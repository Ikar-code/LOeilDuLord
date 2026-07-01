"""Agent RECHERCHE.

Rôle : garantir que les concurrents et sources définis dans
config/competitors.yaml existent en base (création si absents), et
retourner la liste des sources actives à traiter par le reste du pipeline.
"""


def sync_competitors(db, config, competitors_cfg):
    owner = config["OWNER_USER_ID"]
    existing = {c["name"]: c for c in db.select("competitors", {"user_id": owner})}
    result = []

    for comp_cfg in competitors_cfg:
        comp = existing.get(comp_cfg["name"])
        if not comp:
            comp = db.insert("competitors", {
                "user_id": owner,
                "name": comp_cfg["name"],
                "sector": comp_cfg.get("sector"),
                "website": comp_cfg.get("website"),
                "monitoring_frequency": comp_cfg.get("monitoring_frequency", "quotidien"),
                "status": "actif",
            })

        existing_sources = {s["url"]: s for s in db.select("sources", {"competitor_id": comp["id"]})}
        sources = []
        for src_cfg in comp_cfg.get("sources", []):
            src = existing_sources.get(src_cfg["url"])
            if not src:
                src = db.insert("sources", {
                    "user_id": owner,
                    "competitor_id": comp["id"],
                    "type": src_cfg["type"],
                    "url": src_cfg["url"],
                    "status": "actif",
                })
            if src.get("status") == "actif":
                sources.append(src)

        result.append({"competitor": comp, "sources": sources})

    return result
