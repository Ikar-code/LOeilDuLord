import time
from contextlib import contextmanager
from datetime import datetime, timezone


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def track(db, config, agent_name, competitor_id=None, source_id=None):
    """Crée une ligne agent_runs au début, la met à jour (succès/erreur,
    durée) à la fin. Utilisé par pipeline.py autour de chaque étape."""
    started = time.time()
    row = db.insert("agent_runs", {
        "user_id": config["OWNER_USER_ID"],
        "agent_name": agent_name,
        "competitor_id": competitor_id,
        "source_id": source_id,
        "status": "running",
        "progress": 0,
    })
    run_id = row["id"] if row else None

    state = {"message": None}
    try:
        yield state
        if run_id:
            db.update("agent_runs", {"id": run_id}, {
                "status": "success",
                "progress": 100,
                "message": state["message"],
                "finished_at": _now_iso(),
                "duration_ms": int((time.time() - started) * 1000),
            })
    except Exception as e:  # noqa: BLE001 - on trace l'erreur puis on la relance
        if run_id:
            db.update("agent_runs", {"id": run_id}, {
                "status": "error",
                "message": str(e)[:500],
                "finished_at": _now_iso(),
                "duration_ms": int((time.time() - started) * 1000),
            })
        raise
