# Cahier des charges — Navette Sharing Go

**Version :** 1.3 (ingénierie produit PRD + BMAD)  
**Statut :** Référence absolue produit global — toute modification doit être justifiée, discutée et versionnée ici.  
**Dernière validation :** 2026-05-22

**Ingénierie :** exécution obligatoire via [`methodology/BMAD.md`](methodology/BMAD.md) · feature via [`prd/templates/PRD-template.md`](prd/templates/PRD-template.md) · index [`README.md`](README.md).

---

## Contexte produit

| Paramètre | Valeur |
|-----------|--------|
| Projet | Navette Sharing Go |
| Ligne | **Unique** : Châlons-en-Champagne ↔ Aéroport Paris-Vatry |
| Fréquence | 8 trajets/jour, 20 jours/mois → **160 trajets/mois** |
| Capacité | **8 passagers** par trajet |

---

## 1. Logique produit

- Réservation de sièges
- Gestion d’abonnements mensuels
- Gestion de trajets fixes (admin)
- Optimisation du remplissage via dashboard

---

## 2. Utilisateurs & rôles

| Rôle métier | `user_type` | Paiement | Abonnement |
|-------------|-------------|----------|------------|
| Abonné Mosolf | `convoyeur` (+ code promo) | CB Stripe, code Mosolf **usage unique** | 40 €/mois |
| Convoyeur abonné | `convoyeur` | CB Stripe | 30 €/mois |
| Convoyeur ticket | `convoyeur` | **8 €** par réservation (unitaire) | Aucun |
| Admin | `admin` | — | — |

### Règles métier

- Un convoyeur peut passer **ticket → abonnement** (historique conservé).
- Un ticket = **un seul trajet** ; 3 trajets = **3 × 8 €** (pas de panier multi-trajets en un paiement).
- Code Mosolf : lié à un **email ou domaine**, **usage unique**, **désactive** tout autre abonnement actif.

---

## 3. Fonctionnalités V1

| Fonction | Implémentation retenue |
|----------|------------------------|
| **Réservation** | Clic immédiat → réservation **temporaire** (timeout **2 min**) avant paiement. **Pas de panier.** |
| **Paiement** | Stripe Checkout + Webhook. Abonnements mensuels Stripe. Tickets unitaires Stripe. |
| **Abonnements Mosolf** | Code promo personnel → Stripe Checkout avec coupon ou metadata. |
| **Planning trajets (admin)** | CRUD des 8 trajets/jour, activation/désactivation. |
| **Gestion des places** | Compteur temps réel via PostgreSQL **`FOR UPDATE`**. Blocage si complet. |
| **Validation embarquement** | QR code V1 : **JWT signé** (trajet, user, expiration **+10 min** après départ). App chauffeur **hors ligne**. |
| **Dashboard admin** | Réservations, taux remplissage, revenus, abonnements actifs (stats simples). |
| **Compte utilisateur** | Historique trajets, abonnement actif, statut. |

---

## 4. Parcours UX (V1)

1. Ouvrir l’app
2. Choisir son trajet
3. Voir horaires disponibles + places restantes
4. Réserver (blocage temporaire 2 min)
5. Paiement **ou** validation abonnement actif
6. QR code pour embarquer

---

## 5. Stack technique

**Contrainte : Docker obligatoire. Pas de Supabase / Neon.**

| Couche | Technologie |
|--------|-------------|
| Backend | Node.js + Express + TypeScript (Docker) |
| Base de données | PostgreSQL (Docker, volume persistant) |
| ORM | Prisma (migrations, type-safe) |
| Frontend | React + Vite + Tailwind CSS (build statique → Nginx) |
| Reverse proxy | Nginx (Docker) |
| Paiement | Stripe (Checkout + Webhook ; Stripe CLI en local) |
| Auth | Lucia-auth + JWT httpOnly cookie **ou** Auth.js |
| QR embarquement | JWT signé ; clé publique intégrée app chauffeur |
| CI/CD | GitHub Actions → VPS |
| Hébergement | VPS (Hetzner, OVH, etc.) + Docker Compose |

### 5.1 Environnements (schéma imposé)

| Env | DB | Données | Paiement (Stripe) | Accès |
|-----|-----|---------|-------------------|--------|
| **DEV** | PostgreSQL Docker local | Faker + quelques utilisateurs réels (équipe dev) | Mode test (`4242…`) · Stripe CLI | localhost |
| **REC** (recette) | PostgreSQL VPS, conteneur dédié | Snapshot PROD **anonymisé** (rabattage hebdomadaire) | Mode test + simulation 3D Secure | Équipe interne, VPN |
| **PREPROD** | PostgreSQL VPS (réplica dédié) | Clone PROD (pré-migration) | Mode **live**, webhook vers copie/endpoint de test | QA + lead dev |
| **PROD** | PostgreSQL VPS, backup auto | Données réelles | Mode live + webhook réel | Clients finaux |

**Backup PROD :** chaque soir → autre VPS ou stockage S3-compatible · script `restore-backup.sh` · restore testé mensuellement.

**Rabattages :** job hebdo (cron ou GitHub Action) recrée REC depuis PROD · anonymisation SQL (emails, cartes, etc.). PREPROD = clone PROD avant migrations majeures.

**Interdit :** partager une DB entre envs · pousser DEV/REC/PREPROD → PROD.

### 5.2 Sécurité — obligatoire avant déploiement

Garde-fous (post-incidents type redirection / infection) :

| Domaine | Règle |
|---------|--------|
| **Rate limiting** | 10 req/min/IP routes non auth · 100 req/min routes auth |
| **Honeypot** | Champ caché `website` sur inscription → si rempli, bloquer IP |
| **Turnstile** | Inscription, connexion, paiement |
| **Auth convoyeur** | **Google OAuth obligatoire** (pas magic link seul) |
| **Auth admin** | Magic link autorisé ; magic link possible en 2ᵉ facteur |
| **Webhook Stripe** | `constructEvent()` · table `webhook_events` (`idempotency_key`) · échec = rollback, pas de delete massif |
| **DB** | Pas de DROP/DELETE large pour l’app · suppressions `deleted_at` · backup avant migration destructive |
| **Déploiements** | Table `deployments` : `commit_hash`, `deployed_at` — **code sur GitHub uniquement**, pas en DB |

---

## 6. Design (imposé)

Voir `DESIGN.md` à la racine. Résumé :

- Dominante : **noir** `#000000`
- Primaire : **vert** `#22c55e`
- **Pas de dégradé**
- Inspiration : BlaBlaCar (mobile + web), **plus sobre**

---

## 7. Schéma base de données (résumé)

Tables principales (détail SQL à fournir) :

| Table | Champs clés (indicatif) |
|-------|-------------------------|
| `users` | id, email, user_type, subscription_type, stripe_customer_id |
| `promo_codes` | code, type, used_by_user_id |
| `lines` | id, name, start_city, end_city |
| `trips` | id, line_id, datetime, total_seats, price_per_seat, driver_id (nullable) |
| `pending_reservations` | id, trip_id, user_id, expires_at, status |
| `reservations` | id, trip_id, user_id, status, qr_code_jwt, created_at |
| `payments` | id, user_id, stripe_payment_intent, amount, type |
| `webhook_events` | id, idempotency_key, event_type, processed_at, payload_hash |
| `deployments` | id, commit_hash, deployed_at, app_env |
| `admin_audit_logs` | actor_id, action, target_type, target_id, timestamp, metadata |

Entités métier : **`deleted_at`** sur suppressions logiques (pas de DELETE physique large).

---

## 8. Roadmap

| Version | Périmètre |
|---------|-----------|
| **V1** | Réservation, abonnements, planning admin, paiement, QR code, dashboard admin basique |
| **V2** | Analytics avancé, notifications, multi-chauffeurs |
| **V3** | Nouvelles lignes, optimisation automatique |

---

## Historique des versions

| Version | Date | Changement |
|---------|------|------------|
| 1.0 | 2026-05-22 | Version finale post-décisions CTO & Dev |
| 1.1 | 2026-05-22 | §5.1 environnements DEV/REC/PREPROD/PROD, backups, rabattages |
| 1.2 | 2026-05-22 | §5.2 sécurité pré-déploiement, webhook_events, deployments |
| 1.3 | 2026-05-22 | Structure docs/, PRD-template, BMAD methodology |
