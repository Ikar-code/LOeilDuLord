"""Agent RECHERCHE.

Rôle : lister les concurrents actifs d'un utilisateur donné, avec leurs
sources actives. Les concurrents sont désormais ajoutés directement par
l'utilisateur via l'app (page Concurrents ou Découverte) — cet agent ne
fait plus de synchronisation depuis un fichier YAML, il se contente de lire
ce qui existe déjà en base pour cet utilisateur précis.
"""


def list_active_competitors(db, user_id):
    competitors = db.select("competitors", {"user_id": user_id, "status": "actif"})
    result = []
    for comp in competitors:
        sources = db.select("sources", {"competitor_id": comp["id"], "status": "actif"})
        if sources:
            result.append({"competitor": comp, "sources": sources})
    return result
