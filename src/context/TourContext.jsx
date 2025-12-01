"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
  const [driverObj, setDriverObj] = useState(null);

  // Define tour configurations
  const tours = {
    welcome: [
      { 
        element: '#tour-welcome', 
        popover: { 
          title: 'Willkommen beim Drachenboot Manager!', 
          description: 'Hier ist eine kurze Tour durch die wichtigsten Funktionen.', 
          side: "center", 
          align: 'center' 
        } 
      },
      { 
        element: '#tour-new-event', 
        popover: { 
          title: 'Neue Termine', 
          description: 'Hier kannst du neue Trainings oder Regatten anlegen.', 
          side: "right", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-paddler-form', 
        popover: { 
          title: 'Mitglieder verwalten', 
          description: 'Füge neue Paddler hinzu oder bearbeite bestehende Mitglieder.', 
          side: "left", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-event-list', 
        popover: { 
          title: 'Terminübersicht', 
          description: 'Hier siehst du alle anstehenden Termine und kannst Zu/Absagen verwalten.', 
          side: "right", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-paddler-grid', 
        popover: { 
          title: 'Kader Übersicht', 
          description: 'Alle deine Teammitglieder auf einen Blick.', 
          side: "top", 
          align: 'start' 
        } 
      }
    ],
    planner: [
      {
        element: '#tour-planner-stats',
        popover: {
          title: 'Statistik & Tools',
          description: 'Hier siehst du die Gewichtsverteilung und kannst den Trimm anpassen.',
          side: "right",
          align: 'start'
        }
      },
      {
        element: '#tour-planner-pool',
        popover: {
          title: 'Verfügbare Paddler',
          description: 'Alle Paddler, die für diesen Termin zugesagt haben. Klicke auf einen Paddler, um ihn auszuwählen.',
          side: "right",
          align: 'start'
        }
      },
      {
        element: '#tour-planner-canister',
        popover: {
          title: 'Kanister hinzufügen',
          description: 'Füge einen 25kg Kanister als Platzhalter oder Gewichtsausgleich hinzu.',
          side: "bottom",
          align: 'end'
        }
      },
      {
        element: '#tour-planner-guest',
        popover: {
          title: 'Gast hinzufügen',
          description: 'Füge einen Gastpaddler hinzu, der nicht in der regulären Mitgliederliste steht.',
          side: "bottom",
          align: 'end'
        }
      },
      {
        element: '#tour-planner-boat',
        popover: {
          title: 'Bootsbesetzung',
          description: 'Klicke auf einen Sitzplatz, um den ausgewählten Paddler zu setzen. Nutze das "X" zum Entfernen und die Pin-Nadel zum Fixieren (schützt vor Magic KI Änderungen).',
          side: "left",
          align: 'start'
        }
      },
      {
        element: '#tour-planner-autofill',
        popover: {
          title: 'Magic KI',
          description: 'Lass die künstliche Intelligenz das Boot automatisch optimal besetzen.',
          side: "top",
          align: 'center'
        }
      },
      {
        element: '#tour-planner-export',
        popover: {
          title: 'Export',
          description: 'Speichere die aktuelle Aufstellung als Bild.',
          side: "top",
          align: 'center'
        }
      }
    ]
  };

  useEffect(() => {
    const driverInstance = driver({
      showProgress: true,
      animate: true,
      doneBtnText: 'Fertig',
      nextBtnText: 'Weiter',
      prevBtnText: 'Zurück',
      // Steps will be set dynamically
    });

    setDriverObj(driverInstance);
  }, []);

  const startTour = (tourName = 'welcome') => {
    if (driverObj && tours[tourName]) {
      driverObj.setConfig({
        steps: tours[tourName],
        onDestroyed: () => {
          localStorage.setItem(`${tourName}_tour_seen`, 'true');
        }
      });
      driverObj.drive();
    }
  };

  const checkAndStartTour = (tourName) => {
    const tourSeen = localStorage.getItem(`${tourName}_tour_seen`);
    if (!tourSeen && driverObj) {
      startTour(tourName);
    }
  };

  // Check on mount if we should start welcome tour
  useEffect(() => {
    if (driverObj) {
        setTimeout(() => {
             // Only auto-start welcome tour on main page, logic handled by component usage or here if we check path
             if (window.location.pathname === '/') {
                checkAndStartTour('welcome');
             }
        }, 500);
    }
  }, [driverObj]);

  return (
    <TourContext.Provider value={{ startTour, checkAndStartTour }}>
      {children}
    </TourContext.Provider>
  );
};
