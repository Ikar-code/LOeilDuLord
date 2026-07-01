"""Agent CONTRÔLE QUALITÉ.

Rôle : vérifier que le rapport rédigé est bien ancré dans l'extrait source
(pas d'information inventée), et attribuer un score de confiance 0-100.
Utilise si possible un modèle différent de celui de la rédaction (Gemini),
pour ne pas laisser le même modèle juger son propre travail.
"""

import json

from radar.llm import qa_complete

SYSTEM = (
    "Tu contrôles la qualité d'un rapport de veille concurrentielle. On te "
    "donne l'extrait source original et le rapport rédigé à partir de cet "
    "extrait. Vérifie que CHAQUE affirmation du rapport est bien soutenue "
    "par l'extrait — pénalise fortement toute information qui ne s'y trouve "
    "pas. Réponds UNIQUEMENT avec un objet JSON, sans texte avant/après, "
    "sans balises markdown. Format exact : "
    '{"score": 0, "grounded": true, "issues": ["..."]}. '
    "score : confiance globale de 0 à 100. grounded : false s'il y a une "
    "hallucination claire. issues : liste courte des problèmes trouvés, "
    "vide si aucun."
)

REJECT_BELOW = 55


def review_report(config, excerpt, report):
    user = (
        f"Extrait source :\n{excerpt}\n\n"
        f"Rapport rédigé :\n"
        f"Titre : {report.get('title')}\n"
        f"Résumé : {report.get('summary')}\n"
        f"Faits : {report.get('facts')}\n"
        f"Analyse : {report.get('analysis')}"
    )
    raw = qa_complete(config, SYSTEM, user)
    raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        data = json.loads(raw)
        score = int(data.get("score", 0))
        grounded = bool(data.get("grounded", False))
        issues = data.get("issues", [])
    except (json.JSONDecodeError, ValueError, TypeError):
        score, grounded, issues = 0, False, ["Réponse du contrôle qualité illisible."]

    passed = grounded and score >= REJECT_BELOW
    return {"score": max(0, min(100, score)), "grounded": grounded, "issues": issues, "passed": passed}
