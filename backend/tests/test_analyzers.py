from backend.app.services.keyword_analyzer import analyze_keywords, spam_indication_for
from backend.app.services.risk_analyzer import determine_risk


def test_keyword_phrase_detection():
    result = analyze_keywords("Klaim hadiah dan klik link sekarang")
    assert "hadiah" in result.all_keywords
    assert "klik link" in result.all_keywords
    assert spam_indication_for(result) == "Indikasi Penipuan"


def test_risk_levels():
    low = analyze_keywords("Besok kita rapat jam lima")
    assert determine_risk("ham", 0.93, low) == "Rendah"
    medium = analyze_keywords("Promo diskon besar khusus hari ini")
    assert determine_risk("spam", 0.72, medium) == "Sedang"
    high = analyze_keywords("Klaim hadiah klik www.test.com transfer ke rekening sekarang")
    assert determine_risk("spam", 0.91, high) == "Tinggi"

