"""Agent PUBLICATION.

Rôle : dernière étape — écrire le rapport validé et son alerte associée en
base. Aucune génération de contenu ici, uniquement de la persistance.
"""


def publish(db, config, competitor, source, report_data, classification, qa):
    owner = config["OWNER_USER_ID"]

    report = db.insert("reports", {
        "user_id": owner,
        "competitor_id": competitor["id"],
        "title": report_data["title"],
        "summary": report_data["summary"],
        "confidence_score": qa["score"],
        "sources_count": 1,
        "facts": report_data.get("facts", []),
        "changes": [classification.get("one_liner", "")],
        "analysis": report_data.get("analysis", ""),
        "recommendations": report_data.get("recommendations", []),
        "status": "publie",
    })

    db.insert("report_sources", {
        "report_id": report["id"],
        "source_id": source["id"],
        "url": source["url"],
    }, returning=False)

    db.insert("alerts", {
        "user_id": owner,
        "report_id": report["id"],
        "competitor_id": competitor["id"],
        "type": classification["type"],
        "priority": classification["priority"],
        "title": report_data["title"],
        "description": classification.get("one_liner", ""),
    }, returning=False)

    return report
