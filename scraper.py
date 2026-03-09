import json
import urllib.request
from xml.etree import ElementTree
from datetime import datetime
import os

JSON_PATH = "updates.json"

# We use Hacker News RSS as a fast, free, and robust real-time proxy for Open Cloud trends
RSS_URLS = [
    ("Sovereign Cloud, Infrastructure", "https://hnrss.org/newest?q=Cloud"),
    ("Kubernetes, Open Source", "https://hnrss.org/newest?q=Kubernetes"),
    ("Open Source AI, LLM", "https://hnrss.org/newest?q=Open+Source+LLM")
]

def fetch_rss(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'OpenCloudBot/1.0'})
    try:
        with urllib.request.urlopen(req) as response:
            return response.read()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def parse_rss(xml_data, category):
    items = []
    try:
        root = ElementTree.fromstring(xml_data)
        # RSS uses channel -> item
        for item in root.findall('./channel/item')[:3]:  # Top 3 latest per category
            title = item.find('title').text if item.find('title') is not None else "Unknown Title"
            # hnrss description sometimes holds HTML, we keep it simple by just extracting the title
            link = item.find('link').text if item.find('link') is not None else "#"
            items.append({
                "title": title,
                "summary": f"Noticias frescas extraídas automáticamente vía RSS de la comunidad tecnológica. Fuente: {link}",
                "category": category
            })
    except Exception as e:
        print(f"Error parsing XML for {category}: {e}")
    return items

def main():
    print(f"Starting auto-update process at {datetime.utcnow().isoformat()}Z...")
    
    live_trends = []
    for category, url in RSS_URLS:
        print(f"Fetching updates for {category}...")
        xml_data = fetch_rss(url)
        if xml_data:
            live_trends.extend(parse_rss(xml_data, category))
            
    # Load existing updates to keep static architecture and models, and append top 6 news
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        # Fallback empty structure
        data = {
            "liveTrends": [],
            "modelDirectory": [],
            "finopsTools": []
        }

    # Replace old live trends conditionally or append. For a heartbeat, let's keep the best or latest 9
    # Keep the initial base trends if they exist, but push the new ones on top
    merged_trends = live_trends[:6] + [t for t in data.get("liveTrends", []) if "Europa" in t.get("summary", "") or "Sovereign" in t.get("title", "")]
    
    data["liveTrends"] = merged_trends[:9] # max 9 trends
    data["lastUpdated"] = f"{datetime.utcnow().isoformat()}Z"

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully updated {JSON_PATH} with {len(live_trends)} new heartbeat items.")

if __name__ == "__main__":
    main()
