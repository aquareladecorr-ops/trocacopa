import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrocaCromos — Complete seu álbum trocando, não gastando',
  description:
    'A maior comunidade independente de troca de cromos do Brasil. Cadastre suas repetidas e faltantes, encontre quem mora perto e tem o que falta. Plataforma independente, não-oficial.',
  openGraph: {
    title: 'TrocaCromos',
    description: 'Complete seu álbum trocando, não gastando.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
