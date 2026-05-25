'use client';

import { useEffect, useRef, useState } from 'react';
import type { MatchRow } from '@/lib/types';

interface Props {
  matches: MatchRow[];
  cidadeFiltro: string;
}

// Coordenadas aproximadas de cidades brasileiras comuns
const COORDS_BRASIL: Record<string, [number, number]> = {
  'São Paulo': [-23.5505, -46.6333],
  'sao paulo': [-23.5505, -46.6333],
  'Rio de Janeiro': [-22.9068, -43.1729],
  'rio de janeiro': [-22.9068, -43.1729],
  'Belo Horizonte': [-19.9167, -43.9345],
  'belo horizonte': [-19.9167, -43.9345],
  'Brasília': [-15.7939, -47.8828],
  'brasilia': [-15.7939, -47.8828],
  'Salvador': [-12.9714, -38.5014],
  'salvador': [-12.9714, -38.5014],
  'Fortaleza': [-3.7172, -38.5433],
  'fortaleza': [-3.7172, -38.5433],
  'Curitiba': [-25.4297, -49.2711],
  'curitiba': [-25.4297, -49.2711],
  'Manaus': [-3.1190, -60.0217],
  'manaus': [-3.1190, -60.0217],
  'Recife': [-8.0539, -34.8811],
  'recife': [-8.0539, -34.8811],
  'Porto Alegre': [-30.0346, -51.2177],
  'porto alegre': [-30.0346, -51.2177],
  'Belém': [-1.4558, -48.5044],
  'belem': [-1.4558, -48.5044],
  'Goiânia': [-16.6869, -49.2648],
  'goiania': [-16.6869, -49.2648],
  'Florianópolis': [-27.5954, -48.5480],
  'florianopolis': [-27.5954, -48.5480],
  'Maceió': [-9.6658, -35.7350],
  'maceio': [-9.6658, -35.7350],
  'Natal': [-5.7945, -35.2110],
  'natal': [-5.7945, -35.2110],
  'Campo Grande': [-20.4697, -54.6201],
  'campo grande': [-20.4697, -54.6201],
  'Teresina': [-5.0892, -42.8019],
  'teresina': [-5.0892, -42.8019],
  'Campinas': [-22.9056, -47.0608],
  'campinas': [-22.9056, -47.0608],
  'Santos': [-23.9618, -46.3322],
  'santos': [-23.9618, -46.3322],
  'Vitória': [-20.3155, -40.3128],
  'vitoria': [-20.3155, -40.3128],
  'Uberlândia': [-18.9186, -48.2772],
  'uberlandia': [-18.9186, -48.2772],
  'Londrina': [-23.3045, -51.1696],
  'londrina': [-23.3045, -51.1696],
  'João Pessoa': [-7.1195, -34.8450],
  'joao pessoa': [-7.1195, -34.8450],
  'Aracaju': [-10.9472, -37.0731],
  'aracaju': [-10.9472, -37.0731],
  'Porto Velho': [-8.7612, -63.9004],
  'porto velho': [-8.7612, -63.9004],
  'Macapá': [0.0349, -51.0694],
  'macapa': [0.0349, -51.0694],
  'Boa Vista': [2.8235, -60.6758],
  'boa vista': [2.8235, -60.6758],
  'Palmas': [-10.2491, -48.3243],
  'palmas': [-10.2491, -48.3243],
  'Rio Branco': [-9.9754, -67.8249],
  'rio branco': [-9.9754, -67.8249],
  'São Luís': [-2.5297, -44.3028],
  'sao luis': [-2.5297, -44.3028],
  'Cuiabá': [-15.5989, -56.0949],
  'cuiaba': [-15.5989, -56.0949],
};

function getCoordsForCidade(cidade: string | null): [number, number] | null {
  if (!cidade) return null;
  const key = cidade.trim();
  // Exact match
  if (COORDS_BRASIL[key]) return COORDS_BRASIL[key];
  // Case-insensitive match
  const lower = key.toLowerCase();
  if (COORDS_BRASIL[lower]) return COORDS_BRASIL[lower];
  // Partial match
  for (const [k, v] of Object.entries(COORDS_BRASIL)) {
    if (k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase())) return v;
  }
  return null;
}

export default function MapaMatches({ matches, cidadeFiltro }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [geocacheRef] = useState<Map<string, [number, number] | null>>(new Map());

  async function geocodeCidade(cidade: string): Promise<[number, number] | null> {
    if (geocacheRef.has(cidade)) return geocacheRef.get(cidade)!;
    // Try local lookup first
    const local = getCoordsForCidade(cidade);
    if (local) { geocacheRef.set(cidade, local); return local; }
    // Try Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cidade + ', Brasil')}&format=json&limit=1`;
      const resp = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
      const data = await resp.json();
      if (data[0]) {
        const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        geocacheRef.set(cidade, coords);
        return coords;
      }
    } catch {}
    geocacheRef.set(cidade, null);
    return null;
  }

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return; // already initialized

    import('leaflet').then((L) => {
      // Fix default marker icons for Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [-15.7939, -47.8828], // Brasil centro
        zoom: 4,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers when matches or filter changes
  useEffect(() => {
    if (!mapInstance.current) return;

    import('leaflet').then(async (L) => {
      const map = mapInstance.current;
      if (!map) return;

      // Remove old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const filtered = cidadeFiltro
        ? matches.filter(m => m.user_b_cidade?.toLowerCase() === cidadeFiltro.toLowerCase())
        : matches;

      // Group matches by city
      const porCidade = new Map<string, MatchRow[]>();
      for (const m of filtered) {
        const cidade = m.user_b_cidade || 'Desconhecida';
        if (!porCidade.has(cidade)) porCidade.set(cidade, []);
        porCidade.get(cidade)!.push(m);
      }

      const bounds: [number, number][] = [];

      for (const [cidade, ms] of porCidade.entries()) {
        const coords = await geocodeCidade(cidade);
        if (!coords) continue;
        bounds.push(coords);

        const marker = L.marker(coords)
          .addTo(map)
          .bindPopup(`
            <div style="min-width:160px">
              <b style="color:#16a34a">📍 ${cidade}</b><br/>
              <span style="color:#555">${ms.length} ${ms.length === 1 ? 'colecionador' : 'colecionadores'}</span>
              <hr style="margin:6px 0"/>
              ${ms.slice(0, 3).map(m => `<div style="font-size:12px">👤 ${m.user_b_nome}</div>`).join('')}
              ${ms.length > 3 ? `<div style="font-size:11px;color:#888">+${ms.length - 3} mais</div>` : ''}
            </div>
          `);
        markersRef.current.push(marker);
      }

      // Fit bounds if we have markers
      if (bounds.length === 1) {
        map.setView(bounds[0], 10);
      } else if (bounds.length > 1) {
        try { map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 }); } catch {}
      }
    });
  }, [matches, cidadeFiltro]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 340 }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapRef} style={{ height: '100%', width: '100%', background: '#f0f4f8' }} />
    </div>
  );
}
