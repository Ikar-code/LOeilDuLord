"""Agent ANALYSE.

Rôle : classifier l'extrait vérifié (type de changement, priorité) pour
alimenter les alertes et prioriser la lecture. Réponse LLM forcée en JSON
strict pour être exploitable sans post-traitement fragile.
"""

import json

from radar.llm import groq_complete

SYSTEM = (
    "Tu classifies des changements détectés sur le site d'une entreprise concurrente. "
    "Réponds UNIQUEMENT avec un objet JSON, sans texte avant/après, sans balises markdown. "
    "Format exact : "
    '{"type": "...", "priority": "...", "one_liner": "..."}. '
    'type doit être une valeur parmi : nouveau_produit, changement_prix, '
    'nouvelle_fonctionnalite, nouvelle_offre_emploi, levee_de_fonds, autre. '
    'priority doit être une valeur parmi : haute, moyenne, basse. '
    "one_liner : une phrase en français de moins de 15 mots résumant le changement."
)


def analyse_change(config, competitor_name, source_type, excerpt):
    user = (
        f"Concurrent : {competitor_name}\n"
        f"Type de source : {source_type}\n"
        f"Extrait ajouté/modifié :\n{excerpt}"
    )
    raw = groq_complete(config["GROQ_API_KEY"], SYSTEM, user, temperature=0.1)
    raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        data = {"type": "autre", "priority": "basse", "one_liner": "Changement détecté."}

    data.setdefault("type", "autre")
    data.setdefault("priority", "basse")
    data.setdefault("one_liner", "Changement détecté.")
    if data["type"] not in {"nouveau_produit", "changement_prix", "nouvelle_fonctionnalite", "nouvelle_offre_emploi", "levee_de_fonds", "autre"}:
        data["type"] = "autre"
    if data["priority"] not in {"haute", "moyenne", "basse"}:
        data["priority"] = "basse"
    return data
