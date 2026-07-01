"""Wrappers autour des APIs LLM.

Rédaction : Groq (qwen/qwen3-32b), avec repli sur llama-3.3-70b-versatile
en cas d'erreur — même schéma que le pipeline Le Fil du Lord.

Contrôle qualité : Gemini (gemini-2.0-flash) si une clé est fournie, sinon
repli sur une deuxième passe Groq. Un modèle différent de celui de la
rédaction limite le risque que l'agent de contrôle qualité valide ses
propres erreurs.
"""

from groq import Groq

GROQ_PRIMARY_MODEL = "qwen/qwen3-32b"
GROQ_FALLBACK_MODEL = "llama-3.3-70b-versatile"
GEMINI_QA_MODEL = "gemini-2.0-flash"


def groq_complete(api_key, system, user, temperature=0.3):
    client = Groq(api_key=api_key)
    last_err = None
    for model in (GROQ_PRIMARY_MODEL, GROQ_FALLBACK_MODEL):
        try:
            resp = client.chat.completions.create(
                model=model,
                temperature=temperature,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:  # noqa: BLE001 - on tente le modèle de repli
            last_err = e
            continue
    raise RuntimeError(f"Échec Groq (primaire et repli) : {last_err}")


def gemini_complete(api_key, system, user, temperature=0.1):
    import google.generativeai as genai

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(GEMINI_QA_MODEL, system_instruction=system)
    resp = model.generate_content(user, generation_config={"temperature": temperature})
    return resp.text.strip()


def qa_complete(config, system, user):
    """Utilise Gemini si disponible (config['GEMINI_API_KEY']), sinon Groq."""
    if config.get("GEMINI_API_KEY"):
        try:
            return gemini_complete(config["GEMINI_API_KEY"], system, user)
        except Exception:
            pass  # repli silencieux sur Groq si Gemini échoue
    return groq_complete(config["GROQ_API_KEY"], system, user, temperature=0.1)
