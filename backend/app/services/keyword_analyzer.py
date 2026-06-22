from __future__ import annotations

from dataclasses import dataclass

from backend.app.services.preprocessing import normalize_text


FRAUD_KEYWORDS = [
    "hadiah", "menang", "pemenang", "klaim", "transfer", "rekening", "otp",
    "kode verifikasi", "akun diblokir", "segera bayar", "klik link",
    "verifikasi akun", "pin", "password", "data pribadi",
]
PROMO_KEYWORDS = [
    "promo", "diskon", "cashback", "gratis", "beli", "penawaran", "potongan",
    "voucher", "khusus hari ini", "harga spesial",
]


@dataclass(frozen=True)
class KeywordResult:
    fraud_keywords: list[str]
    promo_keywords: list[str]
    all_keywords: list[str]
    has_url: bool
    has_phone: bool


def _contains_phrase(text: str, phrase: str) -> bool:
    return phrase in text


def analyze_keywords(message: str) -> KeywordResult:
    normalized = normalize_text(message)
    fraud = [kw for kw in FRAUD_KEYWORDS if _contains_phrase(normalized, kw)]
    promo = [kw for kw in PROMO_KEYWORDS if _contains_phrase(normalized, kw)]
    has_url = "url_token" in normalized
    has_phone = "phone_token" in normalized
    all_keywords = list(dict.fromkeys(fraud + promo))
    return KeywordResult(fraud, promo, all_keywords, has_url, has_phone)


def spam_indication_for(result: KeywordResult) -> str:
    if result.fraud_keywords:
        return "Indikasi Penipuan"
    if result.promo_keywords:
        return "Indikasi Promosi"
    return "Spam Umum"

