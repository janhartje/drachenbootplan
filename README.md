Drachenboot Planer

Dies ist eine moderne Web-App zur Verwaltung von Drachenboot-Teams, Planung von Trainings und Optimierung der Bootsbesetzung.

Features

Team-Verwaltung: Kader mit Gewicht und Fähigkeiten (Links, Rechts, Trommel, Steuer).

Termin-Planung: Trainings und Regatten mit Anwesenheitsliste.

Boots-Konfigurator: Interaktives Drag & Drop System.

Smart Auto-Fill: Algorithmus zur automatischen Besetzung basierend auf Balance, Trimm und Skills.

Live-Physik: Echtzeit-Anzeige von Balance (Links/Rechts) und Schwerpunkt (Vorne/Hinten).

Export: Speichern der Aufstellung als Bild.

Offline-Fähig: Alle Daten werden lokal im Browser gespeichert (PWA-ready).

Setup (Lokal & Hosting)

Voraussetzungen

Node.js installiert (für die Entwicklung)

Installation

Projekt erstellen:

npx create-next-app@latest drachenboot-app
cd drachenboot-app


(Wähle bei der Installation: JS, Tailwind CSS, App Router)

Abhängigkeiten installieren:

npm install lucide-react html2canvas


Dateien kopieren:

Kopiere den Inhalt von DrachenbootPlaner.jsx nach src/components/DrachenbootPlaner.jsx (erstelle den Ordner components falls nötig).

Öffne src/app/page.js und ersetze den Inhalt mit:

import DrachenbootPlaner from '@/components/DrachenbootPlaner';

export default function Home() {
  return <DrachenbootPlaner />;
}


Starten:

npm run dev


Öffne http://localhost:3000.

Deployment (GitHub Pages / Statisch)

Um die App auf jedem beliebigen Webserver (oder GitHub Pages) zu hosten, musst du sie als statische Seite exportieren.

Ändere next.config.mjs zu:

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true }, // Wichtig für statischen Export
};
export default nextConfig;


Baue die App:

npm run build


Der Inhalt des Ordners out ist deine fertige Webseite. Lade diesen Ordner einfach auf deinen Webspace hoch.
