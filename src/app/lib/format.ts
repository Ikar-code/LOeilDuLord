// Palette réutilisée pour attribuer une couleur stable à chaque concurrent
// (déterministe : même nom → même couleur, sans colonne "color" en base).
const PALETTE = ["#6366f1", "#8b5cf6", "#22d3ee", "#f59e0b", "#10b981", "#ef4444", "#f97316", "#3b82f6"];

export function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function initialsFor(name: string) {
  return (name || "?").slice(0, 2).toUpperCase();
}

export function timeAgo(dateStr?: string | null) {
  if (!dateStr) return "jamais";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

export function formatDateFr(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));
}

export function formatTimeFr(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(dateStr));
}

const FREQ_LABEL: Record<string, string> = {
  horaire: "Toutes les heures",
  quotidien: "Quotidien",
  hebdomadaire: "Hebdomadaire",
};
export function freqLabel(freq: string) {
  return FREQ_LABEL[freq] || freq;
}

// Les statuts d'agent_runs (idle/running/success/error) sont mappés vers les
// libellés utilisés par StatusBadge dans l'UI (actif/en attente/inactif/erreur).
export function agentStatusLabel(runStatus?: string) {
  switch (runStatus) {
    case "running": return "actif";
    case "error": return "erreur";
    case "success": return "en attente"; // dernière exécution réussie, en attente du prochain cycle
    default: return "inactif"; // aucune exécution encore enregistrée
  }
}

export function avgDurationLabel(avgMs: number | null) {
  if (!avgMs || avgMs <= 0) return "—";
  if (avgMs < 1000) return `${Math.round(avgMs)}ms`;
  return `${(avgMs / 1000).toFixed(1)}s`;
}
