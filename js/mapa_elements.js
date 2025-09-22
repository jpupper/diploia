// Archivo de elementos para el mapa de herramientas
// Contiene todos los nodos y conexiones del mapa

// Función para obtener los elementos del mapa
function getMapElements() {
    return [
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
        { data: { id: 'glosario', label: 'Glosario', type: 'category' } },
        
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
        { data: { id: 'shadertoy', label: 'ShaderToy', url: 'https://www.shadertoy.com/' } },
        { data: { id: 'glsl', label: 'GLSL', url: 'https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)' } },
        { data: { id: 'hlsl', label: 'HLSL', url: 'https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl' } },
        { data: { id: 'bookofshaders', label: 'Book of Shaders', url: 'https://thebookofshaders.com/' } },
        { data: { id: 'ejemplos-shaders', label: 'Ejemplos Shaders', url: 'https://jeyder.com.ar/ejemplosshaders' } },
        { data: { id: 'editor-shaders-live', label: 'Editor de Shaders Live', url: 'https://jeyder.com.ar/jpshadereditor' } },
        
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
        { data: { id: 'mapping', label: 'Mapping', url: '#' } },

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
        
        // Glosario
        { data: { id: 'livecoding', label: 'Livecoding', url: '#' } },
        { data: { id: 'vibecoding', label: 'Vibecoding', url: '#' } },
        { data: { id: 'programacion', label: 'Programación', url: '#' } },
        { data: { id: 'prompting', label: 'Prompting', url: '#' } },
        { data: { id: 'consola', label: 'Consola', url: '#' } },
        { data: { id: 'script', label: 'Script', url: '#' } },
        { data: { id: 'compilado-interpretado', label: 'Lenguaje de compilado vs interpretado', url: '#' } },
        { data: { id: 'formatos-exe', label: 'Formatos tipo exe', url: '#' } },
        { data: { id: 'drivers', label: 'Drivers', url: '#' } },
        { data: { id: 'mcp', label: 'MCP', url: '#' } },
        
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
        { data: { id: 'root-glosario', source: 'root', target: 'glosario' } }
    ];
}
