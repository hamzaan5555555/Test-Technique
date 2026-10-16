import AppError from '../utils/AppError.js';
import { getPagination, buildPagination } from '../utils/pagination.js';
import * as participantsRepository from '../repositories/participants.repository.js';

const notFound = () => AppError.notFound('Participant introuvable', 'PARTICIPANT_NOT_FOUND');

const normalizeEmail = (email) => email.trim().toLowerCase();

export function create(data) {
   
  return participantsRepository.create({ ...data, email: normalizeEmail(data.email) });
}

export async function list(query) {
   
  const pagination = getPagination(query, { defaultLimit: 100, maxLimit: 500 });
  const { rows, total } = await participantsRepository.findAll({
    search: query.search?.trim(),
    limit: pagination.limit,
    offset: pagination.offset,
  });
  return { data: rows, pagination: buildPagination(pagination, total) };
}

export async function getById(id) {
  const participant = await participantsRepository.findById(id);
  if (!participant) throw notFound();
  return participant;
}

export async function update(id, data) {
  const changes = { ...data };
  if (changes.email !== undefined) changes.email = normalizeEmail(changes.email);

  const participant = await participantsRepository.update(id, changes);
  if (!participant) throw notFound();
  return participant;
}

export async function remove(id) {
  const deleted = await participantsRepository.remove(id);
  if (!deleted) throw notFound();
}