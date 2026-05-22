# S1.5-T6 — Realistic Transport Seed & Demo Dataset

Dataset **dev/QA uniquement** — ligne Châlons-en-Champagne ↔ Aéroport Paris-Vatry.

## Objectif

Environnement de démo rejouable pour QA, présentations, tests admin/occupancy et futurs clients frontend/mobile.

## Sécurité

| Règle | Détail |
|-------|--------|
| `ALLOW_DEMO_SEED=true` | **Obligatoire** pour exécuter le seed |
| `NODE_ENV=production` | **Refusé** |
| Données touchées | Uniquement emails `*@sharinggo.demo` + ligne demo nommée |
| Stripe | IDs factices `demo_pi_*` / `demo_cs_*` — jamais de clés réelles |

## Commandes

```powershell
# Depuis backend/ (DATABASE_URL vers Postgres local ou Docker)
cd backend
$env:ALLOW_DEMO_SEED="true"
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sharinggo?schema=public"
npm run db:seed:demo
```

Docker (**recommandé**, même base que l’API) :

```powershell
docker exec -e ALLOW_DEMO_SEED=true -e NODE_ENV=development sharinggo-backend-dev npm run db:seed:demo
```

Après rebuild backend : `docker compose -f docker-compose.dev.yml build backend && docker compose -f docker-compose.dev.yml up -d --force-recreate backend`

Re-run : le script **nettoie** d’abord toutes les données `@sharinggo.demo` et la ligne demo, puis recrée — **pas de doublons**.

## Comptes demo

| Email | Rôle |
|-------|------|
| `admin@sharinggo.demo` | ADMIN |
| `convoyeur1@sharinggo.demo` … `convoyeur4@sharinggo.demo` | CONVOYEUR (conducteurs) |
| `passenger01@sharinggo.demo` … `passenger24@sharinggo.demo` | CONVOYEUR (passagers seed) |

**Mot de passe (tous les comptes demo)** :

```text
DemoPassword123!
```

## Données créées

- **1 ligne** : Châlons-en-Champagne ↔ Aéroport Paris-Vatry (en base : `<->` pour compatibilité encodage Windows/libpq)
- **Trajets** : 6 jours × 8 créneaux/jour (horaires 05:30 … 21:00 Europe/Paris), `totalSeats=8`, arrivée +40 min
- Créneaux déjà passés **le jour J** sont ignorés (trajets uniquement dans le futur)
- **Occupancy variée** : 0/8, 2/8, 5/8, 7/8, 8/8 (complet), + autres niveaux
- **Réservations** CONFIRMED + **paiements** SUCCEEDED 8,00 EUR
- **Pending** : une active (+10 min), une expirée (−10 min), une consommée (`consumedAt` renseigné)
- **Paiements** : un FAILED sans réservation, un PENDING (checkout abandonné)
- **AuditLog** : `DEMO_SEED_RUN`, `DEMO_RESERVATION_CREATED`, `DEMO_PAYMENT_SUCCEEDED`

## `.env`

```env
ALLOW_DEMO_SEED=false
```

Mettre `true` uniquement pour lancer le seed en local.

## Endpoints à tester après seed

```powershell
curl.exe -c cookies.txt -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@sharinggo.demo\",\"password\":\"DemoPassword123!\"}"
curl.exe -b cookies.txt http://localhost:3000/api/trips
curl.exe -b cookies.txt http://localhost:3000/api/admin/reservations
curl.exe -b cookies.txt http://localhost:3000/api/admin/payments
curl.exe -b cookies.txt http://localhost:3000/api/admin/pending-reservations
# Remplacer TRIP_ID par un id retourné par /api/trips
curl.exe -b cookies.txt http://localhost:3000/api/admin/trips/TRIP_ID/occupancy
```

## Limites

- Horaires « aujourd’hui » dépendent de l’heure d’exécution du seed
- Pas de webhook Stripe ni paiement réel
- Passagers seed en `userType` CONVOYEUR (seuls ADMIN / CONVOYEUR / SUPER_ADMIN existent)
- OpenAPI inchangé (aucune route ajoutée)

## Fichiers

- `backend/prisma/seed.ts`
- `npm run db:seed:demo`
