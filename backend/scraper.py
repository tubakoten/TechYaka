import requests
from bs4 import BeautifulSoup
import time

def fetch_raw_text_from_url(url: str) -> str:
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
    }
    for attempt in range(3):
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "html.parser")
            for element in soup(["script", "style", "header", "footer", "nav", "aside"]):
                element.extract()
            text = soup.get_text(separator=" ", strip=True)
            return text[:5000]
        except Exception as e:
            print(f"Deneme {attempt+1} başarısız ({url}): {e}")
            time.sleep(2)
    return None