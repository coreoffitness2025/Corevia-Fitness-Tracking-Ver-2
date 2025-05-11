import requests
from bs4 import BeautifulSoup

def scrape_news():
    url = "https://news.naver.com/"
    
    try:
        # 웹 페이지 요청
        response = requests.get(url)
        response.raise_for_status()  # HTTP 오류 확인
        
        # HTML 파싱
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 뉴스 헤드라인 추출
        headlines = soup.select('.cjs_t')
        
        print("\n=== 네이버 뉴스 헤드라인 ===")
        for idx, headline in enumerate(headlines[:10], 1):
            print(f"{idx}. {headline.text.strip()}")
            
    except requests.exceptions.RequestException as e:
        print(f"웹 페이지 요청 중 오류가 발생했습니다: {e}")
    except Exception as e:
        print(f"스크래핑 중 오류가 발생했습니다: {e}")

if __name__ == "__main__":
    scrape_news() 