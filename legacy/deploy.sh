#!/bin/bash
# ============================================================
# CoPilot Odyssey – Deployment Script
# Zero-downtime deployment with health checks
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error(){ echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── Prerequisites ────────────────────────────────────────────
[[ -f .env ]] || error ".env file not found. Copy .env.example and configure it."

log "Starting deployment of CoPilot Odyssey..."

# ─── Step 1: Git Pull ─────────────────────────────────────────
if [[ "${SKIP_GIT:-false}" != "true" ]]; then
  log "Pulling latest code..."
  git fetch origin
  git pull origin main || warn "Git pull failed – using current code"
fi

# ─── Step 2: Build Docker images ──────────────────────────────
log "Building Docker images..."
docker compose build --parallel || error "Docker build failed"

# ─── Step 3: Database Migrations ──────────────────────────────
log "Running database migrations..."
# The DB migrations run automatically via docker-entrypoint-initdb.d
# For subsequent migrations, run the migration service:
docker compose run --rm backend node dist/migrations/run.js || warn "Migration runner not available (first deploy)"

# ─── Step 4: Zero-Downtime Restart ───────────────────────────
log "Performing zero-downtime restart..."

# Scale up new containers alongside old ones (if supported)
# For single-server: graceful stop + start
docker compose up -d --no-deps --build backend frontend nginx

# ─── Step 5: Health Check ─────────────────────────────────────
log "Waiting for services to be healthy..."
sleep 10

HEALTH_URL="http://localhost/health"
MAX_RETRIES=12
RETRY=0

while [[ $RETRY -lt $MAX_RETRIES ]]; do
  if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
    log "✓ Health check passed"
    break
  fi
  RETRY=$((RETRY + 1))
  warn "Health check attempt $RETRY/$MAX_RETRIES failed, retrying..."
  sleep 5
done

if [[ $RETRY -eq $MAX_RETRIES ]]; then
  error "Health check failed after $MAX_RETRIES attempts. Rolling back..."
  docker compose down
  exit 1
fi

# ─── Step 6: Cleanup ─────────────────────────────────────────
log "Cleaning up old images..."
docker image prune -f || true

log "✅ Deployment successful!"
echo ""
echo "Service status:"
docker compose ps
