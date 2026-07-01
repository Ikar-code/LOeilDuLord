# Radar — backend & base de données

Pipeline multi-agents de veille concurrentielle automatisée. Ceci est la
partie **backend + base de données** : collecte, vérification, rédaction,
contrôle qualité et publication de rapports. Le **frontend** (maquette
Figma → React/Next.js/Tailwind) se branche dessus via Supabase.

## Les 7 agents

| Agent | Rôle | Fichier |
|---|---|---|
| Recherche | Synchronise `config/competitors.yaml` vers la base | `radar/agents/recherche.py` |
| Scraping | Récupère le contenu d'une source, détecte les changements (hash) | `radar/agents/scraping.py` |
| Vérification | Extrait uniquement le texte réellement ajouté (diff), pour empêcher toute hallucination en aval | `radar/agents/verification.py` |
| Analyse | Classe le changement (type, priorité) | `radar/agents/analyse.py` |
| Rédaction | Rédige le rapport en français, à partir de l'extrait vérifié uniquement | `radar/agents/redaction.py` |
| Contrôle Qualité | Score de confiance 0-100, rejette si non ancré dans la source | `radar/agents/controle_qualite.py` |
| Publication | Enregistre le rapport + l'alerte | `radar/agents/publication.py` |

Chaque exécution d'agent est tracée dans `agent_runs` (statut, progression,
durée, message) — c'est ce qui alimente les pages "Agents IA" et
"Historique" de ta maquette Figma.

**Anti-hallucination par construction** : l'agent de rédaction ne reçoit
jamais la page complète, seulement l'extrait diffé par l'agent de
vérification. Le contrôle qualité utilise si possible un modèle différent
(Gemini) de celui de la rédaction (Groq), pour éviter qu'un modèle valide
ses propres erreurs.

---

## Déploiement — aucune installation locale nécessaire

### 1. Créer le dépôt GitHub

1. Sur github.com, **New repository** (ex. `radar`), aucune case d'initialisation cochée.
2. **uploading an existing file**, glissez-déposez tout le contenu de ce dossier, validez.

### 2. Créer le projet Supabase

1. Sur [supabase.com](https://supabase.com), créez un projet.
2. **SQL Editor → New query**, collez le contenu de `supabase/schema.sql`, **Run**. Ça crée toutes les tables (`competitors`, `sources`, `snapshots`, `agent_runs`, `reports`, `report_sources`, `alerts`, `settings`, `profiles`) avec les policies RLS, plus un trigger qui crée automatiquement un profil et une ligne `settings` à l'inscription.
3. **Authentication → Providers** : activez Google et/ou GitHub si votre maquette Figma prévoit ces boutons de connexion (chacun demande de créer une app OAuth côté Google Cloud Console / GitHub Developer Settings — Supabase affiche les URLs de callback à y renseigner).
4. **Project Settings → API**, notez :
   - `Project URL`
   - `anon public key`
   - `service_role key` (⚠️ secret)

### 3. Récupérer votre OWNER_USER_ID

Ce backend fonctionne en mode "propriétaire unique" : toutes les données
qu'il écrit sont rattachées à votre compte utilisateur.

1. Déployez d'abord le frontend (étape 4), créez votre compte dessus (ou dans Supabase directement : **Authentication → Users → Add user**).
2. Copiez l'UUID de cet utilisateur (colonne `UID` dans **Authentication → Users**).
3. C'est votre `OWNER_USER_ID`, à mettre dans les secrets GitHub (étape 5).

### 4. Frontend (votre maquette Figma)

Une fois votre maquette exportée en React/Next.js + Tailwind, connectez-la
à cette base de données :

```
npm install @supabase/supabase-js
```

```js
// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

Variables d'environnement à ajouter sur Vercel :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Correspondance pages Figma → tables Supabase :
- **Tableau de bord** → `competitors` (count), `agent_runs` (activité du jour), `alerts` (dernières), `reports` (count)
- **Concurrents** → `competitors`
- **Sources** → `sources`
- **Rapports IA** / page détail → `reports`, `report_sources`
- **Agents IA** → `agent_runs` (filtré par `agent_name`, trié par `started_at desc`)
- **Historique** → `agent_runs` (timeline complète, filtrable)
- **Alertes** → `alerts`
- **Paramètres** → `settings` (clés API — le pipeline les lit directement depuis cette table à chaque exécution, en plus des secrets GitHub)
- **Profil** → `profiles`

Toutes les lectures/écritures depuis le frontend passent par la clé
`anon` + l'authentification utilisateur ; les policies RLS garantissent
que chacun ne voit que ses propres données.

### 5. Configurer le pipeline (secrets GitHub)

Dans le dépôt : **Settings → Secrets and variables → Actions**, ajoutez :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OWNER_USER_ID` (récupéré à l'étape 3)
- `GROQ_API_KEY` — clé sur [console.groq.com](https://console.groq.com)
- `GEMINI_API_KEY` (optionnel, pour un contrôle qualité par un modèle différent) — clé sur [aistudio.google.com](https://aistudio.google.com/apikey)

Ces clés peuvent aussi être saisies plus tard directement dans la page
**Paramètres** de votre frontend (table `settings`) : le pipeline les
utilise en priorité si elles y sont renseignées.

### 6. Configurer vos concurrents

1. Copiez `config/competitors.example.yaml` vers `config/competitors.yaml`.
2. Remplacez les exemples par vos vrais concurrents et leurs sources (changelog, page tarifs, blog RSS, GitHub, page carrières...).
3. Uploadez ce fichier dans le dépôt GitHub (même méthode que l'étape 1).

### 7. Premier run

Onglet **Actions** du dépôt → **Run Radar Pipeline** → **Run workflow**.
Le run tourne ensuite automatiquement toutes les 6h (modifiable dans
`.github/workflows/run-pipeline.yml`, ligne `cron`).

Au premier passage sur chaque source, aucun rapport n'est généré : le
pipeline établit juste une "baseline" (rien à comparer encore). Les
rapports apparaissent à partir du **second** passage, quand un changement
réel est détecté.

---

## Si tu me renvoies une erreur

- **Le workflow échoue** → onglet Actions → run en rouge → copie le log complet (chaque étape logge clairement l'erreur).
- **"Variables d'environnement manquantes"** → vérifie l'orthographe exacte des secrets GitHub (étape 5).
- **"config/competitors.yaml introuvable"** → le fichier n'a pas été uploadé, ou mal nommé (pas `.example`).
- **Erreur Groq / Gemini** (401, quota...) → vérifie la clé, ou son solde/quota sur la console du fournisseur.
- **Le frontend affiche des tableaux vides** → vérifie que `OWNER_USER_ID` correspond bien à l'utilisateur avec lequel tu es connecté sur le frontend, et que le premier run du pipeline a bien été lancé.
- **Erreur RLS ("new row violates row-level security policy")** côté frontend → l'utilisateur n'est pas authentifié, ou essaie d'écrire un `user_id` différent du sien.

## Structure du projet

```
radar/
  config.py       chargement env + config/competitors.yaml
  db.py           client REST Supabase minimal (clé service_role)
  llm.py          appels Groq (rédaction) et Gemini (contrôle qualité)
  tracking.py     traçage des exécutions dans agent_runs
  pipeline.py     orchestration des 7 agents
  main.py         point d'entrée, résolution des clés API
  agents/         un fichier par agent (voir tableau plus haut)
supabase/
  schema.sql      tables, RLS, trigger de création de profil
config/
  competitors.example.yaml   à copier en competitors.yaml
.github/workflows/
  run-pipeline.yml           cron toutes les 6h
run.py            appelé par le workflow
```

## Limites connues (MVP)

- Numérotation / diff basés sur du texte brut nettoyé (pas de rendu JS) : les sites fortement dépendants du JavaScript côté client peuvent nécessiter un scraper plus avancé (Playwright) — non inclus ici pour rester simple à héberger sur GitHub Actions.
- Une source = un item de configuration ; pas de découverte automatique de nouvelles pages sur un site.
- Les clés API dans `settings` sont stockées en clair (protégées par RLS uniquement) — voir le commentaire dans `supabase/schema.sql` pour durcir via Supabase Vault si besoin.
