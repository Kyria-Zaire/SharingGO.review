# OPS-02C-T1 — Validation terrain signalement incident (Boarding)

**Ticket :** OPS-02C-T1B (checklist QA)  
**Date :** 2026-06-20  
**Prérequis :** OPS-02B déployé (backend Docker rebuild + migration) · OPS-02C-T1 UI

---

## Environnement

| Élément | Valeur attendue |
|---------|-----------------|
| Backend | Docker `sharinggo-backend-dev` avec commit ≥ `76baaf3` |
| Migration | `20260620112340_ops02_incident_fields` appliquée |
| Frontend | Vite `:5173` ou ngrok → proxy `/api` → `:3000` |
| Rôles test | `driver@sharinggo.demo` · `admin@sharinggo.demo` |

---

## Checklist terrain

### 1. Signalement libre depuis Boarding

| # | Action | Résultat attendu | OK |
|---|--------|------------------|-----|
| 1.1 | Boarding (DRIVER) → **Signaler un problème** | Bottom sheet s'ouvre | ☐ |
| 1.2 | Sélectionner trajet + description ≥ 10 car. → **Envoyer** | Toast/sheet : **Incident signalé** + `INC-XXXX` | ☐ |
| 1.3 | Réseau coupé volontairement | Message **Impossible de signaler l'incident** (pas de crash) | ☐ |

### 2. Signalement après QR refusé

| # | Action | Résultat attendu | OK |
|---|--------|------------------|-----|
| 2.1 | Scan QR invalide / paiement refusé | Overlay rouge + **Signaler un incident** | ☐ |
| 2.2 | Envoi signalement | `INC-XXXX` affiché | ☐ |
| 2.3 | Double scan (déjà embarqué) | Message **Passager déjà embarqué** — **pas** de bouton signalement | ☐ |

### 3. UI terrain — codes techniques masqués

| # | Vérification | Résultat attendu | OK |
|---|--------------|------------------|-----|
| 3.1 | Écran double scan / refus | Texte **Passager déjà embarqué** uniquement | ☐ |
| 3.2 | Aucun `[RESERVATION_NOT_CONFIRMED]` visible | ☐ |
| 3.3 | Console dev (optionnel) | `[boarding-scan] boarding error code` loggé | ☐ |

### 4. Admin → Incidents

| # | Vérification | Résultat attendu | OK |
|---|--------------|------------------|-----|
| 4.1 | Incident terrain visible | Code `INC-XXXX` + titre | ☐ |
| 4.2 | **Source** | Badge **Terrain** (`BOARDING_FIELD`) | ☐ |
| 4.3 | **Trajet** | `Châlons-en-Champagne → Aéroport Paris-Vatry` + date/heure (pas ID seul) | ☐ |
| 4.4 | ID trip en secondaire seulement | ☐ |

### 5. Résolution obligatoire

| # | Action | Résultat attendu | OK |
|---|--------|------------------|-----|
| 5.1 | Incident OPEN → **Résoudre** | Dialog note obligatoire | ☐ |
| 5.2 | Note &lt; 10 caractères | Bouton désactivé / erreur API `RESOLUTION_REQUIRED` | ☐ |
| 5.3 | Note valide → soumettre | Statut **RESOLVED** · note affichée · résolveur affiché | ☐ |
| 5.4 | **Clear resolved** (optionnel) | Statut **CLOSED** + `closedReason` | ☐ |

### 6. Activity Feed

| # | Vérification | Résultat attendu | OK |
|---|--------------|------------------|-----|
| 6.1 | Après création terrain | Événement **Incident créé** visible | ☐ |
| 6.2 | Après résolution | **Incident résolu** visible | ☐ |
| 6.3 | Après clôture (si testée) | **Incident clôturé** visible | ☐ |
| 6.4 | Sous-titre lisible (pas `INCIDENT_CREATED` brut en titre principal) | ☐ |

### 7. Non-régression scan

| # | Vérification | OK |
|---|--------------|-----|
| 7.1 | Scan valide → confirm → embarquement OK | ☐ |
| 7.2 | Pas de signalement automatique | ☐ |

---

## Commandes de smoke test (local)

```powershell
# Route présente (401 sans session)
Invoke-RestMethod -Uri "http://localhost:3000/api/boarding/field-incidents" -Method POST -ContentType "application/json" -Body '{"relatedTripId":"x"}' 
# → erreur 401 attendue, pas 404

cd frontend
npm run lint
npm run build
```

---

## Limites connues (hors T1B)

- Signalement depuis écran feedback **consume** : non implémenté (T1 scope).
- Filtre incidents par `source` côté UI : backend OK, filtre UI = OPS-02C-T2+.
- Binding chauffeur↔trajet (P1-1) : accepté MVP.

---

*Checklist à cocher après validation CTO terrain.*
