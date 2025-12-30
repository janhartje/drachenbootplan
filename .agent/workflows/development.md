---
description: Allgemeine Entwicklungs-Standards und Dokumentations-Pflichten
---
# Entwicklungs-Standards

Diese Standards gelten für **alle** Änderungen am Code (Features, Bugfixes, Refactorings), nicht nur für Datenbank-Änderungen.

## 1. Dokumentations-Pflicht
Jeder Task ist erst abgeschlossen, wenn auch die zugehörige Dokumentation aktualisiert wurde:

- **Changelog**: Jede sichtbare Änderung oder wichtige technische Neuerung muss in `src/locales/de.json` und `src/locales/en.json` (unter `changelogData`) eingetragen werden.
- **README.md**: Bei neuen Features, Architektur-Änderungen oder neuen Abhängigkeiten muss die README aktuell gehalten werden.
- **OpenAPI (public/openapi.json)**: Jede Änderung an API-Endpunkten (Parameter, Response-Struktur, neue Endpunkte) muss sofort in der Spezifikation nachgezogen werden.
- **DATA_MODEL.md**: Bei Änderungen am Prisma-Schema muss das ERD (Mermaid) und die Tabellenbeschreibung aktualisiert werden.

## 2. Datenbank-Änderungen
Für Datenbank-Änderungen gilt zwingend der [Datenbank-Workflow](file:///Users/janhartje/drachenbootplan/.agent/workflows/database.md). **Niemals `prisma db push` verwenden.**

## 3. API Sicherheit & RBAC
- **Rechteprüfung**: Schreibende API-Endpunkte für Team-Ressourcen müssen **immer** prüfen, ob der Nutzer die `CAPTAIN` Rolle für das entsprechende Team besitzt.
- **Daten-Isolation**: Es muss sichergestellt werden, dass Nutzer niemals Zugriff auf Daten anderer Teams erhalten (Multi-Team-Isolation).

## 4. E-Mail System (React Email & Resend)
- **Templates**: Neue E-Mail-Templates in `src/emails/templates` müssen immer mit dem `<EmailLayout>` umschließen.
- **Lokalisation**: Templates müssen Deutsch und Englisch via `lang` Prop unterstützen.
- **Logging**: Alle versendeten E-Mails müssen über das Warteschlangen-System (`EmailQueue`) oder die Log-Tabelle (`SentEmail`) dokumentiert werden.

## 5. Stripe & Zahlungen
- **Lokales Testing**: Webhooks müssen lokal mit der Stripe CLI (`stripe listen`) getestet werden.
- **Testdaten**: Verwende ausschließlich Stripe Test-Kreditkarten für die Entwicklung.
- **Synchronisation**: Der Abo-Status (`team.plan`) muss über Webhooks konsistent gehalten werden.

## 6. Qualitätssicherung & Linting
- **Linting**: Bei größeren Anpassungen muss **immer** der Linter (`npm run lint`) ausgeführt werden.
- **Tests**: Logik-Änderungen (insb. der Algorithmus) in `src/utils/__tests__` und UI in `src/components/**/__tests__` absichern.

## 7. Umgebungsvariablen
- Bei Einführung neuer Umgebungsvariablen muss die `.env.example` Datei sofort aktualisiert werden.

## 8. Lokalisation (i18n)
Texte dürfen niemals hardcodiert werden. Alle User-sichtbaren Texte müssen in `src/locales/de.json` und `src/locales/en.json` hinterlegt werden.
