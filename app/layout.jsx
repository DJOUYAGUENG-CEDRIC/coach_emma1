import './globals.css';

export const metadata = {
  title: 'Coach Emma',
  description: 'Assistante pronostics sportifs — Code promo TPXA',
  icons: {
    icon: '/dembele.jpeg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
