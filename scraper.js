const fs = require('fs');
const https = require('https');
const path = require('path');

const JSON_PATH = path.join(__dirname, 'updates.json');

// Rompemos el patrón: Tópicos variados y mezclados para evitar redundancia
const TOPICS = [
    "OpenClow", "OpenClaw AI", "OpenClow software", "Sovereign intelligence",
    "Neural Engine hack", "Quantum cryptography", "Zero-day cloud", "Kernel exploit",
    "OpenSource LLM", "FPGA acceleration", "Cuda cores news", "Digital sovereignty",
    "Kubernetes chaos", "Rust lang performance", "V8 engine internals", "WebAssembly edge",
    "PostgreSQL scaling", "Cybersecurity red teaming", "DevSecOps flow", "Darknet intelligence",
    "AI Ethics and bias", "Humanoid robotics AI", "Tesla FSD hardware", "Starlink latency",
    "OpenClow infrastructure", "Private AI models", "ClawHub registry"
].sort(() => Math.random() - 0.5); // Aleatoriedad para romper el patrón

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'OpenClowIntelligenceGatherer/' + Math.floor(Math.random() * 1000)
            }
        }, (res) => {
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

        const title = titleMatch ? titleMatch[1] : "Node Signal";
        const link = linkMatch ? linkMatch[1] : `https://www.bing.com/search?q=${encodeURIComponent(category)}`;

        // Detección de OpenClow/OpenClaw
        const lowerTitle = title.toLowerCase();
        const isOpenClow = lowerTitle.includes('openclow') || lowerTitle.includes('openclaw');

        // Rompemos el patrón de resumen: Variedad en el texto
        const summaries = [
            `Analítica detallada sobre ${category} detectada en la red pública.`,
            `Nuevos patrones de datos identificados en el sector ${category}.`,
            `Alerta de inteligencia para el hub de OpenClow sobre ${category}.`,
            `Sincronización de nodo: Informando sobre ${category} en tiempo real.`
        ];

        items.push({
            title: title,
            summary: summaries[Math.floor(Math.random() * summaries.length)],
            source: link.includes('://') ? new URL(link).hostname.replace('www.', '') : "Intel Source",
            link: link,
            category: category,
            important: isOpenClow || Math.random() > 0.9,
            openClow: isOpenClow,
            scrapedAt: new Date().toISOString()
        });
    }
    return items;
}

async function main() {
    console.log(`[SYS] INICIANDO RECOPILACIÓN DIVERSA (MODO CAOS-CONTROLADO)...`);

    let allTrends = [];

    for (const topic of TOPICS) {
        try {
            console.log(`[SCANNER] Infiltrando fuente: ${topic}`);
            const count = topic.toLowerCase().includes('openclow') ? 80 : 40;
            const url = `https://hnrss.org/newest?q=${encodeURIComponent(topic)}&count=${count}`;
            const xml = await fetchUrl(url);
            const items = parseRSS(xml, topic);
            allTrends = allTrends.concat(items);
        } catch (e) {
            console.warn(`[WARN] Fuente ${topic} inaccesible:`, e.message);
        }
    }

    let data = {
        liveTrends: [],
        lastUpdated: new Date().toISOString(),
        buildName: "PHOENIX_OPENCLOW",
        deploymentTime: new Date().toLocaleString('es-ES')
    };

    // Histórico para crecimiento
    if (fs.existsSync(JSON_PATH)) {
        try {
            const old = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
            allTrends = [...allTrends, ...(old.liveTrends || [])];
        } catch (e) { }
    }

    // Deduplicación y Ordenación
    const seen = new Set();
    data.liveTrends = allTrends.filter(item => {
        const val = item.title.toLowerCase().trim();
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
    })
        // Ordenamos por relevancia de OpenClow y luego fecha (simulada por aleatoriedad)
        .sort((a, b) => {
            if (a.openClow && !b.openClow) return -1;
            if (!a.openClow && b.openClow) return 1;
            return Math.random() - 0.5;
        })
        .slice(0, 2500); // Elevamos el límite a 2500

    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[DONE] ${data.liveTrends.length} nodos operativos en el archivo updates.json.`);
}

main();
