---
description: Entwicklungsrichtlinien für neue Features mit Testfall-Anforderungen (Test-First/TDD)
---

# Feature Development Workflow (Test-First)

Dieser Workflow definiert die Anforderungen für die Entwicklung neuer Features. **Wir folgen einem strikten Test-First (TDD) Ansatz.**

## 1. Grundprinzip: Test-First

**Kein Feature-Code ohne vorherigen roten Test.**

Dies gilt für:
- **Große Features** (Verpflichtend: Markdown Test Cases + Automatisierte Tests)
- **Kleine Features / Bugfixes** (Verpflichtend: Automatisierte Tests, optional Markdown Test Cases)

## 2. Definition "Großes Feature"

Ein Feature gilt als "groß", wenn mindestens eines der folgenden Kriterien zutrifft:
- Es umfasst **mehr als 3 Dateien** oder **mehr als 200 Zeilen Code**
- Es führt einen **neuen User Flow** oder eine **neue Hauptfunktionalität** ein
- Es beeinflusst **kritische Geschäftslogik** (z.B. Zahlungen, Datenimport/export, Authentifizierung)
- Es verändert **bestehende User Journeys** signifikant

## 3. Workflow für Feature-Entwicklung

### Schritt 1: Planung & Analyse
- Analysiere die Feature-Anforderungen.
- Erstelle bei großen Features Markdown-Testfälle (siehe unten).

### Schritt 2: TDD - Tests schreiben (RED)
**Bevor** du auch nur eine Zeile Produktiv-Code schreibst:

1.  **Erstelle Markdown-Testfälle** (Nur bei großen Features, siehe Format unten).
2.  **Schreibe automatisierte Tests** (Jest, Vitest, oder Playwright).
    - Die Tests müssen die Anforderungen des Features abdecken.
    - **Führe die Tests aus**: Sie MÜSSEN zu diesem Zeitpunkt fehlschlagen ("Red").
    - Wenn der Test kompiliert, aber fehlschlägt (z.B. `expect(received).toBe(expected)`), ist er bereit.

### Schritt 3: Implementierung (GREEN)
- Implementiere das Feature so einfach wie möglich, um die Tests user expectations zu erfüllen.
- Schreibe nur so viel Code wie nötig.
- Führe die Tests regelmäßig aus.
- Ziel: **Alle Tests sind grün.**

### Schritt 4: Refactoring (REFACTOR)
- Optimiere den Code (Clean Code, Performance).
- Stelle sicher, dass die Tests weiterhin grün bleiben.

### Schritt 5: Verification & Documentation
- Führe die Markdown-Testfälle manuell oder via Browser-Tool aus (falls vorhanden).
- Aktualisiere die Dokumentation.

## 4. Anforderung: Markdown Testfälle (Für große Features)

Zusätzlich zu automatisierten Code-Tests benötigen große Features dokumentierte Testabläufe in `docs/test_cases/`.

### Format
Dateiname: `[Nummer]-[feature-name].md` (z.B. `015-export-without-watermark.md`)

```markdown
# Test Case: [Feature-Name]

**ID**: TC-[Nummer]
**Description**: [Kurze Beschreibung]
**Pre-conditions**:
- [Vorbedingung 1]

**Steps**:
1. [Schritt 1]
2. [Schritt 2]

**Expected Result**:
- [Erwartetes Ergebnis]
```

## 5. Antigravity Testing Support
- Nutze `/testing` Workflow für exploratives Testen.
- Neue Bugs werden als Issues mit Label `bug` erfasst.

## Beispiele

✅ **Muss vollständig getestet werden (TDD + Markdown)**:
- CSV Import für Paddler
- Stripe Pro-Subscription Flow

✅ **Muss automatisiert getestet werden (TDD)**:
- Bugfix in Berechnung
- Neue Utility-Funktion
- Kleine UI-Logik (z.B. bedingtes Rendern)

❌ **Braucht keine Tests**:
- Reine CSS-Änderungen (sofern keine Logik betroffen)
- Text-Änderungen (Copy)
- Dependency-Updates (sofern Builds und bestehende Tests laufen)
