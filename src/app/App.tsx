import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, Users, Globe, FileText, Bot, Clock, Bell, Settings, User,
  Search, Plus, Activity, AlertCircle, Loader2, ArrowUpRight,
  Edit, Trash2, Download, Filter, RefreshCw, Zap, Shield, Database,
  ExternalLink, MoreHorizontal, AlertTriangle, ChevronRight, LogOut, Link as LinkIcon,
  Github, Key, CheckCircle2, XCircle, Building2, BarChart2,
  Star, ArrowLeft, Target, Circle, PauseCircle, PlayCircle, Copy,
  Globe2, Save, Eye as EyeIcon, EyeOff, BadgeCheck, Rocket, Sparkles,
} from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import { AGENT_META, AGENT_ORDER, type AgentName } from "./lib/agentMeta";
import {
  colorFor, initialsFor, timeAgo, formatDateFr, formatTimeFr,
  freqLabel, agentStatusLabel, avgDurationLabel,
} from "./lib/format";

// ─── UTILITY COMPONENTS (inchangés visuellement) ────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; bg: string }> = {
    actif: { label: "Actif", dot: "bg-emerald-400", bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
    "en pause": { label: "En pause", dot: "bg-amber-400", bg: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
    erreur: { label: "Erreur", dot: "bg-red-400", bg: "bg-red-500/10 text-red-400 border border-red-500/20" },
    inactif: { label: "Inactif", dot: "bg-[#7878a0]", bg: "bg-white/5 text-[#7878a0] border border-white/8" },
    "en attente": { label: "En attente", dot: "bg-blue-400", bg: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
    publie: { label: "Publié", dot: "bg-emerald-400", bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
    brouillon: { label: "Brouillon", dot: "bg-[#7878a0]", bg: "bg-white/5 text-[#7878a0] border border-white/8" },
    rejete: { label: "Rejeté", dot: "bg-red-400", bg: "bg-red-500/10 text-red-400 border border-red-500/20" },
  };
  const c = map[status] ?? { label: status, dot: "bg-[#7878a0]", bg: "bg-white/5 text-[#7878a0]" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    haute: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    moyenne: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    basse: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };
  const labels: Record<string, string> = { haute: "Haute", moyenne: "Moyenne", basse: "Basse" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[priority] || map.basse}`}>
      {labels[priority] || priority}
    </span>
  );
}

const ALERT_TYPE_LABEL: Record<string, string> = {
  nouveau_produit: "Nouveau produit",
  changement_prix: "Tarification",
  nouvelle_fonctionnalite: "Nouvelle fonctionnalité",
  nouvelle_offre_emploi: "Recrutement",
  levee_de_fonds: "Financement",
  autre: "Autre",
};

function Avatar({ name, color, size = "sm" }: { name: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-14 h-14 text-lg" };
  return (
    <div className={`${sizes[size]} rounded-lg flex items-center justify-center font-semibold shrink-0`} style={{ backgroundColor: color + "22", color }}>
      {initialsFor(name)}
    </div>
  );
}

function ProgressBar({ value, color = "#6366f1" }: { value: number; color?: string }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }} />
    </div>
  );
}

function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`bg-[#111119] border border-white/7 rounded-[14px] ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, className = "", icon, disabled }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void; className?: string; icon?: React.ReactNode; disabled?: boolean;
}) {
  const variants = {
    primary: "bg-[#6366f1] hover:bg-[#5254cc] text-white",
    secondary: "bg-white/5 hover:bg-white/10 text-[#e2e2f0] border border-white/10",
    ghost: "hover:bg-white/5 text-[#7878a0] hover:text-[#e2e2f0]",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}>
      {icon && icon}
      {children}
    </button>
  );
}

function Loading({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-[#7878a0] text-sm py-8 justify-center">
      <Loader2 className="w-4 h-4 animate-spin" /> {label}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="text-[#7878a0] text-sm py-8 text-center">{label}</div>;
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

const navItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "discovery", label: "Découverte", icon: Rocket },
  { id: "competitors", label: "Concurrents", icon: Users },
  { id: "sources", label: "Sources", icon: Globe },
  { id: "reports", label: "Rapports IA", icon: FileText },
  { id: "agents", label: "Agents IA", icon: Bot },
  { id: "history", label: "Historique", icon: Clock },
  { id: "alerts", label: "Alertes", icon: Bell },
  { id: "settings", label: "Paramètres", icon: Settings },
  { id: "profile", label: "Profil", icon: User },
];

function Sidebar({ page, setPage, profile, onLogout }: { page: string; setPage: (p: string) => void; profile: any; onLogout: () => void }) {
  const displayName = profile?.full_name || profile?.email || "Utilisateur";
  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-[#0d0d16] border-r border-white/5">
      <div className="px-4 pt-5 pb-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[#e2e2f0] font-semibold text-sm leading-none">Radar</div>
          <div className="text-[10px] text-[#7878a0] mt-0.5 font-mono">veille concurrentielle</div>
        </div>
      </div>

      <div className="px-2 mb-1"><div className="h-px bg-white/5" /></div>

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group ${active ? "bg-[#6366f1]/15 text-[#a5b4fc]" : "text-[#7878a0] hover:text-[#c4c4d8] hover:bg-white/5"}`}>
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${active ? "text-[#6366f1]" : "text-[#5858a0] group-hover:text-[#7878a0]"}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="px-2 mb-2"><div className="h-px bg-white/5" /></div>

      <div className="px-2 pb-4">
        <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 cursor-pointer group text-left">
          <Avatar name={displayName} color="#6366f1" />
          <div className="flex-1 min-w-0">
            <div className="text-[#e2e2f0] text-xs font-medium truncate">{displayName}</div>
            <div className="text-[#7878a0] text-[10px] truncate">{profile?.plan === "pro" ? "Pro" : "Free"}</div>
          </div>
          <LogOut className="w-3.5 h-3.5 text-[#5858a0] group-hover:text-[#7878a0]" />
        </button>
      </div>
    </aside>
  );
}

// ─── TOP BAR ─────────────────────────────────────────────────────────────────

function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-[#09090f]/80 backdrop-blur-sm">
      <div>
        <h1 className="text-[#e2e2f0] font-semibold text-sm">{title}</h1>
        {subtitle && <p className="text-[#7878a0] text-xs">{subtitle}</p>}
      </div>
    </header>
  );
}

// ─── LOGIN / SIGNUP (Supabase Auth réel) ────────────────────────────────────

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });
      if (error) setError(error.message);
      else setInfo("Compte créé. Si la confirmation par email est activée dans Supabase, vérifie ta boîte mail avant de te connecter.");
    }
    setLoading(false);
  }

  async function oauth(provider: "github" | "google") {
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
  }

  return (
    <div className="min-h-screen flex bg-[#09090f] text-[#e2e2f0]">
      <div className="hidden lg:flex w-[52%] relative flex-col justify-between p-12 overflow-hidden bg-[#0d0d16]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20" style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15" style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)" }} />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-[#e2e2f0] font-bold text-xl">Radar</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-[#e2e2f0] leading-tight mb-4">
            Votre veille<br />
            <span className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] bg-clip-text text-transparent">concurrentielle</span><br />
            automatisée
          </h2>
          <p className="text-[#7878a0] text-base leading-relaxed mb-10 max-w-sm">
            Une architecture multi-agents surveille vos concurrents, analyse les sources et génère des rapports stratégiques en français.
          </p>
          <div className="space-y-4">
            {[
              { icon: Bot, label: "7 agents IA spécialisés", sub: "Recherche · Scraping · Vérification · Analyse · Rédaction" },
              { icon: Globe, label: "Sources multi-canal", sub: "Sites web · GitHub · LinkedIn · RSS · Actualités · Offres d'emploi" },
              { icon: FileText, label: "Rapports générés automatiquement", sub: "Synthèses en français avec score de confiance et sources citées" },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-[#6366f1]" />
                </div>
                <div>
                  <div className="text-[#e2e2f0] text-sm font-medium">{f.label}</div>
                  <div className="text-[#7878a0] text-xs mt-0.5">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[#5858a0] text-xs">© 2026 Radar</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#e2e2f0] mb-1">{mode === "login" ? "Bon retour" : "Créer un compte"}</h2>
            <p className="text-[#7878a0] text-sm">{mode === "login" ? "Connecte-toi à ton espace Radar" : "Crée ton compte pour commencer"}</p>
          </div>

          <div className="flex gap-3 mb-6">
            <button onClick={() => oauth("github")} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-[#c4c4d8] font-medium">
              <Github className="w-4 h-4" /> GitHub
            </button>
            <button onClick={() => oauth("google")} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-[#c4c4d8] font-medium">
              <Globe2 className="w-4 h-4" /> Google
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[#5858a0] text-xs">ou par email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-[#c4c4d8] mb-1.5">Nom complet</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" placeholder="Alexandre Martin" className="w-full bg-[#1c1c2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#e2e2f0] placeholder:text-[#5858a0] focus:outline-none focus:border-[#6366f1]/60 transition-all" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-[#c4c4d8] mb-1.5">Adresse email</label>
              <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="vous@example.com" className="w-full bg-[#1c1c2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#e2e2f0] placeholder:text-[#5858a0] focus:outline-none focus:border-[#6366f1]/60 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#c4c4d8] mb-1.5">Mot de passe</label>
              <div className="relative">
                <input required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••" className="w-full bg-[#1c1c2e] border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-[#e2e2f0] placeholder:text-[#5858a0] focus:outline-none focus:border-[#6366f1]/60 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5858a0] hover:text-[#7878a0]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <div className="text-xs text-red-400">{error}</div>}
            {info && <div className="text-xs text-emerald-400">{info}</div>}

            <button type="submit" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5254cc] hover:to-[#7c3aed] text-white font-semibold rounded-xl transition-all text-sm mt-2 disabled:opacity-50">
              {loading ? "…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-sm text-[#7878a0] mt-6">
            {mode === "login" ? "Pas encore de compte ? " : "Vous avez déjà un compte ? "}
            <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-[#6366f1] hover:text-[#a5b4fc] font-medium transition-colors">
              {mode === "login" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#16161f] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-[#7878a0] mb-1 font-mono">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#c4c4d8]">{p.name}: <span className="text-[#e2e2f0] font-medium">{p.value}</span></span>
        </div>
      ))}
    </div>
  );
};

function StatCard({ title, value, sub, icon: Icon, accent }: { title: string; value: string; sub: string; icon: any; accent: string }) {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + "15" }}>
        <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-[#e2e2f0] font-mono leading-none mb-1">{value}</div>
        <div className="text-[#7878a0] text-xs">{title}</div>
        <div className="text-[#5858a0] text-[10px] mt-1">{sub}</div>
      </div>
    </Card>
  );
}

function DashboardPage({ setPage }: { setPage: (p: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ competitors: 0, sources: 0, reportsWeek: 0, alertsWeek: 0, agentsActiveToday: 0 });
  const [activity, setActivity] = useState<{ day: string; analyses: number; alertes: number }[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [activeCompetitors, setActiveCompetitors] = useState<any[]>([]);
  const [agentSnapshot, setAgentSnapshot] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const since = new Date(); since.setDate(since.getDate() - 6); since.setHours(0, 0, 0, 0);
    const startToday = new Date(); startToday.setHours(0, 0, 0, 0);

    const [
      { count: competitorsCount },
      { count: sourcesCount },
      { data: alertsWeek },
      { data: reportsWeek },
      { data: runsWeek },
      { data: recentAlertsData },
      { data: competitorsData },
    ] = await Promise.all([
      supabase.from("competitors").select("id", { count: "exact", head: true }),
      supabase.from("sources").select("id", { count: "exact", head: true }),
      supabase.from("alerts").select("id, created_at").gte("created_at", since.toISOString()),
      supabase.from("reports").select("id, generated_at").gte("generated_at", since.toISOString()),
      supabase.from("agent_runs").select("id, started_at, agent_name, status").gte("started_at", since.toISOString()),
      supabase.from("alerts").select("*, competitors(name)").order("created_at", { ascending: false }).limit(3),
      supabase.from("competitors").select("*, sources(last_analyzed_at)").eq("status", "actif").limit(5),
    ]);

    const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    const dayLabel = (d: Date) => new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(d).replace(".", "");
    setActivity(days.map((d) => {
      const key = d.toDateString();
      return {
        day: dayLabel(d),
        analyses: (runsWeek || []).filter((r: any) => new Date(r.started_at).toDateString() === key).length,
        alertes: (alertsWeek || []).filter((a: any) => new Date(a.created_at).toDateString() === key).length,
      };
    }));

    const todaysRuns = (runsWeek || []).filter((r: any) => new Date(r.started_at) >= startToday);
    const agentsActiveToday = new Set(todaysRuns.map((r: any) => r.agent_name)).size;

    setStats({
      competitors: competitorsCount || 0,
      sources: sourcesCount || 0,
      reportsWeek: (reportsWeek || []).length,
      alertsWeek: (alertsWeek || []).length,
      agentsActiveToday,
    });
    setRecentAlerts(recentAlertsData || []);
    setActiveCompetitors((competitorsData || []).map((c: any) => ({
      ...c,
      lastScan: c.sources?.length ? c.sources.map((s: any) => s.last_analyzed_at).filter(Boolean).sort().reverse()[0] : null,
    })));
    setAgentSnapshot(AGENT_ORDER.map((name) => {
      const runsForAgent = (runsWeek || []).filter((r: any) => r.agent_name === name);
      const latest = runsForAgent.sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
      return { name, status: agentStatusLabel(latest?.status), progress: latest?.status === "running" ? 50 : 0 };
    }));
    setLoading(false);
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Concurrents surveillés" value={String(stats.competitors)} sub="au total" icon={Users} accent="#6366f1" />
        <StatCard title="Alertes" value={String(stats.alertsWeek)} sub="7 derniers jours" icon={Bell} accent="#8b5cf6" />
        <StatCard title="Rapports générés" value={String(stats.reportsWeek)} sub="7 derniers jours" icon={FileText} accent="#22d3ee" />
        <StatCard title="Sources surveillées" value={String(stats.sources)} sub="au total" icon={Globe} accent="#f59e0b" />
        <StatCard title="Agents actifs" value={`${stats.agentsActiveToday}/7`} sub="aujourd'hui" icon={Bot} accent="#10b981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[#e2e2f0] font-semibold text-sm">Activité de la semaine</h3>
              <p className="text-[#7878a0] text-xs mt-0.5">Exécutions d'agents · Alertes</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#7878a0]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#6366f1]" />Analyses</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#22d3ee]" />Alertes</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activity} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#7878a0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7878a0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="analyses" name="Analyses" stroke="#6366f1" strokeWidth={2} fill="url(#ga)" />
              <Area type="monotone" dataKey="alertes" name="Alertes" stroke="#22d3ee" strokeWidth={2} fill="url(#gc)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#e2e2f0] font-semibold text-sm">Agents IA</h3>
            <button onClick={() => setPage("agents")} className="text-xs text-[#6366f1] hover:text-[#a5b4fc] flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3">
            {agentSnapshot.map((a) => {
              const meta = AGENT_META[a.name as AgentName];
              return (
                <div key={a.name} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: meta.color + "15" }}>
                    <meta.icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#c4c4d8] text-xs font-medium truncate">{meta.name}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    {a.progress > 0 && <ProgressBar value={a.progress} color={meta.color} />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#e2e2f0] font-semibold text-sm">Dernières alertes</h3>
            <button onClick={() => setPage("alerts")} className="text-xs text-[#6366f1] hover:text-[#a5b4fc] flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></button>
          </div>
          {recentAlerts.length === 0 ? <EmptyState label="Aucune alerte pour l'instant." /> : (
            <div className="space-y-3">
              {recentAlerts.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all cursor-pointer">
                  <PriorityBadge priority={a.priority} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[#c4c4d8] text-xs font-medium leading-snug mb-0.5">{a.title}</div>
                    <div className="text-[#7878a0] text-[11px]">{a.competitors?.name} · {timeAgo(a.created_at)}</div>
                  </div>
                  {!a.read && <span className="w-2 h-2 rounded-full bg-[#6366f1] shrink-0 mt-1" />}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#e2e2f0] font-semibold text-sm">Concurrents actifs</h3>
            <button onClick={() => setPage("competitors")} className="text-xs text-[#6366f1] hover:text-[#a5b4fc] flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></button>
          </div>
          {activeCompetitors.length === 0 ? <EmptyState label="Aucun concurrent configuré." /> : (
            <div className="space-y-2.5">
              {activeCompetitors.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                  <Avatar name={c.name} color={colorFor(c.name)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[#c4c4d8] text-xs font-medium">{c.name}</div>
                    <div className="text-[#7878a0] text-[11px]">{timeAgo(c.lastScan)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── DÉCOUVERTE ───────────────────────────────────────────────────────────────

function DiscoveryPage() {
  const [companyName, setCompanyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadHistory(); }, []);

  // Tant qu'une demande est en cours (pending/running), on la repolle
  // toutes les 3s jusqu'à done/error — pas de websocket nécessaire ici.
  useEffect(() => {
    if (!activeRequest || activeRequest.status === "done" || activeRequest.status === "error") return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from("discovery_requests").select("*").eq("id", activeRequest.id).single();
      if (data) {
        setActiveRequest(data);
        if (data.status === "done" || data.status === "error") loadHistory();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeRequest]);

  async function loadHistory() {
    setLoadingHistory(true);
    const { data } = await supabase.from("discovery_requests").select("*").order("created_at", { ascending: false }).limit(10);
    setHistory(data || []);
    setLoadingHistory(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;
    setError(null);
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const { data: request, error: insertError } = await supabase
      .from("discovery_requests")
      .insert({ user_id: user.id, company_name: companyName.trim(), status: "pending" })
      .select()
      .single();

    if (insertError || !request) {
      setError(insertError?.message || "Impossible de créer la demande.");
      setSubmitting(false);
      return;
    }

    setActiveRequest(request);

    const { error: fnError } = await supabase.functions.invoke("trigger-discovery", {
      body: { company_name: companyName.trim(), request_id: request.id },
    });

    if (fnError) {
      setError("Le déclenchement a échoué : " + fnError.message + " — vérifie que l'Edge Function trigger-discovery est bien déployée avec ses secrets GitHub.");
    }

    setCompanyName("");
    setSubmitting(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#6366f1]" />
          <h3 className="text-[#e2e2f0] font-semibold text-sm">Trouver des concurrents automatiquement</h3>
        </div>
        <p className="text-[#7878a0] text-xs mb-4 leading-relaxed">
          Entre le nom d'une entreprise (la tienne, ou un concurrent connu comme point de départ) — le pipeline
          cherche sur le web ses concurrents probables et les ajoute directement à ta liste de surveillance.
          Vérifie la liste obtenue avant de la laisser tourner : la recherche automatique peut se tromper sur des marchés de niche.
        </p>
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Ex. Notion, Stripe, Linear…"
            className="flex-1 bg-[#1c1c2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#e2e2f0] placeholder:text-[#5858a0] focus:outline-none focus:border-[#6366f1]/60"
          />
          <Btn variant="primary" icon={<Rocket className="w-3.5 h-3.5" />} disabled={submitting || !companyName.trim()} onClick={() => {}}>
            {submitting ? "…" : "Lancer"}
          </Btn>
        </form>
        {error && <div className="text-xs text-red-400 mt-3">{error}</div>}
      </Card>

      {activeRequest && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#e2e2f0] text-sm font-medium">{activeRequest.company_name}</span>
            </div>
            <StatusBadge status={
              activeRequest.status === "pending" ? "en attente" :
              activeRequest.status === "running" ? "actif" :
              activeRequest.status === "done" ? "publie" : "erreur"
            } />
          </div>

          {(activeRequest.status === "pending" || activeRequest.status === "running") && (
            <div className="flex items-center gap-2 text-[#7878a0] text-xs"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Recherche en cours — ça prend généralement 1 à 2 minutes (démarrage du workflow GitHub Actions inclus).</div>
          )}

          {activeRequest.status === "error" && (
            <div className="text-xs text-red-400">{activeRequest.error_message || "Erreur inconnue."}</div>
          )}

          {activeRequest.status === "done" && (
            <div>
              {(activeRequest.results || []).length === 0 ? (
                <EmptyState label="Aucun concurrent identifié avec confiance suffisante." />
              ) : (
                <div className="space-y-2">
                  {(activeRequest.results || []).map((r: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3">
                      <Avatar name={r.name} color={colorFor(r.name)} size="sm" />
                      <span className="text-[#c4c4d8] text-xs flex-1">{r.name}</span>
                      {r.website && <span className="text-[#5858a0] text-[10px] font-mono">{r.website}</span>}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-[#5858a0] mt-3">Déjà ajoutés à la page Concurrents — vérifie-les et désactive ceux qui ne sont pas pertinents.</p>
            </div>
          )}
        </Card>
      )}

      <div>
        <div className="text-[10px] text-[#5858a0] uppercase tracking-wider mb-2">Demandes précédentes</div>
        {loadingHistory ? <Loading /> : history.length === 0 ? <EmptyState label="Aucune demande encore." /> : (
          <div className="space-y-1.5">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/3 text-xs">
                <span className="text-[#c4c4d8] flex-1">{h.company_name}</span>
                <span className="text-[#5858a0]">{timeAgo(h.created_at)}</span>
                <StatusBadge status={
                  h.status === "pending" ? "en attente" :
                  h.status === "running" ? "actif" :
                  h.status === "done" ? "publie" : "erreur"
                } />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CONCURRENTS ──────────────────────────────────────────────────────────────

const EMPTY_COMPETITOR = { name: "", sector: "", website: "", monitoring_frequency: "quotidien" };

function CompetitorsPage() {
  const [loading, setLoading] = useState(true);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_COMPETITOR);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("competitors")
      .select("*, sources(last_analyzed_at), alerts(id, read)")
      .order("name");
    setCompetitors((data || []).map((c: any) => ({
      ...c,
      lastScan: c.sources?.length ? c.sources.map((s: any) => s.last_analyzed_at).filter(Boolean).sort().reverse()[0] : null,
      unreadAlerts: (c.alerts || []).filter((a: any) => !a.read).length,
    })));
    setLoading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (editingId) {
      await supabase.from("competitors").update(form).eq("id", editingId);
    } else {
      await supabase.from("competitors").insert({ ...form, user_id: user.id });
    }
    setForm(EMPTY_COMPETITOR);
    setEditingId(null);
    setShowForm(false);
    load();
  }

  function edit(c: any) {
    setForm({ name: c.name, sector: c.sector || "", website: c.website || "", monitoring_frequency: c.monitoring_frequency });
    setEditingId(c.id);
    setShowForm(true);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce concurrent et toutes ses sources ?")) return;
    await supabase.from("competitors").delete().eq("id", id);
    load();
  }

  async function toggleStatus(c: any) {
    await supabase.from("competitors").update({ status: c.status === "actif" ? "pause" : "actif" }).eq("id", c.id);
    load();
  }

  const filtered = competitors.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5858a0]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un concurrent…" className="w-full bg-[#111119] border border-white/8 rounded-xl pl-9 pr-3 py-2 text-sm text-[#c4c4d8] placeholder:text-[#5858a0] focus:outline-none focus:border-[#6366f1]/50 transition-all" />
        </div>
        <Btn icon={<Plus className="w-3.5 h-3.5" />} variant="primary" onClick={() => { setForm(EMPTY_COMPETITOR); setEditingId(null); setShowForm(!showForm); }}>
          {showForm ? "Fermer" : "Ajouter"}
        </Btn>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={submit} className="grid grid-cols-2 gap-4">
            <label className="text-xs text-[#7878a0] flex flex-col gap-1.5">Nom
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[#1c1c2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#e2e2f0]" />
            </label>
            <label className="text-xs text-[#7878a0] flex flex-col gap-1.5">Secteur
              <input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="bg-[#1c1c2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#e2e2f0]" />
            </label>
            <label className="text-xs text-[#7878a0] flex flex-col gap-1.5">Site web
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" className="bg-[#1c1c2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#e2e2f0]" />
            </label>
            <label className="text-xs text-[#7878a0] flex flex-col gap-1.5">Fréquence de surveillance
              <select value={form.monitoring_frequency} onChange={(e) => setForm({ ...form, monitoring_frequency: e.target.value })} className="bg-[#1c1c2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#e2e2f0]">
                <option value="horaire">Toutes les heures</option>
                <option value="quotidien">Quotidien</option>
                <option value="hebdomadaire">Hebdomadaire</option>
              </select>
            </label>
            <div className="col-span-2">
              <Btn variant="primary" onClick={() => {}}>{editingId ? "Enregistrer" : "Créer le concurrent"}</Btn>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? <Loading /> : filtered.length === 0 ? <EmptyState label="Aucun concurrent. Ajoutez-en un pour démarrer la veille." /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Concurrent", "Secteur", "Site web", "Fréquence", "Statut", "Dernière analyse", "Alertes", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-[#5858a0] uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className={`border-b border-white/5 hover:bg-white/2 transition-all group ${i === filtered.length - 1 ? "border-b-0" : ""}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} color={colorFor(c.name)} />
                        <span className="text-[#e2e2f0] text-sm font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#7878a0] text-xs">{c.sector || "—"}</td>
                    <td className="px-4 py-3.5">
                      {c.website ? <a href={c.website} target="_blank" rel="noreferrer" className="text-xs text-[#6366f1] hover:text-[#a5b4fc] flex items-center gap-1">{c.website.replace(/^https?:\/\//, "")} <ExternalLink className="w-3 h-3" /></a> : <span className="text-[#5858a0] text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5"><span className="text-xs text-[#c4c4d8] bg-white/5 px-2 py-0.5 rounded-md">{freqLabel(c.monitoring_frequency)}</span></td>
                    <td className="px-4 py-3.5 cursor-pointer" onClick={() => toggleStatus(c)}><StatusBadge status={c.status === "actif" ? "actif" : "en pause"} /></td>
                    <td className="px-4 py-3.5 text-[#7878a0] text-xs font-mono">{timeAgo(c.lastScan)}</td>
                    <td className="px-4 py-3.5">
                      {c.unreadAlerts > 0 ? <span className="text-xs bg-[#6366f1]/15 text-[#a5b4fc] px-2 py-0.5 rounded-full font-mono">{c.unreadAlerts}</span> : <span className="text-[#5858a0] text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => edit(c)} className="p-1.5 rounded-lg hover:bg-white/8 text-[#7878a0] hover:text-[#c4c4d8]"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#7878a0] hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── SOURCES ──────────────────────────────────────────────────────────────────

const SOURCE_TYPES = ["site_web", "blog", "github", "linkedin", "rss", "changelog", "documentation", "emploi"];
const TYPE_LABEL: Record<string, string> = {
  site_web: "Site web", blog: "Blog", github: "GitHub", linkedin: "LinkedIn", rss: "RSS",
  changelog: "Changelog", documentation: "Documentation", emploi: "Offres d'emploi",
};
const typeColor: Record<string, string> = {
  blog: "#6366f1", changelog: "#22d3ee", github: "#e2e2f0", linkedin: "#3b82f6",
  rss: "#f59e0b", site_web: "#10b981", documentation: "#8b5cf6", emploi: "#f97316",
};

function SourcesPage() {
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [filter, setFilter] = useState("Tous");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ competitor_id: "", type: "site_web", url: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: sourcesData }, { data: competitorsData }, { data: reportSources }] = await Promise.all([
      supabase.from("sources").select("*, competitors(name)").order("created_at", { ascending: false }),
      supabase.from("competitors").select("id, name").order("name"),
      supabase.from("report_sources").select("source_id"),
    ]);
    const reportCountBySource: Record<string, number> = {};
    (reportSources || []).forEach((rs: any) => { reportCountBySource[rs.source_id] = (reportCountBySource[rs.source_id] || 0) + 1; });
    setSources((sourcesData || []).map((s: any) => ({ ...s, reportCount: reportCountBySource[s.id] || 0 })));
    setCompetitors(competitorsData || []);
    if (!form.competitor_id && competitorsData?.length) setForm((f) => ({ ...f, competitor_id: competitorsData[0].id }));
    setLoading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !form.competitor_id) return;
    await supabase.from("sources").insert({ ...form, user_id: user.id });
    setForm({ ...form, url: "" });
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette source ?")) return;
    await supabase.from("sources").delete().eq("id", id);
    load();
  }

  const types = ["Tous", ...SOURCE_TYPES];
  const filtered = filter === "Tous" ? sources : sources.filter((s) => s.type === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === t ? "bg-[#6366f1]/15 text-[#a5b4fc] border border-[#6366f1]/25" : "bg-white/5 text-[#7878a0] hover:bg-white/8 border border-transparent"}`}>
            {t === "Tous" ? "Tous" : TYPE_LABEL[t]}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Btn icon={<Plus className="w-3.5 h-3.5" />} variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Fermer" : "Ajouter une source"}
          </Btn>
        </div>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={submit} className="grid grid-cols-3 gap-4">
            <label className="text-xs text-[#7878a0] flex flex-col gap-1.5">Concurrent
              <select required value={form.competitor_id} onChange={(e) => setForm({ ...form, competitor_id: e.target.value })} className="bg-[#1c1c2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#e2e2f0]">
                {competitors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="text-xs text-[#7878a0] flex flex-col gap-1.5">Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="bg-[#1c1c2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#e2e2f0]">
                {SOURCE_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            </label>
            <label className="text-xs text-[#7878a0] flex flex-col gap-1.5">URL
              <input required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" className="bg-[#1c1c2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#e2e2f0]" />
            </label>
            <div className="col-span-3">
              <Btn variant="primary" onClick={() => {}}>Ajouter</Btn>
            </div>
          </form>
        </Card>
      )}

      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState label="Aucune source pour ce filtre." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((s) => {
            const accent = typeColor[s.type] ?? "#6366f1";
            return (
              <Card key={s.id} className="p-4 hover:border-white/12 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accent + "18" }}>
                      <Globe className="w-4 h-4" style={{ color: accent }} />
                    </div>
                    <div>
                      <div className="text-[#e2e2f0] text-sm font-medium leading-none mb-0.5">{s.competitors?.name}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: accent + "15", color: accent }}>{TYPE_LABEL[s.type]}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(s.id)} className="opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:bg-red-500/10 text-[#7878a0] hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <a href={s.url} target="_blank" rel="noreferrer" className="text-[#7878a0] text-xs font-mono mb-3 truncate block hover:text-[#a5b4fc]">{s.url}</a>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#5858a0]">Fiabilité</span>
                      <span className="text-[10px] font-mono text-[#c4c4d8]">{s.reliability_score}%</span>
                    </div>
                    <ProgressBar value={s.reliability_score} color={s.reliability_score > 90 ? "#10b981" : s.reliability_score > 75 ? "#f59e0b" : "#ef4444"} />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#5858a0]">Dernier scan</div>
                    <div className="text-[10px] font-mono text-[#7878a0]">{timeAgo(s.last_analyzed_at)}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <StatusBadge status={s.status === "actif" ? "actif" : s.status === "erreur" ? "erreur" : "en pause"} />
                  <span className="text-xs font-mono text-[#c4c4d8]">{s.reportCount} rapport{s.reportCount !== 1 ? "s" : ""}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── RAPPORTS IA ──────────────────────────────────────────────────────────────

function ReportsPage({ onSelect }: { onSelect: (id: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [tab, setTab] = useState("Tous");
  const tabs = ["Tous", "Publié", "Brouillon"];

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("reports").select("*, competitors(name)").order("generated_at", { ascending: false });
    setReports(data || []);
    setLoading(false);
  }

  const filtered = tab === "Tous" ? reports : reports.filter((r) => (tab === "Publié" ? r.status === "publie" : r.status === "brouillon"));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1 border-b border-white/5 pb-0">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t ? "border-[#6366f1] text-[#a5b4fc]" : "border-transparent text-[#7878a0] hover:text-[#c4c4d8]"}`}>
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pb-2">
          <Btn icon={<RefreshCw className="w-3.5 h-3.5" />} variant="secondary" onClick={load}>Actualiser</Btn>
        </div>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState label="Aucun rapport pour l'instant. Le pipeline en publiera dès qu'un changement significatif sera détecté." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <Card key={r.id} className="p-5 hover:border-white/14 transition-all cursor-pointer group" onClick={() => onSelect(r.id)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Avatar name={r.competitors?.name || "?"} color={colorFor(r.competitors?.name || "?")} />
                  <div>
                    <div className="text-[#7878a0] text-xs">{r.competitors?.name}</div>
                    <div className="text-[#5858a0] text-[10px] font-mono">{formatDateFr(r.generated_at)}</div>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <h3 className="text-[#e2e2f0] font-semibold text-sm leading-snug mb-2 group-hover:text-white transition-colors">{r.title}</h3>
              <p className="text-[#7878a0] text-xs leading-relaxed mb-4 line-clamp-2">{r.summary}</p>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#5858a0]">Score de confiance</span>
                    <span className="text-[10px] font-mono text-[#c4c4d8]">{r.confidence_score}%</span>
                  </div>
                  <ProgressBar value={r.confidence_score} color={r.confidence_score > 90 ? "#10b981" : r.confidence_score > 80 ? "#f59e0b" : "#ef4444"} />
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-[#5858a0]">Sources</div>
                  <div className="text-xs font-mono text-[#c4c4d8] font-semibold">{r.sources_count}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportDetailPage({ reportId, onBack }: { reportId: string; onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [citedSources, setCitedSources] = useState<any[]>([]);

  useEffect(() => { load(); }, [reportId]);

  async function load() {
    setLoading(true);
    const [{ data: r }, { data: rs }] = await Promise.all([
      supabase.from("reports").select("*, competitors(name)").eq("id", reportId).single(),
      supabase.from("report_sources").select("*, sources(type, reliability_score)").eq("report_id", reportId),
    ]);
    setReport(r);
    setCitedSources(rs || []);
    setLoading(false);
  }

  if (loading || !report) return <Loading />;

  const facts: string[] = report.facts || [];
  const recommendations: string[] = report.recommendations || [];

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-[#7878a0] hover:text-[#c4c4d8] text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour aux rapports
      </button>

      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={report.competitors?.name || "?"} color={colorFor(report.competitors?.name || "?")} size="md" />
            <div>
              <div className="text-[#7878a0] text-sm">{report.competitors?.name}</div>
              <div className="text-[#5858a0] text-xs font-mono">{formatDateFr(report.generated_at)}</div>
            </div>
          </div>
          <StatusBadge status={report.status} />
        </div>
        <h2 className="text-xl font-bold text-[#e2e2f0] mb-3">{report.title}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#7878a0] text-xs">Confiance :</span>
            <span className="text-xs font-mono font-semibold text-emerald-400">{report.confidence_score}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#7878a0] text-xs">Sources :</span>
            <span className="text-xs font-mono font-semibold text-[#c4c4d8]">{report.sources_count}</span>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-[#6366f1]" /></div>
          <h3 className="text-[#e2e2f0] font-semibold text-sm">Résumé exécutif</h3>
        </div>
        <p className="text-[#c4c4d8] text-sm leading-relaxed">{report.summary}</p>
      </Card>

      {facts.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 flex items-center justify-center"><AlertCircle className="w-3.5 h-3.5 text-[#6366f1]" /></div>
            <h3 className="text-[#e2e2f0] font-semibold text-sm">Faits importants détectés</h3>
          </div>
          <ul className="space-y-2">
            {facts.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#c4c4d8]">
                <CheckCircle2 className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {report.analysis && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-[#6366f1]" /></div>
            <h3 className="text-[#e2e2f0] font-semibold text-sm">Analyse IA</h3>
          </div>
          <p className="text-[#c4c4d8] text-sm leading-relaxed">{report.analysis}</p>
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 flex items-center justify-center"><Target className="w-3.5 h-3.5 text-[#6366f1]" /></div>
            <h3 className="text-[#e2e2f0] font-semibold text-sm">Recommandations stratégiques</h3>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#c4c4d8]">
                <CheckCircle2 className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" /> {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 flex items-center justify-center"><LinkIcon className="w-3.5 h-3.5 text-[#6366f1]" /></div>
          <h3 className="text-[#e2e2f0] font-semibold text-sm">Sources citées</h3>
        </div>
        {citedSources.length === 0 ? <EmptyState label="Aucune source liée." /> : (
          <div className="space-y-2">
            {citedSources.map((cs) => (
              <a key={cs.id} href={cs.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/3 transition-all">
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: (typeColor[cs.sources?.type] ?? "#6366f1") + "15", color: typeColor[cs.sources?.type] ?? "#6366f1" }}>{TYPE_LABEL[cs.sources?.type] || cs.sources?.type}</span>
                <span className="text-[#c4c4d8] text-xs flex-1 truncate">{cs.url}</span>
                <span className="text-[#7878a0] text-[10px] font-mono">{cs.sources?.reliability_score}%</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#5858a0]" />
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── AGENTS IA ────────────────────────────────────────────────────────────────

function AgentsPage() {
  const [loading, setLoading] = useState(true);
  const [agentData, setAgentData] = useState<Record<string, any>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
    const { data: runs } = await supabase
      .from("agent_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(500);

    const byAgent: Record<string, any> = {};
    AGENT_ORDER.forEach((name) => {
      const runsForAgent = (runs || []).filter((r: any) => r.agent_name === name);
      const latest = runsForAgent[0];
      const successRuns = runsForAgent.filter((r: any) => r.status === "success" && r.duration_ms);
      const avgMs = successRuns.length ? successRuns.reduce((s: number, r: any) => s + r.duration_ms, 0) / successRuns.length : null;
      const tasksToday = runsForAgent.filter((r: any) => new Date(r.started_at) >= startToday).length;
      byAgent[name] = {
        status: agentStatusLabel(latest?.status),
        progress: latest?.status === "running" ? (latest.progress || 50) : 0,
        tasksToday,
        avgTime: avgDurationLabel(avgMs),
        lastRun: latest ? timeAgo(latest.started_at) : "jamais",
        recent: runsForAgent.slice(0, 3).map((r: any) => r.message || `${r.status}`),
      };
    });
    setAgentData(byAgent);
    setLoading(false);
  }

  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {AGENT_ORDER.map((name) => {
        const meta = AGENT_META[name];
        const a = agentData[name];
        return (
          <Card key={name} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: meta.color + "15" }}>
                  <meta.icon className="w-5 h-5" style={{ color: meta.color }} />
                </div>
                <div>
                  <div className="text-[#e2e2f0] font-semibold text-sm">{meta.name}</div>
                  <div className="text-[#7878a0] text-xs mt-0.5">{meta.description}</div>
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>

            {a.progress > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[#5858a0]">Progression</span>
                  <span className="text-[10px] font-mono text-[#c4c4d8]">{a.progress}%</span>
                </div>
                <ProgressBar value={a.progress} color={meta.color} />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Tâches aujourd'hui", value: String(a.tasksToday) },
                { label: "Temps moyen", value: a.avgTime },
                { label: "Dernier run", value: a.lastRun },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/3 rounded-lg p-2.5 text-center">
                  <div className="text-[#e2e2f0] font-mono text-sm font-semibold">{stat.value}</div>
                  <div className="text-[#5858a0] text-[10px] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-[10px] text-[#5858a0] uppercase tracking-wider mb-2">Exécutions récentes</div>
              {a.recent.length === 0 ? (
                <div className="text-xs text-[#5858a0]">Aucune exécution encore.</div>
              ) : (
                <div className="space-y-1.5">
                  {a.recent.map((task: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#7878a0]">
                      <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" /> {task}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── HISTORIQUE ───────────────────────────────────────────────────────────────

const histTypeConfig: Record<string, { color: string; icon: any }> = {
  recherche: { color: "#6366f1", icon: Search },
  scraping: { color: "#8b5cf6", icon: Database },
  verification: { color: "#22d3ee", icon: Shield },
  analyse: { color: "#f59e0b", icon: BarChart2 },
  redaction: { color: "#10b981", icon: FileText },
  controle_qualite: { color: "#ef4444", icon: CheckCircle2 },
  publication: { color: "#f97316", icon: Zap },
};

function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [competitorFilter, setCompetitorFilter] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: runs }, { data: competitorsData }] = await Promise.all([
      supabase.from("agent_runs").select("*, competitors(name)").order("started_at", { ascending: false }).limit(200),
      supabase.from("competitors").select("id, name").order("name"),
    ]);
    setItems(runs || []);
    setCompetitors(competitorsData || []);
    setLoading(false);
  }

  const filtered = competitorFilter ? items.filter((i) => i.competitor_id === competitorFilter) : items;
  const grouped: Record<string, any[]> = {};
  filtered.forEach((item) => {
    const key = formatDateFr(item.started_at);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <select value={competitorFilter} onChange={(e) => setCompetitorFilter(e.target.value)} className="bg-[#111119] border border-white/8 rounded-lg px-3 py-1.5 text-xs text-[#c4c4d8] focus:outline-none">
          <option value="">Tous les concurrents</option>
          {competitors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Btn icon={<RefreshCw className="w-3.5 h-3.5" />} variant="secondary" onClick={load}>Actualiser</Btn>
      </div>

      {loading ? <Loading /> : Object.keys(grouped).length === 0 ? <EmptyState label="Aucun événement encore." /> : (
        Object.entries(grouped).map(([date, dayItems]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold text-[#7878a0] uppercase tracking-wider">{date}</span>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] text-[#5858a0] font-mono">{dayItems.length} événement{dayItems.length > 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-2">
              {dayItems.map((item) => {
                const tc = item.status === "error" ? { color: "#ef4444", icon: XCircle } : (histTypeConfig[item.agent_name] ?? { color: "#7878a0", icon: Circle });
                const Icon = tc.icon;
                const meta = AGENT_META[item.agent_name as AgentName];
                return (
                  <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#111119] border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: tc.color + "15" }}>
                      <Icon className="w-4 h-4" style={{ color: tc.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[#c4c4d8] text-sm font-medium leading-snug">{item.message || meta?.name}</span>
                        <span className="text-[10px] font-mono text-[#5858a0] shrink-0">{formatTimeFr(item.started_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: tc.color + "12", color: tc.color }}>{meta?.name}</span>
                        {item.competitors?.name && <span className="text-[#5858a0] text-[10px]">{item.competitors.name}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── ALERTES ──────────────────────────────────────────────────────────────────

function AlertsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState("Toutes");
  const priorities = ["Toutes", "Haute", "Moyenne", "Basse"];

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: alerts } = await supabase.from("alerts").select("*, competitors(name)").order("created_at", { ascending: false });
    setData(alerts || []);
    setLoading(false);
  }

  async function markRead(id: string) {
    setData((d) => d.map((x) => (x.id === id ? { ...x, read: true } : x)));
    await supabase.from("alerts").update({ read: true }).eq("id", id);
  }

  async function markAllRead() {
    const ids = data.filter((a) => !a.read).map((a) => a.id);
    setData((d) => d.map((a) => ({ ...a, read: true })));
    if (ids.length) await supabase.from("alerts").update({ read: true }).in("id", ids);
  }

  const filtered = filter === "Toutes" ? data : data.filter((a) => a.priority === filter.toLowerCase());
  const unread = data.filter((a) => !a.read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          {priorities.map((p) => (
            <button key={p} onClick={() => setFilter(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === p ? "bg-[#6366f1]/15 text-[#a5b4fc] border border-[#6366f1]/25" : "bg-white/5 text-[#7878a0] hover:bg-white/8 border border-transparent"}`}>
              {p}
            </button>
          ))}
        </div>
        {unread > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-[#7878a0]">{unread} non lue{unread > 1 ? "s" : ""}</span>
            <Btn variant="secondary" onClick={markAllRead}>Tout marquer comme lu</Btn>
          </div>
        )}
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState label="Aucune alerte pour ce filtre." /> : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Card key={a.id} className={`p-5 hover:border-white/12 transition-all cursor-pointer ${!a.read ? "border-[#6366f1]/20" : ""}`} onClick={() => markRead(a.id)}>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                  {!a.read && <span className="w-2 h-2 rounded-full bg-[#6366f1]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PriorityBadge priority={a.priority} />
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#7878a0] border border-white/8">{ALERT_TYPE_LABEL[a.type] || a.type}</span>
                    </div>
                    <span className="text-[10px] text-[#5858a0] font-mono shrink-0">{formatDateFr(a.created_at)}</span>
                  </div>
                  <h3 className="text-[#e2e2f0] font-semibold text-sm mb-1.5">{a.title}</h3>
                  {a.description && <p className="text-[#7878a0] text-xs leading-relaxed mb-3">{a.description}</p>}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={a.competitors?.name || "?"} color={colorFor(a.competitors?.name || "?")} size="sm" />
                      <span className="text-xs text-[#7878a0]">{a.competitors?.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PARAMÈTRES ───────────────────────────────────────────────────────────────

function SettingsPage() {
  const [tab, setTab] = useState("API Keys");
  const tabs = ["API Keys", "Connexion Supabase"];
  const [settings, setSettings] = useState<any>({ groq_api_key: "", gemini_api_key: "", openai_api_key: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("settings").select("*").eq("user_id", user.id).maybeSingle();
    setSettings(data || { groq_api_key: "", gemini_api_key: "", openai_api_key: "" });
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("settings").upsert({ ...settings, user_id: user.id });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const keyFields = [
    { key: "groq_api_key", label: "Groq API", provider: "Groq", help: "Utilisée par l'agent Rédaction — console.groq.com" },
    { key: "gemini_api_key", label: "Gemini API", provider: "Google", help: "Utilisée par l'agent Contrôle Qualité (optionnel) — aistudio.google.com" },
    { key: "openai_api_key", label: "OpenAI API", provider: "OpenAI", help: "Réservée à un usage futur, non utilisée par le pipeline actuel" },
  ];

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-1 border-b border-white/5 pb-0">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t ? "border-[#6366f1] text-[#a5b4fc]" : "border-transparent text-[#7878a0] hover:text-[#c4c4d8]"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "API Keys" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/15">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-amber-400/80 text-xs">Stockées dans la table <code>settings</code>, protégées par RLS (visibles uniquement par toi). Le pipeline les utilise en priorité par rapport aux secrets GitHub Actions.</p>
          </div>
          {loading ? <Loading /> : (
            <div className="space-y-3">
              {keyFields.map((f) => (
                <Card key={f.key} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#6366f1]" />
                      <span className="text-[#e2e2f0] text-sm font-medium">{f.label}</span>
                      <span className="text-[10px] text-[#7878a0] bg-white/5 px-1.5 py-0.5 rounded">{f.provider}</span>
                    </div>
                    <StatusBadge status={settings[f.key] ? "actif" : "inactif"} />
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type={showKeys[f.key] ? "text" : "password"}
                      value={settings[f.key] || ""}
                      onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                      placeholder="Coller la clé ici"
                      className="flex-1 bg-[#1c1c2e] border border-white/8 rounded-lg px-3 py-2 text-xs font-mono text-[#e2e2f0]"
                    />
                    <button onClick={() => setShowKeys((k) => ({ ...k, [f.key]: !k[f.key] }))} className="p-2 rounded-lg hover:bg-white/8 text-[#7878a0]">
                      {showKeys[f.key] ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#5858a0]">{f.help}</p>
                </Card>
              ))}
              <div className="flex items-center gap-3">
                <Btn icon={<Save className="w-3.5 h-3.5" />} variant="primary" onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Btn>
                {saved && <span className="text-emerald-400 text-xs">Enregistré.</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "Connexion Supabase" && (
        <Card className="p-5 space-y-4">
          <p className="text-[#7878a0] text-xs leading-relaxed">
            Ces valeurs configurent la connexion elle-même : elles se règlent dans les variables d'environnement
            Vercel (<code className="text-[#a5b4fc]">VITE_SUPABASE_URL</code>, <code className="text-[#a5b4fc]">VITE_SUPABASE_ANON_KEY</code>),
            pas depuis cette page — les modifier ici n'aurait aucun effet tant que l'app n'est pas rebuild.
          </p>
          <div>
            <label className="block text-[10px] text-[#5858a0] mb-1">VITE_SUPABASE_URL (actuelle)</label>
            <div className="bg-[#1c1c2e] border border-white/8 rounded-lg px-3 py-2 text-xs font-mono text-[#7878a0] truncate">
              {(import.meta as any).env?.VITE_SUPABASE_URL || "non configurée"}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── PROFIL ───────────────────────────────────────────────────────────────────

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [stats, setStats] = useState({ reports: 0, competitors: 0, alerts: 0, daysActive: 0 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: prof }, { count: reportsCount }, { count: competitorsCount }, { count: alertsCount }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("reports").select("id", { count: "exact", head: true }),
      supabase.from("competitors").select("id", { count: "exact", head: true }),
      supabase.from("alerts").select("id", { count: "exact", head: true }),
    ]);
    setProfile(prof);
    setEmail(user.email || "");
    setFullName(prof?.full_name || "");
    const created = user.created_at ? new Date(user.created_at) : new Date();
    setStats({
      reports: reportsCount || 0,
      competitors: competitorsCount || 0,
      alerts: alertsCount || 0,
      daysActive: Math.max(1, Math.floor((Date.now() - created.getTime()) / 86400000)),
    });
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, full_name: fullName });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl space-y-5">
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#6366f1] to-[#22d3ee] relative" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-6 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-xl font-bold border-4 border-[#111119]">
              {initialsFor(fullName || email)}
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[#e2e2f0] font-bold text-lg">{fullName || "Sans nom"}</h2>
                <BadgeCheck className="w-5 h-5 text-[#6366f1]" />
              </div>
              <div className="text-[#7878a0] text-sm">{email}</div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10 border border-[#6366f1]/20 px-3 py-1.5 rounded-xl">
              <Star className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="text-xs font-semibold text-[#a5b4fc]">{profile?.plan === "pro" ? "Pro" : "Free"}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Rapports générés", value: String(stats.reports), icon: FileText, color: "#6366f1" },
          { label: "Concurrents", value: String(stats.competitors), icon: Users, color: "#8b5cf6" },
          { label: "Alertes reçues", value: String(stats.alerts), icon: Bell, color: "#22d3ee" },
          { label: "Jours actif", value: String(stats.daysActive), icon: Activity, color: "#10b981" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: s.color + "15" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div className="text-[#e2e2f0] font-bold font-mono text-lg">{s.value}</div>
            <div className="text-[#7878a0] text-[10px] mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="text-[#e2e2f0] font-semibold text-sm mb-4">Informations personnelles</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#7878a0] mb-1.5">Nom complet</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#1c1c2e] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#e2e2f0] focus:outline-none focus:border-[#6366f1]/60 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7878a0] mb-1.5">Email</label>
            <input value={email} disabled className="w-full bg-[#1c1c2e] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#7878a0] opacity-60" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Btn icon={<Save className="w-3.5 h-3.5" />} variant="primary" onClick={save} disabled={saving}>{saving ? "…" : "Sauvegarder"}</Btn>
          {saved && <span className="text-emerald-400 text-xs">Enregistré.</span>}
        </div>
      </Card>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: "Tableau de bord" },
  discovery: { title: "Découverte", subtitle: "Trouver des concurrents automatiquement" },
  competitors: { title: "Concurrents" },
  sources: { title: "Sources" },
  reports: { title: "Rapports IA" },
  "report-detail": { title: "Détail du rapport" },
  agents: { title: "Agents IA", subtitle: "Architecture multi-agents" },
  history: { title: "Historique" },
  alerts: { title: "Alertes" },
  settings: { title: "Paramètres" },
  profile: { title: "Profil utilisateur" },
};

export default function App() {
  const [session, setSession] = useState<any>(undefined); // undefined = chargement
  const [profile, setProfile] = useState<any>(null);
  const [page, setPage] = useState("dashboard");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === null || session === undefined) { setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle().then(({ data }) => {
      setProfile({ ...data, email: session.user.email });
    });
  }, [session]);

  if (session === undefined) {
    return <div className="min-h-screen bg-[#09090f] flex items-center justify-center text-[#7878a0] text-sm">Chargement…</div>;
  }

  if (!session) {
    return <div className="dark"><LoginPage /></div>;
  }

  const pageInfo = pageTitles[page] ?? { title: page };

  function handleSelectReport(id: string) {
    setSelectedReportId(id);
    setPage("report-detail");
  }

  function renderPage() {
    switch (page) {
      case "dashboard": return <DashboardPage setPage={setPage} />;
      case "discovery": return <DiscoveryPage />;
      case "competitors": return <CompetitorsPage />;
      case "sources": return <SourcesPage />;
      case "reports": return <ReportsPage onSelect={handleSelectReport} />;
      case "report-detail": return selectedReportId ? <ReportDetailPage reportId={selectedReportId} onBack={() => setPage("reports")} /> : null;
      case "agents": return <AgentsPage />;
      case "history": return <HistoryPage />;
      case "alerts": return <AlertsPage />;
      case "settings": return <SettingsPage />;
      case "profile": return <ProfilePage />;
      default: return <DashboardPage setPage={setPage} />;
    }
  }

  return (
    <div className="dark" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex h-screen bg-[#09090f] text-[#e2e2f0] overflow-hidden">
        <Sidebar page={page} setPage={(p) => { setPage(p); setSelectedReportId(null); }} profile={profile} onLogout={() => supabase.auth.signOut()} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBar title={pageInfo.title} subtitle={pageInfo.subtitle} />
          <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {renderPage()}
          </main>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
