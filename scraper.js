const fs = require('fs');
const https = require('https');
const path = require('path');

const JSON_PATH = path.join(__dirname, 'updates.json');

// Diccionario masivo de temas para alcanzar +1500 noticias
const TOPICS = [
    "OpenCloud", "Sovereign Cloud", "Kubernetes", "Docker", "Open Source AI",
    "LLM", "Cybersecurity", "Zero Trust", "DevOps", "FinOps", "Rust Lang",
    "Golang", "Linux Kernel", "WebAssembly", "PostgreSQL", "ReactJS",
    "Machine Learning", "Neural Networks", "Neural Engine", "Quantum Computing",
    "NVIDIA CUDA", "RISC-V", "Digital Sovereignty", "Gaia-X", "Data Privacy",
    "Cloud Native", "Serverless", "Infrastructure as Code", "Terraform",
    "Edge Computing", "5G Open RAN", "Cryptography", "Blockchain tech",
    "Automation", "AI Ethics", "GPU Architecture", "Ubuntu Linux", "Fedora",
    "API Security", "Microservices", "Observability", "Prometheus", "Grafana"
];

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'OpenCloudBot/3.0' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
}

function parseRSS(xml, category) {
    const items = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
        const itemContent = match[1];
        const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemContent.match(/<title>(.*?)<\/title>/);
        const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);

        const title = titleMatch ? titleMatch[1] : "Trend detectado";
        const link = linkMatch ? linkMatch[1] : "#";

        // Importancia base
        const isImportant = title.toLowerCase().includes('eu') || title.toLowerCase().includes('sovereign');
        const isOpenCloud = title.toLowerCase().includes('opencloud') || title.toLowerCase().includes('openclow');

        items.push({
            title: title,
            summary: `Info automatizada de ${category}.`,
            source: link.includes('://') ? new URL(link).hostname.replace('www.', '') : "Intel",
            link: link,
            category: category,
            important: isImportant,
            openCloud: isOpenCloud
        });
    }
    return items;
}

async function main() {
    console.log(`[${new Date().toISOString()}] RECOPILACIÓN MEGA-MASIVA (+1500 ITEMS)...`);

    let allTrends = [];

    // Iteramos por todos los tópicos
    for (const topic of TOPICS) {
        try {
            console.log(`Buscando: ${topic}...`);
            const url = `https://hnrss.org/newest?q=${encodeURIComponent(topic)}&count=50`;
            const xml = await fetchUrl(url);
            const items = parseRSS(xml, topic);
            allTrends = allTrends.concat(items);
        } catch (e) {
            console.warn(`Error en tópico ${topic}:`, e.message);
        }
    }

    let data = { liveTrends: [], lastUpdated: new Date().toISOString() };

    // Persistencia: Cargamos anteriores para no perder el histórico
    if (fs.existsSync(JSON_PATH)) {
        try {
            const old = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
            allTrends = [...allTrends, ...(old.liveTrends || [])];
        } catch (e) { }
    }

    // Deduplicación por Título
    const seen = new Set();
    data.liveTrends = allTrends.filter(item => {
        const val = item.title.toLowerCase().trim();
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
    }).slice(0, 2000); // Límite generoso de 2000 cubos

    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log(`ÉXITO: ${data.liveTrends.length} cubos sincronizados.`);
}

main();
