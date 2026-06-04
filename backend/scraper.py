import requests
from bs4 import BeautifulSoup

def fetch_raw_text_from_url(url: str) -> str:
    """
    Verilen URL'deki web sayfasını ziyaret eder ve HTML etiketlerinden 
    arındırılmış ham metni döndürür.
    """
    try:
        # Sitelerin bot olduğumuzu düşünüp engellememesi için standart bir tarayıcı kimliği (User-Agent) kullanıyoruz.
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        # Siteye HTTP GET isteği atıyoruz
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status() 

        # BeautifulSoup ile HTML yapısını parçalıyoruz
        soup = BeautifulSoup(response.content, "html.parser")

        # Gereksiz bölümleri (JavaScript kodları, CSS stilleri, üst/alt menüler) siliyoruz
        for element in soup(["script", "style", "header", "footer", "nav", "aside"]):
            element.extract()

        # Kalan saf metni alıyoruz
        text = soup.get_text(separator=" ", strip=True)
        
        # LLM (Gemini) token sınırlarını aşmamak için metnin ilk 3000 karakterini almamız MVP için yeterlidir
        return text[:3000]

    except Exception as e:
        print(f"Scraping Hatası ({url}): {e}")
        return None