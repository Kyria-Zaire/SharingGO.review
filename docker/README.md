# Docker — Sharing Go

| Fichier | Usage |
|---------|--------|
| `../docker-compose.dev.yml` | Stack dev : postgres + backend + frontend |
| `nginx/default.conf` | Config Nginx (image frontend production) |

## Commandes

```bash
# Depuis la racine du repo (fichier .env requis)
docker compose -f docker-compose.dev.yml up --build

curl http://localhost:3000/health
# {"status":"ok"}

docker exec -it sharinggo-postgres-dev pg_isready -U postgres
```
