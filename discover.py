"""Point d'entrée de la découverte de concurrents.

Appelé par .github/workflows/discover-competitors.yml avec REQUEST_ID (l'id
de la ligne discovery_requests à traiter). C'est cette ligne qui fait foi
pour le nom de l'entreprise ET l'utilisateur à qui rattacher les concurrents
trouvés (colonne user_id, déjà posée par le frontend sous RLS) — pas de
compte "propriétaire" fixe : n'importe quel utilisateur peut lancer une
découverte pour son propre compte.
"""

import os
import sys
from datetime import datetime, timezone

from radar.agents.decouverte import discover_competitors, save_discovered_competitors
from radar.config import ConfigError, load_env
from radar.db import SupabaseClient


def main():
    request_id = os.environ.get("REQUEST_ID", "").strip()
    if not request_id:
        print("REQUEST_ID manquant : impossible de savoir quel utilisateur traiter.", file=sys.stderr)
        sys.exit(1)

    try:
        config = load_env()
    except ConfigError as e:
        print(f"Erreur de configuration : {e}", file=sys.stderr)
        sys.exit(1)

    db = SupabaseClient(config["SUPABASE_URL"], config["SUPABASE_SERVICE_ROLE_KEY"])

    request_rows = db.select("discovery_requests", {"id": request_id}, limit=1)
    if not request_rows:
        print(f"discovery_requests id={request_id} introuvable.", file=sys.stderr)
        sys.exit(1)
    request = request_rows[0]
    user_id = request["user_id"]
    company_name = request["company_name"]

    # Clé Groq personnelle de cet utilisateur (Paramètres) en priorité,
    # sinon repli sur la clé partagée des secrets GitHub.
    settings_rows = db.select("settings", {"user_id": user_id}, limit=1)
    if settings_rows:
        config["GROQ_API_KEY"] = settings_rows[0].get("groq_api_key") or config["GROQ_API_KEY"]

    if not config["GROQ_API_KEY"]:
        _fail(db, request_id, "Aucune clé Groq disponible (ni personnelle, ni partagée).")
        sys.exit(1)

    db.update("discovery_requests", {"id": request_id}, {"status": "running"})

    try:
        found = discover_competitors(config, company_name)
        created = save_discovered_competitors(db, user_id, found)
        results = [
            {"name": c["name"], "website": c.get("website"), "verified": c.get("verified", True)}
            for c in created
        ]
        db.update("discovery_requests", {"id": request_id}, {
            "status": "done",
            "results": results,
            "finished_at": datetime.now(timezone.utc).isoformat(),
        })
        print(f"{len(created)} concurrent(s) ajouté(s) pour '{company_name}' (utilisateur {user_id}).")
    except Exception as e:  # noqa: BLE001 - on trace l'erreur dans discovery_requests puis on la relance
        _fail(db, request_id, str(e)[:500])
        raise


def _fail(db, request_id, message):
    db.update("discovery_requests", {"id": request_id}, {
        "status": "error",
        "error_message": message,
        "finished_at": datetime.now(timezone.utc).isoformat(),
    })


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # noqa: BLE001 - dernier filet : rien ne doit rester bloqué sur "pending"
        req_id = os.environ.get("REQUEST_ID", "").strip()
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if req_id and url and key:
            try:
                SupabaseClient(url, key).update("discovery_requests", {"id": req_id}, {
                    "status": "error",
                    "error_message": str(e)[:500],
                    "finished_at": datetime.now(timezone.utc).isoformat(),
                })
            except Exception:
                pass
        raise
