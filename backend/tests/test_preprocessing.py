import pytest

from backend.app.services.preprocessing import normalize_text, preprocess_text


def test_replaces_url_money_phone_and_lowercase():
    text = "KLIK https://contoh.com bayar Rp50.000 hubungi 0812-3456-7890"
    result = preprocess_text(text)
    assert "url_token" in result
    assert "money_token" in result
    assert "phone_token" in result
    assert result == result.lower()


def test_empty_message_rejected():
    with pytest.raises(ValueError):
        normalize_text("   ")


def test_extra_spaces_normalized():
    assert normalize_text("Halo     Dunia") == "halo dunia"

