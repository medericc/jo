'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, CalendarPlus } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { createEvents } from "ics";

type Match = {
  id: string;
  date: Date;
  opponent: string;
  opponentLogo: string;
  link: string;
};

function formatOpponentName(name: string): string {
  const mapping: { [key: string]: string } = {
    "Los Angeles Sparks": "L.A. Sparks",
    "Washington Mystics": "Washington",
    "Phoenix Mercury": "Phoenix",
    "New York Liberty": "NY Liberty",
    "Golden State Valkyries": "Golden State",
  };
  return mapping[name] || name;
}

export default function LibertySchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocalTimes, setShowLocalTimes] = useState<{ [key: string]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGoogleInstructions, setShowGoogleInstructions] = useState(false);
 const [showiOSInstructions, setShowiOSInstructions] = useState(false); 
  
  useEffect(() => {
    const getMatches = async () => {
      const res = await fetch(
        `/api/proxy?url=${encodeURIComponent(
          'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/teams/nyl/schedule'
        )}`
      );

      const data = await res.json();

      const now = new Date();
      const nowMinus5h = new Date(now.getTime() - 5 * 60 * 60 * 1000);

      const parsed = data.events
        .filter((event: any) => new Date(event.date) > nowMinus5h)
        .map((event: any) => {
          const date = new Date(event.date);

          const [home, away] = event.competitions[0].competitors;
          const isGSVHome = home.team.displayName === 'New York Liberty';

          const opponentTeam = isGSVHome ? away.team : home.team;
          const opponentName = formatOpponentName(opponentTeam.displayName);

  
          return {
            id: event.id,
            date,
            opponent: formatOpponentName(opponentTeam.displayName),
            opponentLogo: opponentTeam.logos?.[0]?.href ?? '',
            link: event.links?.[0]?.href ?? '#',
          };
        });

      setMatches(parsed);
      setLoading(false);
    };

    getMatches();
  }, []);

  const generateICS = () => {
    const events = matches.map((match) => ({
      start: [
        match.date.getFullYear(),
        match.date.getMonth() + 1,
        match.date.getDate(),
        match.date.getHours(),
        match.date.getMinutes(),
      ] as [number, number, number, number, number],
      duration: { hours: 2 },
      title: `New York Liberty vs ${match.opponent}`,
      description: `Match contre ${match.opponent}`,
      location: 'Match WNBA',
      url: match.link,
    }));

    const { error, value } = createEvents(events as any);

    if (!error && value) {
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'liberty_matchs.ics';
      a.click();
    }
  };
  const handleAppleOutlookImport = () => {
    generateICS(); // Télécharge le fichier .ics
    setShowiOSInstructions(true); // Affiche les instructions iOS
  };
  
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-72px)] -mt-16">
  <div className="relative w-72 h-80 overflow-hidden">
          <img
            src="/loader.jpg"
            alt="Chargement des matchs"
            className="absolute top-0 left-0 w-full h-full object-contain object-center animate-reveal-image"
          />
        </div>
        <style jsx>{`
          @keyframes reveal-image {
            0% {
              clip-path: inset(0 100% 0 0); /* Masque total de l'image de gauche à droite */
              transform: scale(1); /* Pas de redimensionnement */
              opacity: 1; /* L'image est visible mais masquée */
            }
            100% {
              clip-path: inset(0 0 0 0); /* L'image est complètement révélée */
              transform: scale(1); /* L'image conserve sa taille normale */
              opacity: 1; /* L'image reste visible */
            }
          }
  
          .animate-reveal-image {
            animation: reveal-image 2.5s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }
  
  const handleGoogleCalendarImport = () => {
    generateICS();
    setShowGoogleInstructions(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
    <ul className="space-y-4">
      {matches.map((match) => {
     const isLocal = showLocalTimes[match.id];

     // Langue du navigateur
     const browserLocale = Intl.DateTimeFormat().resolvedOptions().locale;
     const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
     
     // Si la langue commence par "en", on considère que c'est de l'anglais
     const isEnglish = browserLocale.startsWith('en');
     
     // Langue utilisée : français par défaut, anglais seulement si langue navigateur = anglais
     const locale = isLocal ? (isEnglish ? 'en-US' : 'fr-FR') : 'fr-FR';
     
     // Fuseau horaire : local si demandé, sinon Paris
     const timeZone = isLocal ? browserTimeZone : 'Europe/Paris';
     
     // Format 12h si anglais US/GB
     const use12HourFormat = ['en-US', 'en-GB'].includes(locale);
     
     // Libellé jour
     const dayLabel = new Date(match.date).toLocaleDateString(locale, {
       weekday: 'long',
       day: 'numeric',
       month: 'long',
       timeZone,
     }).toUpperCase();
     
      
      // Heure formatée selon locale
      const hourLabel = new Date(match.date).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: use12HourFormat,
        timeZone,
      });
      
      // Drapeau
      const flagCode = isLocal
        ? locale.split('-')[1]?.toLowerCase() || 'us'
        : 'fr';

        return (
          <li key={match.id}>
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl">
              <CardHeader className="text-center border-b p-4">
                <p className="text-xl font-semibold text-gray-800 tracking-wide">
                  {dayLabel}
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-between pl-6 pr-8 md:pl-16 md:pr-24 lg:pl-18 lg:pr-26 py-4">
                {/* Logo + Name */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-white  flex items-center justify-center overflow-hidden">
                  <img
  src={ match.opponentLogo}
  alt={match.opponent}
  className="object-contain w-10 h-10"
/>

                  </div>
                  <p className="text-sm font-medium text-gray-900 max-w-[140px] break-words leading-tight">
    {match.opponent}
  </p>
     </div>
  
                {/* Time box */}
                <div className="flex flex-col items-center text-sm text-gray-700 mt-1">
                  <img
                    src={`https://flagcdn.com/w40/${flagCode}.png`}
                    alt={flagCode.toUpperCase()}
                    className="w-5 h-4 mb-1"
                  />
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() =>
                      setShowLocalTimes((prev) => ({
                        ...prev,
                        [match.id]: !prev[match.id],
                      }))
                    }
                    title="Cliquez pour afficher l'heure locale"
                  >
                    <Clock className="w-3 h-3" />
                   <span className="text-sm">{hourLabel}</span>
  
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-teal-600 p-2 rounded-b-xl flex justify-center">
    <a
      href={match.link} // Assure-toi que match.link contient une URL valide
      target="_blank"
      rel="noopener noreferrer"
      className="text-base font-semibold text-white tracking-wide hover:underline"
    >
      MATCH DISPONIBLE ICI
    </a>
  </CardFooter>
  
  
  
            </Card>
          </li>
        );
      })}
    </ul>
        {/* Floating Button */}
        <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-teal-700 hover:bg-teal-800 text-white rounded-full p-4 shadow-lg z-50"
        title="Ajouter au calendrier"
      >
        <CalendarPlus className="w-6 h-6" />
      </button>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-xl p-6 pb-2 max-w-sm mx-auto shadow-xl">
  <DialogTitle className="text-xl font-bold mb-2 text-center">
    Ajouter tous les matchs à votre calendrier ?
  </DialogTitle>

  {!showGoogleInstructions && !showiOSInstructions ? (
    <div className="flex flex-col gap-4 mt-6">
      <button
        onClick={handleAppleOutlookImport}
        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm"
      >
        📅 Apple / Outlook (.ics)
      </button>
      <button
        onClick={handleGoogleCalendarImport }
        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm"
      >
        📆 Google Calendar
      </button>
      <button
        onClick={() => setIsModalOpen(false)}
        className="text-sm text-gray-500 mt-1"
      >
        Annuler
      </button>
    </div>
  ) : showGoogleInstructions ? (
    <div className="max-w-md mx-auto bg-white rounded-lg p-4 space-y-3 text-gray-800 text-center ">
      <p className="text-green-600 font-semibold text-sm">✅ Le fichier a été téléchargé !</p>
      <p className="text-base font-medium">Voici comment l'importer dans Google Calendar :</p>
      <ul className="list-decimal list-inside text-left pl-4 space-y-1 text-sm leading-relaxed mb-2">
        <li>
          Ouvrez <span className="font-semibold">Google Calendar</span>
        </li>
        <li>
          Cliquez sur la roue crantée en haut à droite → <span className="font-semibold">Paramètres</span>
        </li>
        <li>
          Allez dans <span className="font-semibold">Importer et exporter</span>
        </li>
        <li>
          Sélectionnez le fichier téléchargé : <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">liberty_matchs.ics</code>
        </li>
        <li>
          Importez-le dans le calendrier de votre choix
        </li>
        <li className="font-medium">
          🎉 Tous les matchs de MJ  sont maintenant dans votre agenda !
        </li>
      </ul>
      <button
        onClick={() => {
          setIsModalOpen(false);
          setShowGoogleInstructions(false);
        }}
        className="mt-6 text-sm text-purple-700 font-semibold hover:underline"
      >
        Fermer
      </button>
    </div>
  ) : showiOSInstructions ? (
    <div className="max-w-md mx-auto bg-white rounded-lg p-4 space-y-3 text-gray-800 text-center ">
      <p className="text-green-600 font-semibold text-sm">✅ Le fichier a été téléchargé !</p>
      <p className="text-base font-medium">Si pas déjà importer :</p>
      <ul className="list-decimal list-inside text-left pl-4 space-y-1 text-sm leading-relaxed mb-2">
        <li>Ouvrez l'application <span className="font-semibold">Fichiers</span></li>
        <li>Rendez-vous dans le dossier <span className="font-semibold">Téléchargements</span></li>
        <li>Appuyez sur le fichier <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">liberty_matchs.ics</code></li>
        <li>Choisissez <span className="font-semibold">Ajouter à Calendrier</span> si proposé</li>
        <li className="font-medium">📅 Tous les matchs sont maintenant ajoutés à votre calendrier !</li>
      </ul>
      <button
        onClick={() => {
          setIsModalOpen(false);
          setShowiOSInstructions(false);
        }}
        className="mt-6 text-sm text-purple-700 font-semibold hover:underline"
      >
        Fermer
      </button>
    </div>
  ) : null}
</DialogPanel>

        </div>
      </Dialog>
  </div>

  );
}
