from __future__ import annotations

import re
import unicodedata

try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
except Exception:  # pragma: no cover - optional dependency guard
    StemmerFactory = None
    StopWordRemoverFactory = None


NEGATION_WORDS = {"tidak", "bukan", "jangan", "belum", "tanpa"}
URL_RE = re.compile(r"(https?://\S+|www\.\S+|\b\S+\.(?:com|co\.id|id|net|org|info|biz)\S*)", re.I)
EMAIL_RE = re.compile(r"\b[\w.%+-]+@[\w.-]+\.[a-z]{2,}\b", re.I)
PHONE_RE = re.compile(r"(?<!\w)(?:\+?62|0)[\d\s\-().]{7,}\d(?!\w)")
MONEY_RE = re.compile(r"(?<!\w)(?:rp\.?\s*)?\d[\d.,]*(?:\s*(?:rb|ribu|jt|juta|m|miliar))?(?!\w)", re.I)
NUMBER_RE = re.compile(r"(?<!\w)\d+(?!\w)")
TOKEN_RE = re.compile(r"\b\w+\b", re.U)


def _load_stopwords() -> set[str]:
    if StopWordRemoverFactory is None:
        base = {
            "yang", "dan", "di", "ke", "dari", "ini", "itu", "untuk", "dengan",
            "atau", "pada", "akan", "ada", "karena", "sebagai", "dalam", "kami",
        }
    else:
        base = set(StopWordRemoverFactory().get_stop_words())
    return base - NEGATION_WORDS


STOPWORDS = _load_stopwords()
_STEMMER = StemmerFactory().create_stemmer() if StemmerFactory is not None else None


def normalize_text(text: str) -> str:
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Pesan tidak boleh kosong.")

    value = unicodedata.normalize("NFKC", text).lower()
    value = EMAIL_RE.sub(" email_token ", value)
    value = URL_RE.sub(" url_token ", value)
    value = PHONE_RE.sub(" phone_token ", value)
    value = MONEY_RE.sub(" money_token ", value)
    value = NUMBER_RE.sub(" number_token ", value)
    value = re.sub(r"[^\w\s_]", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def tokenize(text: str) -> list[str]:
    return TOKEN_RE.findall(text)


def preprocess_text(text: str, use_stemming: bool = False) -> str:
    normalized = normalize_text(text)
    tokens = [token for token in tokenize(normalized) if token not in STOPWORDS]
    if use_stemming and _STEMMER is not None:
        tokens = [_STEMMER.stem(token) for token in tokens]
    return " ".join(tokens)

