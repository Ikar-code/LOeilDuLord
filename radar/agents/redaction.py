"""Agent RÉDACTION.

Rôle : rédiger le rapport en français à partir UNIQUEMENT de l'extrait
vérifié (jamais du texte complet de la page, pour éviter que le modèle
"complète" avec des informations non vérifiées). Sortie JSON structurée
pour remplir directement les colonnes de la table reports.
"""

import json

from radar.llm import groq_complete

SYSTEM = (
    "Tu es rédacteur pour une plateforme de veille concurrentielle B2B. "
    "Tu écris exclusivement à partir de l'extrait fourni — n'invente aucune "
    "information absente de cet extrait, et si l'extrait est ambigu, dis-le "
    "explicitement plutôt que de supposer. Réponds UNIQUEMENT avec un objet "
    "JSON, sans texte avant/après, sans balises markdown. Format exact : "
    '{"title": "...", "summary": "...", "facts": ["..."], "analysis": "...", '
    '"recommendations": ["..."]}. '
    "title : moins de 12 mots. summary : 2-3 phrases. facts : 2 à 5 faits "
    "factuels et courts extraits directement du texte. analysis : un "
    "paragraphe sur l'implication business pour un lecteur qui surveille ce "
    "concurrent. recommendations : 1 à 3 actions concrètes suggérées, ou "
    "liste vide si aucune n'est pertinente."
)


def write_report(config, competitor_name, sector, change_type, excerpt):
    user = (
        f"Concurrent : {competitor_name}\n"
        f"Secteur : {sector or 'non renseigné'}\n"
        f"Type de changement détecté : {change_type}\n"
        f"Extrait vérifié (source unique d'information) :\n{excerpt}"
    )
    raw = groq_complete(config["GROQ_API_KEY"], SYSTEM, user, temperature=0.4)
    raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    data = json.loads(raw)  # on laisse remonter l'erreur : le pipeline la trace via agent_runs
    data.setdefault("facts", [])
    data.setdefault("recommendations", [])
    return data
