// Paleta y utilitarios de estilo (solo clases Tailwind agrupadas)
export const tokens = {
  brandBlue: '#0066cc',
  brandBlueSoft: 'rgba(0,102,204,0.08)',
  brandBlueRing: 'rgba(0,102,204,0.35)',
  green: '#00a86b',
  orange: '#ff7a00',
  yellow: '#ffd600',
  ink: '#2e2e2e',
};

export const cls = {
  chipBase:
    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs md:text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,102,204,0.35)]',
  chipOn:
    'border-transparent bg-[#0066cc] text-white shadow-[0_10px_24px_-12px_rgba(0,102,204,0.75)] hover:bg-[#005bb8]',
  chipOff:
    'border border-[#c6d9f5] bg-white text-[#2e2e2e] hover:border-[#0066cc] hover:text-[#0066cc]',

  badgeBase: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
  badgeActivo: 'bg-[#e7fbf3] text-[#0a8c60] ring-[rgba(0,168,107,0.55)]',
  badgeInactivo: 'bg-[#fff4eb] text-[#b3561d] ring-[rgba(255,122,0,0.45)]',

  panelCard:
    'rounded-2xl border border-[#dbe7f7] bg-[rgba(249,250,251,0.82)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgba(249,250,251,0.7)] shadow-[0_28px_60px_-32px_rgba(0,51,102,0.5)]',
  heroCard:
    'relative rounded-3xl bg-gradient-to-r from-[#0066cc] via-[#3385ff] to-[#00a86b] text-white shadow-[0_28px_60px_-32px_rgba(0,51,102,0.45)]',

  tableHeader:
    'bg-[rgba(0,102,204,0.06)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(0,102,204,0.06)] text-[#2e2e2e] uppercase tracking-wide text-[11px] font-semibold',
  tableRow:
    'transition-colors hover:bg-[rgba(0,102,204,0.08)] odd:bg-[rgba(0,102,204,0.03)]',
};
