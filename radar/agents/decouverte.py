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

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; RadarBot/1.0; +veille concurrentielle)"}
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

    if not all_results:
        raise RuntimeError("Aucun résultat de recherche exploitable — impossible d'identifier des concurrents.")

    context = "\n".join(dict.fromkeys(all_results))  # dédoublonnage en gardant l'ordre
    user = (
        f"Entreprise cible : {company_name}"
        + (f" ({company_website})" if company_website else "")
        + f"\n\nRésultats de recherche bruts :\n{context}"
    )

    raw = groq_complete(config["GROQ_API_KEY"], SYSTEM, user, temperature=0.2)
    raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise RuntimeError(f"Réponse du modèle illisible (pas du JSON valide) : {raw[:200]}")

    competitors = data.get("competitors", [])
    # Nettoyage minimal : on ne garde pas l'entreprise cible elle-même si le modèle se trompe
    cleaned = [
        c for c in competitors
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
    owner = config["OWNER_USER_ID"]
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
        created.append(row)
    return created
