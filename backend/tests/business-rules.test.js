import { jest } from '@jest/globals';

const withTransaction = jest.fn((callback) => callback({}));
const lockEvent = jest.fn();
const findEvent = jest.fn();
const updateEvent = jest.fn();
const setEventStatus = jest.fn();
const findParticipant = jest.fn();
const findRegistration = jest.fn();
const countActiveRegistrations = jest.fn();
const createRegistration = jest.fn();
const findRegistrationById = jest.fn();
const setRegistrationStatus = jest.fn();
const cancelRegistrationsForEvent = jest.fn();

jest.unstable_mockModule('../src/config/db.js', () => ({ withTransaction }));
jest.unstable_mockModule('../src/repositories/events.repository.js', () => ({
  lockById: lockEvent,
  findById: findEvent,
  update: updateEvent,
  setStatus: setEventStatus,
}));
jest.unstable_mockModule('../src/repositories/participants.repository.js', () => ({
  findById: findParticipant,
}));
jest.unstable_mockModule('../src/repositories/registrations.repository.js', () => ({
  findByEventAndParticipant: findRegistration,
  countActiveByEvent: countActiveRegistrations,
  create: createRegistration,
  findById: findRegistrationById,
  setStatus: setRegistrationStatus,
  cancelAllByEvent: cancelRegistrationsForEvent,
}));

const { create } = await import('../src/services/registrations.service.js');
const { updateStatus: updateEventStatus } = await import('../src/services/events.service.js');

const eventId = '11111111-1111-4111-8111-111111111111';
const participantId = '22222222-2222-4222-8222-222222222222';
const registrationId = '33333333-3333-4333-8333-333333333333';

beforeEach(() => {
  jest.resetAllMocks();
  withTransaction.mockImplementation((callback) => callback({}));
});

describe('règles métier des inscriptions', () => {
  test('refuse une inscription à un événement non publié', async () => {
    lockEvent.mockResolvedValue({ id: eventId, status: 'draft', maxParticipants: 10 });

    await expect(create({ eventId, participantId })).rejects.toMatchObject({
      statusCode: 409,
      code: 'EVENT_NOT_PUBLISHED',
    });
    expect(findParticipant).not.toHaveBeenCalled();
  });

  test('refuse une inscription en doublon', async () => {
    lockEvent.mockResolvedValue({ id: eventId, status: 'published', maxParticipants: 10 });
    findParticipant.mockResolvedValue({ id: participantId });
    findRegistration.mockResolvedValue({ id: registrationId, status: 'confirmed' });

    await expect(create({ eventId, participantId })).rejects.toMatchObject({
      statusCode: 409,
      code: 'ALREADY_REGISTERED',
    });
    expect(createRegistration).not.toHaveBeenCalled();
  });

  test('refuse une inscription quand la capacité est atteinte', async () => {
    lockEvent.mockResolvedValue({ id: eventId, status: 'published', maxParticipants: 1 });
    findParticipant.mockResolvedValue({ id: participantId });
    findRegistration.mockResolvedValue(null);
    countActiveRegistrations.mockResolvedValue(1);

    await expect(create({ eventId, participantId })).rejects.toMatchObject({
      statusCode: 409,
      code: 'EVENT_FULL',
    });
    expect(createRegistration).not.toHaveBeenCalled();
  });

  test('crée une inscription avec le statut pending par défaut', async () => {
    const created = { id: registrationId, eventId, participantId, status: 'pending' };
    lockEvent.mockResolvedValue({ id: eventId, status: 'published', maxParticipants: 5 });
    findParticipant.mockResolvedValue({ id: participantId });
    findRegistration.mockResolvedValue(null);
    countActiveRegistrations.mockResolvedValue(2);
    createRegistration.mockResolvedValue({ id: registrationId });
    findRegistrationById.mockResolvedValue(created);

    await expect(create({ eventId, participantId })).resolves.toEqual(created);
    expect(createRegistration).toHaveBeenCalledWith(
      { eventId, participantId, status: 'pending' },
      expect.any(Object)
    );
  });
});

describe('cycle de vie des événements', () => {
  test('annuler un événement annule aussi ses inscriptions', async () => {
    const cancelledEvent = { id: eventId, status: 'cancelled' };
    lockEvent.mockResolvedValue({ id: eventId, status: 'published', maxParticipants: 10 });
    setEventStatus.mockResolvedValue(undefined);
    cancelRegistrationsForEvent.mockResolvedValue(3);
    findEvent.mockResolvedValue(cancelledEvent);

    await expect(updateEventStatus(eventId, 'cancelled')).resolves.toEqual(cancelledEvent);
    expect(cancelRegistrationsForEvent).toHaveBeenCalledWith(eventId, expect.any(Object));
  });

  test('refuse une transition depuis un événement annulé', async () => {
    lockEvent.mockResolvedValue({ id: eventId, status: 'cancelled', maxParticipants: 10 });

    await expect(updateEventStatus(eventId, 'published')).rejects.toMatchObject({
      statusCode: 409,
      code: 'INVALID_STATUS_TRANSITION',
    });
    expect(setEventStatus).not.toHaveBeenCalled();
  });
});
