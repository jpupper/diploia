// Este archivo contiene las correcciones para el algoritmo de distribución

// 1. Actualizar el mapa de categorías para incluir los nuevos nodos
const categoryMap = {
    'unity': 'engines', 'unreal': 'engines', 'godot': 'engines', 'touchdesigner': 'engines', 'processing': 'engines', 'openframeworks': 'engines',
    'p5': 'frameworks', 'three': 'frameworks', 'babylon': 'frameworks', 'tone': 'frameworks', 'nodejs': 'frameworks', 'websockets': 'frameworks', 'ml5': 'frameworks', 'hydra': 'frameworks', 'xampp': 'frameworks',
    'comfy': 'ia', 'n8n': 'ia', 'pinokio': 'ia',
    'cursor': 'ides', 'trae': 'ides', 'v0': 'ides', 'windsurf': 'ides', 'visual-studio': 'ides',
    'shadertoy': 'shaders', 'glsl': 'shaders', 'hlsl': 'shaders', 'bookofshaders': 'shaders',
    'firebase': 'db', 'mongodb': 'db', 'sql': 'db',
    'cpp': 'languages', 'php': 'languages', 'javascript': 'languages', 
    'python': 'languages', 'typescript': 'languages', 'java': 'languages', 'csharp': 'languages',
    'html': 'languages', 'css': 'languages', 'json': 'languages', 'r': 'languages', 'arduino': 'languages',
    'react': 'frontend', 'vue': 'frontend', 'svelte': 'frontend',
    'chatgpt': 'llm', 'deepseek': 'llm', 'gemini': 'llm', 'kimi': 'llm', 'claude': 'llm',
    'windows': 'os', 'linux': 'os', 'mac': 'os', 'android': 'os', 'ios': 'os',
    'pantalla-touch': 'soportes', 'instalaciones-fisicas': 'soportes', 'raspberry-pi': 'soportes', 'pantalla-led': 'soportes', 'proyector': 'soportes', 'sitio-web': 'soportes', 'compilado-apk': 'soportes'
};

// 2. Actualizar la lista de categorías
const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages', 'llm', 'frontend', 'os', 'soportes'];

// 3. Actualizar las distancias de categorías
const CONFIG = {
    // Distancias desde el nodo central a cada categoría
    categoryDistancesMain: {
        'engines': 300,
        'frameworks': 300,
        'ia': 300,
        'shaders': 300,
        'db': 300,
        'ides': 300,
        'languages': 300,
        'llm': 300,
        'frontend': 300,
        'os': 300,
        'soportes': 300
    },
    // Distancias desde cada categoría a sus nodos secundarios
    categoryDistances: {
        'engines': 1200,
        'frameworks': 550,
        'ia': 900,
        'shaders': 500,
        'db': 800,
        'ides': 500,
        'languages': 1500,
        'llm': 900,
        'frontend': 700,
        'os': 850,
        'soportes': 1500
    }
};
