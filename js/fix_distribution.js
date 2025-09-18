// Este archivo contiene las correcciones para el algoritmo de distribución

// 1. Actualizar el mapa de categorías para incluir los nuevos nodos
const categoryMap = {
    'unity': 'engines', 'unreal': 'engines', 'godot': 'engines', 'touchdesigner': 'engines', 'processing': 'engines',
    'p5': 'frameworks', 'three': 'frameworks', 'babylon': 'frameworks', 'tone': 'frameworks', 'nodejs': 'frameworks', 'websockets': 'frameworks', 'openframeworks': 'frameworks', 'ml5': 'frameworks', 'hydra': 'frameworks',
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
    'pantalla-touch': 'soportes', 'instalaciones-fisicas': 'soportes'
};

// 2. Actualizar la lista de categorías
const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages', 'llm', 'frontend', 'os', 'soportes'];

// 3. Actualizar las distancias de categorías
const CONFIG = {
    categoryDistances: {
        'engines': 600,
        'frameworks': 550,
        'ia': 650,
        'shaders': 500,
        'db': 800,
        'ides': 1000,
        'languages': 1200,
        'llm': 900,
        'frontend': 700,
        'os': 850,
        'soportes': 750
    }
};
