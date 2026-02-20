
(function () {
    const fs = require('fs');
    const path = require('path');

    const DATA_FILE = path.join(__dirname, 'public', 'nube_data', 'mapa_herramientas_data.json');
    const SERVER_DATA_FILE = path.join(__dirname, 'data', 'nodes_data.json');

    function getPlaceholderImageUrl(query) {
        const term = encodeURIComponent(query.toLowerCase());
        return `https://loremflickr.com/800/600/${term}`;
    }

    function processFile(filePath) {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }

        console.log(`Processing: ${filePath}`);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const nodes = data.nodes;
        let count = 0;

        for (const id in nodes) {
            const node = nodes[id];
            if (node.type === 'category' && id === 'root') continue;

            const imgUrl = getPlaceholderImageUrl(node.label);
            node.imageUrl = imgUrl;

            if (node.infoHTML && !node.infoHTML.includes('<img')) {
                const imgTag = `<div class="node-image-container" style="margin: 20px 0; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <img src="${imgUrl}" alt="${node.label}" style="width: 100%; height: auto; display: block; object-fit: cover; max-height: 300px;">
                </div>`;

                if (node.infoHTML.includes('</h3>')) {
                    node.infoHTML = node.infoHTML.replace('</h3>', `</h3>${imgTag}`);
                } else {
                    node.infoHTML = imgTag + node.infoHTML;
                }
            }
            count++;
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Updated ${count} nodes in ${filePath}`);
    }

    processFile(DATA_FILE);
    processFile(SERVER_DATA_FILE);
})();
