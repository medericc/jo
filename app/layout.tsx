import './globals.css';
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
    title: "Johannes Schedule",
    description: "Les matchs de Johannes.",
    icons: {
        icon: "/favicon.ico", // Pour le favicon par défaut
        shortcut: "/favicon.ico", // Pour les navigateurs type iOS
        apple: "/apple-touch-icon.png", // iPhone/iPad
    },
    openGraph: {
      title: "Johannes Schedule",
      description: "Les matchs de Johannes.",
      url: "https://johannes-schedule.vercel.app/",
      siteName: "Johannes Schedule",
      images: [
        {
          url: "https://johannes-schedule.vercel.app/preview.jpg", // Mets une image propre ici !
          width: 1200,
          height: 630,
          alt: "Johannes Schedule",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image", // ✅ Correction ici
      title: "Johannes Schedule",
      description: "Les matchs de Johannes.",
      images: ["https://johannes-schedule.vercel.app/preview.jpg"], // Même image que Open Graph
    },
  };
  



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="fr">
          <body className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
          <header className="bg-gradient-to-r from-[#2eb398] to-[#148b80] text-neutral-100 p-8 text-4xl font-extrabold text-center shadow-md">
    MATCH DE MJ
</header>

              <main className="container mx-auto mt-4">{children}</main>
              <Analytics />
          </body>
      </html>
  );
}
