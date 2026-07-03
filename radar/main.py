import sys

from radar.config import ConfigError, load_env
from radar.db import SupabaseClient
from radar.pipeline import run_pipeline


def main():
    try:
        config = load_env()
    except ConfigError as e:
        print(f"Erreur de configuration : {e}", file=sys.stderr)
        sys.exit(1)

    db = SupabaseClient(config["SUPABASE_URL"], config["SUPABASE_SERVICE_ROLE_KEY"])

    # run_pipeline traite tous les utilisateurs ayant des concurrents actifs,
    # en résolvant la clé Groq/Gemini de chacun (personnelle si renseignée
    # dans Paramètres, sinon repli sur les secrets GitHub partagés ci-dessus).
    totals = run_pipeline(db, config)

    print(f"Terminé — utilisateurs traités: {totals['utilisateurs_traites']}, ignorés (pas de clé): {totals['utilisateurs_ignores']}")


if __name__ == "__main__":
    main()
