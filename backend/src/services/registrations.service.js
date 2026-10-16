import { withTransaction } from '../config/db.js';
import AppError from '../utils/AppError.js';
import { getPagination, buildPagination } from '../utils/pagination.js';
import * as eventsRepository from '../repositories/events.repository.js';
import * as participantsRepository from '../repositories/participants.repository.js';
import * as registrationsRepository from '../repositories/registrations.repository.js';

const eventNotFound = () => AppError.notFound('Événement introuvable', 'EVENT_NOT_FOUND');
const registrationNotFound = () =>
  AppError.notFound('Inscription introuvable', 'REGISTRATION_NOT_FOUND');









export async function create({ eventId, participantId, status }) {
  const initialStatus = status ?? 'pending';
  if (initialStatus === 'cancelled') {
    throw AppError.badRequest(
      "Une inscription ne peut pas être créée avec le statut 'cancelled'",
      'INVALID_INITIAL_STATUS'
    );
  }

  return withTransaction(async (client) => {
    const event = await eventsRepository.lockById(eventId, client);
    if (!event) throw eventNotFound();

    if (event.status !== 'published') {
      throw AppError.conflict(
        "Impossible d'inscrire un participant sur un événement non publié",
        'EVENT_NOT_PUBLISHED'
      );
    }

    const participant = await participantsRepository.findById(participantId, client);
    if (!participant) {
      throw AppError.notFound('Participant introuvable', 'PARTICIPANT_NOT_FOUND');
    }

    const existing = await registrationsRepository.findByEventAndParticipant(
      eventId,
      participantId,
      client
    );
    if (existing) {
      throw AppError.conflict(
        existing.status === 'cancelled'
          ? 'Ce participant a une inscription annulée pour cet événement : modifiez son statut pour la réactiver'
          : 'Ce participant est déjà inscrit à cet événement',
        'ALREADY_REGISTERED'
      );
    }

    const active = await registrationsRepository.countActiveByEvent(eventId, client);
    if (active >= event.maxParticipants) {
      throw AppError.conflict('Événement complet : inscription impossible', 'EVENT_FULL');
    }

    const { id } = await registrationsRepository.create(
      { eventId, participantId, status: initialStatus },
      client
    );
    return registrationsRepository.findById(id, client);
  });
}

export async function list(query) {
  const pagination = getPagination(query);
  const { rows, total } = await registrationsRepository.findAll({
    eventId: query.eventId,
    status: query.status,
    limit: pagination.limit,
    offset: pagination.offset,
  });
  return { data: rows, pagination: buildPagination(pagination, total) };
}






export async function updateStatus(id, newStatus) {
   
  const preview = await registrationsRepository.findById(id);
  if (!preview) throw registrationNotFound();

  return withTransaction(async (client) => {
    const event = await eventsRepository.lockById(preview.eventId, client);
    if (!event) throw eventNotFound();

     
    const registration = await registrationsRepository.findById(id, client);
    if (!registration) throw registrationNotFound();

     
    if (registration.status === newStatus) return registration;

    const wasActive = registration.status !== 'cancelled';
    const willBeActive = newStatus !== 'cancelled';

    if (willBeActive && event.status !== 'published') {
      throw AppError.conflict(
        event.status === 'cancelled'
          ? "Cet événement est annulé : l'inscription ne peut pas être réactivée"
          : "Impossible de modifier l'inscription d'un événement non publié",
        event.status === 'cancelled' ? 'EVENT_CANCELLED' : 'EVENT_NOT_PUBLISHED'
      );
    }

    if (!wasActive && willBeActive) {
      const active = await registrationsRepository.countActiveByEvent(event.id, client);
      if (active >= event.maxParticipants) {
        throw AppError.conflict('Événement complet : réactivation impossible', 'EVENT_FULL');
      }
    }

    await registrationsRepository.setStatus(id, newStatus, client);
    return registrationsRepository.findById(id, client);
  });
}