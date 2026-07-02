import os 
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class ConfigError(RuntimeError):
    pass


def load_env():
    # OWNER_USER_ID n'existe plus : le pipeline traite maintenant tous les
    # utilisateurs qui ont des concurrents en base, pas un seul compte fixe.
    # GROQ_API_KEY / GEMINI_API_KEY restent optionnels ici : ce sont des clés
    # de repli partagées, utilisées seulement si un utilisateur n'a pas
    # renseigné les siennes dans Paramètres.
    required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
    missing = [k for k in required if not os.environ.get(k)]
    if missing:
        raise ConfigError(
            f"Variables d'environnement manquantes : {', '.join(missing)}. "
            "Voir README.md pour la configuration des secrets GitHub Actions."
        )
    return {
        "SUPABASE_URL": os.environ["SUPABASE_URL"].rstrip("/"),
        "SUPABASE_SERVICE_ROLE_KEY": os.environ["SUPABASE_SERVICE_ROLE_KEY"],
        "GROQ_API_KEY": os.environ.get("GROQ_API_KEY"),
        "GEMINI_API_KEY": os.environ.get("GEMINI_API_KEY"),
    }
