# Radar — backend & base de données

Pipeline multi-agents de veille concurrentielle automatisée, **multi-utilisateurs** :
n'importe qui peut créer un compte sur le frontend et avoir sa propre veille,
isolée des autres (RLS Supabase). Ceci est la partie **backend + base de
données** : collecte, vérification, rédaction, contrôle qualité et
publication de rapports. Le **frontend** (maquette Figma → React/Vite/Tailwind)
se branche dessus via Supabase.

## Les 7 agents

| Agent | Rôle | Fichier |
|---|---|---|
| Recherche | Liste les concurrents/sources actifs de l'utilisateur traité | `radar/agents/recherche.py` |
| Scraping | Récupère le contenu d'une source, détecte les changements (hash) | `radar/agents/scraping.py` |
| Vérification | Extrait uniquement le texte réellement ajouté (diff), pour empêcher toute hallucination en aval | `radar/agents/verification.py` |
| Analyse | Classe le changement (type, priorité) | `radar/agents/analyse.py` |
| Rédaction | Rédige le rapport en français, à partir de l'extrait vérifié uniquement | `radar/agents/redaction.py` |
| Contrôle Qualité | Score de confiance 0-100, rejette si non ancré dans la source | `radar/agents/controle_qualite.py` |
| Publication | Enregistre le rapport + l'alerte | `radar/agents/publication.py` |

Un 8e agent, **Découverte** (`radar/agents/decouverte.py`), n'appartient pas
au cycle automatique : il est déclenché à la demande depuis la page
"Découverte" du frontend, pour trouver et ajouter des concurrents à partir
d'un simple nom d'entreprise (voir section dédiée plus bas).

Chaque exécution d'agent est tracée dans `agent_runs` (statut, progression,
durée, message) — c'est ce qui alimente les pages "Agents IA" et
"Historique" de ta maquette Figma, filtré par utilisateur via RLS.

**Anti-hallucination par construction** : l'agent de rédaction ne reçoit
jamais la page complète, seulement l'extrait diffé par l'agent de
vérification. Le contrôle qualité utilise si possible un modèle différent
(Gemini) de celui de la rédaction (Groq), pour éviter qu'un modèle valide
ses propres erreurs.

**Multi-utilisateurs** : à chaque exécution planifiée, `main.py` liste tous
les comptes ayant au moins un concurrent actif, et exécute le pipeline pour
chacun séparément, avec sa propre clé Groq/Gemini (personnelle si
renseignée dans Paramètres, sinon repli sur une clé partagée optionnelle).
Il n'y a pas de compte "propriétaire" fixe.

---

## Déploiement — aucune installation locale nécessaire

### 1. Créer le dépôt GitHub

1. Sur github.com, **New repository** (ex. `radar`), aucune case d'initialisation cochée.
2. **uploading an existing file**, glissez-déposez tout le contenu de ce dossier, validez.

### 2. Créer le projet Supabase

1. Sur [supabase.com](https://supabase.com), créez un projet.
2. **SQL Editor → New query**, collez le contenu de `supabase/schema.sql`, **Run**. Ça crée toutes les tables (`competitors`, `sources`, `snapshots`, `agent_runs`, `reports`, `report_sources`, `alerts`, `settings`, `profiles`, `discovery_requests`) avec les policies RLS, plus un trigger qui crée automatiquement un profil et une ligne `settings` à l'inscription de chaque nouvel utilisateur.
3. **Authentication → URL Configuration** : renseigne la **Site URL** avec l'URL de ton site Vercel (pas `localhost`), et ajoute-la aussi dans **Redirect URLs**.
4. **Authentication → Providers** : active Google et/ou GitHub si ta maquette prévoit ces boutons (chacun demande de créer une app OAuth côté Google Cloud Console / GitHub Developer Settings — Supabase affiche les URLs de callback à y renseigner ; type d'application **"Web application"**, pas Desktop).
5. **Project Settings → API**, note :
   - `Project URL`
   - `anon public key`
   - `service_role key` (⚠️ secret)

### 3. Frontend

```
npm install @supabase/supabase-js
```

```js
// src/app/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Variables d'environnement à ajouter sur Vercel (projet Vite, donc préfixe `VITE_`, pas `NEXT_PUBLIC_`) :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

N'importe qui peut créer un compte sur la page de connexion (email/mot de
passe, ou Google/GitHub une fois activés) — chacun ne voit que ses propres
concurrents, sources, rapports et alertes, grâce aux policies RLS.

### 4. Configurer le pipeline (secrets GitHub)

Dans le dépôt : **Settings → Secrets and variables → Actions**, ajoute :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY` — clé partagée de repli, utilisée pour les utilisateurs qui n'ont pas renseigné la leur dans Paramètres. ⚠️ Si tu la mets, tous les utilisateurs sans clé personnelle partagent ton quota/coût Groq — décide si c'est acceptable, ou laisse ce secret vide pour forcer chacun à mettre sa propre clé.
- `GEMINI_API_KEY` (optionnel, même logique de repli partagé pour le contrôle qualité)

### 5. Premier run

Onglet **Actions** du dépôt → **Run Radar Pipeline** → **Run workflow**.
Le run tourne ensuite automatiquement toutes les 6h (modifiable dans
`.github/workflows/run-pipeline.yml`, ligne `cron`).

Au premier passage sur chaque source, aucun rapport n'est généré : le
pipeline établit juste une "baseline" (rien à comparer encore). Les
rapports apparaissent à partir du **second** passage, quand un changement
réel est détecté.

### 6. Activer la découverte de concurrents (optionnel)

Permet à chaque utilisateur de taper un nom d'entreprise et de se faire
proposer une liste de concurrents, ajoutés automatiquement à sa veille.

1. Supabase → **Edge Functions → Create a new function**, nomme-la `trigger-discovery`, colle le contenu de `supabase/functions/trigger-discovery/index.ts`, **Deploy**.
2. Dans ses secrets (Edge Functions → Secrets, niveau projet), ajoute :
   - `GH_TOKEN` — Personal Access Token GitHub, scope `workflow` ([github.com/settings/tokens](https://github.com/settings/tokens))
   - `GH_OWNER` — ton pseudo GitHub
   - `GH_REPO` — le nom de ce dépôt
3. Le frontend appelle cette fonction via `supabase.functions.invoke('trigger-discovery', ...)` depuis la page Découverte, qui déclenche `.github/workflows/discover-competitors.yml`.

---

## Si tu me renvoies une erreur

- **Le workflow échoue** → onglet Actions → run en rouge → copie le log complet (chaque étape logge clairement l'erreur).
- **"Variables d'environnement manquantes"** → vérifie l'orthographe exacte des secrets GitHub (étape 4).
- **Erreur Groq / Gemini** (401, quota...) → vérifie la clé, ou son solde/quota sur la console du fournisseur.
- **Le frontend affiche des tableaux vides pour un utilisateur** → vérifie qu'il a bien des concurrents actifs et qu'au moins un run du pipeline a eu lieu depuis leur ajout.
- **Erreur RLS ("new row violates row-level security policy")** côté frontend → l'utilisateur n'est pas authentifié, ou une table a été créée sans policy (voir `supabase/schema.sql` pour le modèle à suivre : `enable row level security` + `create policy` systématiques).
- **Edge Function trigger-discovery renvoie 500** → vérifie ses secrets `GH_TOKEN`/`GH_OWNER`/`GH_REPO`, et regarde ses **Logs** (pas les logs réseau généraux) pour le message exact.

## Structure du projet

```
radar/
  config.py       chargement des variables d'environnement
  db.py           client REST Supabase minimal (clé service_role), avec retry réseau
  llm.py          appels Groq (rédaction) et Gemini (contrôle qualité)
  tracking.py     traçage des exécutions dans agent_runs
  pipeline.py     orchestration multi-utilisateurs des 7 agents
  main.py         point d'entrée du pipeline planifié
  agents/         un fichier par agent, + decouverte.py (à la demande)
supabase/
  schema.sql                     tables, RLS, trigger de création de profil
  functions/trigger-discovery/   Edge Function (à coller dans le dashboard)
.github/workflows/
  run-pipeline.yml           cron toutes les 6h, tous utilisateurs
  discover-competitors.yml   à la demande, un utilisateur à la fois
run.py            appelé par run-pipeline.yml
discover.py        appelé par discover-competitors.yml
```

## Limites connues (MVP)

- Numérotation / diff basés sur du texte brut nettoyé (pas de rendu JS) : les sites fortement dépendants du JavaScript côté client peuvent nécessiter un scraper plus avancé (Playwright) — non inclus ici pour rester simple à héberger sur GitHub Actions.
- Une source = une URL ajoutée manuellement ou via Découverte ; pas de découverte automatique de nouvelles pages sur un site déjà suivi.
- Les clés API dans `settings` sont stockées en clair (protégées par RLS uniquement) — voir le commentaire dans `supabase/schema.sql` pour durcir via Supabase Vault si besoin.
- La recherche web de l'agent Découverte scrape DuckDuckGo (pas de clé API requise) ; si elle échoue (fréquent depuis des IPs de CI), le repli sur les connaissances générales du modèle est clairement marqué `verified: false` côté frontend.
