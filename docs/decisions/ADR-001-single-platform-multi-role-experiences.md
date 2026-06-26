# ADR-001 — Plateforme unique, expériences multi-rôles

**Date :** 2026-06-23  
**Statut :** **accepted** (validation CTO)  
**Décideurs :** CTO  
**Contexte :** Fin Passenger V1 Feature Complete · planification Driver post-PILOT-01

---

## Contexte

SharingGO sert plusieurs profils (passager/convoyeur, chauffeur, administrateur) sur une même ligne de transport. La tentation classique est de multiplier backends, bases ou produits autonomes. Le back-office admin (`frontend` admin / F3-*) expose déjà une large partie des capacités terrain (scanner QR, départs, embarquement, incidents).

Le CTO valide un modèle **une logique métier, plusieurs interfaces** — aligné CDC V1 et stack imposée (Express/TS · Postgres · Prisma · RBAC serveur).

---

## Décision

### Modèle plateforme

```text
                Un seul compte
                     │
        Google OAuth / Email / OTP (admin)
                     │
          Un seul backend (Express/TS)
                     │
          Une seule base PostgreSQL
                     │
           Détection automatique du rôle
                     │
     ┌───────────────┼────────────────┐
     │               │                │
 PASSENGER        DRIVER          ADMIN
 Web/Mobile      Web dédié       Back-office
```

| Principe | Règle |
|----------|-------|
| Backend | **Un seul** — pas de microservice Driver |
| Auth | **Une seule** — session / OAuth · rôle côté serveur |
| Base de données | **Une seule** — pas de silo par interface |
| RBAC | **Un seul modèle** — `CONVoyageUR` · `DRIVER` · `ADMIN` |
| Interfaces | **Plusieurs frontends** spécialisés par rôle |

### 1. Passenger — Feature Complete ✅

Expérience livrée V1 : landing, trajets, réservation, paiement, QR, abonnements, profil, notifications, paramètres, aide, juridique, contact.

Statut : **FEATURE COMPLETE** · QA validé · DEPLOY-READY-01 en cours.

### 2. Driver — Interface filtrée, pas nouveau backend

Le Driver **ne nécessite pas** :

- un nouveau backend ;
- une nouvelle logique métier dupliquée.

Il nécessite une **interface différente** — sous-ensemble des capacités admin déjà opérationnelles :

| Admin (complet) | Driver (filtré) |
|-----------------|-----------------|
| Dashboard global | Mes trajets du jour |
| Toutes réservations | Liste passagers du trajet |
| Utilisateurs · Paiements · Reporting | ❌ jamais exposé |
| Scanner QR · Départs · Embarquement | ✔ |
| Incidents · Monitoring global | Incidents · historique **personnel** |

Endpoints existants (ex. `POST /api/boarding/validate`, `POST /api/boarding/consume`) acceptent déjà le rôle `DRIVER` (cf. F3-T5).

### 3. Admin — Back-office complet

Conserve toutes les fonctions d'administration. Le Driver n'y a pas accès (gestion users, paiements, reporting global, paramètres système).

### 4. Stratégie Driver post-PILOT-01

**Ne pas** créer un frontend Driver from scratch.

```text
ADMIN (~80 % du code terrain existant)
        ↓
    Audit composants
        ↓
Extraction fonctionnalités Driver
        ↓
DRIVER-WORKSPACE-01
        ↓
DRIVER-UX-01 (ergonomie métier chauffeur)
        ↓
PILOT-02 (chauffeurs autonomes)
```

Réutiliser composants admin · retirer administration · adapter UX terrain.

---

## Roadmap produit validée (extrait)

```text
✅ Passenger V1 Feature Complete
▶ DEPLOY-READY-01 → DEPLOY-01 → PILOT-01
        ↓
   Analyse réelle pilote
        ↓
DRIVER-WORKSPACE-01   (extraction depuis Admin)
        ↓
DRIVER-UX-01          (refonte ergonomique)
        ↓
PILOT-02              (chauffeurs autonomes)
        ↓
COMPANY
        ↓
B2B
```

> **Remplace** la mention générique `DRIVER-01` dans les documents antérieurs.

---

## Conséquences

### Positives

- Pas de duplication logique métier · maintenance simplifiée
- Time-to-market Driver réduit (base admin ~80 %)
- Cohérence RBAC · audit · webhooks · boarding sur un seul système
- Alignement avec F3-T5 / F3-T7 (composants déjà découplés du rôle admin)

### Contraintes

- Extraction Driver doit respecter Feature Freeze / PRD par phase
- RBAC strict : routes Driver ≠ routes Admin (middleware + UI)
- Tests régression boarding sur les **deux** interfaces (Admin ops + Driver)
- COMPANY / B2B restent hors scope jusqu'à post-PILOT-02

### Hors scope de cet ADR

- Implémentation DRIVER-WORKSPACE-01 (PRD à rédiger après PILOT-01)
- App mobile native Driver (web dédié V1)
- Multi-lignes

---

## Références

| Document | Lien |
|----------|------|
| CDC | `docs/CAHIER_DES_CHARGES.md` §5 |
| Boarding console admin | `docs/features/F3-T5-boarding-operations-console.md` |
| Driver readiness console | `docs/features/F3-T7-driver-readiness-departure-console.md` |
| Rôles équipe | `docs/features/F3-T12-settings-team-management.md` |
| Passenger QA | `docs/audits/WEB-PASSENGER-QA-01.md` |

---

*ADR-001 — à citer dans tout PRD Driver · Company · B2B.*
