"""Agent SCRAPING.

Rôle : récupérer le contenu texte d'une source (page web ou flux RSS),
le comparer au dernier snapshot enregistré (par hash), et si le contenu a
changé, enregistrer un nouveau snapshot. Ne fait aucune interprétation —
juste de la collecte brute, pour que l'agent de vérification travaille sur
du texte réellement présent sur la source.
"""

import hashlib
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "RadarBot/1.0 (+veille concurrentielle automatisée)"}
TIMEOUT = 20
MAX_CHARS = 20000


def fetch_text(source):
    if source["type"] == "rss":
        return _fetch_rss(source["url"])
    return _fetch_html(source["url"])


def _fetch_html(url):
    res = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    res.raise_for_status()
    soup = BeautifulSoup(res.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    text = " ".join(soup.get_text(separator=" ").split())
    return text[:MAX_CHARS]


def _fetch_rss(url):
    import feedparser
    feed = feedparser.parse(url)
    parts = []
    for entry in feed.entries[:15]:
        title = entry.get("title", "")
        summary = entry.get("summary", "") or entry.get("description", "")
        parts.append(f"{title} — {summary}")
    return " ".join(parts)[:MAX_CHARS]


def scrape_source(db, source):
    text = fetch_text(source)
    content_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()

    last = db.select("snapshots", {"source_id": source["id"]}, order="fetched_at.desc", limit=1)
    previous_text = last[0]["raw_text"] if last else None
    previous_hash = last[0]["content_hash"] if last else None

    changed = content_hash != previous_hash
    if changed:
        db.insert("snapshots", {
            "source_id": source["id"],
            "content_hash": content_hash,
            "raw_text": text,
        }, returning=False)

    db.update("sources", {"id": source["id"]}, {
        "last_analyzed_at": datetime.now(timezone.utc).isoformat(),
        "status": "actif",
    })

    return {"changed": changed, "new_text": text, "previous_text": previous_text}
