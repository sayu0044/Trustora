from __future__ import annotations

from backend.app.services.keyword_analyzer import KeywordResult


SENSITIVE_TERMS = {"otp", "pin", "password", "transfer", "rekening", "data pribadi", "klaim", "hadiah"}


def determine_risk(raw_label: str, confidence: float, keywords: KeywordResult) -> str:
    sensitive_hits = SENSITIVE_TERMS.intersection(keywords.all_keywords)
    high_signal_count = len(sensitive_hits) + int(keywords.has_url) + int(keywords.has_phone)

    if raw_label == "ham":
        if confidence >= 0.8 and high_signal_count == 0:
            return "Rendah"
        if high_signal_count >= 2:
            return "Sedang"
        return "Rendah"

    if confidence >= 0.85 and high_signal_count >= 2:
        return "Tinggi"
    if high_signal_count >= 3:
        return "Tinggi"
    return "Sedang"


def build_advice(risk_level: str, keywords: KeywordResult) -> list[str]:
    advice = ["Periksa kembali pengirim dan isi pesan sebelum bertindak."]
    if risk_level == "Tinggi" or keywords.has_url or "klik link" in keywords.all_keywords:
        advice.append("Jangan klik tautan yang tidak dikenal.")
    if {"otp", "pin", "password", "data pribadi"}.intersection(keywords.all_keywords):
        advice.append("Jangan membagikan OTP, PIN, password, atau data pribadi.")
    if {"transfer", "rekening"}.intersection(keywords.all_keywords):
        advice.append("Verifikasi permintaan transfer melalui kanal resmi.")
    if risk_level == "Rendah":
        advice.append("Pesan terlihat normal, tetapi tetap waspada terhadap permintaan mendadak.")
    return list(dict.fromkeys(advice))
