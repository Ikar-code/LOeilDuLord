import requests

TIMEOUT = 20


class SupabaseClient:
    """Client REST minimal pour Supabase (PostgREST), utilisé avec la clé
    service_role côté pipeline : ignore RLS par conception, donc chaque
    appel doit explicitement fournir user_id."""

    def __init__(self, url, service_role_key):
        self.base = f"{url}/rest/v1"
        self.headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        }

    def insert(self, table, row, returning=True):
        headers = {**self.headers, "Prefer": "return=representation" if returning else "return=minimal"}
        res = requests.post(f"{self.base}/{table}", json=row, headers=headers, timeout=TIMEOUT)
        res.raise_for_status()
        data = res.json() if returning else None
        return data[0] if returning and data else None

    def update(self, table, match, patch):
        params = {f"{k}": f"eq.{v}" for k, v in match.items()}
        headers = {**self.headers, "Prefer": "return=representation"}
        res = requests.patch(f"{self.base}/{table}", params=params, json=patch, headers=headers, timeout=TIMEOUT)
        res.raise_for_status()
        return res.json()

    def select(self, table, match=None, order=None, limit=None, columns="*"):
        params = {"select": columns}
        if match:
            for k, v in match.items():
                params[k] = f"eq.{v}"
        if order:
            params["order"] = order
        if limit:
            params["limit"] = str(limit)
        res = requests.get(f"{self.base}/{table}", params=params, headers=self.headers, timeout=TIMEOUT)
        res.raise_for_status()
        return res.json()
