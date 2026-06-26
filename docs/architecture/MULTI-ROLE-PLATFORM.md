# Architecture — Plateforme multi-rôles SharingGO

**Statut :** validé CTO (2026-06-23)  
**ADR :** [`ADR-001-single-platform-multi-role-experiences.md`](../decisions/ADR-001-single-platform-multi-role-experiences.md)

---

## Principe fondateur

> **Une seule logique métier, plusieurs expériences adaptées au rôle.**

| Couche | Nombre | Technologie V1 |
|--------|--------|----------------|
| Comptes | 1 | Google OAuth (convoyeur) · OTP/magic link (admin) |
| Backend API | 1 | Express · TypeScript · Prisma |
| Base de données | 1 | PostgreSQL |
| RBAC | 1 | Rôles serveur · middleware |
| Frontends | 3 | Passenger · Driver (à extraire) · Admin |

---

## Schéma

```text
                Un seul compte
                     │
        Google OAuth / Email / OTP
                     │
          Un seul backend Express/TS
                     │
          Une seule base PostgreSQL
                     │
           Détection automatique du rôle
                     │
     ┌───────────────┼────────────────┐
     │               │                │
 PASSENGER        DRIVER          ADMIN
 frontend/       (workspace       frontend/
 apps/passenger   à extraire)     admin F3-*
```

---

## Interfaces par rôle

### Passenger ✅ Feature Complete

`frontend/apps/passenger` — parcours convoyeur complet (réservation → QR → abonnements → compte → support).

### Admin — back-office complet

Opérations, réservations, utilisateurs, paiements, monitoring, incidents, scanner QR, départs, reporting.

Le chauffeur **n'y accède pas** pour les fonctions sensibles (users, paiements, config système).

### Driver — vue filtrée (post-PILOT-01)

Sous-ensemble admin, ergonomie terrain :

- Mes trajets du jour
- Liste passagers
- Scanner QR · valider embarquement
- Départ terminé
- Incident · historique personnel

**Même API · même RBAC · UI spécialisée.**

Stratégie : `DRIVER-WORKSPACE-01` (extraction) → `DRIVER-UX-01` (ergonomie) → `PILOT-02`.

---

## Roadmap (extrait)

```text
DEPLOY-READY-01 → DEPLOY-01 → PILOT-01
→ DRIVER-WORKSPACE-01 → DRIVER-UX-01 → PILOT-02 → COMPANY → B2B
```

---

## Documents liés

| Fichier | Rôle |
|---------|------|
| `PRODUCT.md` | Utilisateurs · jobs-to-be-done |
| `docs/CAHIER_DES_CHARGES.md` | Périmètre V1 verrouillé |
| F3-T5 · F3-T7 | Composants boarding / départs réutilisables |
