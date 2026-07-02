"""Agent DÉCOUVERTE.

Rôle : à partir d'un seul nom d'entreprise, chercher sur le web ses
concurrents probables et les ajouter dans Supabase, prêts à être surveillés
par le pipeline principal (radar/pipeline.py).

Ni Groq ni Gemini n'ont de recherche web intégrée : ce module scrape les
résultats DuckDuckGo (pas de clé API requise), puis demande au LLM d'en
extraire une liste structurée. C'est moins fiable qu'une vraie API de
recherche — les résultats doivent être relus avant de lancer une
surveillance dessus, surtout pour des entreprises peu connues ou des
marchés de niche.
"""

import json
import re

import requests
from bs4 import BeautifulSoup

from radar.llm import groq_complete

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Referer": "https://duckduckgo.com/",
}
TIMEOUT = 20

SYSTEM = (
    "Tu identifies les concurrents directs d'une entreprise à partir de "
    "résultats de recherche web bruts. Réponds UNIQUEMENT avec un objet "
    "JSON, sans texte avant/après, sans balises markdown. Format exact : "
    '{"competitors": [{"name": "...", "website": "..."}]}. '
    "Maximum 8 concurrents. website : domaine principal si tu peux "
    "l'identifier avec confiance dans les résultats fournis, sinon null. "
    "N'invente pas de concurrent absent des résultats fournis — si les "
    "résultats sont insuffisants, renvoie une liste plus courte plutôt que "
    "de compléter avec tes propres connaissances non vérifiées ici."
)


def _duckduckgo_search(query, max_results=8):
    results = _search_html_endpoint(query, max_results)
    if not results:
        results = _search_lite_endpoint(query, max_results)
    return results


def _search_html_endpoint(query, max_results):
    try:
        res = requests.get(
            "https://duckduckgo.com/html/",
            params={"q": query},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        results = []
        for link in soup.select("a.result__a")[:max_results]:
            title = link.get_text(strip=True)
            href = link.get("href", "")
            snippet_el = link.find_parent("div", class_="result__body")
            snippet = ""
            if snippet_el:
                snippet_tag = snippet_el.select_one(".result__snippet")
                if snippet_tag:
                    snippet = snippet_tag.get_text(strip=True)
            results.append(f"{title} — {snippet} ({href})")
        return results
    except Exception as e:  # noqa: BLE001
        print(f"[avertissement] point html échoué pour '{query}' : {e}")
        return []


def _search_lite_endpoint(query, max_results):
    try:
        res = requests.get(
            "https://lite.duckduckgo.com/lite/",
            params={"q": query},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        results = []
        for link in soup.select("a.result-link")[:max_results]:
            title = link.get_text(strip=True)
            href = link.get("href", "")
            if title and href:
                results.append(f"{title} — ({href})")
        return results
    except Exception as e:  # noqa: BLE001
        print(f"[avertissement] point lite échoué pour '{query}' : {e}")
        return []


FALLBACK_SYSTEM = (
    "Tu identifies les concurrents directs d'une entreprise à partir de tes "
    "connaissances générales (aucun résultat de recherche web n'est "
    "disponible ici). Réponds UNIQUEMENT avec un objet JSON, sans texte "
    "avant/après, sans balises markdown. Format exact : "
    '{"competitors": [{"name": "...", "website": "..."}]}. '
    "Maximum 6 concurrents, uniquement ceux dont tu es raisonnablement "
    "confiant. website : domaine principal si tu le connais avec "
    "confiance, sinon null. Si tu ne connais pas suffisamment bien cette "
    "entreprise pour répondre de façon fiable, renvoie une liste vide "
    "plutôt que de deviner."
)


def discover_competitors(config, company_name, company_website=None):
    queries = [
        f"{company_name} competitors",
        f"{company_name} alternatives",
        f"top {company_name} competitors 2026",
    ]
    all_results = []
    for q in queries:
        try:
            all_results.extend(_duckduckgo_search(q))
        except Exception as e:  # noqa: BLE001 - une requête de recherche ratée ne doit pas tout bloquer
            print(f"[avertissement] recherche échouée pour '{q}' : {e}")

    if all_results:
        context = "\n".join(dict.fromkeys(all_results))  # dédoublonnage en gardant l'ordre
        user = (
            f"Entreprise cible : {company_name}"
            + (f" ({company_website})" if company_website else "")
            + f"\n\nRésultats de recherche bruts :\n{context}"
        )
        system = SYSTEM
    else:
        # La recherche web a échoué (DuckDuckGo bloque fréquemment les IPs
        # des runners GitHub Actions) — on bascule sur les connaissances du
        # modèle, moins fiable, marqué explicitement via "verified": False.
        print("[avertissement] aucun résultat web exploitable — repli sur les connaissances du modèle.")
        user = (
            f"Entreprise cible : {company_name}"
            + (f" ({company_website})" if company_website else "")
        )
        system = FALLBACK_SYSTEM

    raw = groq_complete(config["GROQ_API_KEY"], system, user, temperature=0.2)
    raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise RuntimeError(f"Réponse du modèle illisible (pas du JSON valide) : {raw[:200]}")

    competitors = data.get("competitors", [])
    verified = bool(all_results)
    # Nettoyage minimal : on ne garde pas l'entreprise cible elle-même si le modèle se trompe
    cleaned = [
        {**c, "verified": verified}
        for c in competitors
        if c.get("name") and c["name"].strip().lower() != company_name.strip().lower()
    ]
    return cleaned[:8]


def _normalize_website(website):
    if not website:
        return None
    website = website.strip()
    if not re.match(r"^https?://", website):
        website = f"https://{website}"
    return website


def save_discovered_competitors(db, config, competitors):
    owner = config["USER_ID"]
    existing_names = {c["name"].lower() for c in db.select("competitors", {"user_id": owner})}
    created = []
    for c in competitors:
        if c["name"].lower() in existing_names:
            continue
        row = db.insert("competitors", {
            "user_id": owner,
            "name": c["name"],
            "website": _normalize_website(c.get("website")),
            "monitoring_frequency": "quotidien",
            "status": "actif",
        })
        website = row.get("website")
        if website:
            db.insert("sources", {
                "user_id": owner,
                "competitor_id": row["id"],
                "type": "site_web",
                "url": website,
                "status": "actif",
            }, returning=False)
        row["verified"] = c.get("verified", True)
        created.append(row)
    return created
