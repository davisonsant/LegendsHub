import React from 'react';

/**
 * Utility to resolve client-side and desktop-level custom game assets.
 * Maps strictly to 'game/assets/[category]/[id].png'.
 */

export type AssetCategory = 
  | 'players' 
  | 'teams' 
  | 'sponsors' 
  | 'leagues' 
  | 'staff' 
  | 'managers' 
  | 'press' 
  | 'influencers' 
  | 'ui'
  | 'champions';

/**
 * Universal conversion function to safely transform standard base64 strings, HTTPS URLs,
 * and binary database Buffers (e.g. from SQLite/Electron or binary uploads)
 * into stable Object URLs or usable image sources.
 */
export function getImageUrl(bufferData: any): string {
  if (!bufferData) {
    return '/assets/ui/fallback-silhouette.png';
  }

  // If it's already a clean string URL or base64 data URL
  if (typeof bufferData === 'string') {
    if (bufferData.trim() === '' || bufferData === '/perfil-default.jpeg') {
      return '/assets/ui/fallback-silhouette.png';
    }
    return bufferData;
  }

  // If it's a binary Buffer representation (Electron: { type: 'Buffer', data: [...] })
  if (bufferData && typeof bufferData === 'object' && bufferData.type === 'Buffer' && Array.isArray(bufferData.data)) {
    try {
      const uint8Array = new Uint8Array(bufferData.data);
      const blob = new Blob([uint8Array], { type: 'image/png' });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error('[getImageUrl] Error converting Buffer object to Object URL', e);
    }
  }

  // If it's directly an ArrayBuffer, Uint8Array or ArrayBufferView
  if (bufferData instanceof ArrayBuffer || bufferData instanceof Uint8Array || ArrayBuffer.isView(bufferData)) {
    try {
      const blob = new Blob([bufferData], { type: 'image/png' });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error('[getImageUrl] Error converting raw binary block to Object URL', e);
    }
  }

  // If it's already a native Blob object
  if (bufferData instanceof Blob) {
    try {
      return URL.createObjectURL(bufferData);
    } catch (e) {
      console.error('[getImageUrl] Error converting Blob to URL', e);
    }
  }

  return '/assets/ui/fallback-silhouette.png';
}

/**
 * Asynchronously preloads all custom high-capacity assets from IndexedDB into a global synchronous RAM cache.
 * This guarantees instantaneous síncrono sub-millisecond retrievement of all customized binary icons and pictures.
 */
export async function preloadGameAssetsToCache(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  if (!(window as any).__gameAssetsCache) {
    (window as any).__gameAssetsCache = {
      players: {},
      teams: {},
      managers: {},
      sponsors: {},
      leagues: {},
      champions: {},
      press: {},
      influencers: {}
    };
  }

  const cache = (window as any).__gameAssetsCache;
  const { getGameItem } = await import('./localForageStore');

  // 1. Teams Database cache
  try {
    const rawTeams = await getGameItem<any>('legendshub_custom_db');
    if (rawTeams) {
      Object.keys(rawTeams).forEach(region => {
        const teams = rawTeams[region];
        if (Array.isArray(teams)) {
          teams.forEach((t: any) => {
            if (t && t.id) {
              const cleanId = t.id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
              const blobVal = t.logo_blob || t.image_blob || t.image_base64 || t.base64Image || t.logoUrl || t.logo_url || t.image_data;
              if (blobVal) {
                cache.teams[cleanId] = blobVal;
                cache.teams[t.id] = blobVal;
              }
            }
          });
        }
      });
    }
  } catch (e) {
    console.error('[preloadGameAssets] Error caching teams', e);
  }

  // 2. Players Dict cache
  try {
    const rawPlayers = await getGameItem<any>('legendshub_custom_players_dict');
    if (rawPlayers) {
      Object.keys(rawPlayers).forEach(pId => {
        const p = rawPlayers[pId];
        if (p) {
          const cleanId = pId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
          const blobVal = p.face_blob || p.image_blob || p.image_base64 || p.base64Image || p.photoUrl || p.photo_url || p.image_data;
          if (blobVal) {
            cache.players[cleanId] = blobVal;
            cache.players[pId] = blobVal;
            if (p.id) {
              const cleanPId = p.id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
              cache.players[cleanPId] = blobVal;
              cache.players[p.id] = blobVal;
            }
          }
        }
      });
    }
  } catch (e) {
    console.error('[preloadGameAssets] Error caching players', e);
  }

  // 3. Managers cache
  try {
    const rawMgrs = await getGameItem<any>('legendshub_custom_managers');
    if (Array.isArray(rawMgrs)) {
      rawMgrs.forEach((m: any) => {
        if (m && m.id) {
          const cleanId = m.id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
          const blobVal = m.avatar_blob || m.face_blob || m.image_blob || m.image_base64 || m.base64Image || m.photoUrl || m.photo_url || m.image_data;
          if (blobVal) {
            cache.managers[cleanId] = blobVal;
            cache.managers[m.id] = blobVal;
            if (m.teamId) {
              const cleanTeamId = m.teamId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
              cache.managers[cleanTeamId] = blobVal;
              cache.managers[m.teamId] = blobVal;
            }
          }
        }
      });
    }
  } catch (e) {
    console.error('[preloadGameAssets] Error caching managers', e);
  }

  // 4. Sponsors cache
  try {
    const rawSpons = await getGameItem<any>('legendshub_custom_sponsors');
    if (Array.isArray(rawSpons)) {
      rawSpons.forEach((s: any) => {
        if (s && s.id) {
          const cleanId = s.id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
          const blobVal = s.logo_blob || s.image_blob || s.image_base64 || s.base64Image || s.logoUrl || s.logo_url || s.image_data;
          if (blobVal) {
            cache.sponsors[cleanId] = blobVal;
            cache.sponsors[s.id] = blobVal;
          }
        }
      });
    }
  } catch (e) {
    console.error('[preloadGameAssets] Error caching sponsors', e);
  }

  // 5. Leagues meta cache
  try {
    const rawLeagues = await getGameItem<any>('legendshub_custom_leagues_meta');
    if (rawLeagues && typeof rawLeagues === 'object') {
      Object.keys(rawLeagues).forEach(lId => {
        const meta = rawLeagues[lId];
        if (meta) {
          const cleanId = lId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
          const blobVal = meta.badge_blob || meta.logo_blob || meta.image_blob || meta.image_base64 || meta.base64Image || meta.logo || meta.logoUrl || meta.image_data;
          if (blobVal) {
            cache.leagues[cleanId] = blobVal;
            cache.leagues[lId] = blobVal;
          }
        }
      });
    }
  } catch (e) {
    console.error('[preloadGameAssets] Error caching leagues', e);
  }

  // 6. Champions cache
  try {
    const rawChamps = await getGameItem<any>('legendshub_custom_champions');
    if (Array.isArray(rawChamps)) {
      rawChamps.forEach((c: any) => {
        if (c && c.id) {
          const cleanId = c.id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
          const blobVal = c.logo_blob || c.image_blob || c.image_base64 || c.base64Image || c.logoUrl || c.photoUrl || c.image_data || c.imageUrl;
          if (blobVal) {
            cache.champions[cleanId] = blobVal;
            cache.champions[c.id] = blobVal;
          }
        }
      });
    }
  } catch (e) {
    console.error('[preloadGameAssets] Error caching champions', e);
  }

  // 7. Press cache
  try {
    const rawPress = await getGameItem<any>('legendshub_custom_press');
    if (Array.isArray(rawPress)) {
      rawPress.forEach((p: any) => {
        if (p && p.id) {
          const cleanId = p.id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
          const blobVal = p.logo_blob || p.image_blob || p.image_base64 || p.base64Image || p.logoUrl || p.photoUrl || p.image_data;
          if (blobVal) {
            cache.press[cleanId] = blobVal;
            cache.press[p.id] = blobVal;
          }
        }
      });
    }
  } catch (e) {
    console.error('[preloadGameAssets] Error caching press', e);
  }

  // 8. Influencers cache
  try {
    const rawInfs = await getGameItem<any>('legendshub_custom_influencers');
    if (Array.isArray(rawInfs)) {
      rawInfs.forEach((i: any) => {
        if (i && i.id) {
          const cleanId = i.id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
          const blobVal = i.face_blob || i.image_blob || i.image_base64 || i.base64Image || i.photoUrl || i.logoUrl || i.image_data;
          if (blobVal) {
            cache.influencers[cleanId] = blobVal;
            cache.influencers[i.id] = blobVal;
          }
        }
      });
    }
  } catch (e) {
    console.error('[preloadGameAssets] Error caching influencers', e);
  }
}

/**
 * Returns the exact local asset path or an online fallback if loading fails or does not exist.
 */
export function getGameAssetUrl(
  category: AssetCategory | string,
  id: string | undefined,
  fallbackUrl?: string
): string {
  if (!id) {
    return fallbackUrl || '/perfil-default.jpeg';
  }

  // Purely sanitize ID so it can be mapped safely on local filesystems
  const cleanId = id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
  
  // Map legacy 'staff' to 'managers' internally
  let cat = category;
  if (cat === 'staff') {
    cat = 'managers';
  }

  // --- PASSO 0: CONSULTA AO CACHE SÍNCRONO EM MEMÓRIA RAM (Prioritário para IndexedDB / SQLite Blobs) ---
  if (typeof window !== 'undefined' && (window as any).__gameAssetsCache) {
    const cache = (window as any).__gameAssetsCache;
    const catCache = cache[cat === 'staff' ? 'managers' : cat];
    if (catCache) {
      const val = catCache[cleanId] || catCache[id];
      if (val && val.trim() !== '') {
        const urlResolved = getImageUrl(val);
        if (urlResolved !== '/assets/ui/fallback-silhouette.png') {
          return urlResolved;
        }
      }
    }
  }

  // --- PASSO 1: CONSULTA DIRETA AO LOCALSTORAGE (Legado ou fallback síncrono secundário) ---
  let dbValue: any = null;
  try {
    if (typeof window !== 'undefined') {
      if (cat === 'players') {
        const dictRaw = localStorage.getItem('legendshub_custom_players_dict');
        if (dictRaw) {
          const dict = JSON.parse(dictRaw);
          const found = dict[cleanId] || dict[id] || Object.values(dict).find((p: any) => p && (p.id === id || p.id === cleanId));
          if (found) {
            dbValue = found.face_blob || found.image_blob || found.image_base64 || found.base64Image || found.photoUrl || found.photo_url || found.image_data;
          }
        }
      } else if (cat === 'teams') {
        const dbRaw = localStorage.getItem('legendshub_custom_db');
        if (dbRaw) {
          const db = JSON.parse(dbRaw);
          for (const reg of Object.keys(db)) {
            const team = db[reg]?.find((t: any) => t.id === id || t.id === cleanId);
            if (team) {
              dbValue = team.logo_blob || team.image_blob || team.image_base64 || team.base64Image || team.logoUrl || team.logo_url || team.image_data;
              break;
            }
          }
        }
      } else if (cat === 'managers') {
        const mgrsRaw = localStorage.getItem('legendshub_custom_managers');
        if (mgrsRaw) {
          const mgrs = JSON.parse(mgrsRaw);
          const found = mgrs.find((m: any) => m.id === id || m.id === cleanId || m.teamId === id || m.teamId === cleanId);
          if (found) {
            dbValue = found.avatar_blob || found.face_blob || found.image_blob || found.image_base64 || found.base64Image || found.photoUrl || found.photo_url || found.image_data;
          }
        }
      } else if (cat === 'sponsors') {
        const sponRaw = localStorage.getItem('legendshub_custom_sponsors');
        if (sponRaw) {
          const spons = JSON.parse(sponRaw);
          const found = spons.find((s: any) => s.id === id || s.id === cleanId);
          if (found) {
            dbValue = found.logo_blob || found.image_blob || found.image_base64 || found.base64Image || found.logoUrl || found.logo_url || found.image_data;
          }
        }
      } else if (cat === 'leagues') {
        const leaguesMetaRaw = localStorage.getItem('legendshub_custom_leagues_meta');
        if (leaguesMetaRaw) {
          const meta = JSON.parse(leaguesMetaRaw);
          if (meta[id]) {
            dbValue = meta[id].badge_blob || meta[id].logo_blob || meta[id].image_blob || meta[id].image_base64 || meta[id].base64Image || meta[id].logo || meta[id].logoUrl || meta[id].image_data;
          } else {
            const lowerId = id.toLowerCase();
            const foundKey = Object.keys(meta).find(k => k.toLowerCase() === lowerId);
            if (foundKey && meta[foundKey]) {
              dbValue = meta[foundKey].badge_blob || meta[foundKey].logo_blob || meta[foundKey].image_blob || meta[foundKey].image_base64 || meta[foundKey].base64Image || meta[foundKey].logo || meta[foundKey].logoUrl || meta[foundKey].image_data;
            }
          }
        }
      } else if (cat === 'champions') {
        const champRaw = localStorage.getItem('legendshub_custom_champions');
        if (champRaw) {
          const champs = JSON.parse(champRaw);
          const found = champs.find((c: any) => c.id === id || c.id === cleanId);
          if (found) {
            dbValue = found.logo_blob || found.image_blob || found.image_base64 || found.base64Image || found.logoUrl || found.photoUrl || found.image_data || found.imageUrl;
          }
        }
      } else if (cat === 'press') {
        const pressRaw = localStorage.getItem('legendshub_custom_press');
        if (pressRaw) {
          const press = JSON.parse(pressRaw);
          const found = press.find((p: any) => p.id === id || p.id === cleanId);
          if (found) {
            dbValue = found.logo_blob || found.image_blob || found.image_base64 || found.base64Image || found.logoUrl || found.photoUrl || found.image_data;
          }
        }
      } else if (cat === 'influencers') {
        const infRaw = localStorage.getItem('legendshub_custom_influencers');
        if (infRaw) {
          const infs = JSON.parse(infRaw);
          const found = infs.find((i: any) => i.id === id || i.id === cleanId);
          if (found) {
            dbValue = found.face_blob || found.image_blob || found.image_base64 || found.base64Image || found.photoUrl || found.logoUrl || found.image_data;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[gameAssets] Erro ao carregar .db primário de localStorage:', err);
  }

  // Se encontrarmos o valor convertido/BLOB do Banco de Dados Ativo, usamos ele de forma prioritária!
  if (dbValue) {
    const resolved = getImageUrl(dbValue);
    if (resolved && resolved !== '/assets/ui/fallback-silhouette.png') {
      return resolved;
    }
  }

  // Se houver um fallbackUrl predefinido (como a imagem padrão de fábrica), use-a
  if (fallbackUrl && fallbackUrl.trim() !== '' && fallbackUrl !== '/perfil-default.jpeg') {
    return fallbackUrl;
  }

  // Se não existir mídias do jogo salvas em colunas BLOB do DB ativo, retorna a silhueta padrão da UI
  return '/assets/ui/fallback-silhouette.png';
}

/**
 * Procedural fallback avatar or log generator.
 * Creates clean initials badge as custom vector style layout.
 */
export function getProceduralFallbackUrl(name: string, isSquare = false): string {
  const initials = (name || 'LH')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
  
  // Generate distinct elegant slate gradient hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    ['#1e293b', '#0f172a'], // Slate
    ['#1e1b4b', '#311042'], // Indigo/Violet
    ['#064e3b', '#022c22'], // Emerald
    ['#701a75', '#4a044e'], // Fuchsia
    ['#7c2d12', '#431407'], // Amber/Rust
  ];
  const pair = colors[Math.abs(hash) % colors.length];
  
  // Inline SVG procedural fallback returnable
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${pair[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${pair[1]};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="${isSquare ? '12' : '50'}" fill="url(#grad)" stroke="#2d4665" stroke-width="2" opacity="0.9" />
    <text x="50%" y="54%" font-family="monospace, sans-serif" font-weight="900" font-size="28" fill="#e2e8f0" text-anchor="middle" dominant-baseline="middle" tracking="-2">
      ${initials}
    </text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Global Reusable Rendering Components that adhere to the DB Primary / FS Secondary / SVG Fallback priority rules:

export interface RenderPlayerAvatarProps {
  photoUrl?: string;
  className?: string;
  textStyle?: string;
  square?: boolean;
  playerId?: string;
  playerName?: string;
}

export const RenderPlayerAvatar: React.FC<RenderPlayerAvatarProps> = ({ 
  photoUrl, 
  className = "w-5 h-5 rounded-full", 
  textStyle = "text-[6px]", 
  square = false,
  playerId,
  playerName
}) => {
  const resolvedUrl = getGameAssetUrl('players', playerId, photoUrl);
  const isMissing = !resolvedUrl || resolvedUrl === '/perfil-default.jpeg' || resolvedUrl.trim() === '';
  
  if (isMissing) {
    const fallbackSvgUrl = getProceduralFallbackUrl(playerName || 'LH', square);
    return (
      <img
        src={fallbackSvgUrl}
        alt=""
        className={`${className} object-cover shrink-0`}
      />
    );
  }

  return (
    <img 
      src={resolvedUrl} 
      referrerPolicy="no-referrer"
      alt="" 
      className={`${className} object-cover shrink-0`}
      onError={(e) => {
        // PASSO 3 (Gatilho onError): Aplica o fallback procedural em caso de falha no carregamento secundário
        const fallbackSvgUrl = getProceduralFallbackUrl(playerName || 'LH', square);
        e.currentTarget.src = fallbackSvgUrl;
      }}
    />
  );
};

export interface RenderTeamLogoProps {
  logoUrl?: string;
  teamId?: string;
  teamName?: string;
  className?: string;
}

export const RenderTeamLogo: React.FC<RenderTeamLogoProps> = ({
  logoUrl,
  teamId,
  teamName,
  className = "w-6 h-6 object-contain shrink-0"
}) => {
  const resolvedUrl = getGameAssetUrl('teams', teamId, logoUrl);
  const fallbackUrl = getProceduralFallbackUrl(teamName || 'T', false);
  const srcToUse = resolvedUrl || fallbackUrl;

  return (
    <img
      src={srcToUse}
      referrerPolicy="no-referrer"
      alt=""
      className={className}
      onError={(e) => {
        // PASSO 3: Fallback a partir de erro físico ou protocolo quebrado
        e.currentTarget.src = fallbackUrl;
      }}
    />
  );
};

export interface RenderLeagueLogoProps {
  logoUrl?: string;
  leagueId?: string;
  leagueName?: string;
  className?: string;
}

export const RenderLeagueLogo: React.FC<RenderLeagueLogoProps> = ({
  logoUrl,
  leagueId,
  leagueName,
  className = "w-6 h-6 object-contain shrink-0"
}) => {
  const resolvedUrl = getGameAssetUrl('leagues', leagueId, logoUrl);
  const fallbackUrl = getProceduralFallbackUrl(leagueName || 'L', false);
  const srcToUse = resolvedUrl || fallbackUrl;

  return (
    <img
      src={srcToUse}
      referrerPolicy="no-referrer"
      alt=""
      className={className}
      onError={(e) => {
        e.currentTarget.src = fallbackUrl;
      }}
    />
  );
};
