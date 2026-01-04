---
description: Standard procedure for updating CHANGELOG and version numbers
---

# Changelog & Version Update Workflow

Dieser Workflow definiert, wie das Changelog erweitert und Versionsnummern im Repository hochgezählt werden.

## Versioning Strategy

Wir verwenden **Semantic Versioning** (SemVer) im Format `MAJOR.MINOR.PATCH`:

- **MAJOR** (z.B. 3.0.0): Breaking Changes, große Überarbeitungen
- **MINOR** (z.B. 3.1.0): Neue Features, rückwärtskompatibel
- **PATCH** (z.B. 3.0.1): Bugfixes, kleine Verbesserungen

## 1. Changelog aktualisieren

Das Changelog ist **NICHT** in einer separaten CHANGELOG.md-Datei, sondern wird direkt in den Locale-Dateien verwaltet:

- **Deutsch**: `src/locales/de.json` → `changelogData` Array
- **Englisch**: `src/locales/en.json` → `changelogData` Array

### Schritte:

1. **Neue Version als erstes Element hinzufügen** (am Anfang des `changelogData` Arrays)
2. **Struktur beachten**:
   ```json
   {
     "version": "3.1.0",
     "date": "Februar 2026",
     "features": [
       "Beschreibung des neuen Features auf Deutsch/Englisch"
     ],
     "technical": [
       "Technische Änderungen (z.B. Performance-Verbesserungen)"
     ],
     "bugfixes": [
       "Behobener Bug #123: Beschreibung"
     ]
   }
   ```

3. **Beide Sprachen synchron halten**: Änderungen in `de.json` UND `en.json` vornehmen

### Beispiel:

**Deutsch (`src/locales/de.json`)**:
```json
"changelogData": [
  {
    "version": "3.1.0",
    "date": "Februar 2026",
    "features": [
      "CSV-Export für Paddlerlisten",
      "Verbesserte Statistiken im Admin-Dashboard"
    ],
    "technical": [
      "Datenbank-Indexe für schnellere Abfragen optimiert"
    ],
    "bugfixes": [
      "Fix: Fehler beim Löschen von Gast-Paddlern behoben"
    ]
  },
  {
    "version": "3.0.0",
    ...
  }
]
```
