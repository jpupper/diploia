// Variables globales de configuración
const CONFIG = {
    rootNodeSize: 100,          // Tamaño para el nodo raíz
    primaryNodeSize: 80,        // Tamaño para categorías
    secondaryNodeSize: 60,      // Tamaño para nodos secundarios
    nodeFontSize: 14,           // Tamaño de fuente para nodos normales
    categoryFontSize: 18,       // Tamaño de fuente para categorías
    rootFontSize: 20,           // Tamaño de fuente para el nodo raíz
    secondaryNodeDist: 100,      // Distancia entre nodos secundarios
    primaryDistance: 200,       // Distancia de nodo central a categorías principales
    categoryDistancesMain: {     // Distancias personalizadas para cada categoría al nodo central
        'engines': 1200,          // Distancia de Motores Gráficos al nodo central
        'frameworks': 800,       // Distancia de Frameworks Web al nodo central
        'ia': 500,              // Distancia de Herramientas IA al nodo central
        'shaders': 1000,         // Distancia de Shaders al nodo central
        'db': 800,              // Distancia de Bases de Datos al nodo central
        'ides': 1200,            // Distancia de IDEs al nodo central
        'languages': 600,       // Distancia de Lenguajes de Programación al nodo central
        'llm': 1000,             // Distancia de LLM Models al nodo central
        'frontend': 500,        // Distancia de frameworks frontend al nodo central
        'os': 1000,              // Distancia de Sistemas Operativos al nodo central
        'soportes': 650,        // Distancia de Soportes al nodo central
        'protocolos': 1200,      // Distancia de Protocolos de Comunicación al nodo central
        'software-multimedia': 900 // Distancia de Software Multimediales al nodo central
    },
    categoryDistances: {         // Distancias personalizadas para cada categoríaf
        'engines': 200,         // Distancia de Motores Gráficos a sus herramientas
        'frameworks': 200,       // Distancia de Frameworks Web a sus herramientas
        'ia': 150,              // Distancia de Herramientas IA a sus herramientas
        'shaders': 200,         // Distancia de Shaders a sus herramientas
        'db': 200,              // Distancia de Bases de Datos a sus herramientas
        'ides': 200,           // Distancia de IDEs a sus herramientas
        'languages': 200,      // Distancia de Lenguajes de Programación a sus herramientas
        'llm': 200,             // Distancia de LLM Models a sus herramientas
        'frontend': 200,        // Distancia de frameworks frontend a sus herramientas
        'os': 200,              // Distancia de Sistemas Operativos a sus elementos
        'soportes': 200,        // Distancia de Soportes a sus elementos
        'protocolos': 200,      // Distancia de Protocolos de Comunicación a sus elementos
        'software-multimedia': 200 // Distancia de Software Multimediales a sus elementos
    }
};

// Descripciones de los nodos para mostrar en hover
const NODE_INFO = {
    'unity': 'Motor de juegos multiplataforma con potentes capacidades gráficas y físicas. No es open source (software propietario, de pago con versión gratuita limitada). Se usa para desarrollo de videojuegos, visualizaciones 3D, realidad virtual y aumentada.',
    'unreal': 'Motor de juegos de alta fidelidad visual, ideal para proyectos AAA y experiencias inmersivas. Parcialmente open source (código fuente disponible, pero con licencia comercial). Se usa para videojuegos de alta calidad, cine virtual, arquitectura y visualización.',
    'godot': 'Motor de juegos con soporte para 2D y 3D, ideal para desarrolladores independientes. Open source (MIT). Se usa para videojuegos independientes, prototipado rápido, proyectos educativos.',
    'touchdesigner': 'Plataforma de desarrollo visual para contenido interactivo en tiempo real. No es open source (software propietario, de pago con versión no comercial). Se usa para arte digital, instalaciones interactivas, visuales en vivo, mapping.',
    'processing': 'Entorno de desarrollo y lenguaje de programación enfocado en artes visuales. Open source (LGPL/GPL). Se usa para arte generativo, visualización de datos, prototipado, educación.',
    'openframeworks': 'Framework C++ para programación creativa y arte interactivo. Open source (MIT). Se usa para instalaciones interactivas, arte digital, visuales en tiempo real.',
    'csharp': 'Lenguaje de programación orientado a objetos desarrollado por Microsoft. Open source (.NET es MIT). Se usa para desarrollo de aplicaciones Windows, Unity, servicios web.',
    'nodejs': 'Entorno de ejecución de JavaScript del lado del servidor. Open source (MIT). Se usa para servidores web, APIs, aplicaciones en tiempo real, microservicios.',
    'websockets': 'Protocolo de comunicación bidireccional en tiempo real sobre TCP. Estándar abierto. Se usa para chats, juegos multijugador, actualizaciones en tiempo real, dashboards.',
    'react': 'Biblioteca de JavaScript para construir interfaces de usuario interactivas. Open source (MIT). Se usa para aplicaciones web, interfaces de usuario, SPAs.',
    'vue': 'Framework progresivo para construir interfaces de usuario. Open source (MIT). Se usa para aplicaciones web, interfaces de usuario, integración progresiva.',
    'svelte': 'Framework que compila código en JavaScript optimizado en tiempo de compilación. Open source (MIT). Se usa para aplicaciones web ligeras, componentes interactivos, visualizaciones.',
    'chatgpt': 'Modelo de lenguaje de OpenAI para conversaciones y generación de texto. No es open source (servicio de pago con API). Se usa para asistentes virtuales, generación de contenido, respuesta a preguntas.',
    'deepseek': 'Modelo de lenguaje con capacidades avanzadas de razonamiento. Open source. Se usa para generación de código, asistencia en programación, razonamiento lógico.',
    'gemini': 'Modelo multimodal de Google que procesa texto, imágenes y otros formatos. No es open source (servicio de pago con versión gratuita). Se usa para asistentes virtuales, análisis multimodal, generación de contenido.',
    'kimi': 'Asistente de IA con capacidades de razonamiento y generación creativa. No es open source (servicio de pago). Se usa para asistencia creativa, generación de contenido, respuesta a consultas.',
    'claude': 'Modelo de lenguaje de Anthropic diseñado para ser útil e inofensivo. No es open source (servicio de pago con versión gratuita). Se usa para asistencia virtual, generación de texto, análisis de documentos.',
    'pinokio': 'Asistente de IA enfocado en automatización y ejecución de tareas. Open source. Se usa para automatización de flujos de trabajo, ejecución de scripts, integración de sistemas.',
    'p5': 'Biblioteca JavaScript para programación creativa con enfoque en artes visuales. Open source (LGPL). Se usa para arte generativo, visualizaciones interactivas, educación en programación.',
    'three': 'Biblioteca JavaScript para crear y mostrar gráficos 3D en navegadores. Open source (MIT). Se usa para visualizaciones 3D web, juegos en navegador, experiencias interactivas.',
    'babylon': 'Framework de JavaScript para crear juegos y experiencias 3D web. Open source (Apache 2.0). Se usa para juegos web, visualizaciones 3D, realidad virtual en navegador.',
    'tone': 'Framework de audio web para crear experiencias musicales interactivas. Open source (MIT). Se usa para música web, sintetizadores, instrumentos virtuales, arte sonoro.',
    'ml5': 'Biblioteca de aprendizaje automático para web basada en TensorFlow.js. Open source (MIT). Se usa para proyectos de IA accesibles, arte generativo, experimentos de aprendizaje automático en navegador.',
    'hydra': 'Plataforma de livecoding para síntesis visual en tiempo real. Open source (GPL). Se usa para performances audiovisuales, livecoding, arte generativo, visuales en vivo.',
    'comfy': 'Interfaz gráfica para flujos de trabajo de IA generativa. Open source (GPL), pero algunos modelos requieren pago. Se usa para generación de imágenes, edición con IA, flujos de trabajo visuales.',
    'n8n': 'Plataforma de automatización de flujos de trabajo con integración de IA. Open source (Apache 2.0), con versión cloud de pago. Se usa para automatización de procesos, integración de servicios, workflows.',
    'cursor': 'Editor de código con asistencia de IA integrada. No es open source (servicio de pago con versión gratuita). Se usa para desarrollo de software, programación asistida por IA.',
    'visual-studio': 'Entorno de desarrollo integrado completo. No es open source (producto de Microsoft con versión Community gratuita). Se usa para desarrollo de aplicaciones en múltiples lenguajes, especialmente .NET.',
    'trae': 'Asistente de programación basado en IA para desarrollo. No es open source (servicio de pago). Se usa para desarrollo de software, programación asistida por IA.',
    'v0': 'Herramienta de generación de interfaces con IA. No es open source (servicio de pago con versión gratuita limitada). Se usa para diseño de interfaces, prototipado, generación de código frontend.',
    'windsurf': 'Plataforma de desarrollo con asistencia de IA. No es open source (servicio de pago con versión gratuita limitada). Se usa para desarrollo de software, programación asistida por IA.',
    'shadertoy': 'Plataforma web para crear y compartir shaders en tiempo real. No es open source (plataforma propietaria), pero los shaders son públicos. Se usa para programación de shaders, efectos visuales, demostraciones gráficas.',
    'glsl': 'Lenguaje de sombreado para gráficos OpenGL. Estándar abierto. Se usa para programación de shaders, efectos visuales, gráficos 3D.',
    'hlsl': 'Lenguaje de sombreado de alto nivel para DirectX. No es open source (propiedad de Microsoft). Se usa para desarrollo de videojuegos, efectos visuales, gráficos 3D.',
    'bookofshaders': 'Guía paso a paso para aprender programación de shaders. Open source (contenido abierto, CC). Se usa para educación, aprendizaje de shaders, programación gráfica.',
    'firebase': 'Plataforma de desarrollo con base de datos en tiempo real. No es open source (servicio de pago con nivel gratuito). Se usa para aplicaciones web y móviles, autenticación, almacenamiento en la nube.',
    'mongodb': 'Base de datos NoSQL orientada a documentos. Licencia dual (SSPL/comercial). Se usa para aplicaciones web, almacenamiento de datos no estructurados, APIs.',
    'sql': 'Lenguaje estándar para gestionar bases de datos relacionales. Estándar abierto. Se usa para sistemas de gestión de datos, aplicaciones empresariales, análisis.',
    'cpp': 'Lenguaje de programación de propósito general con control de bajo nivel. Estándar abierto. Se usa para desarrollo de sistemas, videojuegos, aplicaciones de alto rendimiento.',
    'php': 'Lenguaje de programación para desarrollo web del lado del servidor. Open source (PHP License). Se usa para desarrollo web, CMS, aplicaciones de servidor.',
    'javascript': 'Lenguaje de programación interpretado para desarrollo web. Estándar abierto (ECMA). Se usa para desarrollo web frontend, aplicaciones interactivas, servidores Node.js.',
    'python': 'Lenguaje de programación de alto nivel con sintaxis clara. Open source (PSF License). Se usa para ciencia de datos, IA, automatización, desarrollo web.',
    'r': 'Lenguaje de programación especializado en estadística y visualización de datos. Open source (GPL). Se usa para análisis estadístico, ciencia de datos, visualización, investigación.',
    'arduino': 'Plataforma de hardware y software para prototipado electrónico. Open source. Se usa para proyectos DIY, robótica, arte interactivo, Internet de las Cosas.',
    'typescript': 'Superconjunto de JavaScript con tipado estático opcional. Open source (Apache 2.0). Se usa para desarrollo web frontend, aplicaciones empresariales, proyectos grandes.',
    'java': 'Lenguaje de programación orientado a objetos y portable. Parcialmente open source (OpenJDK). Se usa para aplicaciones empresariales, Android, sistemas distribuidos.',
    'html': 'Lenguaje de marcado para estructurar contenido web. Estándar abierto (W3C). Se usa para desarrollo web, estructura de páginas, documentos web.',
    'css': 'Lenguaje de hojas de estilo para diseño web. Estándar abierto (W3C). Se usa para diseño web, interfaces de usuario, animaciones.',
    'json': 'Formato ligero de intercambio de datos. Estándar abierto. Se usa para APIs, configuraciones, almacenamiento de datos estructurados.',
    'windows': 'Sistema operativo de Microsoft para computadoras personales. No es open source (producto comercial). Se usa para entornos de escritorio, juegos, desarrollo de software.',
    'linux': 'Sistema operativo de código abierto basado en Unix. Open source (GPL y otras). Se usa para servidores, desarrollo, sistemas embebidos, supercomputación.',
    'mac': 'Sistema operativo de Apple para computadoras Mac. No es open source (producto comercial). Se usa para diseño gráfico, desarrollo, producción multimedia.',
    'android': 'Sistema operativo móvil basado en Linux desarrollado por Google. Parcialmente open source (Apache 2.0). Android admite .apk que no sean de origen del Google Play si habilitamos los permisos, pero para comercializar oficialmente una aplicación se requiere subirla al Google Play. Se usa en dispositivos móviles, pantallas y otros dispositivos electrónicos.',
    'ios': 'Sistema operativo móvil de Apple para iPhone y iPad. No es open source (producto comercial). Para correr y compilar una aplicación en iOS se requiere una cuenta PAGA de iOS developer, subir la aplicación y pasar por una frustrante burocracia de aplicaciones, es la plataforma para desarrollar más complicada. Se usa en dispositivos móviles de Apple.',
    'pantalla-touch': 'Interfaz de entrada basada en contacto directo con la pantalla. Existen 2 tipos de pantallas touch, los marcos touch con salida HDMI o los dispositivos touch KIOSK que vienen con un android incluido, los dispositivos KIOSK admiten compilados de .apk o se puede acceder a travez de una red local. Se usa en dispositivos móviles, quioscos interactivos, instalaciones artísticas.',
    'instalaciones-fisicas': 'Espacios físicos con componentes electrónicos interactivos. Se usa para arte interactivo, museos, exposiciones, eventos.',
    'raspberry-pi': 'Computadora de placa única de bajo costo y tamaño reducido. Open source (hardware). Se usa para proyectos DIY, instalaciones interactivas, Internet de las Cosas, educación.',
    'pantalla-led': 'Dispositivo de visualización basado en diodos emisores de luz. Se usa para instalaciones artísticas, señalización digital, escenografías, mapping.',
    'proyector': 'Dispositivo óptico que proyecta imágenes en una superficie. Se usa para videomapping, instalaciones inmersivas, proyecciones arquitectónicas, arte digital.',
    'sitio-web': 'Conjunto de páginas web interconectadas accesibles a través de internet. Se usa para portfolios digitales, documentación de proyectos, galerías virtuales, arte web.',
    'compilado-apk': 'Archivo de aplicación empaquetado para el sistema operativo Android. Se usa para distribuir aplicaciones móviles, instalaciones interactivas en dispositivos KIOSK, experiencias inmersivas.',
    'xampp': 'Paquete de software libre que incluye el servidor web Apache, la base de datos MySQL/MariaDB y los intérpretes para scripts PHP y Perl. Se usa para desarrollo web local, pruebas de aplicaciones, entornos de desarrollo.',
    'spout': 'Protocolo de intercambio de texturas en tiempo real para Windows. Open source (BSD). Se usa para compartir texturas entre aplicaciones en tiempo real, VJ, instalaciones interactivas.',
    'syphon': 'Protocolo de intercambio de texturas en tiempo real para macOS. Open source (MIT). Se usa para compartir texturas entre aplicaciones en tiempo real, VJ, instalaciones interactivas.',
    'ndi': 'Protocolo de vídeo en red de NewTek. Parcialmente open source. Se usa para transmisión de vídeo de alta calidad por red, producción en vivo, instalaciones interactivas.',
    'webrtc': 'Tecnología web para comunicación en tiempo real. Open source. Se usa para videollamadas, transmisión de datos peer-to-peer, aplicaciones colaborativas.',
    'osc': 'Protocolo de comunicación para instrumentos musicales y multimedia. Open source. Se usa para control de software multimedia, mapeo de datos, instalaciones interactivas.',
    'resolume': 'Software para mezcla de vídeo en tiempo real y mapping. No es open source (software comercial). Se usa para VJ, mapping arquitectónico, instalaciones audiovisuales, eventos en vivo.',
    'blender': 'Software de modelado 3D, animación, composición y renderizado. Open source (GPL). Se usa para modelado 3D, animación, efectos visuales, videojuegos.',
    'paquete-adobe': 'Conjunto de aplicaciones para diseño gráfico, edición de video y desarrollo web. No es open source (software comercial). Incluye After Effects, Premiere, Photoshop, Illustrator, XD, entre otros. Se usa para diseño gráfico, edición de video, animación, desarrollo web.',
    'obs': 'Software para grabación y transmisión de video en vivo. Open source (GPL). Se usa para streaming, grabación de pantalla, producción de video en vivo.',
    'cinema4d': 'Software de modelado 3D, animación y renderizado. No es open source (software comercial). Se usa para modelado 3D, animación, efectos visuales, diseño gráfico.',
    'angular': 'Framework de JavaScript para desarrollo de aplicaciones web. Open source (MIT). Se usa para aplicaciones web empresariales, SPAs, aplicaciones móviles híbridas.',
    'nextjs': 'Framework de React para aplicaciones web con renderizado del lado del servidor. Open source (MIT). Se usa para sitios web con alto rendimiento SEO, aplicaciones web, e-commerce.',
    'virtual-production': 'Técnica que combina filmación en vivo con entornos virtuales en tiempo real, especialmente utilizando Unreal Engine como plataforma principal. Se usa para producción cinematográfica, televisión, eventos en vivo, instalaciones artísticas y creación de contenido digital avanzado.',
    'vr': 'Tecnología que permite la inmersión en entornos virtuales mediante dispositivos como Oculus Quest, HTC Vive, Valve Index y otros visores. Se usa para videojuegos inmersivos, entrenamiento, educación, arte interactivo.',
    'ar': 'Tecnología que superpone elementos virtuales en el mundo real. Se usa principalmente en dispositivos móviles Android e iOS para aplicaciones interactivas, educación, marketing, navegación y experiencias artísticas.',
    'api': 'Interfaz de Programación de Aplicaciones. Conjunto de reglas y protocolos que permiten la comunicación entre diferentes aplicaciones de software. Se usa para integración de servicios, acceso a datos externos, automatización de procesos.',
    'midi': 'Protocolo estándar para la comunicación entre instrumentos musicales electrónicos y computadoras. Se usa para composición musical, control de sintetizadores, automatización de audio, instalaciones interactivas.',
    'sonido': 'Medio de expresión artística y comunicación basado en ondas acústicas. Se usa en instalaciones sonoras, música generativa, arte interactivo, diseño de experiencias inmersivas.',
    'videojuegos': 'Medio interactivo que combina narrativa, arte visual y programación. Se usa para entretenimiento, educación, arte interactivo, simulaciones, experiencias inmersivas.',
    'ableton': 'Software de producción musical y actuación en vivo. No es open source (software comercial). Se usa para producción musical, actuaciones en vivo, instalaciones sonoras, arte interactivo.',
    'puredata': 'Entorno de programación visual para audio, video y procesamiento gráfico. Open source (BSD). Se usa para arte sonoro, instalaciones interactivas, procesamiento de señales en tiempo real, música generativa.',
    'guipper': 'Software de programación visual para la creación de gráficos generativos en tiempo real. Open source. Se usa para visuales en vivo, VJ, instalaciones interactivas, arte generativo.'
};

// Función para inicializar el mapa
function initMap() {
    // Aquí puedes poner código de inicialización adicional si es necesario
}

document.addEventListener('DOMContentLoaded', function() {
    // Verificar parámetro de fullscreen en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const autoFullscreen = urlParams.get('fullscreen') === 'true';
    
    // Inicializar Cytoscape
    var cy = cytoscape({
        container: document.getElementById('cy'),
        elements: [
            // Nodos principales
            { data: { id: 'root', label: 'Arte Generativo y Código con IA', type: 'category' } },
            { data: { id: 'engines', label: 'Motores Gráficos', type: 'category' } },
            { data: { id: 'frameworks', label: 'Frameworks Web', type: 'category' } },
            { data: { id: 'ia', label: 'Herramientas IA', type: 'category' } },
            { data: { id: 'shaders', label: 'Shaders', type: 'category' } },
            { data: { id: 'db', label: 'Bases de Datos', type: 'category' } },
            { data: { id: 'ides', label: 'IDEs', type: 'category' } },
            { data: { id: 'languages', label: 'Lenguajes de Programación', type: 'category' } },
            { data: { id: 'llm', label: 'LLM Models', type: 'category' } },
            { data: { id: 'frontend', label: 'Frontend Frameworks', type: 'category' } },
            { data: { id: 'os', label: 'Sistemas Operativos', type: 'category' } },
            { data: { id: 'soportes', label: 'Soportes', type: 'category' } },
            { data: { id: 'protocolos', label: 'Protocolos de Comunicación', type: 'category' } },
            { data: { id: 'software-multimedia', label: 'Software Multimediales', type: 'category' } },
            
            // Motores Gráficos
            { data: { id: 'unity', label: 'Unity', url: 'https://unity.com/' } },
            { data: { id: 'unreal', label: 'Unreal Engine', url: 'https://www.unrealengine.com/' } },
            { data: { id: 'godot', label: 'Godot', url: 'https://godotengine.org/' } },
            { data: { id: 'touchdesigner', label: 'TouchDesigner', url: 'https://derivative.ca/' } },
            { data: { id: 'processing', label: 'Processing', url: 'https://processing.org/' } },
            
            // Frameworks Web
            { data: { id: 'p5', label: 'P5.js', url: 'https://p5js.org/es/' } },
            { data: { id: 'three', label: 'Three.js', url: 'https://threejs.org/docs/' } },
            { data: { id: 'babylon', label: 'Babylon.js', url: 'https://www.babylonjs.com/' } },
            { data: { id: 'tone', label: 'Tone.js', url: 'https://tonejs.github.io/' } },
            { data: { id: 'nodejs', label: 'Node.js', url: 'https://nodejs.org/' } },
            { data: { id: 'openframeworks', label: 'OpenFrameworks', url: 'https://openframeworks.cc/' } },
            { data: { id: 'ml5', label: 'ML5.js', url: 'https://ml5js.org/' } },
            { data: { id: 'hydra', label: 'Hydra', url: 'https://hydra.ojack.xyz/' } },
            { data: { id: 'xampp', label: 'XAMPP', url: 'https://www.apachefriends.org/' } },
            
            // Herramientas IA
            { data: { id: 'comfy', label: 'ComfyUI', url: 'https://github.com/comfyanonymous/ComfyUI' } },
            { data: { id: 'n8n', label: 'n8n', url: 'https://n8n.io/' } },
            { data: { id: 'pinokio', label: 'Pinokio', url: 'https://pinokio.computer/' } },
            
            // IDEs
            { data: { id: 'cursor', label: 'Cursor', url: 'https://cursor.sh/' } },
            { data: { id: 'trae', label: 'Trae AI', url: 'https://www.trae.ai/' } },
            { data: { id: 'v0', label: 'v0.dev', url: 'https://v0.dev/' } },
            { data: { id: 'windsurf', label: 'Windsurf', url: 'https://www.windsurf.io/' } },
            { data: { id: 'visual-studio', label: 'Visual Studio', url: 'https://visualstudio.microsoft.com/' } },
            
            // Shaders
            { data: { id: 'shadertoy', label: 'Shadertoy', url: 'https://www.shadertoy.com/' } },
            { data: { id: 'glsl', label: 'GLSL', url: 'https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)' } },
            { data: { id: 'hlsl', label: 'HLSL', url: 'https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl' } },
            { data: { id: 'bookofshaders', label: 'Book of Shaders', url: 'https://thebookofshaders.com/?lan=es' } },
            
            // Bases de Datos
            { data: { id: 'firebase', label: 'Firebase', url: 'https://firebase.google.com/' } },
            { data: { id: 'mongodb', label: 'MongoDB', url: 'https://www.mongodb.com/' } },
            { data: { id: 'sql', label: 'SQL', url: 'https://www.w3schools.com/sql/' } },
            
            // Lenguajes de Programación
            { data: { id: 'cpp', label: 'C++', url: 'https://isocpp.org/' } },
            { data: { id: 'csharp', label: 'C#', url: 'https://docs.microsoft.com/en-us/dotnet/csharp/' } },
            { data: { id: 'php', label: 'PHP', url: 'https://www.php.net/' } },
            { data: { id: 'javascript', label: 'JavaScript', url: 'https://developer.mozilla.org/es/docs/Web/JavaScript' } },
            { data: { id: 'python', label: 'Python', url: 'https://www.python.org/' } },
            { data: { id: 'typescript', label: 'TypeScript', url: 'https://www.typescriptlang.org/' } },
            { data: { id: 'java', label: 'Java', url: 'https://www.java.com/' } },
            { data: { id: 'html', label: 'HTML', url: 'https://developer.mozilla.org/es/docs/Web/HTML' } },
            { data: { id: 'css', label: 'CSS', url: 'https://developer.mozilla.org/es/docs/Web/CSS' } },
            { data: { id: 'json', label: 'JSON', url: 'https://www.json.org/' } },
            { data: { id: 'r', label: 'R', url: 'https://www.r-project.org/' } },
            { data: { id: 'arduino', label: 'Arduino', url: 'https://www.arduino.cc/' } },
            
            // Frontend Frameworks
            { data: { id: 'react', label: 'React', url: 'https://reactjs.org/' } },
            { data: { id: 'vue', label: 'Vue.js', url: 'https://vuejs.org/' } },
            { data: { id: 'svelte', label: 'Svelte', url: 'https://svelte.dev/' } },
            { data: { id: 'angular', label: 'Angular', url: 'https://angular.io/' } },
            { data: { id: 'nextjs', label: 'Next.js', url: 'https://nextjs.org/' } },
            
            
            // LLM Models
            { data: { id: 'chatgpt', label: 'ChatGPT', url: 'https://openai.com/chatgpt' } },
            { data: { id: 'deepseek', label: 'Deepseek', url: 'https://deepseek.ai/' } },
            { data: { id: 'gemini', label: 'Gemini', url: 'https://deepmind.google/technologies/gemini/' } },
            { data: { id: 'kimi', label: 'Kimi', url: 'https://kimi.moonshot.cn/' } },
            { data: { id: 'claude', label: 'Claude', url: 'https://www.anthropic.com/claude' } },
            
            // Sistemas Operativos
            { data: { id: 'windows', label: 'Windows', url: 'https://www.microsoft.com/windows' } },
            { data: { id: 'linux', label: 'Linux', url: 'https://www.linux.org/' } },
            { data: { id: 'mac', label: 'macOS', url: 'https://www.apple.com/macos' } },
            { data: { id: 'android', label: 'Android', url: 'https://www.android.com/' } },
            { data: { id: 'ios', label: 'iOS', url: 'https://www.apple.com/ios' } },
            
            // Soportes
            { data: { id: 'pantalla-touch', label: 'Pantalla Touch', url: '#' } },
            { data: { id: 'instalaciones-fisicas', label: 'Instalaciones Físicas', url: '#' } },
            { data: { id: 'raspberry-pi', label: 'Raspberry Pi', url: 'https://www.raspberrypi.org/' } },
            { data: { id: 'pantalla-led', label: 'Pantalla LED', url: '#' } },
            { data: { id: 'proyector', label: 'Proyector', url: '#' } },
            { data: { id: 'sitio-web', label: 'Sitio Web', url: '#' } },
            { data: { id: 'compilado-apk', label: 'Compilado .apk', url: '#' } },
            { data: { id: 'virtual-production', label: 'Virtual Production', url: '#' } },
            { data: { id: 'vr', label: 'VR', url: '#' } },
            { data: { id: 'ar', label: 'AR', url: '#' } },
            { data: { id: 'sonido', label: 'Sonido', url: '#' } },
            { data: { id: 'videojuegos', label: 'Videojuegos', url: '#' } },

            // Protocolos de Comunicación
            { data: { id: 'websockets', label: 'WebSockets', url: 'https://developer.mozilla.org/es/docs/Web/API/WebSockets_API' } },
            { data: { id: 'spout', label: 'Spout', url: 'https://spout.zeal.co/' } },
            { data: { id: 'syphon', label: 'Syphon', url: 'http://syphon.v002.info/' } },
            { data: { id: 'ndi', label: 'NDI', url: 'https://www.ndi.tv/' } },
            { data: { id: 'webrtc', label: 'WebRTC', url: 'https://webrtc.org/' } },
            { data: { id: 'osc', label: 'OSC', url: 'https://opensoundcontrol.stanford.edu/' } },
            { data: { id: 'api', label: 'API', url: 'https://developer.mozilla.org/es/docs/Glossary/API' } },
            { data: { id: 'midi', label: 'MIDI', url: 'https://www.midi.org/' } },

            // Software Multimediales
            { data: { id: 'resolume', label: 'Resolume', url: 'https://resolume.com/' } },
            { data: { id: 'blender', label: 'Blender', url: 'https://www.blender.org/' } },
            { data: { id: 'paquete-adobe', label: 'Paquete Adobe', url: 'https://www.adobe.com/' } },
            { data: { id: 'obs', label: 'OBS', url: 'https://obsproject.com/' } },
            { data: { id: 'cinema4d', label: 'Cinema 4D', url: 'https://www.maxon.net/cinema-4d' } },
            { data: { id: 'ableton', label: 'Ableton Live', url: 'https://www.ableton.com/' } },
            { data: { id: 'puredata', label: 'Pure Data', url: 'https://puredata.info/' } },
            { data: { id: 'guipper', label: 'Guipper', url: 'https://jeyder.com.ar/guipper/' } },
            
            // Conexiones principales con el nodo raíz
            { data: { id: 'root-engines', source: 'root', target: 'engines' } },
            { data: { id: 'root-frameworks', source: 'root', target: 'frameworks' } },
            { data: { id: 'root-ia', source: 'root', target: 'ia' } },
            { data: { id: 'root-shaders', source: 'root', target: 'shaders' } },
            { data: { id: 'root-db', source: 'root', target: 'db' } },
            { data: { id: 'root-ides', source: 'root', target: 'ides' } },
            { data: { id: 'root-languages', source: 'root', target: 'languages' } },
            { data: { id: 'root-llm', source: 'root', target: 'llm' } },
            { data: { id: 'root-frontend', source: 'root', target: 'frontend' } },
            { data: { id: 'root-os', source: 'root', target: 'os' } },
            { data: { id: 'root-soportes', source: 'root', target: 'soportes' } },
            { data: { id: 'root-protocolos', source: 'root', target: 'protocolos' } },
            { data: { id: 'root-software-multimedia', source: 'root', target: 'software-multimedia' } },
            
            // Conexiones de categorías a sus elementos
            // Motores Gráficos
            { data: { id: 'engines-unity', source: 'engines', target: 'unity' } },
            { data: { id: 'engines-unreal', source: 'engines', target: 'unreal' } },
            { data: { id: 'engines-godot', source: 'engines', target: 'godot' } },
            { data: { id: 'engines-touchdesigner', source: 'engines', target: 'touchdesigner' } },
            { data: { id: 'engines-processing', source: 'engines', target: 'processing' } },
            { data: { id: 'engines-openframeworks', source: 'engines', target: 'openframeworks' } },
            
            // Frameworks Web
            { data: { id: 'frameworks-p5', source: 'frameworks', target: 'p5' } },
            { data: { id: 'frameworks-three', source: 'frameworks', target: 'three' } },
            { data: { id: 'frameworks-babylon', source: 'frameworks', target: 'babylon' } },
            { data: { id: 'frameworks-tone', source: 'frameworks', target: 'tone' } },
            { data: { id: 'frameworks-nodejs', source: 'frameworks', target: 'nodejs' } },
            { data: { id: 'frameworks-websockets', source: 'frameworks', target: 'websockets' } },
            { data: { id: 'frameworks-ml5', source: 'frameworks', target: 'ml5' } },
            { data: { id: 'frameworks-hydra', source: 'frameworks', target: 'hydra' } },
            { data: { id: 'frameworks-xampp', source: 'frameworks', target: 'xampp' } },
            
            // Herramientas IA
            { data: { id: 'ia-comfy', source: 'ia', target: 'comfy' } },
            { data: { id: 'ia-n8n', source: 'ia', target: 'n8n' } },
            { data: { id: 'ia-pinokio', source: 'ia', target: 'pinokio' } },
            
            // IDEs
            { data: { id: 'ides-cursor', source: 'ides', target: 'cursor' } },
            { data: { id: 'ides-trae', source: 'ides', target: 'trae' } },
            { data: { id: 'ides-v0', source: 'ides', target: 'v0' } },
            { data: { id: 'ides-windsurf', source: 'ides', target: 'windsurf' } },
            { data: { id: 'ides-visual-studio', source: 'ides', target: 'visual-studio' } },
            
            // Shaders
            { data: { id: 'shaders-shadertoy', source: 'shaders', target: 'shadertoy' } },
            { data: { id: 'shaders-glsl', source: 'shaders', target: 'glsl' } },
            { data: { id: 'shaders-hlsl', source: 'shaders', target: 'hlsl' } },
            { data: { id: 'shaders-bookofshaders', source: 'shaders', target: 'bookofshaders' } },
            
            // Bases de Datos
            { data: { id: 'db-firebase', source: 'db', target: 'firebase' } },
            { data: { id: 'db-mongodb', source: 'db', target: 'mongodb' } },
            { data: { id: 'db-sql', source: 'db', target: 'sql' } },
            
            // Lenguajes de Programación
            { data: { id: 'languages-cpp', source: 'languages', target: 'cpp' } },
            { data: { id: 'languages-csharp', source: 'languages', target: 'csharp' } },
            { data: { id: 'languages-php', source: 'languages', target: 'php' } },
            { data: { id: 'languages-javascript', source: 'languages', target: 'javascript' } },
            { data: { id: 'languages-python', source: 'languages', target: 'python' } },
            { data: { id: 'languages-typescript', source: 'languages', target: 'typescript' } },
            { data: { id: 'languages-java', source: 'languages', target: 'java' } },
            { data: { id: 'languages-html', source: 'languages', target: 'html' } },
            { data: { id: 'languages-css', source: 'languages', target: 'css' } },
            { data: { id: 'languages-json', source: 'languages', target: 'json' } },
            { data: { id: 'languages-r', source: 'languages', target: 'r' } },
            { data: { id: 'languages-arduino', source: 'languages', target: 'arduino' } },
            
            // Frontend Frameworks
            { data: { id: 'frontend-react', source: 'frontend', target: 'react' } },
            { data: { id: 'frontend-vue', source: 'frontend', target: 'vue' } },
            { data: { id: 'frontend-svelte', source: 'frontend', target: 'svelte' } },
            { data: { id: 'frontend-angular', source: 'frontend', target: 'angular' } },
            { data: { id: 'frontend-nextjs', source: 'frontend', target: 'nextjs' } },
            
            
            // LLM Models
            { data: { id: 'llm-chatgpt', source: 'llm', target: 'chatgpt' } },
            { data: { id: 'llm-deepseek', source: 'llm', target: 'deepseek' } },
            { data: { id: 'llm-gemini', source: 'llm', target: 'gemini' } },
            { data: { id: 'llm-kimi', source: 'llm', target: 'kimi' } },
            { data: { id: 'llm-claude', source: 'llm', target: 'claude' } },
            
            // Sistemas Operativos
            { data: { id: 'os-windows', source: 'os', target: 'windows' } },
            { data: { id: 'os-linux', source: 'os', target: 'linux' } },
            { data: { id: 'os-mac', source: 'os', target: 'mac' } },
            { data: { id: 'os-android', source: 'os', target: 'android' } },
            { data: { id: 'os-ios', source: 'os', target: 'ios' } },
            
            // Soportes
            { data: { id: 'soportes-pantalla-touch', source: 'soportes', target: 'pantalla-touch' } },
            { data: { id: 'soportes-instalaciones-fisicas', source: 'soportes', target: 'instalaciones-fisicas' } },
            { data: { id: 'soportes-raspberry-pi', source: 'soportes', target: 'raspberry-pi' } },
            { data: { id: 'soportes-pantalla-led', source: 'soportes', target: 'pantalla-led' } },
            { data: { id: 'soportes-proyector', source: 'soportes', target: 'proyector' } },
            { data: { id: 'soportes-sitio-web', source: 'soportes', target: 'sitio-web' } },
            { data: { id: 'soportes-compilado-apk', source: 'soportes', target: 'compilado-apk' } },
            { data: { id: 'soportes-virtual-production', source: 'soportes', target: 'virtual-production' } },
            { data: { id: 'soportes-vr', source: 'soportes', target: 'vr' } },
            { data: { id: 'soportes-ar', source: 'soportes', target: 'ar' } },
            { data: { id: 'soportes-sonido', source: 'soportes', target: 'sonido' } },
            { data: { id: 'soportes-videojuegos', source: 'soportes', target: 'videojuegos' } },

            // Protocolos de Comunicación
            { data: { id: 'protocolos-websockets', source: 'protocolos', target: 'websockets' } },
            { data: { id: 'protocolos-spout', source: 'protocolos', target: 'spout' } },
            { data: { id: 'protocolos-syphon', source: 'protocolos', target: 'syphon' } },
            { data: { id: 'protocolos-ndi', source: 'protocolos', target: 'ndi' } },
            { data: { id: 'protocolos-webrtc', source: 'protocolos', target: 'webrtc' } },
            { data: { id: 'protocolos-osc', source: 'protocolos', target: 'osc' } },
            { data: { id: 'protocolos-api', source: 'protocolos', target: 'api' } },
            { data: { id: 'protocolos-midi', source: 'protocolos', target: 'midi' } },

            // Software Multimediales
            { data: { id: 'software-multimedia-resolume', source: 'software-multimedia', target: 'resolume' } },
            { data: { id: 'software-multimedia-blender', source: 'software-multimedia', target: 'blender' } },
            { data: { id: 'software-multimedia-paquete-adobe', source: 'software-multimedia', target: 'paquete-adobe' } },
            { data: { id: 'software-multimedia-obs', source: 'software-multimedia', target: 'obs' } },
            { data: { id: 'software-multimedia-cinema4d', source: 'software-multimedia', target: 'cinema4d' } },
            { data: { id: 'software-multimedia-ableton', source: 'software-multimedia', target: 'ableton' } },
            { data: { id: 'software-multimedia-puredata', source: 'software-multimedia', target: 'puredata' } },
            { data: { id: 'software-multimedia-guipper', source: 'software-multimedia', target: 'guipper' } },
            
            // Algunas conexiones adicionales entre nodos relacionados (con clase 'secondary')
            { data: { id: 'three-glsl', source: 'three', target: 'glsl', type: 'secondary' } },
            { data: { id: 'javascript-typescript', source: 'javascript', target: 'typescript', type: 'secondary' } },
            { data: { id: 'unity-csharp', source: 'unity', target: 'csharp', type: 'secondary' } },
            { data: { id: 'unity-hlsl', source: 'unity', target: 'hlsl', type: 'secondary' } },
            { data: { id: 'unreal-cpp', source: 'unreal', target: 'cpp', type: 'secondary' } },
            { data: { id: 'unreal-hlsl', source: 'unreal', target: 'hlsl', type: 'secondary' } },
            { data: { id: 'godot-glsl', source: 'godot', target: 'glsl', type: 'secondary' } },
            { data: { id: 'blender-glsl', source: 'blender', target: 'glsl', type: 'secondary' } },
            { data: { id: 'processing-glsl', source: 'processing', target: 'glsl', type: 'secondary' } },
            { data: { id: 'touchdesigner-glsl', source: 'touchdesigner', target: 'glsl', type: 'secondary' } },
            { data: { id: 'p5-javascript', source: 'p5', target: 'javascript', type: 'secondary' } },
            { data: { id: 'p5-glsl', source: 'p5', target: 'glsl', type: 'secondary' } },
            { data: { id: 'babylon-glsl', source: 'babylon', target: 'glsl', type: 'secondary' } },
            { data: { id: 'touchdesigner-python', source: 'touchdesigner', target: 'python', type: 'secondary' } },
            { data: { id: 'touchdesigner-glsl', source: 'touchdesigner', target: 'glsl', type: 'secondary' } },
            { data: { id: 'processing-java', source: 'processing', target: 'java', type: 'secondary' } },
            { data: { id: 'nodejs-javascript', source: 'nodejs', target: 'javascript', type: 'secondary' } },
            { data: { id: 'nodejs-typescript', source: 'nodejs', target: 'typescript', type: 'secondary' } },
            { data: { id: 'openframeworks-cpp', source: 'openframeworks', target: 'cpp', type: 'secondary' } },
            { data: { id: 'comfy-python', source: 'comfy', target: 'python', type: 'secondary' } },
            { data: { id: 'n8n-python', source: 'n8n', target: 'python', type: 'secondary' } },
            { data: { id: 'pinokio-python', source: 'pinokio', target: 'python', type: 'secondary' } },
            { data: { id: 'ml5-javascript', source: 'ml5', target: 'javascript', type: 'secondary' } },
            { data: { id: 'hydra-javascript', source: 'hydra', target: 'javascript', type: 'secondary' } },
            { data: { id: 'arduino-cpp', source: 'arduino', target: 'cpp', type: 'secondary' } },
            { data: { id: 'pantalla-touch-android', source: 'pantalla-touch', target: 'android', type: 'secondary' } },
            { data: { id: 'instalaciones-fisicas-arduino', source: 'instalaciones-fisicas', target: 'arduino', type: 'secondary' } },
            { data: { id: 'raspberry-pi-linux', source: 'raspberry-pi', target: 'linux', type: 'secondary' } },
            { data: { id: 'sitio-web-javascript', source: 'sitio-web', target: 'javascript', type: 'secondary' } },
            { data: { id: 'sitio-web-css', source: 'sitio-web', target: 'css', type: 'secondary' } },
            { data: { id: 'sitio-web-html', source: 'sitio-web', target: 'html', type: 'secondary' } },
            { data: { id: 'sitio-web-nodejs', source: 'sitio-web', target: 'nodejs', type: 'secondary' } },
            { data: { id: 'sitio-web-typescript', source: 'sitio-web', target: 'typescript', type: 'secondary' } },
            { data: { id: 'compilado-apk-unity', source: 'compilado-apk', target: 'unity', type: 'secondary' } },
            { data: { id: 'compilado-apk-sitio-web', source: 'compilado-apk', target: 'sitio-web', type: 'secondary' } },
            { data: { id: 'compilado-apk-pantalla-touch', source: 'compilado-apk', target: 'pantalla-touch', type: 'secondary' } },
            { data: { id: 'xampp-javascript', source: 'xampp', target: 'javascript', type: 'secondary' } },
            { data: { id: 'xampp-php', source: 'xampp', target: 'php', type: 'secondary' } },
            { data: { id: 'xampp-sql', source: 'xampp', target: 'sql', type: 'secondary' } },
            { data: { id: 'sql-php', source: 'sql', target: 'php', type: 'secondary' } },
            { data: { id: 'spout-windows', source: 'spout', target: 'windows', type: 'secondary' } },
            { data: { id: 'syphon-mac', source: 'syphon', target: 'mac', type: 'secondary' } },
            { data: { id: 'frameworks-websockets', source: 'frameworks', target: 'websockets', type: 'secondary' } },
            { data: { id: 'blender-python', source: 'blender', target: 'python', type: 'secondary' } },
            { data: { id: 'paquete-adobe-javascript', source: 'paquete-adobe', target: 'javascript', type: 'secondary' } },
            { data: { id: 'obs-spout', source: 'obs', target: 'spout', type: 'secondary' } },
            { data: { id: 'obs-ndi', source: 'obs', target: 'ndi', type: 'secondary' } },
            { data: { id: 'vr-unity', source: 'vr', target: 'unity', type: 'secondary' } },
            { data: { id: 'vr-unreal', source: 'vr', target: 'unreal', type: 'secondary' } },
            { data: { id: 'ar-android', source: 'ar', target: 'android', type: 'secondary' } },
            { data: { id: 'virtual-production-unreal', source: 'virtual-production', target: 'unreal', type: 'secondary' } },
            { data: { id: 'ableton-sonido', source: 'ableton', target: 'sonido', type: 'secondary' } },
            { data: { id: 'ableton-osc', source: 'ableton', target: 'osc', type: 'secondary' } },
            { data: { id: 'ableton-midi', source: 'ableton', target: 'midi', type: 'secondary' } },
            { data: { id: 'puredata-sonido', source: 'puredata', target: 'sonido', type: 'secondary' } },
            { data: { id: 'puredata-osc', source: 'puredata', target: 'osc', type: 'secondary' } },
            { data: { id: 'puredata-midi', source: 'puredata', target: 'midi', type: 'secondary' } },
            { data: { id: 'resolume-osc', source: 'resolume', target: 'osc', type: 'secondary' } },
            { data: { id: 'guipper-osc', source: 'guipper', target: 'osc', type: 'secondary' } },
            { data: { id: 'guipper-spout', source: 'guipper', target: 'spout', type: 'secondary' } },
            { data: { id: 'guipper-ndi', source: 'guipper', target: 'ndi', type: 'secondary' } },
            { data: { id: 'videojuegos-unity', source: 'videojuegos', target: 'unity', type: 'secondary' } },
            { data: { id: 'videojuegos-godot', source: 'videojuegos', target: 'godot', type: 'secondary' } },
            { data: { id: 'videojuegos-unreal', source: 'videojuegos', target: 'unreal', type: 'secondary' } },
            { data: { id: 'videojuegos-javascript', source: 'videojuegos', target: 'javascript', type: 'secondary' } },
            { data: { id: 'videojuegos-three', source: 'videojuegos', target: 'three', type: 'secondary' } },
            
            // Conexiones con sistemas operativos
            { data: { id: 'unity-windows', source: 'unity', target: 'windows', type: 'secondary' } },
            { data: { id: 'unity-mac', source: 'unity', target: 'mac', type: 'secondary' } },
            { data: { id: 'unity-linux', source: 'unity', target: 'linux', type: 'secondary' } },
            { data: { id: 'unity-android', source: 'unity', target: 'android', type: 'secondary' } },
            { data: { id: 'unity-ios', source: 'unity', target: 'ios', type: 'secondary' } },
            
            { data: { id: 'unreal-windows', source: 'unreal', target: 'windows', type: 'secondary' } },
            { data: { id: 'unreal-mac', source: 'unreal', target: 'mac', type: 'secondary' } },
            
            { data: { id: 'godot-windows', source: 'godot', target: 'windows', type: 'secondary' } },
            { data: { id: 'godot-mac', source: 'godot', target: 'mac', type: 'secondary' } },
            { data: { id: 'godot-linux', source: 'godot', target: 'linux', type: 'secondary' } },
            { data: { id: 'godot-android', source: 'godot', target: 'android', type: 'secondary' } },
            
            { data: { id: 'processing-windows', source: 'processing', target: 'windows', type: 'secondary' } },
            { data: { id: 'processing-mac', source: 'processing', target: 'mac', type: 'secondary' } },
            { data: { id: 'processing-linux', source: 'processing', target: 'linux', type: 'secondary' } },
            { data: { id: 'processing-android', source: 'processing', target: 'android', type: 'secondary' } },
            
            { data: { id: 'openframeworks-windows', source: 'openframeworks', target: 'windows', type: 'secondary' } },
            { data: { id: 'openframeworks-mac', source: 'openframeworks', target: 'mac', type: 'secondary' } },
            { data: { id: 'openframeworks-linux', source: 'openframeworks', target: 'linux', type: 'secondary' } },
            
            { data: { id: 'touchdesigner-windows', source: 'touchdesigner', target: 'windows', type: 'secondary' } },
            { data: { id: 'touchdesigner-mac', source: 'touchdesigner', target: 'mac', type: 'secondary' } },
        ],
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#1a1a1a',
                    'border-color': '#ff69b4',
                    'border-width': 2,
                    'label': 'data(label)',
                    'color': '#ffffff',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': CONFIG.nodeFontSize + 'px',
                    'font-weight': 'bold',
                    'text-wrap': 'wrap',
                    'text-max-width': '100px',
                    'width': CONFIG.secondaryNodeSize + 'px',
                    'height': CONFIG.secondaryNodeSize + 'px',
                    'padding': '15px',
                    'transition-property': 'background-color, border-color, border-width, width, height, background-opacity',
                    'transition-duration': '0.3s',
                    'transition-timing-function': 'ease-in-out'
                }
            },
            {
                selector: 'node[type="category"]',
                style: {
                    'background-color': '#8a2be2',
                    'border-color': '#ff69b4',
                    'border-width': 3,
                    'font-size': CONFIG.categoryFontSize + 'px',
                    'width': CONFIG.primaryNodeSize + 'px',
                    'height': CONFIG.primaryNodeSize + 'px',
                    'padding': '20px'
                }
            },
            {
                selector: 'node[id="root"]',
                style: {
                    'background-color': '#9400d3',
                    'border-color': '#ff1493',
                    'border-width': 4,
                    'font-size': CONFIG.rootFontSize + 'px',
                    'width': CONFIG.rootNodeSize + 'px',
                    'height': CONFIG.rootNodeSize + 'px',
                    'padding': '25px'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': 'rgba(255, 105, 180, 0.6)',
                    'curve-style': 'bezier',
                    'target-arrow-color': '#ff69b4',
                    'target-arrow-shape': 'triangle',
                    'arrow-scale': 0.8
                }
            },
            {
                selector: 'edge[type="secondary"]',
                style: {
                    'line-style': 'dashed',
                    'line-dash-pattern': [6, 3],
                    'line-color': 'rgba(138, 43, 226, 0.6)',
                    'target-arrow-color': '#8a2be2',
                    'transition-property': 'line-color, target-arrow-color, width, opacity',
                    'transition-duration': '0.3s'
                }
            },
            {
                selector: ':selected',
                style: {
                    'background-color': '#ff1493',
                    'line-color': '#ff1493',
                    'border-color': '#ffffff',
                    'border-width': 3,
                    'target-arrow-color': '#ff1493'
                }
            }
        ],
        layout: {
            name: 'preset',
            padding: 80,
            fit: true,
            animate: true,
            animationDuration: 1000,
            positions: function(node) {
                // Posición para el nodo raíz (centro)
                if (node.id() === 'root') {
                    return { x: 0, y: 0 };
                }
                
                // Posiciones para categorías principales (primer anillo)
                if (node.data('type') === 'category') {
                    const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages', 'llm', 'frontend', 'os', 'soportes', 'protocolos', 'software-multimedia'];
                    const index = categories.indexOf(node.id());
                    if (index !== -1) {
                        const angle = (2 * Math.PI * index) / categories.length;
                        // Usar la distancia personalizada para cada categoría o el valor por defecto
                        const radius = CONFIG.categoryDistancesMain[node.id()] || 300;
                        return {
                            x: radius * Math.cos(angle),
                            y: radius * Math.sin(angle)
                        };
                    }
                }
                
                // Posiciones para nodos secundarios (segundo anillo)
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
                    'react': 'frontend', 'vue': 'frontend', 'svelte': 'frontend', 'angular': 'frontend', 'nextjs': 'frontend',
                    'chatgpt': 'llm', 'deepseek': 'llm', 'gemini': 'llm', 'kimi': 'llm', 'claude': 'llm',
                    'windows': 'os', 'linux': 'os', 'mac': 'os', 'android': 'os', 'ios': 'os',
                    'pantalla-touch': 'soportes', 'instalaciones-fisicas': 'soportes', 'raspberry-pi': 'soportes', 'pantalla-led': 'soportes', 'proyector': 'soportes', 'sitio-web': 'soportes', 'compilado-apk': 'soportes', 'virtual-production': 'soportes', 'vr': 'soportes', 'ar': 'soportes', 'sonido': 'soportes', 'videojuegos': 'soportes',
                    'websockets': 'protocolos', 'spout': 'protocolos', 'syphon': 'protocolos', 'ndi': 'protocolos', 'webrtc': 'protocolos', 'osc': 'protocolos', 'api': 'protocolos', 'midi': 'protocolos',
                    'resolume': 'software-multimedia', 'blender': 'software-multimedia', 'paquete-adobe': 'software-multimedia', 'obs': 'software-multimedia', 'cinema4d': 'software-multimedia', 'ableton': 'software-multimedia', 'puredata': 'software-multimedia', 'guipper': 'software-multimedia'
                };
                
                const parentCategory = categoryMap[node.id()];
                if (parentCategory) {
                    const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages', 'llm', 'frontend', 'os', 'soportes', 'protocolos', 'software-multimedia'];
                    const categoryIndex = categories.indexOf(parentCategory);
                    
                    // Obtener nodos hermanos (misma categoría)
                    const siblings = Object.keys(categoryMap).filter(key => categoryMap[key] === parentCategory);
                    const siblingIndex = siblings.indexOf(node.id());
                    
                    if (categoryIndex !== -1 && siblingIndex !== -1) {
                        const categoryAngle = (2 * Math.PI * categoryIndex) / categories.length;
                        
                        // Algoritmo mejorado para distribución de nodos secundarios
                        let siblingOffset;
                        let radius = CONFIG.categoryDistances[parentCategory] || 500;
                        
                        // No hay casos especiales
                        
                        // Distribuir los nodos secundarios de forma radial alrededor de la categoría
                        // Calcular el ángulo para cada nodo secundario
                        const totalNodes = siblings.length;
                        // Distribuir los nodos en un círculo completo (360 grados)
                        const angleStep = (2 * Math.PI) / totalNodes;
                        // El ángulo para este nodo específico
                        const nodeAngle = angleStep * siblingIndex;
                        
                        // Calcular la posición en coordenadas cartesianas
                        // Primero obtenemos la posición de la categoría padre
                        const categoryX = CONFIG.categoryDistancesMain[parentCategory] * Math.cos(categoryAngle) || 0;
                        const categoryY = CONFIG.categoryDistancesMain[parentCategory] * Math.sin(categoryAngle) || 0;
                        
                        // Luego calculamos la posición del nodo secundario alrededor de la categoría
                        return {
                            x: categoryX + radius * Math.cos(nodeAngle),
                            y: categoryY + radius * Math.sin(nodeAngle)
                        };
                    }
                }
                
                // Posición por defecto
                return { x: 0, y: 0 };
            }
        },
        minZoom: 0.2,
        maxZoom: 3,
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        autounselectify: false,
        autoungrabify: false,  // Permitir arrastrar nodos
        wheelSensitivity: 0.1  // Reducir la sensibilidad del zoom con la rueda
    });
    
    // Crear el elemento para mostrar información al hacer hover
    const infoBox = document.createElement('div');
    infoBox.id = 'node-hover-info';
    infoBox.style.position = 'absolute';
    infoBox.style.display = 'none';
    infoBox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    infoBox.style.color = '#fff';
    infoBox.style.padding = '10px';
    infoBox.style.borderRadius = '5px';
    infoBox.style.maxWidth = '300px';
    infoBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    infoBox.style.zIndex = '1000';
    infoBox.style.pointerEvents = 'none';
    infoBox.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    infoBox.style.opacity = 0;
    infoBox.style.transform = 'translateY(10px)';
    document.getElementById('cy').appendChild(infoBox);
    
    // Iniciar animación para líneas discontinuas
    setInterval(function() {
        // Animar líneas discontinuas cambiando el patrón
        cy.style()
            .selector('edge[type="secondary"]')
            .style({
                'line-dash-offset': function(ele) {
                    return (parseFloat(ele.style('line-dash-offset') || 0) + 1) % 12;
                }
            })
            .update();
    }, 100);
    
    // Función para resaltar nodos conectados
    function highlightConnectedNodes(node) {
        // Restablecer todos los nodos y bordes
        cy.elements().removeClass('highlighted faded');
        
        // Si no hay nodo seleccionado, salir
        if (!node) return;
        
        // Obtener nodos conectados y bordes
        const connectedEdges = node.connectedEdges();
        const connectedNodes = node.neighborhood('node');
        
        // Agregar el nodo actual a los nodos conectados
        connectedNodes.merge(node);
        
        // Atenuar todos los nodos y bordes excepto los conectados
        cy.elements().difference(connectedNodes).difference(connectedEdges).addClass('faded');
        
        // Resaltar nodos conectados y bordes
        connectedNodes.addClass('highlighted');
        connectedEdges.addClass('highlighted');
    }
    
    // Agregar interactividad para abrir enlaces, mostrar información y resaltar conexiones
    cy.on('tap', 'node', function(evt){
        var node = evt.target;
        highlightConnectedNodes(node);
        
        var url = node.data('url');
        if (url) {
            window.open(url, '_blank');
        }
    });
    
    // Quitar resaltado al hacer clic en el fondo
    cy.on('tap', function(evt){
        if (evt.target === cy) {
            cy.elements().removeClass('highlighted faded');
        }
    });
    
    // Mostrar información al hacer hover sobre un nodo y resaltar conexiones
    cy.on('mouseover', 'node', function(evt){
        var node = evt.target;
        var nodeId = node.id();
        var nodeInfo = NODE_INFO[nodeId];
        
        // Aplicar estilo directamente para asegurar que se aplique
        node.style({
            'border-width': '5px',
            'border-color': '#00ffff',
            'background-color': '#3a3a3a',
            'z-index': 1000
        });
        
        // Obtener todas las conexiones entrantes y salientes
        var connectedEdges = node.connectedEdges();
        connectedEdges.style({
            'width': '4px',
            'line-color': '#00ffff',
            'target-arrow-color': '#00ffff',
            'opacity': 1,
            'z-index': 999
        });
        
        // Resaltar nodos conectados
        var connectedNodes = node.neighborhood('node');
        connectedNodes.style({
            'border-color': '#00ccff',
            'border-width': '4px',
            'z-index': 999
        });
        
        if (nodeInfo) { // Mostrar info para todos los nodos
            infoBox.textContent = nodeInfo;
            infoBox.style.display = 'block';
            infoBox.style.opacity = 0;
            
            // Posicionar cerca del cursor
            infoBox.style.left = (evt.renderedPosition.x + 20) + 'px';
            infoBox.style.top = (evt.renderedPosition.y + 20) + 'px';
            
            // Animar la aparición del infoBox
            setTimeout(function() {
                infoBox.style.opacity = 1;
                infoBox.style.transform = 'translateY(0)';
            }, 10);
        }
    });
    
    cy.on('mouseout', 'node', function(evt){
        var node = evt.target;
        
        // Restaurar estilos originales
        node.removeStyle('border-width border-color background-color z-index');
        
        // Restaurar estilos de bordes
        var connectedEdges = node.connectedEdges();
        connectedEdges.removeStyle('width line-color target-arrow-color opacity z-index');
        
        // Restaurar estilos de nodos conectados
        var connectedNodes = node.neighborhood('node');
        connectedNodes.removeStyle('border-color border-width z-index');
        
        // Ocultar infoBox con animación
        infoBox.style.opacity = 0;
        infoBox.style.transform = 'translateY(10px)';
        setTimeout(function() {
            if (infoBox.style.opacity === '0') {
                infoBox.style.display = 'none';
            }
        }, 300);
    });
    
    // Actualizar posición del infoBox al mover el mouse
    cy.on('mousemove', 'node', function(evt){
        if (infoBox.style.display === 'block') {
            infoBox.style.left = (evt.renderedPosition.x + 20) + 'px';
            infoBox.style.top = (evt.renderedPosition.y + 20) + 'px';
        }
    });
    

    
    // Reposicionar las bibliotecas de Python cuando se mueva el nodo Python
    cy.on('position', 'node#python', function() {
       // positionPythonLibraries(cy);
    });
    
    // Reposicionar las bibliotecas de Python cuando finalice cualquier arrastre
    cy.on('dragfree', function() {
        //positionPythonLibraries(cy);
    });
    
    // Controles de zoom
    document.getElementById('zoom-in').addEventListener('click', function() {
        cy.zoom({
            level: cy.zoom() * 1.2,
            renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
        });
    });
    
    document.getElementById('zoom-out').addEventListener('click', function() {
        cy.zoom({
            level: cy.zoom() * 0.8,
            renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
        });
    });
    
    // Corregir la función de reset
    document.getElementById('reset').addEventListener('click', function() {
        cy.elements().layout({
            name: 'preset',
            padding: 80,
            fit: true,
            animate: true,
            animationDuration: 1000,
            positions: function(node) {
                // Posición para el nodo raíz (centro)
                if (node.id() === 'root') {
                    return { x: 0, y: 0 };
                }
                
                // Posiciones para categorías principales (primer anillo)
                if (node.data('type') === 'category') {
                    const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages', 'llm', 'frontend', 'os', 'soportes', 'protocolos', 'software-multimedia'];
                    const index = categories.indexOf(node.id());
                    if (index !== -1) {
                        const angle = (2 * Math.PI * index) / categories.length;
                        // Usar la distancia personalizada para cada categoría o el valor por defecto
                        const radius = CONFIG.categoryDistancesMain[node.id()] || 300;
                        return {
                            x: radius * Math.cos(angle),
                            y: radius * Math.sin(angle)
                        };
                    }
                }
                
                // Posiciones para nodos secundarios (segundo anillo)
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
                    'react': 'frontend', 'vue': 'frontend', 'svelte': 'frontend', 'angular': 'frontend', 'nextjs': 'frontend',
                    'chatgpt': 'llm', 'deepseek': 'llm', 'gemini': 'llm', 'kimi': 'llm', 'claude': 'llm',
                    'windows': 'os', 'linux': 'os', 'mac': 'os', 'android': 'os', 'ios': 'os',
                    'pantalla-touch': 'soportes', 'instalaciones-fisicas': 'soportes', 'raspberry-pi': 'soportes', 'pantalla-led': 'soportes', 'proyector': 'soportes', 'sitio-web': 'soportes', 'compilado-apk': 'soportes', 'virtual-production': 'soportes', 'vr': 'soportes', 'ar': 'soportes', 'sonido': 'soportes', 'videojuegos': 'soportes',
                    'websockets': 'protocolos', 'spout': 'protocolos', 'syphon': 'protocolos', 'ndi': 'protocolos', 'webrtc': 'protocolos', 'osc': 'protocolos', 'api': 'protocolos', 'midi': 'protocolos',
                    'resolume': 'software-multimedia', 'blender': 'software-multimedia', 'paquete-adobe': 'software-multimedia', 'obs': 'software-multimedia', 'cinema4d': 'software-multimedia', 'ableton': 'software-multimedia', 'puredata': 'software-multimedia', 'guipper': 'software-multimedia'
                };
                
                const parentCategory = categoryMap[node.id()];
                if (parentCategory) {
                    const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages', 'llm', 'frontend', 'os', 'soportes', 'protocolos', 'software-multimedia'];
                    const categoryIndex = categories.indexOf(parentCategory);
                    
                    // Obtener nodos hermanos (misma categoría)
                    const siblings = Object.keys(categoryMap).filter(key => categoryMap[key] === parentCategory);
                    const siblingIndex = siblings.indexOf(node.id());
                    
                    if (categoryIndex !== -1 && siblingIndex !== -1) {
                        const categoryAngle = (2 * Math.PI * categoryIndex) / categories.length;
                        
                        // Distribuir los nodos secundarios de forma radial alrededor de la categoría
                        const totalNodes = siblings.length;
                        // Distribuir los nodos en un círculo completo (360 grados)
                        const angleStep = (2 * Math.PI) / totalNodes;
                        // El ángulo para este nodo específico
                        const nodeAngle = angleStep * siblingIndex;
                        
                        // Usar la distancia personalizada para cada categoría o el valor por defecto
                        const radius = CONFIG.categoryDistances[parentCategory] || 600;
                        
                        // Calcular la posición en coordenadas cartesianas
                        // Primero obtenemos la posición de la categoría padre
                        const categoryX = CONFIG.categoryDistancesMain[parentCategory] * Math.cos(categoryAngle) || 0;
                        const categoryY = CONFIG.categoryDistancesMain[parentCategory] * Math.sin(categoryAngle) || 0;
                        
                        // Luego calculamos la posición del nodo secundario alrededor de la categoría
                        return {
                            x: categoryX + radius * Math.cos(nodeAngle),
                            y: categoryY + radius * Math.sin(nodeAngle)
                        };
                    }
                }
                
                // Posición por defecto
                return { x: 0, y: 0 };
            }
        }).run();
        cy.fit();
        cy.center();
    });
    
    // Eliminado el botón de ajustar
    
    // Función de pantalla completa simplificada
    document.getElementById('fullscreen').addEventListener('click', function() {
        var elem = document.getElementById('cy');
        
        if (!document.fullscreenElement) {
            try {
                // Intentar entrar en fullscreen con diferentes métodos
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.mozRequestFullScreen) { /* Firefox */
                    elem.mozRequestFullScreen();
                } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) { /* IE/Edge */
                    elem.msRequestFullscreen();
                }
                this.textContent = 'Salir';
            } catch (err) {
                console.error('Error al intentar pantalla completa:', err);
            }
        } else {
            try {
                // Intentar salir de fullscreen con diferentes métodos
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) { /* Firefox */
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) { /* Chrome, Safari & Opera */
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE/Edge */
                    document.msExitFullscreen();
                }
                this.textContent = 'Pantalla Completa';
            } catch (err) {
                console.error('Error al salir de pantalla completa:', err);
            }
        }
    });
    
    // Ya no activamos fullscreen automáticamente
    // Asegurar que el texto del botón es correcto al inicio
    document.getElementById('fullscreen').textContent = 'Pantalla Completa';
    
    // Detectar cambios en el estado de pantalla completa
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
    
    function updateFullscreenButton() {
        var button = document.getElementById('fullscreen');
        if (document.fullscreenElement) {
            button.textContent = 'Salir';
        } else {
            button.textContent = 'Pantalla Completa';
        }
    }
        // Posicionar las bibliotecas de Python inicialmente
        //positionPythonLibraries(cy);
});
