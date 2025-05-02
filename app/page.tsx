'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent,CardFooter } from "@/components/ui/card";
import { Clock } from "lucide-react";

type Match = {
  id: string;
  date: Date;
  opponent: string;
  opponentLogo: string;
  link: string; // 👈 Ajout ici
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

export default function ValkyriesSchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocalTimes, setShowLocalTimes] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const getMatches = async () => {
      const res = await fetch(
        `/api/proxy?url=${encodeURIComponent(
          'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/teams/gsv/schedule'
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
          const isGSVHome = home.team.displayName === 'Golden State Valkyries';

          const opponentTeam = isGSVHome ? away.team : home.team;

          return {
            id: event.id,
            date,
            opponent: formatOpponentName(opponentTeam.displayName),
            opponentLogo: opponentTeam.logos?.[0]?.href ?? '',
            link: event.links?.[0]?.href ?? '#', // 👈 Ajout ici
          };
          
          });
  
        setMatches(parsed);
        setLoading(false);
      };
  
      getMatches();
    }, []);

  if (loading) return <p className="p-4">Les matchs arrivent.....</p>;

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
                      src={match.opponentLogo}
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
              <CardFooter className="bg-purple-900 p-2 rounded-b-xl flex justify-center">
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
  </div>

  );
}
