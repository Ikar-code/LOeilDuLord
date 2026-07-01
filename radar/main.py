import sys

from radar.config import ConfigError, load_competitors, load_env
from radar.db import SupabaseClient
from radar.pipeline import run_pipeline


def resolve_api_keys(db, config):
    """La page Paramètres du frontend (table settings) est prioritaire sur
    les secrets GitHub Actions si elle contient une valeur, pour que
    l'utilisateur puisse gérer ses clés sans toucher au dépôt."""
    rows = db.select("settings", {"user_id": config["OWNER_USER_ID"]}, limit=1)
    if rows:
        settings = rows[0]
        config["GROQ_API_KEY"] = settings.get("groq_api_key") or config["GROQ_API_KEY"]
        config["GEMINI_API_KEY"] = settings.get("gemini_api_key") or config["GEMINI_API_KEY"]
    return config


def main():
    try:
        config = load_env()
        competitors_cfg = load_competitors()
    except ConfigError as e:
        print(f"Erreur de configuration : {e}", file=sys.stderr)
        sys.exit(1)

    if not competitors_cfg:
        sys.exit(0)

    db = SupabaseClient(config["SUPABASE_URL"], config["SUPABASE_SERVICE_ROLE_KEY"])
    config = resolve_api_keys(db, config)

    if not config["GROQ_API_KEY"]:
        print(
            "Aucune clé Groq disponible (ni en secret GitHub GROQ_API_KEY, "
            "ni dans Paramètres > Clés API du frontend).",
            file=sys.stderr,
        )
        sys.exit(1)

    stats = run_pipeline(db, config, competitors_cfg)

    if stats["erreurs"] > 0:
        sys.exit(1)  # fait apparaître le run GitHub Actions en échec, visible dans l'onglet Actions


if __name__ == "__main__":
    main()
