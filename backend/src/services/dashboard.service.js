import * as dashboardRepository from '../repositories/dashboard.repository.js';

/** Les 4 indicateurs sont indépendants : exécutés en parallèle. */
export async function getStats() {
  const [totalEvents, publishedEvents, registrationsToday, topEvents] = await Promise.all([
    dashboardRepository.countEvents(),
    dashboardRepository.countPublishedEvents(),
    dashboardRepository.countRegistrationsToday(),
    dashboardRepository.findTopEvents(5),
  ]);

  return { totalEvents, publishedEvents, registrationsToday, topEvents };
}