// Este archivo contiene las correcciones para el algoritmo de distribución

// 1. Actualizar el mapa de categorías para incluir los nuevos nodos
const categoryMap = {
    'unity': 'engines', 'unreal': 'engines', 'godot': 'engines', 'touchdesigner': 'engines', 'processing': 'engines', 'openframeworks': 'engines',
    'p5': 'frameworks', 'three': 'frameworks', 'babylon': 'frameworks', 'tone': 'frameworks', 'nodejs': 'frameworks', 'ml5': 'frameworks', 'hydra': 'frameworks', 'xampp': 'frameworks',
    'comfy': 'ia', 'n8n': 'ia', 'pinokio': 'ia',
    'cursor': 'ides', 'trae': 'ides', 'v0': 'ides', 'windsurf': 'ides', 'visual-studio': 'ides',
    'shadertoy': 'shaders', 'glsl': 'shaders', 'hlsl': 'shaders', 'bookofshaders': 'shaders',
    'firebase': 'db', 'mongodb': 'db', 'sql': 'db',
    'cpp': 'languages', 'php': 'languages', 'javascript': 'languages', 
    'python': 'languages', 'typescript': 'languages', 'java': 'languages', 'csharp': 'languages',
    'html': 'languages', 'css': 'languages', 'json': 'languages', 'r': 'languages', 'arduino': 'languages',
    'react': 'frontend', 'vue': 'frontend', 'svelte': 'frontend', 'angular': 'frontend', 'nextjs': 'frontend',
    'chatgpt': 'llm', 'deepseek': 'llm', 'gemini': 'llm', 'kimi': 'llm', 'claude': 'llm',
    'windows': 'os', 'linux': 'os', 'mac': 'os', 'android': 'os', 'ios': 'os',
    'pantalla-touch': 'soportes', 'instalaciones-fisicas': 'soportes', 'raspberry-pi': 'soportes', 'pantalla-led': 'soportes', 'proyector': 'soportes', 'sitio-web': 'soportes', 'compilado-apk': 'soportes', 'virtual-production': 'soportes', 'vr': 'soportes', 'ar': 'soportes', 'sonido': 'soportes', 'videojuegos': 'soportes',
    'websockets': 'protocolos', 'spout': 'protocolos', 'syphon': 'protocolos', 'ndi': 'protocolos', 'webrtc': 'protocolos', 'osc': 'protocolos', 'api': 'protocolos', 'midi': 'protocolos',
    'resolume': 'software-multimedia', 'blender': 'software-multimedia', 'paquete-adobe': 'software-multimedia', 'obs': 'software-multimedia', 'cinema4d': 'software-multimedia', 'ableton': 'software-multimedia', 'puredata': 'software-multimedia', 'guipper': 'software-multimedia'
};

// 2. Actualizar la lista de categorías
const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages', 'llm', 'frontend', 'os', 'soportes', 'protocolos', 'software-multimedia'];

// 3. Actualizar las distancias de categorías
const CONFIG = {
    // Distancias desde el nodo central a cada categoría
    categoryDistancesMain: {
        'engines': 1200,
        'frameworks': 800,
        'ia': 500,
        'shaders': 1000,
        'db': 800,
        'ides': 1200,
        'languages': 600,
        'llm': 1000,
        'frontend': 500,
        'os': 1000,
        'soportes': 500,
        'protocolos': 700,
        'software-multimedia': 900
    },
    // Distancias desde cada categoría a sus nodos secundarios
    categoryDistances: {
        'engines': 200,
        'frameworks': 200,
        'ia': 150,
        'shaders': 200,
        'db': 200,
        'ides': 200,
        'languages': 200,
        'llm': 200,
        'frontend': 200,
        'os': 200,
        'soportes': 200,
        'protocolos': 200,
        'software-multimedia': 200
    }
};
