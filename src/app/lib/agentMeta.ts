import { Search, Database, Shield, BarChart2, FileText, CheckCircle2, Zap } from "lucide-react";

export type AgentName =
  | "recherche"
  | "scraping"
  | "verification"
  | "analyse"
  | "redaction"
  | "controle_qualite"
  | "publication";

export const AGENT_ORDER: AgentName[] = [
  "recherche",
  "scraping",
  "verification",
  "analyse",
  "redaction",
  "controle_qualite",
  "publication",
];

export const AGENT_META: Record<AgentName, { name: string; icon: any; color: string; description: string }> = {
  recherche: { name: "Agent Recherche", icon: Search, color: "#6366f1", description: "Synchronise les concurrents et sources configurés" },
  scraping: { name: "Agent Scraping", icon: Database, color: "#8b5cf6", description: "Extraction et collecte des données brutes depuis les sources" },
  verification: { name: "Agent Vérification", icon: Shield, color: "#22d3ee", description: "Extraction du texte réellement modifié, anti-hallucination" },
  analyse: { name: "Agent Analyse", icon: BarChart2, color: "#f59e0b", description: "Classification du type de changement et de sa priorité" },
  redaction: { name: "Agent Rédaction", icon: FileText, color: "#10b981", description: "Génération des synthèses en français à partir des extraits vérifiés" },
  controle_qualite: { name: "Agent Contrôle QA", icon: CheckCircle2, color: "#ef4444", description: "Score de confiance et détection d'hallucination" },
  publication: { name: "Agent Publication", icon: Zap, color: "#f97316", description: "Enregistrement du rapport validé et de l'alerte associée" },
};
