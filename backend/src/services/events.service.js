import { withTransaction } from '../config/db.js';
import AppError from '../utils/AppError.js';
import { getPagination, buildPagination } from '../utils/pagination.js';
import * as eventsRepository from '../repositories/events.repository.js';
import * as registrationsRepository from '../repositories/registrations.repository.js';

// Transitions de statut autorisées
const ALLOWED_TRANSITIONS = {
  draft: ['published', 'cancelled'],
  published: ['cancelled'],
  cancelled: [],
};

const notFound = () => AppError.notFound('Événement introuvable', 'EVENT_NOT_FOUND');

/** Un événement est toujours créé en brouillon (draft). */
export async function create(data, userId) {
  const { id } = await eventsRepository.create({ ...data, createdBy: userId });
  return eventsRepository.findById(id);
}

export async function list(query) {
  const pagination = getPagination(query);
  const { rows, total } = await eventsRepository.findAll({
    status: query.status,
    date: query.date,
    limit: pagination.limit,
    offset: pagination.offset,
  });
  return { data: rows, pagination: buildPagination(pagination, total) };
}

export async function getById(id) {
  const event = await eventsRepository.findById(id);
  if (!event) throw notFound();
  return event;
}

export function update(id, data) {
  return withTransaction(async (client) => {
    // Le verrou évite qu'une inscription concurrente fausse la vérification de capacité
    const event = await eventsRepository.lockById(id, client);
    if (!event) throw notFound();

    if (event.status === 'cancelled') {
      throw AppError.conflict('Un événement annulé ne peut pas être modifié', 'EVENT_CANCELLED');
    }

    if (data.maxParticipants !== undefined) {
      const active = await registrationsRepository.countActiveByEvent(id, client);
      if (data.maxParticipants < active) {
        throw AppError.conflict(
          `maxParticipants ne peut pas être inférieur au nombre d'inscrits actuel (${active})`,
          'MAX_BELOW_REGISTRATIONS'
        );
      }
    }

    await eventsRepository.update(id, data, client);
    return eventsRepository.findById(id, client);
  });
}

/**
 * draft -> published, ou draft/published -> cancelled.
 * Annuler un événement annule TOUTES ses inscriptions, dans la même transaction.
 */
export function updateStatus(id, newStatus) {
  return withTransaction(async (client) => {
    const event = await eventsRepository.lockById(id, client);
    if (!event) throw notFound();

    if (!ALLOWED_TRANSITIONS[event.status]?.includes(newStatus)) {
      throw AppError.conflict(
        `Transition de statut impossible : ${event.status} -> ${newStatus}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    await eventsRepository.setStatus(id, newStatus, client);

    if (newStatus === 'cancelled') {
      await registrationsRepository.cancelAllByEvent(id, client);
    }

    return eventsRepository.findById(id, client);
  });
}