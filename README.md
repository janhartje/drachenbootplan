# Drachenboot Manager

![App Icon](/public/icons/logo-192.png)

## 📖 Über das Projekt

Der **Drachenboot Manager** ist eine Progressive Web App (PWA) zur Verwaltung von Drachenboot-Teams. Sie ermöglicht Trainern und Teamkapitänen die effiziente Planung von Trainings und Regatten sowie die optimale Besetzung des Bootes unter Berücksichtigung von Gewichtsverteilung und individuellen Fähigkeiten.

### ✨ Features

*   **Multi-Team Management**: Verwalten mehrerer Teams mit einfachem Wechsel zwischen Teams.
*   **User Accounts**: Benutzer-Authentifizierung (Login) und Verknüpfung von Paddlern mit Benutzerkonten.
*   **Team Management**: Verwalten von Mitgliedern inkl. Gewicht und Fähigkeiten (Links, Rechts, Trommel, Steuer).
*   **Terminplanung**: Erstellen von Trainings und Regatten mit Zu-/Absage-Funktion.
*   **Magic KI**: Automatischer Algorithmus zur optimalen Bootsbesetzung (Balance & Trimm).
*   **Boots-Visualisierung**: Interaktive Drag & Drop (bzw. Click & Assign) Oberfläche für das Drachenboot.
*   **Statistiken**: Echtzeit-Berechnung von Gesamtgewicht, Balance (Links/Rechts) und Trimm (Bug/Heck).
*   **Offline-First**: Dank PWA-Technologie und PostgreSQL auch ohne Internet nutzbar (nach initialer Synchronisation).
*   **Internationalisierung**: Verfügbar in Deutsch und Englisch (automatische Erkennung).
*   **Dark Mode**: Automatische Anpassung an das System-Theme.
*   **Hilfe & Support**: Integriertes Hilfe-Center mit Anleitungen, FAQs und direktem Kontakt zum Entwickler.
*   **Erweiterte Mitgliederverwaltung**: Status-Tracking (Ausstehend), einfache Rollenvergabe und Verwaltungsoptionen.
*   **Team Branding**: Personalisierung des Teams mit Akzentfarben (10 Auswahlmöglichkeiten) und individuellem Logo-Ring (PRO).
*   **PRO Features**: Unbegrenzte Mitglieder, iCal-Integration, PDF/Bild-Export ohne Wasserzeichen, erweiterte Branding-Optionen und **MCP Server API** für AI-Integration (z.B. Claude Desktop).
*   **Admin Dashboard**: Umfassende Statistiken zu Nutzern, Teams und Events inkl. Wachstumscharts und System-Metriken (nur für Administratoren).

### 🔒 Rollen & Berechtigungen

*   **Captain**: Voller Zugriff auf das eigene Team. Kann Teams erstellen (wird automatisch Captain), Einstellungen ändern, Mitglieder verwalten und Termine planen. Alle schreibenden API-Endpunkte für Team-Ressourcen sind geschützt.
*   **Paddler**: Eingeschränkter Zugriff. Kann nur das eigene Profil (Gewicht, Seite, Skills) bearbeiten und Zu/Absagen für Termine geben. Beim Bearbeiten des Profils bleiben vom Captain zugewiesene Spezialrollen (z.B. Schlag) erhalten. Kein Zugriff auf Teameinstellungen. Schreibzugriffe auf fremde Daten werden blockiert.
*   **Admin**: Zugriff auf das `/admin/dashboard`. Wird über die `ADMIN_EMAILS` Umgebungsvariable gesteuert.

## 🛠 Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
*   **Runtime**: [Node.js 24+](https://nodejs.org/)
*   **Language**: [TypeScript 5.x](https://www.typescriptlang.org/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma 7 ORM](https://www.prisma.io/)
*   **Auth**: [Auth.js v5](https://authjs.dev/) (NextAuth Beta)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
*   **Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
*   **PWA**: [@ducanh2912/next-pwa](https://github.com/ducanh2912/next-pwa)
*   **AI Integration**: [MCP SDK](https://github.com/modelcontextprotocol/sdk) (Model Context Protocol)
*   **Payments**: [Stripe](https://stripe.com/)
*   **Email**: [Resend](https://resend.com/) & [React Email](https://react.email/)

## 🏗 Gesamtarchitektur

```mermaid
flowchart TB
    %% Entry Points
    User((Nutzer / Browser))
    AI_Agent((AI Agent / Claude))

    %% Client Layer
    subgraph Client ["Client Layer (PWA)"]
        direction TB
        UI[React 19 / Tailwind 4]
        State[React Context / DrachenbootContext]
        PWA_SW[Service Worker / Offline Support]
        Auth_Client[Auth.js Session Management]
    end

    %% Server Layer
    subgraph Server ["Next.js Server (App Router)"]
        direction TB
        direction TB
        ServerActions[Server Actions / Business Logic]
        API_Routes[API Routes / REST / OpenAPI]
        MCP_Server[MCP Server / Tool Definitions]
        Email_Engine[Resend / Mail Queue]
    end

    %% Data Layer
    subgraph Storage ["Data Layer"]
        Prisma[Prisma 7 Client]
        Postgres[(PostgreSQL)]
        Prisma --- Postgres
    end

    %% External Services
    subgraph External ["Externe Services"]
        Stripe[Stripe Checkout & Billing]
        Resend_API[Resend Transactional Email]
    end

    %% Connections
    User -->|HTTPS| UI
    AI_Agent <-->|MCP/SSE| MCP_Server
    
    UI <--> ServerActions
    UI <--> API_Routes
    UI --- PWA_SW
    
    ServerActions <--> Auth_Client
    ServerActions --> Prisma
    API_Routes --> Prisma
    MCP_Server --> Prisma
    
    ServerActions -->|Payment Flow| Stripe
    Stripe -- "Webhooks" --> API_Routes
    
    Email_Engine -->|SMTP/API| Resend_API
    ServerActions --> Email_Engine

    %% Styling
    style User fill:#e1f5fe,stroke:#01579b
    style AI_Agent fill:#f3e5f5,stroke:#4a148c
    style Server fill:#f1f8e9,stroke:#33691e
    style Client fill:#fff3e0,stroke:#e65100
    style Storage fill:#eceff1,stroke:#263238
    style External fill:#fce4ec,stroke:#880e4f
    style Postgres fill:#fff9c4,stroke:#fbc02d
```

## 📂 Projektstruktur

```
src/
├── app/                 # Next.js App Router Pages (TSX)
│   ├── layout.tsx       # Root Layout & Providers
│   ├── page.tsx         # Landing Page
│   ├── app/             # Main Application
│   │   ├── page.tsx     # Team View
│   │   ├── admin/       # Admin Dashboard
│   │   ├── planner/     # Planner View Route
│   │   └── teams/       # Team Management Pages
│   └── api/             # API Routes (Prisma)
├── components/
├── context/             # Global State (Daten, Sprache, Tour)
├── locales/             # Übersetzungsdateien (de.json, en.json)
├── types/               # TypeScript Definitionen (index.ts)
└── utils/               # Hilfsfunktionen (Algorithmus)
prisma/
└── schema.prisma        # Prisma Schema (Datenmodell)
```

## 🚀 Getting Started

### Voraussetzungen

*   Node.js 18.17+
*   npm oder yarn

### Konfiguration

#### Lokale Entwicklung (empfohlen)

Für die lokale Entwicklung wird Docker für die PostgreSQL-Datenbank verwendet:

1. Docker Desktop installieren (falls nicht vorhanden)
2. `.env` Datei erstellen basierend auf `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. **Admin Konfiguration (Optional):**
   Füge deine E-Mail-Adresse zu `ADMIN_EMAILS` in der `.env` hinzu, um Zugriff auf das Dashboard zu erhalten:
   ```bash
   ADMIN_EMAILS="deine@email.de,admin@drachenboot.app"
   ```
4. Datenbank starten:
   ```bash
   npm run db:up
   ```

**Verfügbare Datenbank-Befehle:**
*   `npm run db:up` - Startet die PostgreSQL-Datenbank
*   `npm run db:down` - Stoppt die Datenbank
*   `npm run db:reset` - Setzt die Datenbank zurück (löscht alle Daten!)
*   `npm run db:studio` - Öffnet Prisma Studio (Web-UI zur Datenbank-Inspektion)

#### Database Seeding (Testdaten)

Um die Datenbank mit initialen Testdaten (Nutzern, PRO-Teams, Paddlern) zu füllen:

1.  **SEED_EMAILS konfigurieren:**
    Füge in deiner `.env` die E-Mail-Adressen hinzu, für die Testdaten generiert werden sollen:
    ```bash
    SEED_EMAILS="jan@janhartje.com,reg@janhartje.com"
    ```
2.  **Seed ausführen:**
    ```bash
    npx prisma db seed
    ```
    *Hinweis: Wenn du `npm run db:reset` ausführst, wird der Seed automatisch im Anschluss ausgeführt.*

#### Produktion (Vercel)

Erstelle eine `.env` Datei im Hauptverzeichnis (siehe `.env.example`):

```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
POSTGRES_URL="postgresql://user:password@localhost:5432/drachenboot"
ADMIN_EMAILS="admin@example.com"
```

### Installation

1.  Repository klonen:
    ```bash
    git clone <repo-url>
    cd drachenbootplan
    ```

2.  Abhängigkeiten installieren:
    ```bash
    npm install
    ```

3.  Datenbank aufsetzen:
    ```bash
    npx prisma migrate dev
    npx prisma generate
    ```

4.  Development Server starten:
    ```bash
    npm run dev
    ```

5.  App öffnen: [http://localhost:3000](http://localhost:3000)

## 📱 PWA Installation

Die App kann als Progressive Web App (PWA) installiert werden:

1. Öffne die App im Browser (Chrome, Edge, Safari)
2. Navigiere zur App-Seite (`/app`)
3. Klicke auf den **"App installieren"** Button im Header
4. Bestätige die Installation
5. Die App wird als eigenständige Anwendung auf deinem Gerät installiert

**Vorteile der PWA-Installation:**
- Direkter Zugriff vom Home-Screen/Desktop
- Schnellere Ladezeiten durch Caching
- Offline-Funktionalität
- Native App-Erfahrung ohne App Store

## 🧪 Testing

Das Projekt verwendet **Jest** und **React Testing Library** für Unit- und Integrationstests.

### Tests ausführen

```bash
npm test
```

### CI/CD

Tests werden automatisch bei jedem Push und Pull Request auf den `main` Branch via **GitHub Actions** ausgeführt.

- **Unit Tests**: `src/utils/__tests__` (Algorithmus-Logik)
- **Component Tests**: `src/components/**/__tests__` (UI-Komponenten wie `SeatBox`, `Stats`, `Header`)

### Test User (Automated Testing)

For automated testing (e.g. E2E tests) or local development without email magic links, a **Test User** is available.

*   **Email**: `test@drachenbootmanager.de`
*   **Password**: `testuser123` (or set via `TEST_USER_PASSWORD` env var)
*   **Provider**: `credentials`

**Note:** This login method is **only available** in `development` and `test` environments (Node.env). It creates the user in the database if it doesn't exist.

To use the Test User in a **production** environment (e.g. `npm run start`), you must explicitly enable it by setting the environment variable in your `.env`:
```bash
ENABLE_TEST_USER="true"
```

## 📚 Dokumentation

Die vollständige Dokumentation findest du im **[docs/ Ordner](docs/README.md)**.

*   **[Gesamtüberblick & Navigation](docs/README.md)** - Startpunkt für die gesamte technische Dokumentation.
*   **[API Dokumentation (OpenAPI)](http://localhost:3000/docs)** - Interaktive Swagger UI (lokal).
*   **[Datenmodell](docs/data-model.md)** - Detaillierte Erklärung der Datenbankstruktur.
*   **[MCP Server Guide](docs/mcp-guide.md)** - Anleitung zur Anbindung an KI-Modelle.
*   **[Testfall-Katalog](docs/test_cases/README.md)** - Übersicht über alle funktionalen Testfälle.

## 👨‍💻 Development Guidelines

### Localization
Neue Features müssen vollständig lokalisiert werden. Bitte aktualisiere immer beide Sprachdateien:
*   `src/locales/de.json`
*   `src/locales/en.json`

### Testing
Jedes neue Feature und jeder Bugfix sollte von Tests begleitet werden.
*   **Logik**: Unit Tests in `src/utils/__tests__`
*   **UI**: Component Tests in `src/components/**/__tests__`

### E-Mail System
Wir nutzen **Resend** und **React Email** für den Versand von transaktionalen E-Mails.

*   **Templates**: Zu finden in `src/emails/templates`.
*   **Komponenten**: Wiederverwendbare E-Mail-Komponenten in `src/emails/components`.
*   **Layout**: Neue Templates immer mit `<EmailLayout>` umschließen, um ein einheitliches Branding und den rechtlichen Footer sicherzustellen.
*   **i18n**: Alle Templates unterstützen Deutsch und Englisch via `lang` Prop (`'de'` | `'en'`).
*   **Versand**: Nutze die Helper-Funktion `src/lib/email.ts`.
*   **Logging**: Alle E-Mails werden in der `SentEmail`-Tabelle gespeichert (inkl. Status, Fehler, Props).

#### Entwicklung & Testing
Du kannst E-Mail-Templates lokal im Browser entwickeln und testen, ohne sie versenden zu müssen:

```bash
npm run email
```

Dies startet einen lokalen Server unter `http://localhost:3010`, auf dem du alle Templates live sehen und bearbeiten kannst. Änderungen am Code werden sofort reflektiert.

Benötigte Node.js Version: **18+** (nutze `nvm use`, falls nötig).

### Stripe Integration (Payments & Subscriptions)

Wir nutzen **Stripe** für die Zahlungsabwicklung des PRO-Abos.

#### Umgebungsvariablen

Folgende Variablen müssen in `.env` gesetzt werden:

```bash
STRIPE_SECRET_KEY=sk_test_...           # Stripe Secret Key (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Stripe Publishable Key (Test Mode)
STRIPE_PRO_PRICE_ID=price_...           # Preis-ID des PRO-Produkts (monthly oder yearly)
STRIPE_WEBHOOK_SECRET=whsec_...         # Webhook Secret (siehe unten)
```

#### Stripe CLI für lokale Entwicklung

1. **Installation (macOS):**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login:**
   ```bash
   stripe login
   ```
   Folge den Anweisungen im Browser, um den Pairing-Code zu bestätigen.

3. **Webhook-Listener starten:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Dieser Befehl gibt dir den `STRIPE_WEBHOOK_SECRET` aus (beginnt mit `whsec_...`). Trage diesen in deine `.env` ein.

4. **Events testen:**
   ```bash
   stripe trigger invoice.payment_succeeded
   ```

#### Test-Kreditkarten

| Szenario | Kartennummer | CVC | Ablaufdatum |
|----------|--------------|-----|-------------|
| **Erfolgreiche Zahlung** | `4242 4242 4242 4242` | Beliebig | Beliebig in der Zukunft |
| **3D Secure erforderlich** | `4000 0025 0000 3155` | Beliebig | Beliebig |
| **Zahlung abgelehnt** | `4000 0000 0000 0002` | Beliebig | Beliebig |
| **Unzureichende Deckung** | `4000 0000 0000 9995` | Beliebig | Beliebig |

**SEPA-Lastschrift (Test):** `DE89 3704 0044 0532 0130 00`

👉 Vollständige Liste: [Stripe Testing Docs](https://docs.stripe.com/testing)

### InfoCards System

Ein generisches System für dauerhaft ausblendbare Hinweise (Dismissible Info Cards), das den Status pro User in der Datenbank speichert.

*   **Datenbank**: `DismissedInfoCard` Model speichert `userId` + `cardId`.
*   **Frontend**: `<InfoCard id="my-card-id">...</InfoCard>` Komponente.
*   **Backend**: `dismissInfoCard` Server Action.
*   **Verwendung**: Nutze dies für Onboarding-Elemente oder einmalige Hinweise, die nicht wiederkehren sollen.

### PRO Subscription Model

Das PRO-Abo erweitert Teams um Premium-Features:

#### Pläne

| Plan | Mitglieder | Features |
|------|------------|----------|
| **FREE** | Max. 25 | Basis-Features, Magic KI, Terminplanung |
| **PRO** | Unbegrenzt | + PDF/Bild Export, iCal Integration, bevorzugter Support |

#### Preisgestaltung

- **Jährlich:** €48/Jahr (€4/Monat, -20% Rabatt)
- **Monatlich:** €5/Monat

#### Technische Umsetzung

- **Kauf:** `/app/teams/[id]/upgrade` - Custom Checkout mit Stripe Elements
- **Webhook:** `/api/webhooks/stripe` - Updates `team.plan` auf `'PRO'` bei erfolgreicher Zahlung
- **Portal:** `/api/stripe/create-portal-session` - Öffnet Stripe Customer Portal für Abo-Verwaltung
- **Preis-Auswahl:** Backend wählt dynamisch zwischen Monthly/Yearly Price-ID basierend auf Frontend-Auswahl

#### Datenbank-Felder (Team-Modell)

```prisma
plan               String   @default("FREE")  // 'FREE' | 'PRO'
subscriptionStatus String?                    // 'active' | 'canceled' | 'past_due'
stripeCustomerId   String?                    // Stripe Customer ID
maxMembers         Int      @default(25)      // Mitglieder-Limit
```

#### Wichtige Events (Webhooks)

- `charge.refunded`
- `checkout.session.completed`
- `customer.updated`
- `customer.subscription.created`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `customer.subscription.updated`
- `invoice.payment_action_required`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

### MCP Server (PRO)

Der **Model Context Protocol (MCP) Server** ermöglicht es AI-Assistenten wie Claude Desktop, programmatisch mit der Drachenboot Manager API zu interagieren. Dies ist ein exklusives Feature für PRO-Teams.

#### Features

- **Team Management**: Teams auflisten und Details abrufen
- **Paddler Management**: Paddler auflisten, erstellen, **Gäste hinzufügen/entfernen**
- **Event Management**: Events auflisten, **erstellen**, **bearbeiten**, **löschen** und verwalten
- **Assignments**: Bootsbesetzung abrufen, **Sitze leeren** und **komplette Sitzpläne speichern**

#### Quick Start

1. **API Key generieren**:
   - Navigiere zu **Team Settings** → **API Access**
   - Klicke auf "Generate New Key"
   - Kopiere den generierten Key (wird nur einmal angezeigt!)

2. **Claude Desktop konfigurieren**:
   ```json
   // ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
   {
     "mcpServers": {
       "drachenboot": {
         "command": "npx",
         "args": [
           "-y",
           "@mcpwizard/sse-bridge",
           "https://drachenbootmanager.app/api/mcp",
           "--header",
           "X-API-KEY:dbm_live_xxx..."
         ]
       }
     }
   }
   ```

3. **Claude Desktop neustarten** und loslegen!

#### Beispiel-Prompts

- "Welche Teams habe ich im Drachenboot Manager?"
- "Liste alle Paddler in meinem Team auf"
- "Erstelle einen neuen Paddler namens 'Max Mustermann' mit 80kg"
- "Zeige mir die nächsten 10 Events"

**Ausführliche Dokumentation**: [docs/mcp-guide.md](docs/mcp-guide.md)

## 🧠 Key Concepts

*   **Team**: Eine Gruppe mit eigenem Kader und Terminkalender. Mehrere Teams können parallel verwaltet werden.
*   **Paddler**: Ein Teammitglied mit Eigenschaften wie Gewicht und bevorzugter Seite.
*   **Event**: Ein Training oder eine Regatta mit einer Liste von `attendance` (Zu/Absagen).
*   **Assignment**: Die Zuordnung eines Paddlers zu einem Sitzplatz (`row-1-left`, `drummer`, etc.) für ein spezifisches Event.
*   **Canister**: Ein Platzhalter-Objekt (25kg), das wie ein Paddler behandelt wird, um Lücken zu füllen oder Gewicht auszugleichen.

## 🤝 Contributing

Verbesserungsvorschläge und Pull Requests sind willkommen! Bitte achte auf sauberen Code und aktualisiere Tests/Doku bei Änderungen.

## 📄 License

**Proprietary / All Rights Reserved**

Copyright (c) 2025 Jan Hartje.
Dieses Projekt ist urheberrechtlich geschützt. Jegliche kommerzielle Nutzung, Vervielfältigung oder Verbreitung ohne ausdrückliche schriftliche Genehmigung ist untersagt.

---
Made with ❤️ in Hannover.
