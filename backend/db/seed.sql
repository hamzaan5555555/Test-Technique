-- =====================================================================
-- EventHub - Données de test
--   2 utilisateurs, 5 événements, 10 participants, 20 inscriptions
-- Comptes :
--   admin@eventhub.com / Admin123!
--   staff@eventhub.com / Staff123!
-- =====================================================================

BEGIN;

TRUNCATE registrations, participants, events, users CASCADE;

-- ---------------------------------------------------------------------
-- Users (mots de passe hashés en bcrypt via pgcrypto, compatibles bcryptjs)
-- ---------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@eventhub.com',
   crypt('Admin123!', gen_salt('bf', 10)), 'Admin EventHub', 'admin'),
  ('a0000000-0000-0000-0000-000000000002', 'staff@eventhub.com',
   crypt('Staff123!', gen_salt('bf', 10)), 'Staff EventHub', 'staff');

-- ---------------------------------------------------------------------
-- Events : 3 published, 1 draft, 1 cancelled
-- ---------------------------------------------------------------------
INSERT INTO events (id, title, description, location, event_date, max_participants, status, created_by) VALUES
  ('e0000000-0000-0000-0000-000000000001',
   'Conférence Tech Casablanca',
   'Une journée de conférences sur le développement web moderne.',
   'Casablanca - Technopark', now() + interval '10 days', 50, 'published',
   'a0000000-0000-0000-0000-000000000001'),

  ('e0000000-0000-0000-0000-000000000002',
   'Workshop React & Node.js',
   'Atelier pratique : construire une application PERN de A à Z. Places limitées.',
   'Rabat - Salle B12', now() + interval '5 days', 5, 'published',
   'a0000000-0000-0000-0000-000000000002'),

  ('e0000000-0000-0000-0000-000000000003',
   'Meetup Open Source',
   'Rencontre mensuelle de la communauté open source.',
   'Marrakech - Gueliz Hub', now() + interval '20 days', 20, 'published',
   'a0000000-0000-0000-0000-000000000002'),

  ('e0000000-0000-0000-0000-000000000004',
   'Hackathon Innovation (brouillon)',
   'Hackathon 24h - programme en cours de préparation.',
   'Tanger - Tangier Tech', now() + interval '45 days', 100, 'draft',
   'a0000000-0000-0000-0000-000000000001'),

  ('e0000000-0000-0000-0000-000000000005',
   'Soirée Networking (annulée)',
   'Événement annulé faute de sponsor.',
   'Casablanca - Rooftop Maarif', now() + interval '15 days', 30, 'cancelled',
   'a0000000-0000-0000-0000-000000000002');

-- ---------------------------------------------------------------------
-- Participants (10)
-- ---------------------------------------------------------------------
INSERT INTO participants (id, full_name, email, phone) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Youssef El Amrani',  'youssef.elamrani@example.com',  '+212600000001'),
  ('b0000000-0000-0000-0000-000000000002', 'Salma Benjelloun',   'salma.benjelloun@example.com',  '+212600000002'),
  ('b0000000-0000-0000-0000-000000000003', 'Omar Tazi',          'omar.tazi@example.com',         '+212600000003'),
  ('b0000000-0000-0000-0000-000000000004', 'Imane Alaoui',       'imane.alaoui@example.com',      NULL),
  ('b0000000-0000-0000-0000-000000000005', 'Mehdi Berrada',      'mehdi.berrada@example.com',     '+212600000005'),
  ('b0000000-0000-0000-0000-000000000006', 'Khadija Fassi',      'khadija.fassi@example.com',     '+212600000006'),
  ('b0000000-0000-0000-0000-000000000007', 'Anas Chraibi',       'anas.chraibi@example.com',      NULL),
  ('b0000000-0000-0000-0000-000000000008', 'Hajar Lahlou',       'hajar.lahlou@example.com',      '+212600000008'),
  ('b0000000-0000-0000-0000-000000000009', 'Reda Idrissi',       'reda.idrissi@example.com',      '+212600000009'),
  ('b0000000-0000-0000-0000-000000000010', 'Nadia Sekkat',       'nadia.sekkat@example.com',      '+212600000010');

-- ---------------------------------------------------------------------
-- Registrations (20), statuts variés
--  - Event 1 (50 places)  : 6 inscriptions
--  - Event 2 (5 places)   : 6 inscriptions dont 5 actives => COMPLET
--  - Event 3 (20 places)  : 4 inscriptions
--  - Event 4 (draft)      : aucune (règle : événement non publié)
--  - Event 5 (cancelled)  : 4 inscriptions, toutes cancelled
-- ---------------------------------------------------------------------
INSERT INTO registrations (event_id, participant_id, status, created_at) VALUES
  -- Event 1
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'confirmed', now() - interval '6 days'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'confirmed', now() - interval '5 days'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'pending',   now() - interval '2 days'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'confirmed', now() - interval '1 day'),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'pending',   now()),
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'cancelled', now() - interval '3 days'),

  -- Event 2 (complet : 5 actives sur 5)
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'confirmed', now() - interval '4 days'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'confirmed', now() - interval '4 days'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'confirmed', now() - interval '3 days'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'pending',   now() - interval '1 day'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 'pending',   now()),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 'cancelled', now() - interval '2 days'),

  -- Event 3
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'confirmed', now() - interval '2 days'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 'confirmed', now() - interval '1 day'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000007', 'pending',   now()),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000008', 'cancelled', now() - interval '1 day'),

  -- Event 5 (annulé => toutes les inscriptions annulées)
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'cancelled', now() - interval '7 days'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'cancelled', now() - interval '7 days'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000009', 'cancelled', now() - interval '6 days'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000010', 'cancelled', now() - interval '6 days');

COMMIT;