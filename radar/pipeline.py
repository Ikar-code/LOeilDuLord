"""Orchestration du pipeline : pour chaque concurrent configuré, pour
chaque source active, exécute la chaîne complète
recherche → scraping → vérification → analyse → rédaction → contrôle qualité → publication.

Chaque étape est tracée dans agent_runs (voir tracking.py) pour alimenter
les pages "Agents IA" et "Historique" du frontend.
"""

from radar.agents import analyse, controle_qualite, publication, recherche, redaction, scraping, verification
from radar.tracking import track


def run_pipeline(db, config, competitors_cfg):
    with track(db, config, "recherche") as state:
        plan = recherche.sync_competitors(db, config, competitors_cfg)
        state["message"] = f"{len(plan)} concurrent(s) synchronisé(s)."

    stats = {"sources_traitees": 0, "changements": 0, "rapports_publies": 0, "rejets_qa": 0, "erreurs": 0}

    for entry in plan:
        competitor = entry["competitor"]
        for source in entry["sources"]:
            try:
                _process_source(db, config, competitor, source, stats)
            except Exception as e:  # noqa: BLE001 - une source en erreur ne doit pas arrêter les autres
                stats["erreurs"] += 1
                print(f"[ERREUR] {competitor['name']} / {source['url']} : {e}")

    print(
        f"Terminé — sources: {stats['sources_traitees']}, changements: {stats['changements']}, "
        f"rapports publiés: {stats['rapports_publies']}, rejets QA: {stats['rejets_qa']}, "
        f"erreurs: {stats['erreurs']}"
    )
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
