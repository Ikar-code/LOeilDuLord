"""Orchestration du pipeline. Multi-utilisateurs : on liste tous les
comptes ayant au moins un concurrent actif, puis pour chacun on exécute la
chaîne complète sur ses propres concurrents/sources :
recherche → scraping → vérification → analyse → rédaction → contrôle qualité → publication.

Chaque étape est tracée dans agent_runs (voir tracking.py) pour alimenter
les pages "Agents IA" et "Historique" du frontend — propre à chaque
utilisateur grâce à user_id + RLS.
"""

from radar.agents import analyse, controle_qualite, publication, recherche, redaction, scraping, verification
from radar.tracking import track


def run_pipeline(db, base_config):
    user_ids = _distinct_users_with_competitors(db)
    if not user_ids:
        print("Aucun utilisateur avec des concurrents actifs — rien à faire.")
        return {"utilisateurs_traites": 0, "utilisateurs_ignores": 0}

    totals = {"utilisateurs_traites": 0, "utilisateurs_ignores": 0}
    for user_id in user_ids:
        config = _resolve_user_config(db, base_config, user_id)
        if not config["GROQ_API_KEY"]:
            print(f"[ignoré] utilisateur {user_id} : aucune clé Groq (ni personnelle, ni partagée).")
            totals["utilisateurs_ignores"] += 1
            continue

        stats = _run_for_user(db, config, user_id)
        print(
            f"[utilisateur {user_id}] sources: {stats['sources_traitees']}, changements: {stats['changements']}, "
            f"rapports publiés: {stats['rapports_publies']}, rejets QA: {stats['rejets_qa']}, "
            f"erreurs: {stats['erreurs']}"
        )
        totals["utilisateurs_traites"] += 1

    return totals


def _distinct_users_with_competitors(db):
    rows = db.select("competitors", {"status": "actif"}, columns="user_id")
    return sorted({r["user_id"] for r in rows})


def _resolve_user_config(db, base_config, user_id):
    config = {**base_config, "OWNER_USER_ID": user_id}
    rows = db.select("settings", {"user_id": user_id}, limit=1)
    if rows:
        config["GROQ_API_KEY"] = rows[0].get("groq_api_key") or config["GROQ_API_KEY"]
        config["GEMINI_API_KEY"] = rows[0].get("gemini_api_key") or config["GEMINI_API_KEY"]
    return config


def _run_for_user(db, config, user_id):
    with track(db, config, "recherche") as state:
        plan = recherche.list_active_competitors(db, user_id)
        state["message"] = f"{len(plan)} concurrent(s) actif(s)."

    stats = {"sources_traitees": 0, "changements": 0, "rapports_publies": 0, "rejets_qa": 0, "erreurs": 0}

    for entry in plan:
        competitor = entry["competitor"]
        for source in entry["sources"]:
            try:
                _process_source(db, config, competitor, source, stats)
            except Exception as e:  # noqa: BLE001 - une source en erreur ne doit pas arrêter les autres
                stats["erreurs"] += 1
                print(f"[ERREUR] {competitor['name']} / {source['url']} : {e}")

    return stats


def _process_source(db, config, competitor, source, stats):
    stats["sources_traitees"] += 1

    with track(db, config, "scraping", competitor["id"], source["id"]) as state:
        scrape_result = scraping.scrape_source(db, source)
        state["message"] = "Changement détecté." if scrape_result["changed"] else "Aucun changement."

    if not scrape_result["changed"]:
        return

    with track(db, config, "verification", competitor["id"], source["id"]) as state:
        verified = verification.extract_verified_change(scrape_result["previous_text"], scrape_result["new_text"])
        state["message"] = "Baseline initiale." if verified["baseline"] else (
            "Extrait vérifié." if verified["excerpt"] else "Changement trop mineur, ignoré."
        )

    if verified["baseline"] or not verified["excerpt"]:
        return  # premier passage sur cette source, ou changement non significatif (ex. typo)

    stats["changements"] += 1
    excerpt = verified["excerpt"]

    with track(db, config, "analyse", competitor["id"], source["id"]) as state:
        classification = analyse.analyse_change(config, competitor["name"], source["type"], excerpt)
        state["message"] = f"{classification['type']} / priorité {classification['priority']}"

    with track(db, config, "redaction", competitor["id"], source["id"]) as state:
        report_data = redaction.write_report(config, competitor["name"], competitor.get("sector"), classification["type"], excerpt)
        state["message"] = report_data["title"]

    with track(db, config, "controle_qualite", competitor["id"], source["id"]) as state:
        qa = controle_qualite.review_report(config, excerpt, report_data)
        state["message"] = f"score {qa['score']}/100" + ("" if qa["passed"] else " — REJETÉ")

    if not qa["passed"]:
        stats["rejets_qa"] += 1
        return

    with track(db, config, "publication", competitor["id"], source["id"]) as state:
        report = publication.publish(db, config, competitor, source, report_data, classification, qa)
        state["message"] = f"Rapport {report['id']} publié."

    stats["rapports_publies"] += 1
