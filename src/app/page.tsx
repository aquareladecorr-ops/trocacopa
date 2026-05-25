'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { ShareButton } from '@/components/ShareButton';

// Static demo sticker data: 1=have, 2=duplicate, 0=missing
const DEMO_STICKERS: Record<number, 0 | 1 | 2> = {
1:0, 2:1, 3:1, 4:0, 5:1, 6:1, 7:0, 8:2, 9:1, 10:0,
11:1, 12:1, 13:0, 14:1, 15:2, 16:0, 17:1, 18:1, 19:0, 20:1,
21:1, 22:0, 23:1, 24:1, 25:0, 26:1, 27:1, 28:0, 29:2, 30:1,
31:0, 32:1, 33:1, 34:0, 35:1, 36:2, 37:0, 38:1, 39:1, 40:0,
41:1, 42:0, 43:1, 44:1, 45:1, 46:0, 47:2, 48:1, 49:0, 50:2,
51:1, 52:0, 53:1, 54:1, 55:0, 56:1, 57:2, 58:0, 59:1, 60:1,
};

const TOTAL = 670;
const TENHO = Object.values(DEMO_STICKERS).filter(v => v >= 1).length;

function StickerGrid() {
return (
<div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-md">
<div className="flex justify-between items-center mb-4">
<span className="font-semibold text-gray-800 text-sm">Sua coleção</span>
<span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
{TENHO + 363} / {TOTAL}
</span>
</div>
<div className="grid grid-cols-10 gap-1">
{Array.from({ length: 60 }, (_, i) => i + 1).map((n) => {
const estado = DEMO_STICKERS[n] ?? 0;
const bg =
estado === 2
? 'bg-yellow-400 text-white'
: estado === 1
? 'bg-green-600 text-white'
: 'bg-gray-100 text-gray-400';
return (
<div
key={n}
className={`${bg} rounded-lg text-[10px] font-bold flex items-center justify-center aspect-square select-none`}
>
{n}
</div>
);
})}
</div>
<div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
<span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-600 inline-block"></span>Tenho</span>
<span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>Repetida</span>
<span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-200 inline-block"></span>Falta</span>
</div>
</div>
);
}

export default function HomePage() {
return (
<>
<Navbar initialUser={null} />

{/* HERO */}
<section className="bg-white py-16 px-4 md:px-8">
<div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
{/* Left: text */}
<div>
<div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
<span>✦</span> Comunidade brasileira de colecionadores
</div>
<p className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-gray-900 mb-4 leading-tight">
TROQUE FIGURINHAS COM QUEM ESTÁ<br />
<span className="text-green-600">PERTO DE VOCÊ.</span>
</p>
<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
Pare de gastar com pacotes.{' '}
<span className="text-green-600">Troque com quem tem o que falta.</span>
</h1>
<p className="text-gray-500 text-base md:text-lg mb-8 max-w-md">
Marque suas repetidas e faltantes, encontre matches perto de você e combine trocas direto no chat. Tudo grátis para começar.
</p>
<div className="flex flex-wrap gap-3">
<Link
href="/signup"
className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm"
>
Começar grátis
</Link>
<Link
href="/login"
className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
>
Já tenho conta
</Link>
<ShareButton />
</div>
</div>

{/* Right: sticker grid demo */}
<div className="flex justify-center md:justify-end">
<StickerGrid />
</div>
</div>
</section>

{/* COMO FUNCIONA */}
<section className="py-20 px-4 bg-gray-50">
<div className="max-w-6xl mx-auto">
<h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3 text-gray-900">Como funciona</h2>
<p className="text-center text-gray-500 mb-12">3 passos para fechar seu álbum sem gastar mais nada.</p>
<div className="grid md:grid-cols-3 gap-6">
{[
{ n: '01', t: 'Cadastre em 5 minutos', d: 'Toque nos números das suas repetidas e das que faltam. Por foto, lista numérica ou grade visual.' },
{ n: '02', t: 'A gente acha quem combina', d: 'Match automático na sua cidade e bairro. Você só vê quem tem o que você precisa — e precisa do que você tem.' },
{ n: '03', t: 'Converse, combine e troque', d: 'Pelo chat seguro com antifraude, avaliação pós-troca e seguro de envio opcional.' },
].map((s) => (
<div key={s.n} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-green-500 transition-colors">
<div className="text-4xl font-extrabold text-yellow-400 mb-3">{s.n}</div>
<h3 className="text-lg font-bold mb-2 text-gray-900">{s.t}</h3>
<p className="text-gray-500 text-sm leading-relaxed">{s.d}</p>
</div>
))}
</div>
</div>
</section>

{/* PROVA SOCIAL */}
<section className="py-20 px-4 bg-white">
<div className="max-w-4xl mx-auto">
<h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-gray-900">Quem trocou, contou.</h2>
<div className="grid md:grid-cols-3 gap-6">
{[
{ n: 'Carlos', c: 'São Paulo', t: 'Completei 80 figurinhas em duas semanas. Não comprei mais nenhum pacote.' },
{ n: 'Marina', c: 'Belo Horizonte', t: 'Achei o cromo do meu craque favorito em 10 minutos. Mora a 2 km de mim.' },
{ n: 'Ricardo', c: 'Curitiba', t: 'Família inteira completou o álbum trocando. Economizamos uns R$ 600.' },
].map((t) => (
<div key={t.n} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
<p className="text-gray-700 italic mb-4 leading-relaxed">"{t.t}"</p>
<div className="text-sm">
<div className="font-semibold text-gray-900">{t.n}</div>
<div className="text-gray-400 text-xs">{t.c}</div>
</div>
</div>
))}
</div>
</div>
</section>

{/* CTA FINAL */}
<section className="py-20 px-4 bg-green-600">
<div className="max-w-3xl mx-auto text-center">
<h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Comece a trocar hoje.</h2>
<p className="text-white/80 text-lg mb-8">Cadastro grátis. Sem cartão. Sem letra miúda.</p>
<div className="flex flex-wrap gap-3 justify-center">
<Link
href="/signup"
className="inline-block bg-white text-green-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-50 shadow-sm transition-colors"
>
Criar conta grátis
</Link>
<ShareButton
className="bg-white/10 border-white text-white hover:bg-white/20"
/>
</div>
</div>
</section>

<Disclaimer />

<footer className="bg-gray-900 text-gray-500 text-xs py-4 px-4">
<div className="max-w-6xl mx-auto flex flex-wrap gap-4 justify-between items-center">
<span>© 2026 TrocaCopa · Plataforma independente</span>
<div className="flex gap-4">
<Link href="/termos" className="hover:text-white">Termos</Link>
<Link href="/privacidade" className="hover:text-white">Privacidade</Link>
<Link href="/anti-golpes" className="hover:text-white">Anti-golpes</Link>
</div>
</div>
</footer>
</>
);
}
