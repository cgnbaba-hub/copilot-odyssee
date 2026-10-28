# 🎮 CoPilot Odyssey

Ein gamifiziertes Lernspiel im 8-Bit/Pixel-Art-Stil, das Mitarbeitenden spielerisch den Umgang mit **Microsoft 365 Copilot** beibringt.

## 🗺️ Spielwelt

Spieler erkunden ein Insel-Archipel, wobei jede Insel ein M365-Tool repräsentiert:

| Insel | Tool | Thema |
|-------|------|-------|
| **Aurora** | Copilot Grundlagen | LLMs, Prompting, KI-Ethik |
| **Gridforge** | Excel Copilot | Datenanalyse, Formeln, Pivot |
| **Deckstorm** | PowerPoint Copilot | Präsentationen, Design, Speaker Notes |

## 🏗️ Tech-Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Datenbank**: PostgreSQL 16
- **KI**: Mistral API (Prompt-Bewertung)
- **Auth**: JWT + bcrypt
- **Deployment**: Docker + Nginx + Cloudflare

---

## 🚀 Setup & Installation

### Voraussetzungen

- Docker & Docker Compose (v2)
- Node.js 20+ (nur für lokale Entwicklung)
- Git

### 1. Repository klonen

```bash
git clone https://github.com/cgnbaba-hub/copilot-odyssee.git
cd copilot-odyssee
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

Öffne `.env` und setze:

```env
DB_PASSWORD=sicheres_passwort_hier
JWT_SECRET=mindestens_64_zeichen_langer_random_string
MISTRAL_API_KEY=dein_mistral_api_key
FRONTEND_URL=https://deine-domain.com
```

**Mistral API Key** erhältst du unter [console.mistral.ai](https://console.mistral.ai).

### 3. SSL-Zertifikat (für Produktion)

Erstelle ein Cloudflare Origin Certificate:
1. Cloudflare Dashboard → SSL/TLS → Origin Server → Create Certificate
2. Speichere als `nginx/ssl/origin.crt` und `nginx/ssl/origin.key`

```bash
mkdir -p nginx/ssl
# Füge origin.crt und origin.key in nginx/ssl/ ein
```

### 4. Starten

```bash
docker compose up -d
```

### 5. Datenbank initialisieren

Die Migration läuft automatisch beim ersten Start (via `docker-entrypoint-initdb.d`).

Seed-Daten laden (45 Quiz-Fragen, 15 Challenges, 10 Badges):

```bash
docker compose exec backend node dist/seeds/run.js
```

### 6. Admin-Account erstellen

```bash
# Verbinde mit der Datenbank
docker compose exec db psql -U odyssey_admin -d copilot_odyssey

# Setze einen User als Super-Admin
UPDATE users SET role = 'super_admin' WHERE username = 'dein_username';
\q
```

---

## 🔧 Lokale Entwicklung

```bash
# Backend
cd backend
npm install
npm run dev   # Startet auf :4000

# Frontend (neues Terminal)
cd frontend
npm install
npm run dev   # Startet auf :3000 mit Proxy zu :4000
```

Datenbank lokal starten:
```bash
docker compose up db -d
```

---

## 🌐 Cloudflare-Setup

### DNS-Konfiguration
1. Füge einen A-Record hinzu: `@ → VPS-IP-Adresse`
2. Proxy-Status: **Proxied** (orange Wolke)

### SSL-Einstellungen
- SSL-Mode: **Full (Strict)**
- Origin Certificate installiert (siehe Step 3)

### Caching-Regeln
Erstelle eine Cache-Regel:
- `*deine-domain.com/api/*` → **Bypass** (nicht cachen!)
- `*deine-domain.com/assets/*` → **Cache Everything** (1 Jahr)

### Firewall (optional)
- Erlaube nur Cloudflare-IPs auf Port 80/443
- Alle anderen blockieren

---

## 🐋 Docker-Services

| Service | Port (intern) | Beschreibung |
|---------|--------------|--------------|
| `nginx` | 80, 443 (extern) | Reverse Proxy + SSL |
| `frontend` | 80 (intern) | React-App (nginx-static) |
| `backend` | 4000 (intern) | Express API |
| `db` | 5432 (intern) | PostgreSQL 16 |

---

## 🚢 Deployment

### Automatisch (via deploy.sh)

```bash
./deploy.sh
```

Das Skript:
1. Zieht neuesten Code (`git pull`)
2. Baut Docker-Images (parallel)
3. Führt Migrations aus
4. Startet Services mit Zero-Downtime-Restart
5. Healthcheck auf `/health`
6. Bereinigt alte Images

### Manuell

```bash
docker compose build
docker compose up -d
docker compose exec backend node dist/migrations/run.js
```

---

## 📚 API-Dokumentation

### Basis-URL
`https://deine-domain.com/api`

### Authentifizierung
Alle geschützten Endpunkte erfordern:
```
Authorization: Bearer <JWT_TOKEN>
```

### Wichtige Endpunkte

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| POST | `/auth/register` | Registrierung |
| POST | `/auth/login` | Login → JWT |
| GET | `/auth/me` | Aktueller User |
| GET | `/islands` | Alle Inseln mit Status |
| GET | `/quiz/:slug/next` | Nächste Quiz-Frage |
| POST | `/quiz/answer` | Antwort einreichen |
| GET | `/prompt/:slug/next` | Nächste Prompt-Challenge |
| POST | `/prompt/submit` | Prompt einreichen (Mistral) |
| POST | `/duel/create` | Neues Duell starten |
| GET | `/leaderboard/global` | Globale Rangliste |
| GET | `/admin/analytics/active-users` | Analytics (Admin) |

---

## 🎯 Spielmechaniken

### XP & Level-System

```
Level 1-50:  Exponentiell (Basis 1.15)
Level 51-100: Linear (+3.000 XP/Level)
Level 100+:  Konstant (+5.000 XP/Level)

Beispiele:
Level 1:  0 XP
Level 5:  749 XP
Level 10: 2.030 XP
Level 20: 8.620 XP
Level 50: 108.150 XP
```

### Quellen für XP

| Aktivität | XP |
|-----------|-----|
| Quiz richtig (Beginner) | 10 |
| Quiz richtig (Intermediate) | 20 |
| Quiz richtig (Advanced) | 40 |
| Quiz richtig (Expert) | 80 |
| Prompt Challenge (max) | 100 |
| Duell gewonnen | 100 |
| Duell verloren (Teilnahme) | 20 |
| Insel abgeschlossen | 500 |

### Rate-Limiting

- **Auth**: 20 Anfragen / 15 Minuten
- **Mistral API**: 10 Bewertungen / Stunde / User
- **Allgemein**: 300 Anfragen / 15 Minuten

---

## 🔧 Häufige Probleme

### Container startet nicht

```bash
docker compose logs backend
docker compose logs db
```

### Datenbankverbindung schlägt fehl

```bash
# Prüfe ob DB läuft
docker compose ps
# Prüfe Umgebungsvariablen
docker compose exec backend env | grep DB_
```

### Mistral API nicht verfügbar

Kein Problem – das System hat einen Fallback: Bei API-Fehler wird eine Standard-Bewertung (60/100) vergeben mit dem Hinweis "KI-Bewertung temporär nicht verfügbar".

### Frontend-Build schlägt fehl

```bash
docker compose build frontend
# Prüfe ob VITE_API_URL korrekt gesetzt ist
```

### SSL-Fehler

```bash
# Prüfe ob Zertifikate vorhanden
ls -la nginx/ssl/
# Für Entwicklung: selbstsigniertes Zertifikat erstellen
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/origin.key \
  -out nginx/ssl/origin.crt \
  -subj "/CN=localhost"
```

### Admin-Zugriff

```bash
docker compose exec db psql -U odyssey_admin -d copilot_odyssey -c \
  "UPDATE users SET role = 'super_admin' WHERE username = 'dein_username';"
```

---

## 📁 Projektstruktur

```
copilot-odyssey/
├── docker-compose.yml          # Service-Konfiguration
├── .env.example                # Umgebungsvariablen-Template
├── deploy.sh                   # Deployment-Skript
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── App.tsx             # Router, Auth-Guards
│   │   ├── components/         # Wiederverwendbare Komponenten
│   │   ├── pages/              # Route-Seiten
│   │   ├── services/api.ts     # API-Client (axios)
│   │   ├── context/AuthStore.ts # Zustand State
│   │   ├── i18n/               # DE + EN Übersetzungen
│   │   └── types/              # TypeScript Typen
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts            # Express App
│   │   ├── routes/             # API-Routen
│   │   ├── controllers/        # Request-Handler
│   │   ├── services/           # Business Logic
│   │   │   ├── XPService.ts    # Level & XP Engine
│   │   │   ├── BadgeService.ts # Badge-Vergabe
│   │   │   └── MistralService.ts # AI Prompt-Bewertung
│   │   ├── middleware/         # Auth, Validation, Errors
│   │   ├── migrations/         # SQL-Migrations
│   │   └── seeds/              # Initial-Daten
└── nginx/
    ├── Dockerfile
    └── nginx.conf              # Reverse Proxy + SSL
```

---

## 🔐 Sicherheit

- **JWT**: 7 Tage Gültigkeit, in DB gespeichert (Blacklist möglich)
- **Passwörter**: bcrypt mit 12 Salzrunden
- **SQL**: Parametrisierte Queries (kein SQL-Injection möglich)
- **Rate-Limiting**: Auth + Mistral-API extra geschützt
- **Helmet**: Security-Header (XSS, Clickjacking etc.)
- **CORS**: Nur erlaubte Origin

---

## 🎨 Asset-Platzhalter

Alle Bilder sind SVG-Platzhalter. Ersetze sie in `frontend/public/assets/`:
- `characters/` – Avatar-Sprites
- `islands/` – Insel-Grafiken (Aurora, Gridforge, Deckstorm)
- `ui/` – UI-Elemente, Logo, Favicon
- `npcs/` – NPC-Portraits

**Empfohlene KI-Tools für 8-Bit Assets**:
- [Midjourney](https://midjourney.com) mit Prompt: "8-bit pixel art, [beschreibung], retro game style"
- [DALL-E](https://openai.com/dall-e)
- [Stable Diffusion](https://stability.ai)

---

## 📊 Mandantenfähigkeit (Multi-Tenant)

Das System ist von Anfang an multi-tenant-fähig:
- Jede Tabelle hat `tenant_id`
- Alle Queries filtern nach `tenant_id`
- Im MVP: ein Default-Tenant
- Erweiterung: Tenant-Registrierung + eigene Domains

---

## 🤝 Mitwirken

1. Fork erstellen
2. Feature-Branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Pull Request öffnen

---

## 📄 Lizenz

Proprietary – Alle Rechte vorbehalten.

---

*CoPilot Odyssey – Lerne Microsoft 365 Copilot durch epische Quests! ⚔️*
