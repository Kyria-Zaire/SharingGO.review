# PRD-S0-T1 — Infrastructure de base (Docker, configs)

Status: VERIFY  
Owner: Tech Lead / CTO  
Last updated: 2026-05-22  
Version: v1.0

## Executive Summary

Environnement de développement local Docker : PostgreSQL, backend Express/TS/Prisma (init), frontend React/Vite/Tailwind placeholder.

## Non-goals

- Logique métier réservation / paiement
- Modèles Prisma complets (S0-T2)
- Auth, CI/CD

## Definition of Done

- [x] docker-compose.dev.yml fonctionnel
- [x] GET /health → `{"status":"ok"}`
- [x] Frontend noir/vert
- [x] Prisma connecté (schéma vide)
- [x] helmet, cors, rate-limit préparé
- [x] .env.example
