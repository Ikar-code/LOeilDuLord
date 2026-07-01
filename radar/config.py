import os
import sys
import yaml
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class ConfigError(RuntimeError):
    pass


def load_env():
    # GROQ_API_KEY / GEMINI_API_KEY sont optionnels ici : ils peuvent être
    # fournis à la place (ou en plus) via la page "Paramètres" du frontend,
    # qui les écrit dans la table settings. Voir main.py::resolve_api_keys.
    required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OWNER_USER_ID"]
    missing = [k for k in required if not os.environ.get(k)]
    if missing:
        raise ConfigError(
            f"Variables d'environnement manquantes : {', '.join(missing)}. "
            "Voir README.md pour la configuration des secrets GitHub Actions."
        )
    return {
        "SUPABASE_URL": os.environ["SUPABASE_URL"].rstrip("/"),
        "SUPABASE_SERVICE_ROLE_KEY": os.environ["SUPABASE_SERVICE_ROLE_KEY"],
        "OWNER_USER_ID": os.environ["OWNER_USER_ID"],
        "GROQ_API_KEY": os.environ.get("GROQ_API_KEY"),
        "GEMINI_API_KEY": os.environ.get("GEMINI_API_KEY"),
    }


def load_competitors(path=None):
    path = Path(path) if path else ROOT / "config" / "competitors.yaml"
    if not path.exists():
        example = ROOT / "config" / "competitors.example.yaml"
        raise ConfigError(
            f"{path} introuvable. Copiez {example.name} vers {path.name} et adaptez-le."
        )
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    competitors = data.get("competitors", [])
    if not competitors:
        print("Aucun concurrent configuré — rien à faire.", file=sys.stderr)
    return competitors
