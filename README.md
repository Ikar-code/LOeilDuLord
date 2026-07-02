# Loeil du Lord

> **L'intelligence qui surveille vos concurrents.**

Loeil du Lord est une plateforme de veille concurrentielle basée sur une architecture **multi-agents IA**. Elle automatise la collecte, l'analyse, la vérification et la synthèse d'informations stratégiques afin de fournir des rapports exploitables sur vos concurrents.

Ce projet fait partie de l'écosystème **FairyLord**, aux côtés de :

- 📰 Le Fil du Lord
- 💰 Le Capital du Lord
- 👁️ Loeil du Lord

---

## Aperçu

Loeil du Lord combine :

- une interface web moderne développée avec **React**, **TypeScript** et **Tailwind CSS** ;
- un moteur de veille écrit en **Python** reposant sur une architecture multi-agents ;
- une base de données **Supabase** ;
- une automatisation via **GitHub Actions**.

Chaque agent possède une responsabilité précise dans le pipeline de veille afin de produire des rapports fiables et exploitables.

---

## Fonctionnalités

- 📡 Surveillance automatique des concurrents
- 🌐 Collecte de données depuis plusieurs sources
- 🤖 Analyse par IA
- ✅ Vérification des informations
- 📝 Génération automatique de rapports
- 🚨 Alertes stratégiques
- 📊 Tableau de bord interactif
- 📚 Historique des analyses
- ⚙️ Gestion des agents et des paramètres

---

# Architecture

```
                ┌────────────────────┐
                │    Sources Web     │
                └─────────┬──────────┘
                          │
                          ▼
                 Agent Recherche
                          │
                          ▼
                 Agent Scraping
                          │
                          ▼
               Agent Vérification
                          │
                          ▼
                  Agent Analyse
                          │
                          ▼
                 Agent Rédaction
                          │
                          ▼
             Agent Contrôle Qualité
                          │
                          ▼
                Agent Publication
                          │
                          ▼
                    Interface React
```

---

# Structure du projet

```text
.
├── src/                 # Frontend React
├── radar/               # Backend Python et agents IA
├── supabase/            # Schéma SQL
├── config/              # Configurations
├── .github/             # GitHub Actions
├── requirements.txt
└── run.py
```

---

# Les agents IA

Le moteur de veille est composé de plusieurs agents spécialisés.

| Agent | Rôle |
|--------|------|
| Recherche | Recherche de nouvelles informations |
| Scraping | Extraction du contenu des sources |
| Vérification | Validation et croisement des informations |
| Analyse | Analyse stratégique et sémantique |
| Rédaction | Génération des rapports |
| Contrôle Qualité | Vérification de la cohérence |
| Publication | Diffusion des rapports et alertes |

---

# Technologies

## Frontend

- React
- TypeScript
- Tailwind CSS
- Vite
- Lucide React

## Backend

- Python
- Supabase
- Architecture Multi-Agents

## Automatisation

- GitHub Actions

---

# Installation

## Cloner le dépôt

```bash
git clone https://github.com/ikar-code/loeildulord.git
cd loeil-du-lord
```

## Frontend

```bash
npm install
npm run dev
```

## Backend

Créer un environnement virtuel :

```bash
python -m venv .venv
```

Activation :

Windows

```bash
.venv\Scripts\activate
```

Linux / macOS

```bash
source .venv/bin/activate
```

Installer les dépendances :

```bash
pip install -r requirements.txt
```

Lancer le moteur :

```bash
python run.py
```

---

# Documentation

La documentation détaillée du moteur de veille est disponible dans :

```
radar/README.md
```

---

# Auteur

**Lucas Rajany**

Projet développé dans l'univers **FairyLord**.

---

# Licence

Distribué sous licence **Apache License 2.0**.

Voir le fichier **LICENSE** pour plus d'informations.
