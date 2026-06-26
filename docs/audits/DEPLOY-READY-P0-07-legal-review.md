# DEPLOY-READY P0-07 — Release Legal Review (Passenger)

**Date :** 2026-06-23  
**Périmètre :** `frontend/apps/passenger` — documents légaux, contact, liens transverses  
**Méthode :** audit statique contenus + vérification chaîne de liens (post P0-03)  
**Référence :** Décision CTO Q2 · PRD DEPLOY-READY-01 P0-07

---

## 1. Synthèse exécutive

| Verdict pilote privé | Verdict production publique |
|----------------------|----------------------------|
| **GO CONDITIONNEL** ✅ | **NON** — gate juridique requise |

**Conditions du GO CONDITIONNEL pilote :**

- Utilisateurs **restreints** et informés (pas d'ouverture SEO / publique).
- Placeholders mentions légales **acceptés** (décision Q2).
- Correction **CGV → CGU** sur booking form : **appliquée** (P0-07).

---

## 2. Tableau documents

| Élément | Route | Statut | Action |
|---------|-------|--------|--------|
| CGU | `/legal/terms` | ✅ | Contenu cohérent MVP · version 1.0 · dates alignées |
| Politique de confidentialité | `/legal/privacy` | ⚠️ | Version de travail déclarée · durées conservation à préciser (prod publique) |
| Mentions légales | `/legal/notice` | ⚠️ | Placeholders éditeur / hébergeur · note prod présente |
| Contact | `/contact` | ✅ | Coordonnées alignées · formulaire désactivé (honnête MVP) |
| Métadonnées légales (version / dates) | Meta cards | ✅ | v1.0 · 23 juin 2026 sur les 3 documents |
| Note production publique | Mentions légales | ✅ | `LEGAL_NOTICE_PLACEHOLDER_NOTE` affichée |

---

## 3. Cohérence transversale

### 3.1 Coordonnées

| Canal | Valeur | Occurrences vérifiées |
|-------|--------|------------------------|
| Email | `support@sharinggo.fr` | Footer · Contact · Help · CGU · Privacy · Mentions · Booking · Boarding pass · Subscriptions |
| Téléphone | `07 80 90 10 20` | Idem (format uniforme) |

**Verdict :** ✅ **Cohérent**

### 3.2 Versions et dates

| Document | Version | Entrée en vigueur | Dernière MAJ |
|----------|---------|-------------------|--------------|
| CGU | 1.0 | 23 juin 2026 | 23 juin 2026 |
| Confidentialité | 1.0 | 23 juin 2026 | 23 juin 2026 |
| Mentions légales | 1.0 | 23 juin 2026 | 23 juin 2026 |

**Verdict :** ✅ **Aligné**

### 3.3 Dénomination ligne

| Contexte | Libellé |
|----------|---------|
| CGU | Châlons-en-Champagne ↔ **Paris-Vatry** |
| Meta description / Help / Contact | Châlons ↔ **Paris-Vatry** ou **Vatry** |
| Landing hero | Châlons ↔ **Vatry** |

**Verdict :** ⚠️ **Écart mineur** (sémantique identique · harmonisation optionnelle P2)

### 3.4 Terminologie juridique réservation

| Emplacement | Libellé | Cible lien |
|-------------|---------|------------|
| Footer / Help / Contact | **CGU** | `/legal/terms` (CGU) ✅ |
| Formulaire réservation | **CGU** (`Conditions Générales d'Utilisation (CGU)`) | `/legal/terms` ✅ |

**Verdict :** ✅ **Corrigé** (P0-07 · commit clôture).

---

## 4. Placeholders — inventaire et criticité

| Placeholder | Section | Pilote privé | Production publique | Obligatoire prod ? |
|-------------|---------|--------------|-------------------|-------------------|
| `[Nom de la société]` | Mentions · Éditeur | ✅ Accepté | ❌ Bloquant | **Oui** |
| `[Forme juridique]` | Mentions · Éditeur | ✅ Accepté | ❌ Bloquant | **Oui** |
| `[Adresse complète]` | Mentions · Siège | ✅ Accepté | ❌ Bloquant | **Oui** |
| `[Numéro SIREN]` | Mentions · Éditeur | ✅ Accepté | ❌ Bloquant | **Oui** |
| `[Montant]` (capital) | Mentions · Éditeur | ✅ Accepté | ❌ Bloquant | **Oui** |
| `[Nom du responsable]` | Mentions · Publication | ✅ Accepté | ❌ Bloquant | **Oui** |
| `[Nom de l'hébergeur]` | Mentions · Hébergement | ✅ Accepté | ❌ Bloquant | **Oui** |
| `[Adresse de l'hébergeur]` | Mentions · Hébergement | ✅ Accepté | ❌ Bloquant | **Oui** |
| Note placeholder générique | Mentions (×3) | ✅ | Gate documentée | **Oui** (remplacer par données réelles) |
| « Version de travail » (Privacy intro) | Confidentialité | ✅ Accepté | ❌ Bloquant | **Oui** (validation juriste) |
| Durées conservation TBD | Privacy §7 | ✅ Accepté | ⚠️ | **Oui** |
| Absence CMP cookies | Privacy §9 | ✅ MVP honnête | ❌ Bloquant | **Oui** (prod publique) |
| Formulaire contact désactivé | Contact | ✅ Accepté | Optionnel | Non (canal email/tél suffit) |
| Settings → CGU/Privacy (boutons morts) | `/settings` | ✅ Accepté | ⚠️ UX | Optionnel (liens à activer P2) |

---

## 5. Chaîne de liens légaux

```text
Booking Form ──► CGU (/legal/terms)     ✅
              └──► Privacy (/legal/privacy) ✅

Footer ──► CGU · Privacy · Mentions · Contact     ✅

Help (useful links) ──► Privacy · CGU · Mentions  ✅

Contact (useful links) ──► CGU · Privacy · Mentions ✅

Pages légales ──► LegalFooterLinks (4 liens)       ✅
              └──► LegalContactCard → /contact     ✅

Settings (privacy tab) ──► CGU / Privacy            ⚠️ pas de lien (disabled)
```

**Audit liens P0-03 :** FAIL 0 · ancres FAQ OK.

---

## 6. Alignement contenu ↔ produit MVP

| Affirmation légale | Produit réel | Verdict |
|--------------------|--------------|---------|
| 8 € / trajet | CDC V1 | ✅ |
| 8 places / trajet | CDC V1 | ✅ |
| Pending « durée limitée » | 2 min backend | ✅ (non contradictoire) |
| QR usage unique · exp +10 min | Implémenté | ✅ |
| Annulation en ligne absente | Support only | ✅ (honnête) |
| OAuth Google passager | Implémenté | ✅ |
| Pas de CMP cookies | Vrai | ✅ (déclaré) |
| « Places garanties » marketing | Non utilisé en meta (P0-05) | ✅ |

---

## 7. Actions recommandées

| Priorité | Action | Owner | Statut |
|----------|--------|-------|--------|
| P0-07 | Libellé **CGV → CGU** sur booking form | Frontend | ✅ **Fait** |
| Gate prod | Remplacer placeholders mentions légales | Juriste + CTO | ⬜ |
| Gate prod | Valider Privacy définitive + durées conservation | Juriste | ⬜ |
| Gate prod | CMP / politique cookies | Juriste + Frontend | ⬜ |
| P2 | Lier CGU/Privacy depuis Settings | Frontend | Backlog |
| P2 | Harmoniser Paris-Vatry / Vatry | Copy | Backlog |

---

## 8. KPI P0-07

| KPI | Avant | Après review |
|-----|-------|--------------|
| Documents légaux présents | 3/3 | **3/3** ✅ |
| Coordonnées cohérentes | Oui | **Oui** ✅ |
| Versions/dates alignées | Oui | **Oui** ✅ |
| Placeholders inventoriés | Non | **Oui** ✅ |
| Incohérence CGV/CGU | 1 | **0** ✅ |
| FAIL liens | 0 | **0** ✅ |
| Gate prod publique | NON | **NON** (attendu) |

---

## 9. Décision

```text
╔══════════════════════════════════════════════════════════╗
║  PILOTE PRIVÉ (PILOT-01)     GO CONDITIONNEL ✅          ║
║  PRODUCTION PUBLIQUE         NON — gate juridique        ║
║  P0-07                         CLOSED ✅ (2026-06-23)    ║
║  Sprint P0 DEPLOY-READY-01     COMPLETE ✅               ║
╚══════════════════════════════════════════════════════════╝
```

**Clôture P0-07 :** validée CTO · correctif CGU livré · passage au **sprint P1** (hardening technique).
