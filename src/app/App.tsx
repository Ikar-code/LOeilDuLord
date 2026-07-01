import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  LayoutDashboard, Users, Globe, FileText, Bot, Clock, Bell, Settings, User,
  Search, Plus, Activity, TrendingUp, AlertCircle, Loader2, ArrowUpRight,
  Eye, Edit, Trash2, Download, Filter, RefreshCw, Zap, Shield, Database,
  ExternalLink, MoreHorizontal, AlertTriangle, X, ChevronRight, LogOut, Link,
  Github, Lock, Key, CheckCircle2, XCircle, Building2, Briefcase, BarChart2,
  Star, CreditCard, Rss, Newspaper, Mail, ArrowLeft, Info, Tag, Layers, Target,
  Terminal, CheckCircle, Circle, PauseCircle, ChevronDown, Copy, Cpu, Award,
  TrendingDown, MapPin, Phone, Globe2, Sliders, Webhook, Save, Eye as EyeIcon,
  EyeOff, BadgeCheck,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const activityData = [
  { day: "Lun", analyses: 143, alertes: 12, rapports: 3 },
  { day: "Mar", analyses: 189, alertes: 18, rapports: 5 },
  { day: "Mer", analyses: 167, alertes: 9, rapports: 4 },
  { day: "Jeu", analyses: 212, alertes: 23, rapports: 6 },
  { day: "Ven", analyses: 198, alertes: 15, rapports: 5 },
  { day: "Sam", analyses: 134, alertes: 8, rapports: 2 },
  { day: "Dim", analyses: 156, alertes: 11, rapports: 3 },
];

const competitors = [
  { id: 1, name: "Stripe", initials: "ST", color: "#6366f1", sector: "Paiements en ligne", website: "stripe.com", frequency: "Quotidien", status: "actif", lastScan: "Il y a 23 min", changes: 3 },
  { id: 2, name: "Notion", initials: "NO", color: "#8b5cf6", sector: "Productivité SaaS", website: "notion.so", frequency: "Quotidien", status: "actif", lastScan: "Il y a 1h", changes: 1 },
  { id: 3, name: "Linear", initials: "LN", color: "#22d3ee", sector: "Gestion de projet", website: "linear.app", frequency: "Bihebdomadaire", status: "actif", lastScan: "Il y a 2h", changes: 0 },
  { id: 4, name: "Vercel", initials: "VC", color: "#e2e2f0", sector: "Cloud & Déploiement", website: "vercel.com", frequency: "Hebdomadaire", status: "actif", lastScan: "Il y a 3h", changes: 2 },
  { id: 5, name: "Figma", initials: "FG", color: "#f59e0b", sector: "Design collaboratif", website: "figma.com", frequency: "Quotidien", status: "actif", lastScan: "Il y a 45 min", changes: 1 },
  { id: 6, name: "Airtable", initials: "AT", color: "#10b981", sector: "Base de données SaaS", website: "airtable.com", frequency: "Hebdomadaire", status: "en pause", lastScan: "Il y a 2 jours", changes: 0 },
  { id: 7, name: "Loom", initials: "LM", color: "#ef4444", sector: "Vidéo asynchrone", website: "loom.com", frequency: "Mensuel", status: "erreur", lastScan: "Il y a 5h", changes: 0 },
  { id: 8, name: "Miro", initials: "MI", color: "#f97316", sector: "Whiteboard collaboratif", website: "miro.com", frequency: "Bihebdomadaire", status: "actif", lastScan: "Il y a 1h 30", changes: 1 },
];

const sources = [
  { id: 1, type: "Blog", name: "Blog Stripe", url: "stripe.com/blog", competitor: "Stripe", reliability: 98, lastScan: "23 min", articlesFound: 3 },
  { id: 2, type: "Changelog", name: "Stripe Changelog", url: "stripe.com/changelog", competitor: "Stripe", reliability: 99, lastScan: "23 min", articlesFound: 1 },
  { id: 3, type: "GitHub", name: "stripe/stripe-js", url: "github.com/stripe/stripe-js", competitor: "Stripe", reliability: 97, lastScan: "1h", articlesFound: 5 },
  { id: 4, type: "LinkedIn", name: "Stripe LinkedIn", url: "linkedin.com/company/stripe", competitor: "Stripe", reliability: 82, lastScan: "2h", articlesFound: 2 },
  { id: 5, type: "Blog", name: "Notion Blog", url: "notion.so/blog", competitor: "Notion", reliability: 96, lastScan: "1h", articlesFound: 1 },
  { id: 6, type: "RSS", name: "Linear Feed", url: "linear.app/changelog/rss", competitor: "Linear", reliability: 99, lastScan: "2h", articlesFound: 0 },
  { id: 7, type: "Actualités", name: "TechCrunch – Vercel", url: "techcrunch.com/search/vercel", competitor: "Vercel", reliability: 75, lastScan: "3h", articlesFound: 2 },
  { id: 8, type: "Documentation", name: "Figma Dev Mode", url: "figma.com/dev-mode", competitor: "Figma", reliability: 94, lastScan: "45 min", articlesFound: 1 },
  { id: 9, type: "Offres d'emploi", name: "Notion Jobs", url: "notion.so/jobs", competitor: "Notion", reliability: 88, lastScan: "1h", articlesFound: 4 },
  { id: 10, type: "GitHub", name: "vercel/next.js", url: "github.com/vercel/next.js", competitor: "Vercel", reliability: 99, lastScan: "3h", articlesFound: 8 },
  { id: 11, type: "Twitter/X", name: "@stripe", url: "twitter.com/stripe", competitor: "Stripe", reliability: 71, lastScan: "30 min", articlesFound: 3 },
  { id: 12, type: "Product Hunt", name: "Linear — Product Hunt", url: "producthunt.com/products/linear", competitor: "Linear", reliability: 83, lastScan: "4h", articlesFound: 0 },
];

const reports = [
  { id: 1, title: "Rapport hebdomadaire : Stripe — Semaine 26", competitor: "Stripe", date: "1 juillet 2026", confidence: 94, sources: 23, summary: "Stripe a annoncé une nouvelle API pour les paiements récurrents optimisés par IA, une réduction des frais pour les volumes élevés, et le recrutement massif d'ingénieurs ML en Europe.", tags: ["Nouvelle fonctionnalité", "Tarification", "Recrutement"], status: "publié" },
  { id: 2, title: "Analyse approfondie : Notion AI — Fonctionnalités Q2 2026", competitor: "Notion", date: "29 juin 2026", confidence: 91, sources: 18, summary: "Notion a lancé Notion AI 2.0 avec des capacités de génération de bases de données intelligentes, intégration Slack améliorée et un nouveau modèle de tarification freemium.", tags: ["IA", "Nouveau produit", "Tarification"], status: "publié" },
  { id: 3, title: "Veille concurrentielle : Linear vs Jira — Positionnement", competitor: "Linear", date: "28 juin 2026", confidence: 87, sources: 15, summary: "Linear gagne des parts de marché sur les équipes tech premium. Nouveaux templates enterprise et intégrations GitHub Actions renforcent l'offre face à Jira.", tags: ["Stratégie", "Marché", "Intégrations"], status: "publié" },
  { id: 4, title: "Alerte stratégique : Vercel — Levée de fonds Série E", competitor: "Vercel", date: "27 juin 2026", confidence: 98, sources: 31, summary: "Vercel a annoncé une levée de fonds de 250M$ pour accélérer son expansion sur les marchés asiatiques et renforcer son offre enterprise avec des fonctionnalités de conformité avancées.", tags: ["Financement", "Expansion", "Enterprise"], status: "publié" },
  { id: 5, title: "Rapport mensuel : Figma — Fonctionnalités juin 2026", competitor: "Figma", date: "25 juin 2026", confidence: 89, sources: 20, summary: "Figma Dev Mode 2.0, variable tokens améliorés, annotations natives et intégration Cursor AI transforment le workflow designer-développeur.", tags: ["Nouveau produit", "Dev Mode", "IA"], status: "archivé" },
  { id: 6, title: "Veille emploi : Stripe — Signaux recrutement ML/IA", competitor: "Stripe", date: "24 juin 2026", confidence: 82, sources: 12, summary: "47 nouvelles offres d'emploi ML/IA détectées chez Stripe en juin, concentration sur fraud detection, recommendation systems et modèles de risque financier.", tags: ["Recrutement", "IA", "Signal"], status: "publié" },
];

const selectedReport = reports[0];

const agents = [
  { id: 1, name: "Agent Recherche", icon: Search, color: "#6366f1", description: "Découverte et indexation de nouvelles sources pertinentes", status: "actif", progress: 73, tasksToday: 284, avgTime: "2.3s", lastRun: "Il y a 12 min", recent: ["Indexation blog Stripe", "Scan GitHub vercel/next.js", "Détection nouvelles offres Notion"] },
  { id: 2, name: "Agent Scraping", icon: Database, color: "#8b5cf6", description: "Extraction et collecte des données brutes depuis les sources", status: "actif", progress: 89, tasksToday: 1247, avgTime: "0.8s", lastRun: "Il y a 3 min", recent: ["Scraping stripe.com/changelog", "Extraction LinkedIn Figma", "Collecte RSS Linear"] },
  { id: 3, name: "Agent Vérification", icon: Shield, color: "#22d3ee", description: "Vérification croisée et validation de l'authenticité des infos", status: "actif", progress: 61, tasksToday: 892, avgTime: "1.5s", lastRun: "Il y a 7 min", recent: ["Vérification levée Vercel", "Cross-check API Stripe", "Validation TechCrunch"] },
  { id: 4, name: "Agent Analyse", icon: BarChart2, color: "#f59e0b", description: "Analyse sémantique et extraction des insights stratégiques", status: "actif", progress: 45, tasksToday: 67, avgTime: "8.2s", lastRun: "Il y a 18 min", recent: ["Analyse sentiment Notion AI", "Extraction signaux Stripe", "Évaluation impact Linear"] },
  { id: 5, name: "Agent Rédaction", icon: FileText, color: "#10b981", description: "Génération des synthèses et rapports en français structurés", status: "en attente", progress: 0, tasksToday: 8, avgTime: "45s", lastRun: "Il y a 2h", recent: ["Rédaction rapport Stripe S26", "Synthèse Notion AI Q2", "Rapport Vercel Série E"] },
  { id: 6, name: "Agent Contrôle QA", icon: CheckCircle2, color: "#ef4444", description: "Relecture, correction et validation qualité des rapports", status: "en attente", progress: 0, tasksToday: 8, avgTime: "12s", lastRun: "Il y a 2h 10", recent: ["Validation rapport Stripe", "QA synthèse Notion", "Révision rapport Vercel"] },
  { id: 7, name: "Agent Publication", icon: Zap, color: "#f97316", description: "Distribution des rapports validés vers les canaux configurés", status: "inactif", progress: 0, tasksToday: 5, avgTime: "3.1s", lastRun: "Il y a 3h", recent: ["Publication rapport Stripe", "Envoi digest Figma", "Notification Slack Vercel"] },
];

const historyItems = [
  { id: 1, date: "1 juillet 2026", time: "14:32", competitor: "Stripe", agent: "Recherche", action: "5 nouvelles sources découvertes", type: "découverte" },
  { id: 2, date: "1 juillet 2026", time: "14:18", competitor: "Stripe", agent: "Scraping", action: "Changelog mis à jour — nouvelle entrée API", type: "changement" },
  { id: 3, date: "1 juillet 2026", time: "13:45", competitor: "Notion", agent: "Analyse", action: "Analyse complétée — 3 insights détectés", type: "analyse" },
  { id: 4, date: "1 juillet 2026", time: "12:30", competitor: "Vercel", agent: "Vérification", action: "Levée de fonds vérifiée — 3 sources croisées", type: "vérification" },
  { id: 5, date: "1 juillet 2026", time: "11:15", competitor: "Linear", agent: "Publication", action: "Rapport hebdomadaire généré et publié", type: "publication" },
  { id: 6, date: "30 juin 2026", time: "16:20", competitor: "Figma", agent: "Scraping", action: "Dev Mode 2.0 — nouvelles fonctionnalités détectées", type: "changement" },
  { id: 7, date: "30 juin 2026", time: "15:00", competitor: "Stripe", agent: "Recherche", action: "47 nouvelles offres emploi ML/IA indexées", type: "découverte" },
  { id: 8, date: "30 juin 2026", time: "09:45", competitor: "Notion", agent: "Publication", action: "Rapport Notion AI Q2 publié — Slack + Email", type: "publication" },
  { id: 9, date: "29 juin 2026", time: "18:30", competitor: "Vercel", agent: "Rédaction", action: "Alerte stratégique Série E rédigée", type: "rapport" },
  { id: 10, date: "29 juin 2026", time: "14:10", competitor: "Airtable", agent: "Scraping", action: "Surveillance suspendue — erreur authentification", type: "erreur" },
];

const alertsData = [
  { id: 1, priority: "critique", type: "Levée de fonds", competitor: "Vercel", title: "Vercel lève 250M$ en Série E", description: "Vercel a annoncé une levée de fonds historique de 250 millions de dollars dirigée par Accel Partners pour accélérer son expansion internationale.", date: "27 juin 2026", read: false },
  { id: 2, priority: "haute", type: "Nouveau produit", competitor: "Stripe", title: "Stripe lance une API IA pour paiements récurrents", description: "Nouvelle API Stripe AI permettant l'optimisation automatique des paiements récurrents avec réduction du churn grâce au machine learning.", date: "1 juillet 2026", read: false },
  { id: 3, priority: "haute", type: "Nouveau produit", competitor: "Notion", title: "Notion AI 2.0 — Génération de bases de données intelligentes", description: "Notion déploie Notion AI 2.0 avec capacités de génération automatique de bases de données structurées à partir de texte naturel.", date: "29 juin 2026", read: false },
  { id: 4, priority: "moyenne", type: "Tarification", competitor: "Stripe", title: "Réduction de frais pour volumes > 1M$/mois", description: "Stripe annonce des tarifs préférentiels pour les marchands dépassant 1 million de dollars de volume mensuel, baisse de 0.1% des frais.", date: "1 juillet 2026", read: true },
  { id: 5, priority: "moyenne", type: "Recrutement", competitor: "Stripe", title: "47 nouvelles offres ML/IA publiées en juin", description: "Signal fort de développement produit IA : Stripe recrute massivement des ingénieurs spécialisés en fraud detection et modèles de risque.", date: "30 juin 2026", read: true },
  { id: 6, priority: "haute", type: "Nouvelle fonctionnalité", competitor: "Figma", title: "Figma Dev Mode 2.0 — Intégration Cursor AI", description: "Figma lance une intégration native avec Cursor AI permettant la génération de code directement depuis les designs.", date: "25 juin 2026", read: true },
  { id: 7, priority: "basse", type: "Partenariat", competitor: "Linear", title: "Linear annonce un partenariat avec GitHub Copilot", description: "Intégration approfondie entre Linear et GitHub Copilot pour la création automatique de tickets depuis les suggestions de code.", date: "28 juin 2026", read: true },
];

// ─── UTILITY COMPONENTS ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; bg: string }> = {
    actif: { label: "Actif", dot: "bg-emerald-400", bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
    "en pause": { label: "En pause", dot: "bg-amber-400", bg: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
    erreur: { label: "Erreur", dot: "bg-red-400", bg: "bg-red-500/10 text-red-400 border border-red-500/20" },
    inactif: { label: "Inactif", dot: "bg-[#7878a0]", bg: "bg-white/5 text-[#7878a0] border border-white/8" },
    "en attente": { label: "En attente", dot: "bg-blue-400", bg: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
    publié: { label: "Publié", dot: "bg-emerald-400", bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
    archivé: { label: "Archivé", dot: "bg-[#7878a0]", bg: "bg-white/5 text-[#7878a0] border border-white/8" },
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
    critique: "bg-red-500/10 text-red-400 border border-red-500/20",
    haute: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    moyenne: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    basse: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };
  const labels: Record<string, string> = { critique: "Critique", haute: "Haute", moyenne: "Moyenne", basse: "Basse" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[priority]}`}>
      {labels[priority]}
    </span>
  );
}

function Avatar({ name, color, size = "sm" }: { name: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-14 h-14 text-lg" };
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className={`${sizes[size]} rounded-lg flex items-center justify-center font-semibold shrink-0`} style={{ backgroundColor: color + "22", color }}>
      {initials}
    </div>
  );
}

function ProgressBar({ value, color = "#6366f1" }: { value: number; color?: string }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#111119] border border-white/7 rounded-[14px] ${className}`}>
      {children}
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, className = "", icon }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void; className?: string; icon?: React.ReactNode;
}) {
  const variants = {
    primary: "bg-[#6366f1] hover:bg-[#5254cc] text-white",
    secondary: "bg-white/5 hover:bg-white/10 text-[#e2e2f0] border border-white/10",
    ghost: "hover:bg-white/5 text-[#7878a0] hover:text-[#e2e2f0]",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
  };
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${variants[variant]} ${className}`}>
      {icon && icon}
      {children}
    </button>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

const navItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "competitors", label: "Concurrents", icon: Users, badge: 12 },
  { id: "sources", label: "Sources", icon: Globe, badge: 1284 },
  { id: "reports", label: "Rapports IA", icon: FileText, badge: 8 },
  { id: "agents", label: "Agents IA", icon: Bot },
  { id: "history", label: "Historique", icon: Clock },
  { id: "alerts", label: "Alertes", icon: Bell, badge: 3, badgeDanger: true },
  { id: "settings", label: "Paramètres", icon: Settings },
  { id: "profile", label: "Profil", icon: User },
];

function Sidebar({ page, setPage }: { page: string; setPage: (p: string) => void }) {
  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-[#0d0d16] border-r border-white/5">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[#e2e2f0] font-semibold text-sm leading-none">LOeilDuLord</div>
          <div className="text-[10px] text-[#7878a0] mt-0.5 font-mono">v2.4.1</div>
        </div>
      </div>

      <div className="px-2 mb-1">
        <div className="h-px bg-white/5" />
      </div>

      {/* Nav */}
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
              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${item.badgeDanger ? "bg-red-500/20 text-red-400" : "bg-white/8 text-[#7878a0]"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-2 mb-2">
        <div className="h-px bg-white/5" />
      </div>

      {/* User */}
      <div className="px-2 pb-4">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-[11px] font-bold text-white shrink-0">AM</div>
          <div className="flex-1 min-w-0">
            <div className="text-[#e2e2f0] text-xs font-medium truncate">Alexandre Martin</div>
            <div className="text-[#7878a0] text-[10px] truncate">Pro · 8 jours restants</div>
          </div>
          <LogOut className="w-3.5 h-3.5 text-[#5858a0] group-hover:text-[#7878a0]" />
        </div>
      </div>
    </aside>
  );
}

// ─── TOP BAR ─────────────────────────────────────────────────────────────────

function TopBar({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-[#09090f]/80 backdrop-blur-sm">
      <div>
        <h1 className="text-[#e2e2f0] font-semibold text-sm">{title}</h1>
        {subtitle && <p className="text-[#7878a0] text-xs">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5858a0]" />
          <input placeholder="Rechercher…" className="bg-white/5 border border-white/8 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#c4c4d8] placeholder:text-[#5858a0] focus:outline-none focus:border-[#6366f1]/50 w-44 transition-all" />
        </div>
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#7878a0] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-[11px] font-bold text-white cursor-pointer">AM</div>
      </div>
    </header>
  );
}

// ─── LOGIN PAGE ──────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#09090f] text-[#e2e2f0]">
      {/* Left panel */}
      <div className="hidden lg:flex w-[52%] relative flex-col justify-between p-12 overflow-hidden bg-[#0d0d16]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20" style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15" style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-[#e2e2f0] font-bold text-xl">LOeilDuLord</span>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#a5b4fc] text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
            7 agents IA actifs · 1 284 sources surveillées
          </div>
          <h2 className="text-4xl font-bold text-[#e2e2f0] leading-tight mb-4">
            Votre veille<br />
            <span className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] bg-clip-text text-transparent">concurrentielle</span><br />
            automatisée
          </h2>
          <p className="text-[#7878a0] text-base leading-relaxed mb-10 max-w-sm">
            Une architecture multi-agents surveille vos concurrents 24h/24, analyse les sources et génère des rapports stratégiques en français.
          </p>
          <div className="space-y-4">
            {[
              { icon: Bot, label: "7 agents IA spécialisés", sub: "Recherche · Scraping · Vérification · Analyse · Rédaction" },
              { icon: Globe, label: "1 284 sources surveillées", sub: "Sites web · GitHub · LinkedIn · RSS · Actualités · Offres d'emploi" },
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

        <div className="relative z-10 flex items-center gap-4 text-[#5858a0] text-xs">
          <span>© 2026 LOeilDuLord</span>
          <span>·</span>
          <span className="hover:text-[#7878a0] cursor-pointer">Confidentialité</span>
          <span>·</span>
          <span className="hover:text-[#7878a0] cursor-pointer">Conditions</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#e2e2f0] mb-1">
              {mode === "login" ? "Bon retour 👋" : "Créer un compte"}
            </h2>
            <p className="text-[#7878a0] text-sm">
              {mode === "login" ? "Connectez-vous à votre espace LOeilDuLord" : "Commencez votre période d'essai gratuit de 14 jours"}
            </p>
          </div>

          {/* Social */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-[#c4c4d8] font-medium">
              <Github className="w-4 h-4" />
              GitHub
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-[#c4c4d8] font-medium">
              <Globe2 className="w-4 h-4" />
              Google
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[#5858a0] text-xs">ou par email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-[#c4c4d8] mb-1.5">Nom complet</label>
                <input type="text" placeholder="Alexandre Martin" className="w-full bg-[#1c1c2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#e2e2f0] placeholder:text-[#5858a0] focus:outline-none focus:border-[#6366f1]/60 transition-all" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-[#c4c4d8] mb-1.5">Adresse email</label>
              <input type="email" placeholder="vous@example.com" className="w-full bg-[#1c1c2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#e2e2f0] placeholder:text-[#5858a0] focus:outline-none focus:border-[#6366f1]/60 transition-all" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#c4c4d8]">Mot de passe</label>
                {mode === "login" && <span className="text-xs text-[#6366f1] hover:text-[#a5b4fc] cursor-pointer">Mot de passe oublié ?</span>}
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} placeholder="••••••••" className="w-full bg-[#1c1c2e] border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-[#e2e2f0] placeholder:text-[#5858a0] focus:outline-none focus:border-[#6366f1]/60 transition-all" />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5858a0] hover:text-[#7878a0]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button onClick={onLogin} className="w-full py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5254cc] hover:to-[#7c3aed] text-white font-semibold rounded-xl transition-all text-sm mt-2">
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </div>

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

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

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

function StatCard({ title, value, change, icon: Icon, accent, trend }: {
  title: string; value: string; change: string; icon: any; accent: string; trend: "up" | "down" | "neutral";
}) {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + "15" }}>
          <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-[#7878a0]"}`}>
          {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : trend === "down" ? <TrendingDown className="w-3.5 h-3.5" /> : null}
          {change}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-[#e2e2f0] font-mono leading-none mb-1">{value}</div>
        <div className="text-[#7878a0] text-xs">{title}</div>
      </div>
    </Card>
  );
}

function DashboardPage({ setPage }: { setPage: (p: string) => void }) {
  const recentAlerts = alertsData.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Concurrents surveillés" value="12" change="+2 ce mois" icon={Users} accent="#6366f1" trend="up" />
        <StatCard title="Nouvelles détectées" value="47" change="+18% vs hier" icon={Bell} accent="#8b5cf6" trend="up" />
        <StatCard title="Rapports générés" value="8" change="cette semaine" icon={FileText} accent="#22d3ee" trend="neutral" />
        <StatCard title="Sources analysées" value="1 284" change="+56 aujourd'hui" icon={Globe} accent="#f59e0b" trend="up" />
        <StatCard title="Agents actifs" value="4/7" change="3 en attente" icon={Bot} accent="#10b981" trend="neutral" />
      </div>

      {/* Chart + Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[#e2e2f0] font-semibold text-sm">Activité de la semaine</h3>
              <p className="text-[#7878a0] text-xs mt-0.5">Analyses · Alertes · Rapports</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#7878a0]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#6366f1]" />Analyses</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#22d3ee]" />Alertes</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
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

        {/* Agent status */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#e2e2f0] font-semibold text-sm">Agents IA</h3>
            <button onClick={() => setPage("agents")} className="text-xs text-[#6366f1] hover:text-[#a5b4fc] flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3">
            {agents.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: a.color + "15" }}>
                  <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#c4c4d8] text-xs font-medium truncate">{a.name}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  {a.progress > 0 && <ProgressBar value={a.progress} color={a.color} />}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent alerts + recent competitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#e2e2f0] font-semibold text-sm">Dernières alertes</h3>
            <button onClick={() => setPage("alerts")} className="text-xs text-[#6366f1] hover:text-[#a5b4fc] flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all cursor-pointer">
                <PriorityBadge priority={a.priority} />
                <div className="flex-1 min-w-0">
                  <div className="text-[#c4c4d8] text-xs font-medium leading-snug mb-0.5">{a.title}</div>
                  <div className="text-[#7878a0] text-[11px]">{a.competitor} · {a.date}</div>
                </div>
                {!a.read && <span className="w-2 h-2 rounded-full bg-[#6366f1] shrink-0 mt-1" />}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#e2e2f0] font-semibold text-sm">Concurrents actifs</h3>
            <button onClick={() => setPage("competitors")} className="text-xs text-[#6366f1] hover:text-[#a5b4fc] flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-2.5">
            {competitors.filter(c => c.status === "actif").slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                <Avatar name={c.name} color={c.color} />
                <div className="flex-1 min-w-0">
                  <div className="text-[#c4c4d8] text-xs font-medium">{c.name}</div>
                  <div className="text-[#7878a0] text-[11px]">{c.lastScan}</div>
                </div>
                {c.changes > 0 && (
                  <span className="text-[10px] bg-[#6366f1]/15 text-[#a5b4fc] px-2 py-0.5 rounded-full font-mono">{c.changes} modif.</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── COMPETITORS PAGE ─────────────────────────────────────────────────────────

function CompetitorsPage() {
  const [search, setSearch] = useState("");
  const filtered = competitors.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.sector.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5858a0]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un concurrent…" className="w-full bg-[#111119] border border-white/8 rounded-xl pl-9 pr-3 py-2 text-sm text-[#c4c4d8] placeholder:text-[#5858a0] focus:outline-none focus:border-[#6366f1]/50 transition-all" />
        </div>
        <Btn icon={<Filter className="w-3.5 h-3.5" />} variant="secondary">Filtres</Btn>
        <Btn icon={<Plus className="w-3.5 h-3.5" />} variant="primary">Ajouter</Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Concurrent", "Secteur", "Site web", "Fréquence", "Statut", "Dernière analyse", "Modif.", "Actions"].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-[#5858a0] uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={`border-b border-white/5 hover:bg-white/2 transition-all group ${i === filtered.length - 1 ? "border-b-0" : ""}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} color={c.color} />
                      <span className="text-[#e2e2f0] text-sm font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#7878a0] text-xs">{c.sector}</td>
                  <td className="px-4 py-3.5">
                    <a className="text-xs text-[#6366f1] hover:text-[#a5b4fc] flex items-center gap-1 cursor-pointer">
                      {c.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#c4c4d8] bg-white/5 px-2 py-0.5 rounded-md">{c.frequency}</span>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3.5 text-[#7878a0] text-xs font-mono">{c.lastScan}</td>
                  <td className="px-4 py-3.5">
                    {c.changes > 0 ? <span className="text-xs bg-[#6366f1]/15 text-[#a5b4fc] px-2 py-0.5 rounded-full font-mono">{c.changes}</span> : <span className="text-[#5858a0] text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-1.5 rounded-lg hover:bg-white/8 text-[#7878a0] hover:text-[#c4c4d8]"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-white/8 text-[#7878a0] hover:text-[#c4c4d8]"><Edit className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#7878a0] hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between text-xs text-[#7878a0]">
        <span>{filtered.length} concurrent{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}</span>
        <div className="flex items-center gap-1">
          {[1, 2].map(n => (
            <button key={n} className={`w-7 h-7 rounded-lg text-xs font-mono ${n === 1 ? "bg-[#6366f1]/15 text-[#a5b4fc]" : "hover:bg-white/5 text-[#7878a0]"}`}>{n}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SOURCES PAGE ─────────────────────────────────────────────────────────────

const typeColor: Record<string, string> = {
  Blog: "#6366f1", Changelog: "#22d3ee", GitHub: "#e2e2f0", LinkedIn: "#3b82f6",
  RSS: "#f59e0b", Actualités: "#10b981", Documentation: "#8b5cf6",
  "Offres d'emploi": "#f97316", "Twitter/X": "#7878a0", "Product Hunt": "#ef4444",
};

function SourcesPage() {
  const [filter, setFilter] = useState("Tous");
  const types = ["Tous", ...Array.from(new Set(sources.map(s => s.type)))];
  const filtered = filter === "Tous" ? sources : sources.filter(s => s.type === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === t ? "bg-[#6366f1]/15 text-[#a5b4fc] border border-[#6366f1]/25" : "bg-white/5 text-[#7878a0] hover:bg-white/8 border border-transparent"}`}>
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Btn icon={<Plus className="w-3.5 h-3.5" />} variant="primary">Ajouter une source</Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((s) => {
          const accent = typeColor[s.type] ?? "#6366f1";
          return (
            <Card key={s.id} className="p-4 hover:border-white/12 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accent + "18" }}>
                    <Globe className="w-4 h-4" style={{ color: accent }} />
                  </div>
                  <div>
                    <div className="text-[#e2e2f0] text-sm font-medium leading-none mb-0.5">{s.name}</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: accent + "15", color: accent }}>{s.type}</span>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:bg-white/8 text-[#7878a0]">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[#7878a0] text-xs font-mono mb-3 truncate">{s.url}</div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#5858a0]">Fiabilité</span>
                    <span className="text-[10px] font-mono text-[#c4c4d8]">{s.reliability}%</span>
                  </div>
                  <ProgressBar value={s.reliability} color={s.reliability > 90 ? "#10b981" : s.reliability > 75 ? "#f59e0b" : "#ef4444"} />
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#5858a0]">Dernier scan</div>
                  <div className="text-[10px] font-mono text-[#7878a0]">il y a {s.lastScan}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[#7878a0] text-xs">{s.competitor}</span>
                <span className="text-xs font-mono text-[#c4c4d8]">{s.articlesFound} article{s.articlesFound !== 1 ? "s" : ""}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────

function ReportsPage({ onSelect }: { onSelect: (r: typeof reports[0]) => void }) {
  const [tab, setTab] = useState("Tous");
  const tabs = ["Tous", "Publié", "Archivé"];
  const filtered = tab === "Tous" ? reports : reports.filter(r => r.status === tab.toLowerCase());

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1 border-b border-white/5 pb-0">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t ? "border-[#6366f1] text-[#a5b4fc]" : "border-transparent text-[#7878a0] hover:text-[#c4c4d8]"}`}>
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pb-2">
          <Btn icon={<RefreshCw className="w-3.5 h-3.5" />} variant="secondary">Générer</Btn>
          <Btn icon={<Download className="w-3.5 h-3.5" />} variant="secondary">Exporter</Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((r) => (
          <Card key={r.id} className="p-5 hover:border-white/14 transition-all cursor-pointer group" onClick={() => onSelect(r)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Avatar name={r.competitor} color={competitors.find(c => c.name === r.competitor)?.color ?? "#6366f1"} />
                <div>
                  <div className="text-[#7878a0] text-xs">{r.competitor}</div>
                  <div className="text-[#5858a0] text-[10px] font-mono">{r.date}</div>
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>

            <h3 className="text-[#e2e2f0] font-semibold text-sm leading-snug mb-2 group-hover:text-white transition-colors">{r.title}</h3>
            <p className="text-[#7878a0] text-xs leading-relaxed mb-4 line-clamp-2">{r.summary}</p>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#5858a0]">Score de confiance</span>
                  <span className="text-[10px] font-mono text-[#c4c4d8]">{r.confidence}%</span>
                </div>
                <ProgressBar value={r.confidence} color={r.confidence > 90 ? "#10b981" : r.confidence > 80 ? "#f59e0b" : "#ef4444"} />
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-[#5858a0]">Sources</div>
                <div className="text-xs font-mono text-[#c4c4d8] font-semibold">{r.sources}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {r.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#6366f1]/10 text-[#a5b4fc] border border-[#6366f1]/15">{tag}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── REPORT DETAIL PAGE ───────────────────────────────────────────────────────

function ReportDetailPage({ report, onBack }: { report: typeof reports[0]; onBack: () => void }) {
  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-[#7878a0] hover:text-[#c4c4d8] text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour aux rapports
      </button>

      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={report.competitor} color={competitors.find(c => c.name === report.competitor)?.color ?? "#6366f1"} size="md" />
            <div>
              <div className="text-[#7878a0] text-sm">{report.competitor}</div>
              <div className="text-[#5858a0] text-xs font-mono">{report.date}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={report.status} />
            <Btn icon={<Download className="w-3.5 h-3.5" />} variant="secondary">PDF</Btn>
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#e2e2f0] mb-3">{report.title}</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[#7878a0] text-xs">Confiance :</span>
            <span className="text-xs font-mono font-semibold text-emerald-400">{report.confidence}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#7878a0] text-xs">Sources :</span>
            <span className="text-xs font-mono font-semibold text-[#c4c4d8]">{report.sources}</span>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {report.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#6366f1]/10 text-[#a5b4fc] border border-[#6366f1]/15">{t}</span>)}
        </div>
      </Card>

      {[
        { title: "Résumé exécutif", icon: FileText, content: report.summary + " Cette analyse a été réalisée à partir de 23 sources croisées et vérifiées par l'Agent Vérification avec un taux de fiabilité moyen de 94%." },
        { title: "Faits importants détectés", icon: AlertCircle, isList: true, items: ["Nouvelle API IA pour optimisation des paiements récurrents annoncée publiquement", "Réduction tarifaire de 0.1% pour les volumes supérieurs à 1M$/mois", "47 offres d'emploi ML/IA publiées en juin 2026", "Recrutement de 12 ingénieurs machine learning en Europe (Berlin, Paris, Amsterdam)", "Partenariat stratégique non confirmé avec un acteur bancaire européen majeur"] },
        { title: "Analyse IA", icon: Bot, content: "L'analyse sémantique révèle une accélération significative de la stratégie IA de Stripe, avec un investissement ciblé sur la fraud detection et l'optimisation automatique. Le signal recrutement est particulièrement fort en Europe, suggérant une expansion du centre R&D. La réduction tarifaire ciblée grands volumes indique une bataille pour la rétention des clients enterprise. Recommandation : surveiller de près les annonces produit du prochain Stripe Sessions." },
        { title: "Recommandations stratégiques", icon: Target, isList: true, items: ["Préparer une réponse commerciale aux clients enterprise potentiellement ciblés par Stripe", "Surveiller de près le dépôt de brevets liés à l'IA de paiement", "Analyser l'impact du recrutement ML sur le roadmap produit estimé à 6-12 mois", "Activer une alerte hebdomadaire sur les changelogs et API Stripe"] },
      ].map(section => (
        <Card key={section.title} className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
              <section.icon className="w-3.5 h-3.5 text-[#6366f1]" />
            </div>
            <h3 className="text-[#e2e2f0] font-semibold text-sm">{section.title}</h3>
          </div>
          {section.isList ? (
            <ul className="space-y-2">
              {section.items!.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#c4c4d8]">
                  <CheckCircle2 className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#c4c4d8] text-sm leading-relaxed">{section.content}</p>
          )}
        </Card>
      ))}

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
            <Link className="w-3.5 h-3.5 text-[#6366f1]" />
          </div>
          <h3 className="text-[#e2e2f0] font-semibold text-sm">Sources citées</h3>
        </div>
        <div className="space-y-2">
          {sources.filter(s => s.competitor === report.competitor).slice(0, 4).map(s => (
            <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/3 transition-all">
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: (typeColor[s.type] ?? "#6366f1") + "15", color: typeColor[s.type] ?? "#6366f1" }}>{s.type}</span>
              <span className="text-[#c4c4d8] text-xs flex-1">{s.name}</span>
              <span className="text-[#7878a0] text-[10px] font-mono">{s.reliability}%</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#5858a0]" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── AGENTS PAGE ──────────────────────────────────────────────────────────────

function AgentsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {agents.map((a) => (
        <Card key={a.id} className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: a.color + "15" }}>
                <a.icon className="w-5 h-5" style={{ color: a.color }} />
              </div>
              <div>
                <div className="text-[#e2e2f0] font-semibold text-sm">{a.name}</div>
                <div className="text-[#7878a0] text-xs mt-0.5">{a.description}</div>
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
              <ProgressBar value={a.progress} color={a.color} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Tâches aujourd'hui", value: a.tasksToday.toLocaleString() },
              { label: "Temps moyen", value: a.avgTime },
              { label: "Dernier run", value: a.lastRun },
            ].map(stat => (
              <div key={stat.label} className="bg-white/3 rounded-lg p-2.5 text-center">
                <div className="text-[#e2e2f0] font-mono text-sm font-semibold">{stat.value}</div>
                <div className="text-[#5858a0] text-[10px] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-[10px] text-[#5858a0] uppercase tracking-wider mb-2">Tâches récentes</div>
            <div className="space-y-1.5">
              {a.recent.map((task, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#7878a0]">
                  <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                  {task}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
            <Btn variant="secondary" icon={<RefreshCw className="w-3 h-3" />}>Redémarrer</Btn>
            {a.status === "actif" ? (
              <Btn variant="secondary" icon={<PauseCircle className="w-3 h-3" />}>Pause</Btn>
            ) : a.status !== "inactif" ? (
              <Btn variant="secondary" icon={<PlayCircle className="w-3 h-3" />}>Démarrer</Btn>
            ) : null}
            <button className="ml-auto p-1.5 rounded-lg hover:bg-white/8 text-[#7878a0] hover:text-[#c4c4d8]"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── HISTORY PAGE ─────────────────────────────────────────────────────────────

const histTypeConfig: Record<string, { color: string; icon: any }> = {
  découverte: { color: "#6366f1", icon: Search },
  changement: { color: "#f59e0b", icon: AlertTriangle },
  analyse: { color: "#8b5cf6", icon: BarChart2 },
  vérification: { color: "#22d3ee", icon: Shield },
  publication: { color: "#10b981", icon: Zap },
  rapport: { color: "#6366f1", icon: FileText },
  erreur: { color: "#ef4444", icon: XCircle },
};

function HistoryPage() {
  const grouped = historyItems.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, typeof historyItems>);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Btn icon={<Filter className="w-3.5 h-3.5" />} variant="secondary">Filtrer</Btn>
        <select className="bg-[#111119] border border-white/8 rounded-lg px-3 py-1.5 text-xs text-[#c4c4d8] focus:outline-none">
          <option value="">Tous les concurrents</option>
          {competitors.map(c => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>

      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-[#7878a0] uppercase tracking-wider">{date}</span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] text-[#5858a0] font-mono">{items.length} événement{items.length > 1 ? "s" : ""}</span>
          </div>
          <div className="space-y-2">
            {items.map((item) => {
              const tc = histTypeConfig[item.type] ?? { color: "#7878a0", icon: Circle };
              const Icon = tc.icon;
              return (
                <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#111119] border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: tc.color + "15" }}>
                      <Icon className="w-4 h-4" style={{ color: tc.color }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[#c4c4d8] text-sm font-medium leading-snug">{item.action}</span>
                      <span className="text-[10px] font-mono text-[#5858a0] shrink-0">{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: tc.color + "12", color: tc.color }}>{item.type}</span>
                      <span className="text-[#5858a0] text-[10px]">{item.competitor}</span>
                      <span className="text-[#5858a0] text-[10px]">·</span>
                      <span className="text-[#5858a0] text-[10px]">Agent {item.agent}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ALERTS PAGE ──────────────────────────────────────────────────────────────

function AlertsPage() {
  const [filter, setFilter] = useState("Toutes");
  const [data, setData] = useState(alertsData);
  const priorities = ["Toutes", "Critique", "Haute", "Moyenne", "Basse"];
  const filtered = filter === "Toutes" ? data : data.filter(a => a.priority === filter.toLowerCase());
  const unread = data.filter(a => !a.read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          {priorities.map(p => (
            <button key={p} onClick={() => setFilter(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === p ? "bg-[#6366f1]/15 text-[#a5b4fc] border border-[#6366f1]/25" : "bg-white/5 text-[#7878a0] hover:bg-white/8 border border-transparent"}`}>
              {p}
            </button>
          ))}
        </div>
        {unread > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-[#7878a0]">{unread} non lue{unread > 1 ? "s" : ""}</span>
            <Btn variant="secondary" onClick={() => setData(d => d.map(a => ({ ...a, read: true })))}>Tout marquer comme lu</Btn>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((a) => (
          <Card key={a.id} className={`p-5 hover:border-white/12 transition-all cursor-pointer ${!a.read ? "border-[#6366f1]/20" : ""}`} onClick={() => setData(d => d.map(x => x.id === a.id ? { ...x, read: true } : x))}>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                {!a.read && <span className="w-2 h-2 rounded-full bg-[#6366f1]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge priority={a.priority} />
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#7878a0] border border-white/8">{a.type}</span>
                  </div>
                  <span className="text-[10px] text-[#5858a0] font-mono shrink-0">{a.date}</span>
                </div>
                <h3 className="text-[#e2e2f0] font-semibold text-sm mb-1.5">{a.title}</h3>
                <p className="text-[#7878a0] text-xs leading-relaxed mb-3">{a.description}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Avatar name={a.competitor} color={competitors.find(c => c.name === a.competitor)?.color ?? "#6366f1"} size="sm" />
                    <span className="text-xs text-[#7878a0]">{a.competitor}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Btn variant="ghost">Ignorer</Btn>
                    <Btn variant="secondary">Voir le rapport</Btn>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────

function SettingsPage() {
  const [tab, setTab] = useState("API Keys");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const tabs = ["API Keys", "Surveillance", "Notifications", "Intégrations", "Général"];

  const apiKeys = [
    { name: "Gemini API", key: "AIzaSy••••••••••••••••••••••••••XyZ9", provider: "Google", status: "actif" },
    { name: "Groq API", key: "gsk_••••••••••••••••••••••••••••••AbC3", provider: "Groq", status: "actif" },
    { name: "OpenAI API", key: "sk-proj-••••••••••••••••••••••••••••••", provider: "OpenAI", status: "inactif" },
    { name: "Supabase URL", key: "https://xxxx.supabase.co", provider: "Supabase", status: "actif" },
    { name: "Supabase Anon Key", key: "eyJhbGci••••••••••••••••••••••••••••", provider: "Supabase", status: "actif" },
  ];

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-1 border-b border-white/5 pb-0">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t ? "border-[#6366f1] text-[#a5b4fc]" : "border-transparent text-[#7878a0] hover:text-[#c4c4d8]"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "API Keys" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/15">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-amber-400/80 text-xs">Ne partagez jamais vos clés API. Elles sont chiffrées et stockées de façon sécurisée.</p>
          </div>
          <div className="space-y-3">
            {apiKeys.map((api) => (
              <Card key={api.name} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#6366f1]" />
                    <span className="text-[#e2e2f0] text-sm font-medium">{api.name}</span>
                    <span className="text-[10px] text-[#7878a0] bg-white/5 px-1.5 py-0.5 rounded">{api.provider}</span>
                  </div>
                  <StatusBadge status={api.status} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#1c1c2e] border border-white/8 rounded-lg px-3 py-2 text-xs font-mono text-[#7878a0]">
                    {showKeys[api.name] ? api.key : api.key.replace(/[^•]/g, (c, i) => i > 8 ? c : c)}
                  </div>
                  <button onClick={() => setShowKeys(k => ({ ...k, [api.name]: !k[api.name] }))} className="p-2 rounded-lg hover:bg-white/8 text-[#7878a0]">
                    {showKeys[api.name] ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/8 text-[#7878a0]"><Copy className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-white/8 text-[#7878a0]"><Edit className="w-4 h-4" /></button>
                </div>
              </Card>
            ))}
          </div>
          <Btn icon={<Plus className="w-3.5 h-3.5" />} variant="secondary">Ajouter une clé API</Btn>
        </div>
      )}

      {tab === "Surveillance" && (
        <Card className="p-5 space-y-5">
          {[
            { label: "Fréquence par défaut", desc: "Fréquence d'analyse des nouvelles sources", options: ["Quotidien", "Bihebdomadaire", "Hebdomadaire"] },
            { label: "Profondeur d'analyse", desc: "Nombre de pages à analyser par source", options: ["Légère (5 pages)", "Standard (20 pages)", "Approfondie (50+ pages)"] },
            { label: "Langue des rapports", desc: "Langue de génération des synthèses", options: ["Français", "Anglais", "Bilingue"] },
          ].map(s => (
            <div key={s.label} className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[#e2e2f0] text-sm font-medium">{s.label}</div>
                <div className="text-[#7878a0] text-xs mt-0.5">{s.desc}</div>
              </div>
              <select className="bg-[#1c1c2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#c4c4d8] focus:outline-none shrink-0">
                {s.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div className="h-px bg-white/5" />
          {[
            { label: "Score de confiance minimum", desc: "Publier uniquement les rapports avec un score ≥ à ce seuil" },
            { label: "Alerte automatique si score < 70%", desc: "Notifier l'équipe si le score de confiance est insuffisant" },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[#e2e2f0] text-sm font-medium">{s.label}</div>
                <div className="text-[#7878a0] text-xs mt-0.5">{s.desc}</div>
              </div>
              <div className="w-10 h-6 rounded-full bg-[#6366f1] relative cursor-pointer shrink-0">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-all" />
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Btn icon={<Save className="w-3.5 h-3.5" />} variant="primary">Enregistrer les paramètres</Btn>
          </div>
        </Card>
      )}

      {tab === "Notifications" && (
        <Card className="p-5 space-y-4">
          {[
            { label: "Alertes critiques", desc: "Levées de fonds, lancements produits majeurs", email: true, slack: true },
            { label: "Nouveaux rapports", desc: "Notification lors de la publication d'un rapport", email: true, slack: false },
            { label: "Résumé quotidien", desc: "Digest des activités de la journée", email: false, slack: true },
            { label: "Erreurs d'agents", desc: "Alertes en cas de défaillance d'un agent IA", email: true, slack: true },
            { label: "Changements tarifaires", desc: "Modification des prix ou offres concurrents", email: true, slack: false },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-b-0">
              <div>
                <div className="text-[#e2e2f0] text-sm font-medium">{n.label}</div>
                <div className="text-[#7878a0] text-xs mt-0.5">{n.desc}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-[#7878a0]">
                  <div className={`w-8 h-4.5 rounded-full relative cursor-pointer ${n.email ? "bg-[#6366f1]" : "bg-white/10"}`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${n.email ? "right-0.5" : "left-0.5"}`} />
                  </div>
                  Email
                </label>
                <label className="flex items-center gap-1.5 text-xs text-[#7878a0]">
                  <div className={`w-8 h-4.5 rounded-full relative cursor-pointer ${n.slack ? "bg-[#6366f1]" : "bg-white/10"}`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${n.slack ? "right-0.5" : "left-0.5"}`} />
                  </div>
                  Slack
                </label>
              </div>
            </div>
          ))}
        </Card>
      )}

      {(tab === "Intégrations" || tab === "Général") && (
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#6366f1]/10 flex items-center justify-center">
            <Webhook className="w-6 h-6 text-[#6366f1]" />
          </div>
          <div className="text-[#e2e2f0] font-semibold">Section {tab}</div>
          <div className="text-[#7878a0] text-sm max-w-xs">Cette section est en cours de développement et sera disponible prochainement.</div>
        </Card>
      )}
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────

function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#6366f1] to-[#22d3ee] relative">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-6 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-xl font-bold border-4 border-[#111119]">AM</div>
            <Btn icon={<Edit className="w-3.5 h-3.5" />} variant="secondary">Modifier</Btn>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[#e2e2f0] font-bold text-lg">Alexandre Martin</h2>
                <BadgeCheck className="w-5 h-5 text-[#6366f1]" />
              </div>
              <div className="text-[#7878a0] text-sm">alexandre.martin@acme.io</div>
              <div className="text-[#5858a0] text-xs mt-1 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Acme Corp · Directeur Produit
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10 border border-[#6366f1]/20 px-3 py-1.5 rounded-xl">
              <Star className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="text-xs font-semibold text-[#a5b4fc]">Pro</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Rapports générés", value: "142", icon: FileText, color: "#6366f1" },
          { label: "Concurrents", value: "12", icon: Users, color: "#8b5cf6" },
          { label: "Alertes reçues", value: "847", icon: Bell, color: "#22d3ee" },
          { label: "Jours actif", value: "94", icon: Activity, color: "#10b981" },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: s.color + "15" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div className="text-[#e2e2f0] font-bold font-mono text-lg">{s.value}</div>
            <div className="text-[#7878a0] text-[10px] mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Subscription */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-[#6366f1]" />
          <h3 className="text-[#e2e2f0] font-semibold text-sm">Abonnement</h3>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#6366f1]/8 to-[#8b5cf6]/8 border border-[#6366f1]/15 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[#e2e2f0] font-semibold">Plan Pro</span>
              <span className="text-xs bg-[#f59e0b]/15 text-[#f59e0b] px-2 py-0.5 rounded-full font-medium">Actif</span>
            </div>
            <div className="text-[#7878a0] text-xs">Renouvellement le 9 juillet 2026 · 49€/mois</div>
          </div>
          <div className="text-right">
            <div className="text-[#e2e2f0] text-sm font-semibold font-mono">8 jours</div>
            <div className="text-[#7878a0] text-xs">restants</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-xs text-[#7878a0]">
          {["12/20 Concurrents", "1 284/5 000 Sources", "142/∞ Rapports"].map(f => (
            <div key={f} className="bg-white/3 rounded-lg p-2.5 text-[#c4c4d8] font-medium">{f}</div>
          ))}
        </div>
      </Card>

      {/* Personal info */}
      <Card className="p-5">
        <h3 className="text-[#e2e2f0] font-semibold text-sm mb-4">Informations personnelles</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Prénom", value: "Alexandre" },
            { label: "Nom", value: "Martin" },
            { label: "Email", value: "alexandre.martin@acme.io" },
            { label: "Entreprise", value: "Acme Corp" },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-medium text-[#7878a0] mb-1.5">{f.label}</label>
              <input defaultValue={f.value} className="w-full bg-[#1c1c2e] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#e2e2f0] focus:outline-none focus:border-[#6366f1]/60 transition-all" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Btn icon={<Save className="w-3.5 h-3.5" />} variant="primary">Sauvegarder</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: "Tableau de bord", subtitle: "Mardi 1 juillet 2026" },
  competitors: { title: "Concurrents", subtitle: "12 concurrents surveillés" },
  sources: { title: "Sources", subtitle: "1 284 sources actives" },
  reports: { title: "Rapports IA", subtitle: "Synthèses générées automatiquement" },
  "report-detail": { title: "Détail du rapport" },
  agents: { title: "Agents IA", subtitle: "Architecture multi-agents" },
  history: { title: "Historique", subtitle: "Timeline des analyses" },
  alerts: { title: "Alertes", subtitle: "Modifications importantes détectées" },
  settings: { title: "Paramètres", subtitle: "Configuration de la plateforme" },
  profile: { title: "Profil utilisateur" },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [selectedRpt, setSelectedRpt] = useState<typeof reports[0] | null>(null);

  const handleSelectReport = (r: typeof reports[0]) => {
    setSelectedRpt(r);
    setPage("report-detail");
  };

  if (!isLoggedIn) {
    return (
      <div className="dark">
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      </div>
    );
  }

  const pageInfo = pageTitles[page] ?? { title: page };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage setPage={setPage} />;
      case "competitors": return <CompetitorsPage />;
      case "sources": return <SourcesPage />;
      case "reports": return <ReportsPage onSelect={handleSelectReport} />;
      case "report-detail": return selectedRpt ? <ReportDetailPage report={selectedRpt} onBack={() => setPage("reports")} /> : null;
      case "agents": return <AgentsPage />;
      case "history": return <HistoryPage />;
      case "alerts": return <AlertsPage />;
      case "settings": return <SettingsPage />;
      case "profile": return <ProfilePage />;
      default: return <DashboardPage setPage={setPage} />;
    }
  };

  return (
    <div className="dark" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex h-screen bg-[#09090f] text-[#e2e2f0] overflow-hidden">
        <Sidebar page={page} setPage={(p) => { setPage(p); setSelectedRpt(null); }} />
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
