"""Point d'entrée de la découverte de concurrents.

Appelé par .github/workflows/discover-competitors.yml avec deux variables
d'environnement : COMPANY_NAME (obligatoire) et REQUEST_ID (l'id de la ligne
discovery_requests à mettre à jour avec le résultat).
"""

import os
import sys
from datetime import datetime, timezone

from radar.agents.decouverte import discover_competitors, save_discovered_competitors
from radar.config import ConfigError, load_env
from radar.db import SupabaseClient


def main():
    company_name = os.environ.get("COMPANY_NAME", "").strip()
    request_id = os.environ.get("REQUEST_ID", "").strip()

    if not company_name:
        print("COMPANY_NAME manquant.", file=sys.stderr)
        sys.exit(1)

    try:
        config = load_env()
    except ConfigError as e:
        print(f"Erreur de configuration : {e}", file=sys.stderr)
        sys.exit(1)

    db = SupabaseClient(config["SUPABASE_URL"], config["SUPABASE_SERVICE_ROLE_KEY"])

    # Récupère l'utilisateur ayant créé la demande
    request = db.select("discovery_requests", {"id": request_id}, limit=1)
    
    if not request:
        _fail(db, request_id, "Demande de découverte introuvable.")
        sys.exit(1)
    
    user_id = request[0]["user_id"]
    
    # Charge les paramètres de cet utilisateur
    rows = db.select("settings", {"user_id": user_id}, limit=1)
    if rows:
        config["GROQ_API_KEY"] = rows[0].get("groq_api_key") or config["GROQ_API_KEY"]

    if not config["GROQ_API_KEY"]:
        _fail(db, request_id, "Aucune clé Groq disponible.")
        sys.exit(1)

    if request_id:
        db.update("discovery_requests", {"id": request_id}, {"status": "running"})

    try:
        found = discover_competitors(config, company_name)
        created = save_discovered_competitors(db, config, found)
        results = [
            {"name": c["name"], "website": c.get("website"), "verified": c.get("verified", True)}
            for c in created
        ]

        if request_id:
            db.update("discovery_requests", {"id": request_id}, {
                "status": "done",
                "results": results,
                "finished_at": datetime.now(timezone.utc).isoformat(),
            })
        print(f"{len(created)} concurrent(s) ajouté(s) pour '{company_name}'.")
    except Exception as e:  # noqa: BLE001 - on trace l'erreur dans discovery_requests puis on la relance
        _fail(db, request_id, str(e)[:500])
        raise


def _fail(db, request_id, message):
    if request_id:
        db.update("discovery_requests", {"id": request_id}, {
            "status": "error",
            "error_message": message,
            "finished_at": datetime.now(timezone.utc).isoformat(),
        })


if __name__ == "__main__":
    main()
