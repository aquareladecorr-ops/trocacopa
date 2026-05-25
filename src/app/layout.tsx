import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
title: 'TrocaCopa — Complete seu álbum trocando, não gastando',
description:
'A maior comunidade independente de troca de cromos do Brasil. Cadastre suas repetidas e faltantes, encontre quem mora perto e tem o que falta. Plataforma independente, não-oficial.',
openGraph: {
title: 'TrocaCopa',
description: 'Complete seu álbum trocando, não gastando.',
type: 'website',
},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="pt-BR">
<body>
{children}
<Analytics />
</body>
</html>
);
}
