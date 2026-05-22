# Security Baseline — Sharing Go

> Miroir documentaire. Référence opérationnelle : `.cursor/rules/security-baseline.mdc` · `.claude/security-baseline.md`

Voir le contenu complet dans `.claude/security-baseline.md` (rate limit, Turnstile, OAuth, webhooks, DB, deployments).

S0-T1 : helmet + CORS (`localhost:5173`) actifs · S1.5-T4 : rate-limit **monté** · S1.5-T7 : logs Stripe normalisés · S1.5-T8 : `/health` + `/ready` (`docs/runbooks/ops-health-monitoring.md`).
