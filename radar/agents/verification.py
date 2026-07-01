"""Agent VÉRIFICATION.

Rôle : à partir de deux versions d'une source, extraire uniquement le texte
réellement ajouté (pas de résumé, pas d'interprétation) — c'est ce texte,
et seulement lui, qui sera transmis à l'agent de rédaction. Ça limite
structurellement le risque d'hallucination en aval : le LLM ne peut écrire
que sur des extraits qui existent vraiment sur la source.
"""

import difflib

MIN_EXCERPT_CHARS = 40   # en dessous, on considère que ce n'est pas un vrai changement
MAX_EXCERPT_CHARS = 4000


def extract_verified_change(previous_text, new_text):
    if previous_text is None:
        return {"baseline": True, "excerpt": None}

    prev_words = previous_text.split()
    new_words = new_text.split()
    matcher = difflib.SequenceMatcher(a=prev_words, b=new_words, autojunk=False)

    added_chunks = []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag in ("insert", "replace"):
            chunk = " ".join(new_words[j1:j2]).strip()
            if chunk:
                added_chunks.append(chunk)

    excerpt = " […] ".join(added_chunks)[:MAX_EXCERPT_CHARS].strip()

    if len(excerpt) < MIN_EXCERPT_CHARS:
        return {"baseline": False, "excerpt": None}

    return {"baseline": False, "excerpt": excerpt}
