// Archivo de datos para el mapa de herramientas
// Contiene toda la información del mapa: configuración, descripciones, nodos y conexiones

// Variables globales de configuración
const CONFIG = {
    rootNodeSize: 200,          // Tamaño para el nodo raíz
    primaryNodeSize: 100,        // Tamaño para categorías
    secondaryNodeSize: 90,      // Tamaño para nodos secundarios
    nodeFontSize: 14,           // Tamaño de fuente para nodos normales
    categoryFontSize: 18,       // Tamaño de fuente para categorías
    rootFontSize: 20,           // Tamaño de fuente para el nodo raíz
    popupTitleFontSize: 22,     // Tamaño de fuente para títulos en popups
    popupSubtitleFontSize: 18,  // Tamaño de fuente para subtítulos en popups
    popupTextFontSize: 16,      // Tamaño de fuente para texto en popups
    secondaryNodeDist: 120,      // Distancia entre nodos secundarios
    primaryDistance: 250,       // Distancia de nodo central a categorías principales
    categoryDistancesMain: {     // Distancias personalizadas para cada categoría al nodo central
        'engines': 1300,          // Distancia de Motores Gráficos al nodo central
        'frameworks': 1300,       // Distancia de Frameworks Web al nodo central
        'ia': 700,              // Distancia de Herramientas IA al nodo central
        'shaders': 1100,         // Distancia de Shaders al nodo central
        'db': 800,              // Distancia de Bases de Datos al nodo central
        'ides': 1400,            // Distancia de IDEs al nodo central
        'languages': 1600,       // Distancia de Lenguajes de Programación al nodo central
        'llm': 1200,             // Distancia de LLM Models al nodo central
        'frontend': 700,        // Distancia de frameworks frontend al nodo central
        'os': 1100,              // Distancia de Sistemas Operativos al nodo central
        'soportes': 1800,        // Distancia de Soportes al nodo central
        'protocolos': 1400,      // Distancia de Protocolos de Comunicación al nodo central
        'software-multimedia': 1000, // Distancia de Software Multimediales al nodo central
        'entornos': 1500,        // Distancia de Entornos de Desarrollo al nodo central
        'glosario': 1700         // Distancia de Glosario al nodo central
    },
    categoryDistances: {         // Distancias personalizadas para cada categoría
        'engines': 250,         // Distancia de Motores Gráficos a sus herramientas
        'frameworks': 250,       // Distancia de Frameworks Web a sus herramientas
        'ia': 180,              // Distancia de Herramientas IA a sus herramientas
        'shaders': 220,         // Distancia de Shaders a sus herramientas
        'db': 220,              // Distancia de Bases de Datos a sus herramientas
        'ides': 250,           // Distancia de IDEs a sus herramientas
        'languages': 350,      // Distancia de Lenguajes de Programación a sus herramientas
        'llm': 220,             // Distancia de LLM Models a sus herramientas
        'frontend': 220,        // Distancia de frameworks frontend a sus herramientas
        'os': 220,              // Distancia de Sistemas Operativos a sus elementos
        'soportes': 280,        // Distancia de Soportes a sus elementos
        'protocolos': 220,      // Distancia de Protocolos de Comunicación a sus elementos
        'software-multimedia': 220, // Distancia de Software Multimediales a sus elementos
        'entornos': 220,        // Distancia de Entornos de Desarrollo a sus elementos
        'glosario': 380         // Distancia de Glosario a sus elementos
    }
};

// Descripciones de los nodos para mostrar en hover
const NODE_INFO = {
    // Descripciones de las categorías principales
    'engines': `<h3>Motores Gráficos</h3>
                <p>Motores gráficos y entornos de desarrollo para crear aplicaciones interactivas, videojuegos y experiencias visuales.</p>
                <p><strong>Se usa para:</strong> Desarrollo de videojuegos, aplicaciones interactivas, simulaciones y experiencias visuales.</p>
                <p><strong>Disponibilidad:</strong> Variada, desde soluciones open source hasta plataformas comerciales de pago.</p>`,
    'frameworks': `<h3>Frameworks Web</h3>
                   <p>Bibliotecas y frameworks que facilitan el desarrollo web y multimedia.</p>
                   <p><strong>Se usa para:</strong> Crear aplicaciones web, interfaces interactivas y contenido multimedia en la web.</p>
                   <p><strong>Disponibilidad:</strong> Mayormente open source bajo licencias permisivas como MIT.</p>`,
    'ia': `<h3>Herramientas de IA</h3>
           <p>Herramientas de Inteligencia Artificial para la generación de contenido, automatización de tareas y asistencia en el proceso creativo.</p>
           <p><strong>Se usa para:</strong> Generación de imágenes, texto, audio y automatización de tareas creativas.</p>
           <p><strong>Disponibilidad:</strong> Mezcla de soluciones open source y servicios comerciales.</p>`,
    'shaders': `<h3>Shaders</h3>
                <p>Programas que se ejecutan en la GPU para crear efectos visuales y gráficos avanzados.</p>
                <p><strong>Se usa para:</strong> Efectos visuales, gráficos en tiempo real, procesamiento de imágenes y visuales generativos.</p>
                <p><strong>Disponibilidad:</strong> Tecnología abierta con implementaciones específicas según plataforma.</p>`,
    'db': `<h3>Bases de Datos</h3>
           <p>Sistemas para almacenar, organizar y recuperar información.</p>
           <p><strong>Se usa para:</strong> Almacenamiento persistente, gestión de datos de aplicaciones y servicios web.</p>
           <p><strong>Disponibilidad:</strong> Opciones open source y servicios comerciales en la nube.</p>`,
    'ides': `<h3>Entornos de Desarrollo (IDEs)</h3>
             <p>Entornos que facilitan la escritura, prueba y depuración de código.</p>
             <p><strong>Se usa para:</strong> Desarrollo de software, programación y gestión de proyectos de código.</p>
             <p><strong>Disponibilidad:</strong> Desde opciones gratuitas y open source hasta soluciones comerciales premium.</p>`,
    'languages': `<h3>Lenguajes de Programación</h3>
                  <p>Lenguajes utilizados para desarrollar aplicaciones, sitios web y experiencias interactivas.</p>
                  <p><strong>Se usa para:</strong> Implementar lógica, algoritmos y funcionalidades en software.</p>
                  <p><strong>Disponibilidad:</strong> Generalmente de uso libre, con implementaciones open source y comerciales.</p>`,
    'llm': `<h3>Modelos de Lenguaje (LLM)</h3>
            <p>Modelos de Lenguaje de Gran Escala que utilizan aprendizaje profundo para generar y comprender texto.</p>
            <p><strong>Se usa para:</strong> Asistencia en programación, generación de contenido, chatbots y procesamiento de lenguaje natural.</p>
            <p><strong>Disponibilidad:</strong> Principalmente servicios comerciales con algunas opciones open source emergentes.</p>`,
    'frontend': `<h3>Frameworks Frontend</h3>
                 <p>Frameworks para desarrollo de interfaces de usuario web.</p>
                 <p><strong>Se usa para:</strong> Crear aplicaciones web interactivas, SPAs y interfaces de usuario reactivas.</p>
                 <p><strong>Disponibilidad:</strong> Mayormente open source bajo licencias como MIT.</p>`,
    'os': `<h3>Sistemas Operativos</h3>
           <p>Plataformas base para ejecutar aplicaciones y software.</p>
           <p><strong>Se usa para:</strong> Proporcionar un entorno de ejecución para aplicaciones y gestionar recursos de hardware.</p>
           <p><strong>Disponibilidad:</strong> Opciones comerciales (Windows, macOS) y open source (Linux).</p>`,
    'soportes': `<h3>Soportes</h3>
                 <p>Medios físicos y digitales donde se pueden implementar y mostrar proyectos interactivos.</p>
                 <p><strong>Se usa para:</strong> Desplegar y exhibir proyectos interactivos y experiencias multimedia.</p>
                 <p><strong>Disponibilidad:</strong> Variada, desde hardware especializado hasta plataformas web.</p>`,
    'protocolos': `<h3>Protocolos de Comunicación</h3>
                   <p>Estándares que permiten la interacción entre diferentes sistemas, dispositivos y aplicaciones.</p>
                   <p><strong>Se usa para:</strong> Intercambio de datos, comunicación en tiempo real y conectividad entre sistemas.</p>
                   <p><strong>Disponibilidad:</strong> Generalmente estándares abiertos de libre implementación.</p>`,
    'software-multimedia': `<h3>Software Multimedia</h3>
                            <p>Aplicaciones especializadas para la creación, edición y procesamiento de contenido multimedia.</p>
                            <p><strong>Se usa para:</strong> Edición de video/audio, composición visual, efectos especiales y producción multimedia.</p>
                            <p><strong>Disponibilidad:</strong> Mezcla de soluciones comerciales y alternativas open source.</p>`,
    'glosario': `<h3>Glosario</h3>
                 <p>Términos y conceptos fundamentales relacionados con la programación, el desarrollo de software y las tecnologías creativas.</p>
                 <p><strong>Se usa para:</strong> Referencia técnica, aprendizaje y comprensión de terminología especializada.</p>
                 <p><strong>Disponibilidad:</strong> Conocimiento libre y abierto.</p>`,
    'unity': `<h3>Unity</h3>
              <p>Motor de juegos multiplataforma con potentes capacidades gráficas y físicas.</p>
              <p><strong>Se usa para:</strong> Desarrollo de videojuegos, visualizaciones 3D, realidad virtual y aumentada.</p>
              <p><strong>Disponibilidad:</strong> Software propietario, de pago con versión gratuita limitada.</p>`,
    'unreal': `<h3>Unreal Engine</h3>
               <p>Motor de juegos de alta fidelidad visual, ideal para proyectos AAA y experiencias inmersivas.</p>
               <p><strong>Se usa para:</strong> Videojuegos de alta calidad, cine virtual, arquitectura y visualización.</p>
               <p><strong>Disponibilidad:</strong> Parcialmente open source (código fuente disponible, pero con licencia comercial).</p>`,
    'godot': `<h3>Godot</h3>
              <p>Motor de juegos con soporte para 2D y 3D, ideal para desarrolladores independientes.</p>
              <p><strong>Se usa para:</strong> Videojuegos independientes, prototipado rápido, proyectos educativos.</p>
              <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'touchdesigner': `<h3>TouchDesigner</h3>
                      <p>Plataforma de desarrollo visual para contenido interactivo en tiempo real.</p>
                      <p><strong>Se usa para:</strong> Arte digital, instalaciones interactivas, visuales en vivo, mapping.</p>
                      <p><strong>Disponibilidad:</strong> Software propietario, de pago con versión no comercial gratuita.</p>`,
    'processing': `<h3>Processing</h3>
                   <p>Entorno de desarrollo y lenguaje de programación enfocado en artes visuales.</p>
                   <p><strong>Se usa para:</strong> Arte generativo, visualización de datos, prototipado, educación.</p>
                   <p><strong>Disponibilidad:</strong> Open source (LGPL/GPL).</p>`,
    'openframeworks': `<h3>OpenFrameworks</h3>
                       <p>Framework C++ para programación creativa y arte interactivo.</p>
                       <p><strong>Se usa para:</strong> Instalaciones interactivas, arte digital, visuales en tiempo real.</p>
                       <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'csharp': `<h3>C#</h3>
               <p>Lenguaje de programación orientado a objetos desarrollado por Microsoft.</p>
               <p><strong>Se usa para:</strong> Desarrollo de aplicaciones Windows, Unity, servicios web.</p>
               <p><strong>Disponibilidad:</strong> Open source (.NET es MIT).</p>`,
    'nodejs': `<h3>Node.js</h3>
               <p>Entorno de ejecución de JavaScript del lado del servidor.</p>
               <p><strong>Se usa para:</strong> Servidores web, APIs, aplicaciones en tiempo real, microservicios.</p>
               <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'websockets': `<h3>WebSockets</h3>
                   <p>Protocolo de comunicación bidireccional en tiempo real sobre TCP.</p>
                   <p><strong>Se usa para:</strong> Chats, juegos multijugador, actualizaciones en tiempo real, dashboards.</p>
                   <p><strong>Disponibilidad:</strong> Estándar abierto de libre implementación.</p>`,
    'react': `<h3>React</h3>
              <p>Biblioteca de JavaScript para construir interfaces de usuario interactivas.</p>
              <p><strong>Se usa para:</strong> Aplicaciones web, interfaces de usuario, SPAs.</p>
              <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'vue': `<h3>Vue.js</h3>
            <p>Framework progresivo para construir interfaces de usuario.</p>
            <p><strong>Se usa para:</strong> Aplicaciones web, interfaces de usuario, integración progresiva.</p>
            <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'svelte': `<h3>Svelte</h3>
               <p>Framework que compila código en JavaScript optimizado en tiempo de compilación.</p>
               <p><strong>Se usa para:</strong> Aplicaciones web ligeras, componentes interactivos, visualizaciones.</p>
               <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'chatgpt': `<h3>ChatGPT</h3>
                <p>Modelo de lenguaje de OpenAI para conversaciones y generación de texto.</p>
                <p><strong>Se usa para:</strong> Asistentes virtuales, generación de contenido, respuesta a preguntas.</p>
                <p><strong>Disponibilidad:</strong> Servicio de pago con API.</p>`,
    'deepseek': `<h3>DeepSeek</h3>
                 <p>Modelo de lenguaje con capacidades avanzadas de razonamiento.</p>
                 <p><strong>Se usa para:</strong> Generación de código, asistencia en programación, razonamiento lógico.</p>
                 <p><strong>Disponibilidad:</strong> Open source.</p>`,
    'gemini': `<h3>Gemini</h3>
               <p>Modelo multimodal de Google que procesa texto, imágenes y otros formatos.</p>
               <p><strong>Se usa para:</strong> Asistentes virtuales, análisis multimodal, generación de contenido.</p>
               <p><strong>Disponibilidad:</strong> Servicio de pago con versión gratuita.</p>`,
    'kimi': `<h3>Kimi</h3>
             <p>Asistente de IA con capacidades de razonamiento y generación creativa.</p>
             <p><strong>Se usa para:</strong> Asistencia creativa, generación de contenido, respuesta a consultas.</p>
             <p><strong>Disponibilidad:</strong> Servicio de pago.</p>`,
    'claude': `<h3>Claude</h3>
               <p>Modelo de lenguaje de Anthropic diseñado para ser útil e inofensivo.</p>
               <p><strong>Se usa para:</strong> Asistencia virtual, generación de texto, análisis de documentos.</p>
               <p><strong>Disponibilidad:</strong> Servicio de pago con versión gratuita.</p>`,
    'pinokio': `<h3>Pinokio</h3>
                <p>Asistente de IA enfocado en automatización y ejecución de tareas.</p>
                <p><strong>Se usa para:</strong> Automatización de flujos de trabajo, ejecución de scripts, integración de sistemas.</p>
                <p><strong>Disponibilidad:</strong> Open source.</p>`,
    'p5': `<h3>P5.js</h3>
           <p>Biblioteca JavaScript para programación creativa con enfoque en artes visuales.</p>
           <p><strong>Se usa para:</strong> Arte generativo, visualizaciones interactivas, educación en programación.</p>
           <p><strong>Disponibilidad:</strong> Open source (LGPL).</p>`,
    'three': `<h3>Three.js</h3>
              <p>Biblioteca JavaScript para crear y mostrar gráficos 3D en navegadores.</p>
              <p><strong>Se usa para:</strong> Visualizaciones 3D web, juegos en navegador, experiencias interactivas.</p>
              <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'babylon': `<h3>Babylon.js</h3>
                <p>Framework de JavaScript para crear juegos y experiencias 3D web.</p>
                <p><strong>Se usa para:</strong> Juegos web, visualizaciones 3D, realidad virtual en navegador.</p>
                <p><strong>Disponibilidad:</strong> Open source (Apache 2.0).</p>`,
    'tone': `<h3>Tone.js</h3>
             <p>Framework de audio web para crear experiencias musicales interactivas.</p>
             <p><strong>Se usa para:</strong> Música web, sintetizadores, instrumentos virtuales, arte sonoro.</p>
             <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'ml5': `<h3>ML5.js</h3>
            <p>Biblioteca de aprendizaje automático para web basada en TensorFlow.js.</p>
            <p><strong>Se usa para:</strong> Proyectos de IA accesibles, arte generativo, experimentos de aprendizaje automático en navegador.</p>
            <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'hydra': `<h3>Hydra</h3>
              <p>Plataforma de livecoding para síntesis visual en tiempo real.</p>
              <p><strong>Se usa para:</strong> Performances audiovisuales, livecoding, arte generativo, visuales en vivo.</p>
              <p><strong>Disponibilidad:</strong> Open source (GPL).</p>`,
    'comfy': `<h3>ComfyUI</h3>
              <p>Interfaz gráfica para flujos de trabajo de IA generativa.</p>
              <p><strong>Se usa para:</strong> Generación de imágenes, edición con IA, flujos de trabajo visuales.</p>
              <p><strong>Disponibilidad:</strong> Open source (GPL), pero algunos modelos requieren pago.</p>`,
    'n8n': `<h3>n8n</h3>
            <p>Plataforma de automatización de flujos de trabajo con integración de IA.</p>
            <p><strong>Se usa para:</strong> Automatización de procesos, integración de servicios, workflows.</p>
            <p><strong>Disponibilidad:</strong> Open source (Apache 2.0), con versión cloud de pago.</p>`,
    'cursor': `<h3>Cursor</h3>
               <p>Editor de código con asistencia de IA integrada.</p>
               <p><strong>Se usa para:</strong> Desarrollo de software, programación asistida por IA.</p>
               <p><strong>Disponibilidad:</strong> Servicio de pago con versión gratuita.</p>`,
    'visual-studio': `<h3>Visual Studio</h3>
                      <p>Entorno de desarrollo integrado completo.</p>
                      <p><strong>Se usa para:</strong> Desarrollo de aplicaciones en múltiples lenguajes, especialmente .NET.</p>
                      <p><strong>Disponibilidad:</strong> Producto de Microsoft con versión Community gratuita.</p>`,
    'trae': `<h3>Trae AI</h3>
             <p>Asistente de programación basado en IA para desarrollo.</p>
             <p><strong>Se usa para:</strong> Desarrollo de software, programación asistida por IA.</p>
             <p><strong>Disponibilidad:</strong> Servicio de pago.</p>`,
    'v0': `<h3>v0.dev</h3>
           <p>Herramienta de generación de interfaces con IA.</p>
           <p><strong>Se usa para:</strong> Diseño de interfaces, prototipado, generación de código frontend.</p>
           <p><strong>Disponibilidad:</strong> Servicio de pago con versión gratuita limitada.</p>`,
    'windsurf': `<h3>Windsurf</h3>
                 <p>Plataforma de desarrollo con asistencia de IA.</p>
                 <p><strong>Se usa para:</strong> Desarrollo de software, programación asistida por IA.</p>
                 <p><strong>Disponibilidad:</strong> Servicio de pago con versión gratuita limitada.</p>`,
    'shadertoy': `<h3>ShaderToy</h3>
                  <p>Plataforma web para crear y compartir shaders en tiempo real.</p>
                  <p><strong>Se usa para:</strong> Programación de shaders, efectos visuales, demostraciones gráficas.</p>
                  <p><strong>Disponibilidad:</strong> Plataforma propietaria, pero los shaders son públicos.</p>`,
    'glsl': `<h3>GLSL</h3>
             <p>Lenguaje de sombreado para gráficos OpenGL.</p>
             <p><strong>Se usa para:</strong> Programación de shaders, efectos visuales, gráficos 3D.</p>
             <p><strong>Disponibilidad:</strong> Estándar abierto.</p>`,
    'hlsl': `<h3>HLSL</h3>
             <p>Lenguaje de sombreado de alto nivel para DirectX.</p>
             <p><strong>Se usa para:</strong> Desarrollo de videojuegos, efectos visuales, gráficos 3D.</p>
             <p><strong>Disponibilidad:</strong> Propiedad de Microsoft.</p>`,
    'bookofshaders': `<h3>Book of Shaders</h3>
                      <p>Guía paso a paso para aprender programación de shaders.</p>
                      <p><strong>Se usa para:</strong> Educación, aprendizaje de shaders, programación gráfica.</p>
                      <p><strong>Disponibilidad:</strong> Contenido abierto (CC).</p>`,
    'firebase': `<h3>Firebase</h3>
                 <p>Plataforma de desarrollo con base de datos en tiempo real.</p>
                 <p><strong>Se usa para:</strong> Aplicaciones web y móviles, autenticación, almacenamiento en la nube.</p>
                 <p><strong>Disponibilidad:</strong> Servicio de pago con nivel gratuito.</p>`,
    'mongodb': `<h3>MongoDB</h3>
                <p>Base de datos NoSQL orientada a documentos.</p>
                <p><strong>Se usa para:</strong> Aplicaciones web, almacenamiento de datos no estructurados, APIs.</p>
                <p><strong>Disponibilidad:</strong> Licencia dual (SSPL/comercial).</p>`,
    'sql': `<h3>SQL</h3>
            <p>Lenguaje estándar para gestionar bases de datos relacionales.</p>
            <p><strong>Se usa para:</strong> Sistemas de gestión de datos, aplicaciones empresariales, análisis.</p>
            <p><strong>Disponibilidad:</strong> Estándar abierto.</p>`,
    'cpp': `<h3>C++</h3>
            <p>Lenguaje de programación de propósito general con control de bajo nivel.</p>
            <p><strong>Se usa para:</strong> Desarrollo de sistemas, videojuegos, aplicaciones de alto rendimiento.</p>
            <p><strong>Disponibilidad:</strong> Estándar abierto.</p>`,
    'php': `<h3>PHP</h3>
            <p>Lenguaje de programación para desarrollo web del lado del servidor.</p>
            <p><strong>Se usa para:</strong> Desarrollo web, CMS, aplicaciones de servidor.</p>
            <p><strong>Disponibilidad:</strong> Open source (PHP License).</p>`,
    'javascript': `<h3>JavaScript</h3>
                   <p>Lenguaje de programación interpretado para desarrollo web.</p>
                   <p><strong>Se usa para:</strong> Desarrollo web frontend, aplicaciones interactivas, servidores Node.js.</p>
                   <p><strong>Disponibilidad:</strong> Estándar abierto (ECMA).</p>`,
    'python': `<h3>Python</h3>
               <p>Lenguaje de programación de alto nivel con sintaxis clara.</p>
               <p><strong>Se usa para:</strong> Ciencia de datos, IA, automatización, desarrollo web.</p>
               <p><strong>Disponibilidad:</strong> Open source (PSF License).</p>`,
    'r': `<h3>R</h3>
          <p>Lenguaje de programación especializado en estadística y visualización de datos.</p>
          <p><strong>Se usa para:</strong> Análisis estadístico, ciencia de datos, visualización, investigación.</p>
          <p><strong>Disponibilidad:</strong> Open source (GPL).</p>`,
    'arduino': `<h3>Arduino</h3>
                <p>Plataforma de hardware y software para prototipado electrónico.</p>
                <p><strong>Se usa para:</strong> Proyectos DIY, robótica, arte interactivo, Internet de las Cosas.</p>
                <p><strong>Disponibilidad:</strong> Open source.</p>`,
    'assembler': `<h3>Assembler (Lenguaje Ensamblador)</h3>
                <p>Lenguaje de programación de bajo nivel que representa directamente las instrucciones del procesador con una sintaxis legible por humanos.</p>
                <p><strong>Se usa para:</strong> Programación de sistemas embebidos, optimización de rendimiento, desarrollo de drivers, seguridad informática y reverse engineering.</p>
                <p><strong>Disponibilidad:</strong> Varía según la arquitectura del procesador (x86, ARM, RISC-V, etc.).</p>`,
    'typescript': `<h3>TypeScript</h3>
                   <p>Superconjunto de JavaScript con tipado estático opcional.</p>
                   <p><strong>Se usa para:</strong> Desarrollo web frontend, aplicaciones empresariales, proyectos grandes.</p>
                   <p><strong>Disponibilidad:</strong> Open source (Apache 2.0).</p>`,
    'java': `<h3>Java</h3>
             <p>Lenguaje de programación orientado a objetos y portable.</p>
             <p><strong>Se usa para:</strong> Aplicaciones empresariales, Android, sistemas distribuidos.</p>
             <p><strong>Disponibilidad:</strong> Parcialmente open source (OpenJDK).</p>`,
    'html': `<h3>HTML</h3>
             <p>Lenguaje de marcado para estructurar contenido web.</p>
             <p><strong>Se usa para:</strong> Desarrollo web, estructura de páginas, documentos web.</p>
             <p><strong>Disponibilidad:</strong> Estándar abierto (W3C).</p>`,
    'css': `<h3>CSS</h3>
            <p>Lenguaje de hojas de estilo para diseño web.</p>
            <p><strong>Se usa para:</strong> Diseño web, interfaces de usuario, animaciones.</p>
            <p><strong>Disponibilidad:</strong> Estándar abierto (W3C).</p>`,
    'json': `<h3>JSON</h3>
             <p>Formato ligero de intercambio de datos.</p>
             <p><strong>Se usa para:</strong> APIs, configuraciones, almacenamiento de datos estructurados.</p>
             <p><strong>Disponibilidad:</strong> Estándar abierto.</p>`,
    'windows': `<h3>Windows</h3>
                <p>Sistema operativo de Microsoft para computadoras personales.</p>
                <p><strong>Se usa para:</strong> Entornos de escritorio, juegos, desarrollo de software.</p>
                <p><strong>Disponibilidad:</strong> Producto comercial.</p>`,
    'linux': `<h3>Linux</h3>
              <p>Sistema operativo de código abierto basado en Unix.</p>
              <p><strong>Se usa para:</strong> Servidores, desarrollo, sistemas embebidos, supercomputación.</p>
              <p><strong>Disponibilidad:</strong> Open source (GPL y otras).</p>`,
    'mac': `<h3>macOS</h3>
            <p>Sistema operativo de Apple para computadoras Mac.</p>
            <p><strong>Se usa para:</strong> Diseño gráfico, desarrollo, producción multimedia.</p>
            <p><strong>Disponibilidad:</strong> Producto comercial.</p>`,
    'android': `<h3>Android</h3>
                <p>Sistema operativo móvil basado en Linux desarrollado por Google.</p>
                <p><strong>Se usa para:</strong> Dispositivos móviles, pantallas y otros dispositivos electrónicos.</p>
                <p><strong>Disponibilidad:</strong> Parcialmente open source (Apache 2.0). Admite .apk no oficiales habilitando permisos, pero para distribución oficial requiere Google Play.</p>`,
    'ios': `<h3>iOS</h3>
            <p>Sistema operativo móvil de Apple para iPhone y iPad.</p>
            <p><strong>Se usa para:</strong> Dispositivos móviles de Apple.</p>
            <p><strong>Disponibilidad:</strong> Producto comercial. Requiere cuenta de desarrollador de pago y pasar por proceso de aprobación para publicar aplicaciones.</p>`,
    'pantalla-touch': `<h3>Pantalla Touch</h3>
                       <p>Interfaz de entrada basada en contacto directo con la pantalla.</p>
                       <p><strong>Se usa para:</strong> Dispositivos móviles, quioscos interactivos, instalaciones artísticas.</p>
                       <p><strong>Disponibilidad:</strong> Existen marcos touch con salida HDMI o dispositivos KIOSK con Android incluido que admiten .apk o acceso por red local.</p>`,
    'instalaciones-fisicas': `<h3>Instalaciones Físicas</h3>
                              <p>Espacios físicos con componentes electrónicos interactivos.</p>
                              <p><strong>Se usa para:</strong> Arte interactivo, museos, exposiciones, eventos.</p>
                              <p><strong>Disponibilidad:</strong> Depende del proyecto y sus componentes.</p>`,
    'raspberry-pi': `<h3>Raspberry Pi</h3>
                     <p>Computadora de placa única de bajo costo y tamaño reducido.</p>
                     <p><strong>Se usa para:</strong> Proyectos DIY, instalaciones interactivas, Internet de las Cosas, educación.</p>
                     <p><strong>Disponibilidad:</strong> Hardware open source.</p>`,
    'pantalla-led': `<h3>Pantalla LED</h3>
                     <p>Dispositivo de visualización basado en diodos emisores de luz.</p>
                     <p><strong>Se usa para:</strong> Instalaciones artísticas, señalización digital, escenografías, mapping.</p>
                     <p><strong>Disponibilidad:</strong> Hardware comercial en diversos formatos.</p>`,
    'proyector': `<h3>Proyector</h3>
                  <p>Dispositivo óptico que proyecta imágenes en una superficie.</p>
                  <p><strong>Se usa para:</strong> Videomapping, instalaciones inmersivas, proyecciones arquitectónicas, arte digital.</p>
                  <p><strong>Disponibilidad:</strong> Hardware comercial en diversos formatos y potencias.</p>`,
    'sitio-web': `<h3>Sitio Web</h3>
                  <p>Conjunto de páginas web interconectadas accesibles a través de internet.</p>
                  <p><strong>Se usa para:</strong> Portfolios digitales, documentación de proyectos, galerías virtuales, arte web.</p>
                  <p><strong>Disponibilidad:</strong> Accesible a través de navegadores web.</p>`,
    'compilado-apk': `<h3>Compilado APK</h3>
                      <p>Archivo de aplicación empaquetado para el sistema operativo Android.</p>
                      <p><strong>Se usa para:</strong> Distribuir aplicaciones móviles, instalaciones interactivas en dispositivos KIOSK, experiencias inmersivas.</p>
                      <p><strong>Disponibilidad:</strong> Formato estándar para aplicaciones Android.</p>`,
    'xampp': `<h3>XAMPP</h3>
              <p>Paquete de software libre que incluye el servidor web Apache, la base de datos MySQL/MariaDB y los intérpretes para scripts PHP y Perl.</p>
              <p><strong>Se usa para:</strong> Desarrollo web local, pruebas de aplicaciones, entornos de desarrollo.</p>
              <p><strong>Disponibilidad:</strong> Software libre y gratuito.</p>`,
    'spout': `<h3>Spout</h3>
              <p>Protocolo de intercambio de texturas en tiempo real para Windows.</p>
              <p><strong>Se usa para:</strong> Compartir texturas entre aplicaciones en tiempo real, VJ, instalaciones interactivas.</p>
              <p><strong>Disponibilidad:</strong> Open source (BSD).</p>`,
    'syphon': `<h3>Syphon</h3>
               <p>Protocolo de intercambio de texturas en tiempo real para macOS.</p>
               <p><strong>Se usa para:</strong> Compartir texturas entre aplicaciones en tiempo real, VJ, instalaciones interactivas.</p>
               <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'ndi': `<h3>NDI</h3>
            <p>Protocolo de vídeo en red de NewTek.</p>
            <p><strong>Se usa para:</strong> Transmisión de vídeo de alta calidad por red, producción en vivo, instalaciones interactivas.</p>
            <p><strong>Disponibilidad:</strong> Parcialmente open source.</p>`,
    'webrtc': `<h3>WebRTC</h3>
               <p>Tecnología web para comunicación en tiempo real.</p>
               <p><strong>Se usa para:</strong> Videollamadas, transmisión de datos peer-to-peer, aplicaciones colaborativas.</p>
               <p><strong>Disponibilidad:</strong> Open source.</p>`,
    'osc': `<h3>OSC</h3>
            <p>Protocolo de comunicación para instrumentos musicales y multimedia.</p>
            <p><strong>Se usa para:</strong> Control de software multimedia, mapeo de datos, instalaciones interactivas.</p>
            <p><strong>Disponibilidad:</strong> Open source.</p>`,
    'resolume': `<h3>Resolume</h3>
                 <p>Software para mezcla de vídeo en tiempo real y mapping.</p>
                 <p><strong>Se usa para:</strong> VJ, mapping arquitectónico, instalaciones audiovisuales, eventos en vivo.</p>
                 <p><strong>Disponibilidad:</strong> Software comercial.</p>`,
    'blender': `<h3>Blender</h3>
                <p>Software de modelado 3D, animación, composición y renderizado.</p>
                <p><strong>Se usa para:</strong> Modelado 3D, animación, efectos visuales, videojuegos.</p>
                <p><strong>Disponibilidad:</strong> Open source (GPL).</p>`,
    'paquete-adobe': `<h3>Paquete Adobe</h3>
                       <p>Conjunto de aplicaciones para diseño gráfico, edición de video y desarrollo web.</p>
                       <p><strong>Se usa para:</strong> Diseño gráfico, edición de video, animación, desarrollo web.</p>
                       <p><strong>Disponibilidad:</strong> Software comercial. Incluye After Effects, Premiere, Photoshop, Illustrator, XD, entre otros.</p>`,
    'obs': `<h3>OBS Studio</h3>
            <p>Software para grabación y transmisión de video en vivo.</p>
            <p><strong>Se usa para:</strong> Streaming, grabación de pantalla, producción de video en vivo.</p>
            <p><strong>Disponibilidad:</strong> Open source (GPL).</p>`,
    'cinema4d': `<h3>Cinema 4D</h3>
                 <p>Software de modelado 3D, animación y renderizado.</p>
                 <p><strong>Se usa para:</strong> Modelado 3D, animación, efectos visuales, diseño gráfico.</p>
                 <p><strong>Disponibilidad:</strong> Software comercial.</p>`,
    'angular': `<h3>Angular</h3>
                <p>Framework de JavaScript para desarrollo de aplicaciones web.</p>
                <p><strong>Se usa para:</strong> Aplicaciones web empresariales, SPAs, aplicaciones móviles híbridas.</p>
                <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'nextjs': `<h3>Next.js</h3>
               <p>Framework de React para aplicaciones web con renderizado del lado del servidor.</p>
               <p><strong>Se usa para:</strong> Sitios web con alto rendimiento SEO, aplicaciones web, e-commerce.</p>
               <p><strong>Disponibilidad:</strong> Open source (MIT).</p>`,
    'virtual-production': `<h3>Virtual Production</h3>
                           <p>Técnica que combina filmación en vivo con entornos virtuales en tiempo real.</p>
                           <p><strong>Se usa para:</strong> Producción cinematográfica, televisión, eventos en vivo, instalaciones artísticas.</p>
                           <p><strong>Disponibilidad:</strong> Tecnología principalmente basada en Unreal Engine.</p>`,
    'vr': `<h3>Realidad Virtual (VR)</h3>
           <p>Tecnología que permite la inmersión en entornos virtuales mediante dispositivos especializados.</p>
           <p><strong>Se usa para:</strong> Videojuegos inmersivos, entrenamiento, educación, arte interactivo.</p>
           <p><strong>Disponibilidad:</strong> Requiere hardware específico como Oculus Quest, HTC Vive, Valve Index.</p>`,
    'ar': `<h3>Realidad Aumentada (AR)</h3>
           <p>Tecnología que superpone elementos virtuales en el mundo real.</p>
           <p><strong>Se usa para:</strong> Aplicaciones interactivas, educación, marketing, navegación, experiencias artísticas.</p>
           <p><strong>Disponibilidad:</strong> Principalmente en dispositivos móviles Android e iOS.</p>`,
    'api': `<h3>API</h3>
            <p>Interfaz de Programación de Aplicaciones. Conjunto de reglas y protocolos para la comunicación entre aplicaciones.</p>
            <p><strong>Se usa para:</strong> Integración de servicios, acceso a datos externos, automatización de procesos.</p>
            <p><strong>Disponibilidad:</strong> Varía según el proveedor, desde abiertas hasta comerciales.</p>`,
    'midi': `<h3>MIDI</h3>
             <p>Protocolo estándar para la comunicación entre instrumentos musicales electrónicos y computadoras.</p>
             <p><strong>Se usa para:</strong> Composición musical, control de sintetizadores, automatización de audio, instalaciones interactivas.</p>
             <p><strong>Disponibilidad:</strong> Estándar abierto.</p>`,
    'nft': `<h3>NFT</h3>
             <p>Token No Fungible, un activo digital único que representa la propiedad de un elemento digital específico.</p>
             <p><strong>Se usa para:</strong> Arte digital, coleccionables, certificados de autenticidad, propiedad digital en blockchain.</p>
             <p><strong>Disponibilidad:</strong> Implementado en diversas blockchains como Ethereum, Solana, Tezos, entre otras.</p>`,
    'sonido': `<h3>Sonido</h3>
               <p>Medio de expresión artística y comunicación basado en ondas acústicas.</p>
               <p><strong>Se usa para:</strong> Instalaciones sonoras, música generativa, arte interactivo, diseño de experiencias inmersivas.</p>
               <p><strong>Disponibilidad:</strong> Medio universal accesible a través de diversas tecnologías.</p>`,
    'videojuegos': `<h3>Videojuegos</h3>
                    <p>Medio interactivo que combina narrativa, arte visual y programación.</p>
                    <p><strong>Se usa para:</strong> Entretenimiento, educación, arte interactivo, simulaciones, experiencias inmersivas.</p>
                    <p><strong>Disponibilidad:</strong> Desde plataformas comerciales hasta desarrollo independiente.</p>`,
    'ableton': `<h3>Ableton Live</h3>
                <p>Software de producción musical y actuación en vivo.</p>
                <p><strong>Se usa para:</strong> Producción musical, actuaciones en vivo, instalaciones sonoras, arte interactivo.</p>
                <p><strong>Disponibilidad:</strong> Software comercial.</p>`,
    'puredata': `<h3>Pure Data</h3>
                 <p>Entorno de programación visual para audio, video y procesamiento gráfico.</p>
                 <p><strong>Se usa para:</strong> Arte sonoro, instalaciones interactivas, procesamiento de señales en tiempo real, música generativa.</p>
                 <p><strong>Disponibilidad:</strong> Open source (BSD).</p>`,
    'guipper': `<h3>Guipper</h3>
                <p>Software de programación visual para la creación de gráficos generativos en tiempo real.</p>
                <p><strong>Se usa para:</strong> Visuales en vivo, VJ, instalaciones interactivas, arte generativo.</p>
                <p><strong>Disponibilidad:</strong> Open source.</p>`,
    'gitbash': `<h3>Git Bash</h3>
                <p>Emulador de terminal que integra Git con una shell de tipo Bash para Windows.</p>
                <p><strong>Se usa para:</strong> Control de versiones, gestión de repositorios, automatización de tareas mediante scripts.</p>
                <p><strong>Disponibilidad:</strong> Software libre incluido con Git para Windows.</p>`,
    'mapping': `<h3>Mapping</h3>
                <p>Técnica que consiste en proyectar imágenes sobre superficies reales para conseguir efectos de movimiento o 3D.</p>
                <p><strong>Se usa para:</strong> Instalaciones artísticas, eventos, espectáculos, publicidad, arquitectura.</p>
                <p><strong>Disponibilidad:</strong> Técnica accesible mediante software especializado.</p>`,
    'livecoding': `<h3>Livecoding</h3>
                   <p>Práctica de programación en vivo donde el código se escribe y modifica en tiempo real como parte de una actuación artística o musical.</p>
                   <p><strong>Se usa para:</strong> Performances, instalaciones interactivas, eventos artísticos.</p>
                   <p><strong>Disponibilidad:</strong> Práctica abierta con diversas herramientas disponibles.</p>`,
    'vibecoding': `<h3>Vibecoding</h3>
                   <p>Práctica de programación utilizando exclusivamente modelos de lenguaje y editores de texto.</p>
                   <p><strong>Se usa para:</strong> Desarrollo de código de manera fluida y conversacional.</p>
                   <p><strong>Disponibilidad:</strong> Requiere acceso a modelos de lenguaje avanzados (LLMs).</p>`,
    'programacion': `<h3>Programación</h3>
                     <p>Arte de crear instrucciones para que una computadora realice tareas específicas.</p>
                     <p><strong>Se usa para:</strong> Desarrollo de software, automatización, resolución de problemas.</p>
                     <p><strong>Estructuras básicas:</strong></p>
                     <ul style="margin: 5px 0; padding-left: 20px;">
                         <li><strong>Variables:</strong> Contenedores para almacenar datos</li>
                         <li><strong>IFs:</strong> Estructuras condicionales para toma de decisiones</li>
                         <li><strong>Ciclos repetitivos:</strong> for, map, while, do-while, etc.</li>
                         <li><strong>Funciones:</strong> Bloques de código reutilizables</li>
                         <li><strong>Clases:</strong> Plantillas para crear objetos</li>
                         <li><strong>Objetos:</strong> Instancias con propiedades y métodos</li>
                     </ul>
                     <p><strong>Disponibilidad:</strong> Conocimiento libre accesible a través de diversos recursos educativos.</p>`,
    'prompting': `<h3>Prompting</h3>
                  <p>Técnica para comunicarse eficazmente con modelos de IA mediante instrucciones precisas.</p>
                  <p><strong>Se usa para:</strong> Obtener resultados óptimos de modelos de IA, generación de contenido, asistencia en programación.</p>
                  <p><strong>Disponibilidad:</strong> Técnica accesible para cualquier usuario de modelos de IA.</p>`,
    'consola': `<h3>Consola</h3>
                <p>Interfaz de línea de comandos que permite interactuar con el sistema operativo o con un programa mediante texto.</p>
                <p><strong>Se usa para:</strong> Ejecutar comandos, depurar aplicaciones, monitorear procesos y realizar tareas administrativas.</p>
                <p><strong>Disponibilidad:</strong> Presente en todos los sistemas operativos modernos.</p>`,
    'script': `<h3>Script</h3>
               <p>Archivo de texto que contiene una serie de instrucciones que son ejecutadas secuencialmente por un intérprete.</p>
               <p><strong>Se usa para:</strong> Automatizar tareas, configurar sistemas, procesar datos y crear funcionalidades.</p>
               <p><strong>Disponibilidad:</strong> Puede crearse en cualquier editor de texto.</p>`,
    'compilado-interpretado': `<h3>Lenguajes Compilados vs Interpretados</h3>
                              <p>Dos enfoques diferentes para la ejecución de código.</p>
                              <p><strong>Se usa para:</strong> Desarrollo de software con diferentes requisitos de rendimiento y flexibilidad.</p>
                              <p><strong>Disponibilidad:</strong> Los lenguajes compilados (C++, Rust) traducen todo el código a lenguaje máquina antes de la ejecución, mientras que los interpretados (Python, JavaScript) lo hacen línea por línea durante la ejecución.</p>`,
    'drivers': `<h3>Drivers</h3>
                <p>Software especializado que permite la comunicación entre el sistema operativo y el hardware.</p>
                <p><strong>Se usa para:</strong> Habilitar el funcionamiento de componentes como tarjetas gráficas, impresoras o controladores.</p>
                <p><strong>Disponibilidad:</strong> Proporcionados por fabricantes de hardware o incluidos en sistemas operativos.</p>`,
    'mcp': `<h3>MCP (Model-Controller-Presenter)</h3>
            <p>Patrón arquitectónico de software que extiende el MVC para separar mejor las responsabilidades.</p>
            <p><strong>Se usa para:</strong> Estructurar aplicaciones complejas, mejorar la testabilidad y mantener un código más limpio.</p>
            <p><strong>Disponibilidad:</strong> Concepto de diseño aplicable en cualquier proyecto de software.</p>`,
    'repositorio': `<h3>Repositorio (o Repo)</h3>
            <p>Espacio centralizado donde se almacena, organiza, mantiene y difunde información digital, habitualmente bases de datos o archivos informáticos.</p>
            <p><strong>Se usa para:</strong> Almacenar código fuente, controlar versiones, colaborar en proyectos de desarrollo y compartir recursos.</p>
            <p><strong>Disponibilidad:</strong> Servicios como GitHub, GitLab, Bitbucket o implementaciones propias.</p>`,
    'github': `<h3>GitHub</h3>
            <p>Plataforma de desarrollo colaborativo basada en Git que permite alojar y revisar código, gestionar proyectos y construir software junto con otros desarrolladores.</p>
            <p><strong>Se usa para:</strong> Almacenar repositorios, colaborar en proyectos, gestionar versiones de código y publicar páginas web mediante GitHub Pages.</p>
            <p><strong>Disponibilidad:</strong> Servicio gratuito con opciones de pago para funcionalidades avanzadas.</p>
            <p><strong>Nota:</strong> Es la plataforma que utilizaremos para mostrar nuestras páginas web durante el curso.</p>`,
    'git': `<h3>Git</h3>
            <p>Sistema de control de versiones distribuido diseñado para manejar proyectos desde pequeños a muy grandes con velocidad y eficiencia.</p>
            <p><strong>Se usa para:</strong> Control de versiones, trabajo colaborativo, seguimiento de cambios en archivos y gestión de ramas de desarrollo.</p>
            <p><strong>Disponibilidad:</strong> Software libre y de código abierto.</p>`,
    'ejemplos-shaders': `<h3>Ejemplos de Shaders</h3>
                         <p>Colección de ejemplos prácticos de shaders GLSL que muestran diferentes efectos visuales.</p>
                         <p><strong>Se usa para:</strong> Aprender y experimentar con shaders desde nivel básico hasta avanzado.</p>
                         <p><strong>Disponibilidad:</strong> Recursos educativos disponibles en línea.</p>`,
    'editor-shaders-live': `<h3>Editor de Shaders Live</h3>
                            <p>Herramienta online para escribir, editar y visualizar shaders GLSL en tiempo real.</p>
                            <p><strong>Se usa para:</strong> Experimentar con código de shaders y ver resultados inmediatamente.</p>
                            <p><strong>Disponibilidad:</strong> Herramientas web accesibles desde navegadores.</p>`,
    'entornos': `<h3>Entornos de Desarrollo</h3>
                <p>Herramientas que permiten crear y gestionar ambientes aislados para el desarrollo de software.</p>
                <p><strong>Se usa para:</strong> Aislar dependencias, garantizar la reproducibilidad, facilitar la colaboración y el despliegue de aplicaciones.</p>
                <p><strong>Disponibilidad:</strong> Diversas herramientas open source y comerciales.</p>`,
    'docker': `<h3>Docker</h3>
              <p>Plataforma de virtualización a nivel de sistema operativo para desarrollar, enviar y ejecutar aplicaciones en contenedores.</p>
              <p><strong>Se usa para:</strong> Crear entornos aislados y reproducibles, facilitar el despliegue de aplicaciones y microservicios.</p>
              <p><strong>Disponibilidad:</strong> Open source con versiones Community y Enterprise.</p>`,
    'venv': `<h3>venv (Python)</h3>
            <p>Módulo integrado en Python para crear entornos virtuales ligeros con su propia instalación de Python.</p>
            <p><strong>Se usa para:</strong> Aislar dependencias de proyectos Python, evitar conflictos entre paquetes.</p>
            <p><strong>Disponibilidad:</strong> Incluido en la biblioteca estándar de Python desde la versión 3.3.</p>`,
    'conda': `<h3>Conda</h3>
             <p>Sistema de gestión de paquetes y entornos multiplataforma, especialmente popular en ciencia de datos.</p>
             <p><strong>Se usa para:</strong> Crear entornos virtuales para Python, R y otros lenguajes, gestionar dependencias complejas.</p>
             <p><strong>Disponibilidad:</strong> Open source, disponible a través de Anaconda o Miniconda.</p>`
};


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
        { data: { id: 'entornos', label: 'Entornos de Desarrollo', type: 'category' } },
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
        { data: { id: 'assembler', label: 'Assembler', url: 'https://en.wikipedia.org/wiki/Assembly_language' } },
        
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
        { data: { id: 'nft', label: 'NFT', url: 'https://ethereum.org/en/nft/' } },

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
        { data: { id: 'gitbash', label: 'Git Bash', url: 'https://gitforwindows.org/' } },
        
        // Glosario
        { data: { id: 'livecoding', label: 'Livecoding', url: '#' } },
        { data: { id: 'vibecoding', label: 'Vibecoding', url: '#' } },
        { data: { id: 'programacion', label: 'Programación', url: '#' } },
        { data: { id: 'prompting', label: 'Prompting', url: '#' } },
        { data: { id: 'consola', label: 'Consola', url: '#' } },
        { data: { id: 'script', label: 'Script', url: '#' } },
        { data: { id: 'compilado-interpretado', label: 'Lenguaje de compilado vs interpretado', url: '#' } },
        { data: { id: 'drivers', label: 'Drivers', url: '#' } },
        { data: { id: 'mcp', label: 'MCP', url: '#' } },
        { data: { id: 'repositorio', label: 'Repositorio (o Repo)', url: 'https://github.com/' } },
        { data: { id: 'github', label: 'GitHub', url: 'https://github.com/' } },
        { data: { id: 'git', label: 'Git', url: 'https://git-scm.com/' } },

        // Entornos de Desarrollo
        { data: { id: 'docker', label: 'Docker', url: 'https://www.docker.com/' } },
        { data: { id: 'venv', label: 'venv', url: 'https://docs.python.org/3/library/venv.html' } },
        { data: { id: 'conda', label: 'Conda', url: 'https://docs.conda.io/' } },
        
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
        { data: { id: 'root-entornos', source: 'root', target: 'entornos' } },
        { data: { id: 'root-glosario', source: 'root', target: 'glosario' } }
    ];
}

// Archivo de conexiones para el mapa de herramientas
// Contiene todas las conexiones entre nodos secundarios

// Función para obtener las conexiones del mapa
function getMapConnections() {
    return [
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
        { data: { id: 'shaders-ejemplos-shaders', source: 'shaders', target: 'ejemplos-shaders' } },
        { data: { id: 'shaders-editor-shaders-live', source: 'shaders', target: 'editor-shaders-live' } },
        
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
        { data: { id: 'languages-assembler', source: 'languages', target: 'assembler' } },
        
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
        { data: { id: 'soportes-mapping', source: 'soportes', target: 'mapping' } },
        { data: { id: 'soportes-nft', source: 'soportes', target: 'nft' } },

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
        { data: { id: 'software-multimedia-gitbash', source: 'software-multimedia', target: 'gitbash' } },

        // Entornos de Desarrollo
        { data: { id: 'entornos-docker', source: 'entornos', target: 'docker' } },
        { data: { id: 'entornos-venv', source: 'entornos', target: 'venv' } },
        { data: { id: 'entornos-conda', source: 'entornos', target: 'conda' } },
        
        // Glosario
        { data: { id: 'glosario-livecoding', source: 'glosario', target: 'livecoding' } },
        { data: { id: 'glosario-vibecoding', source: 'glosario', target: 'vibecoding' } },
        { data: { id: 'glosario-programacion', source: 'glosario', target: 'programacion' } },
        { data: { id: 'glosario-prompting', source: 'glosario', target: 'prompting' } },
        { data: { id: 'glosario-consola', source: 'glosario', target: 'consola' } },
        { data: { id: 'glosario-script', source: 'glosario', target: 'script' } },
        { data: { id: 'glosario-compilado-interpretado', source: 'glosario', target: 'compilado-interpretado' } },
        { data: { id: 'glosario-drivers', source: 'glosario', target: 'drivers' } },
        { data: { id: 'glosario-mcp', source: 'glosario', target: 'mcp' } },
        { data: { id: 'glosario-repositorio', source: 'glosario', target: 'repositorio' } },
        { data: { id: 'glosario-github', source: 'glosario', target: 'github' } },
        { data: { id: 'glosario-git', source: 'glosario', target: 'git' } },
        
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
        { data: { id: 'resolume-midi', source: 'resolume', target: 'midi', type: 'secondary' } },
        { data: { id: 'resolume-ndi', source: 'resolume', target: 'ndi', type: 'secondary' } },
        { data: { id: 'resolume-spout', source: 'resolume', target: 'spout', type: 'secondary' } },
        // Eliminada la conexión entre Python y Resolume: { data: { id: 'resolume-python', source: 'resolume', target: 'python', type: 'secondary' } },
        { data: { id: 'guipper-osc', source: 'guipper', target: 'osc', type: 'secondary' } },
        { data: { id: 'guipper-spout', source: 'guipper', target: 'spout', type: 'secondary' } },
        { data: { id: 'guipper-ndi', source: 'guipper', target: 'ndi', type: 'secondary' } },
        { data: { id: 'videojuegos-unity', source: 'videojuegos', target: 'unity', type: 'secondary' } },
        { data: { id: 'videojuegos-godot', source: 'videojuegos', target: 'godot', type: 'secondary' } },
        { data: { id: 'videojuegos-unreal', source: 'videojuegos', target: 'unreal', type: 'secondary' } },
        { data: { id: 'videojuegos-javascript', source: 'videojuegos', target: 'javascript', type: 'secondary' } },
        { data: { id: 'videojuegos-three', source: 'videojuegos', target: 'three', type: 'secondary' } },
        { data: { id: 'vibecoding-ides', source: 'vibecoding', target: 'ides', type: 'secondary' } },
        { data: { id: 'nft-p5', source: 'nft', target: 'p5', type: 'secondary' } },
        { data: { id: 'nft-three', source: 'nft', target: 'three', type: 'secondary' } },
        { data: { id: 'nft-javascript', source: 'nft', target: 'javascript', type: 'secondary' } },
        { data: { id: 'nft-babylon', source: 'nft', target: 'babylon', type: 'secondary' } },
        { data: { id: 'github-git', source: 'github', target: 'git', type: 'secondary' } },
        { data: { id: 'github-repositorio', source: 'github', target: 'repositorio', type: 'secondary' } },
        { data: { id: 'git-repositorio', source: 'git', target: 'repositorio', type: 'secondary' } },
        { data: { id: 'gitbash-git', source: 'gitbash', target: 'git', type: 'secondary' } },
        { data: { id: 'gitbash-nodejs', source: 'gitbash', target: 'nodejs', type: 'secondary' } },
        { data: { id: 'gitbash-python', source: 'gitbash', target: 'python', type: 'secondary' } },
        { data: { id: 'docker-python', source: 'docker', target: 'python', type: 'secondary' } },
        { data: { id: 'docker-nodejs', source: 'docker', target: 'nodejs', type: 'secondary' } },
        { data: { id: 'venv-python', source: 'venv', target: 'python', type: 'secondary' } },
        { data: { id: 'conda-python', source: 'conda', target: 'python', type: 'secondary' } },
        { data: { id: 'conda-r', source: 'conda', target: 'r', type: 'secondary' } },
        { data: { id: 'livecoding-hydra', source: 'livecoding', target: 'hydra', type: 'secondary' } },
        { data: { id: 'livecoding-javascript', source: 'livecoding', target: 'javascript', type: 'secondary' } },
        { data: { id: 'livecoding-p5', source: 'livecoding', target: 'p5', type: 'secondary' } },
        { data: { id: 'livecoding-glsl', source: 'livecoding', target: 'glsl', type: 'secondary' } },
        { data: { id: 'editor-shaders-live-javascript', source: 'editor-shaders-live', target: 'javascript', type: 'secondary' } },
        { data: { id: 'editor-shaders-live-html', source: 'editor-shaders-live', target: 'html', type: 'secondary' } },
        { data: { id: 'editor-shaders-live-css', source: 'editor-shaders-live', target: 'css', type: 'secondary' } },
        { data: { id: 'editor-shaders-live-websockets', source: 'editor-shaders-live', target: 'websockets', type: 'secondary' } },
        { data: { id: 'editor-shaders-live-nodejs', source: 'editor-shaders-live', target: 'nodejs', type: 'secondary' } },
        
        // Conexiones con sistemas operativos
        { data: { id: 'unity-windows', source: 'unity', target: 'windows', type: 'secondary' } },
        { data: { id: 'unity-mac', source: 'unity', target: 'mac', type: 'secondary' } },
        { data: { id: 'unity-linux', source: 'unity', target: 'linux', type: 'secondary' } },
        { data: { id: 'unity-android', source: 'unity', target: 'android', type: 'secondary' } },
        { data: { id: 'unity-ios', source: 'unity', target: 'ios', type: 'secondary' } }
    ];
}
