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
        'soportes': 1600,        // Distancia de Soportes al nodo central
        'protocolos': 1200,      // Distancia de Protocolos de Comunicación al nodo central
        'software-multimedia': 900, // Distancia de Software Multimediales al nodo central
        'glosario': 1200         // Distancia de Glosario al nodo central
    },
    categoryDistances: {         // Distancias personalizadas para cada categoría
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
        'soportes': 250,        // Distancia de Soportes a sus elementos
        'protocolos': 200,      // Distancia de Protocolos de Comunicación a sus elementos
        'software-multimedia': 200, // Distancia de Software Multimediales a sus elementos
        'glosario': 200         // Distancia de Glosario a sus elementos
    }
};

// Descripciones de los nodos para mostrar en hover
const NODE_INFO = {
    // Descripciones de las categorías principales
    'engines': 'Motores gráficos y entornos de desarrollo para crear aplicaciones interactivas, videojuegos y experiencias visuales. Estas herramientas proporcionan frameworks completos con capacidades de renderizado, física, audio y más.',
    'frameworks': 'Bibliotecas y frameworks que facilitan el desarrollo web y multimedia. Proporcionan estructuras y funciones predefinidas para agilizar la creación de aplicaciones y contenido interactivo.',
    'ia': 'Herramientas de Inteligencia Artificial para la generación de contenido, automatización de tareas y asistencia en el proceso creativo. Incluye modelos de generación de imágenes, texto y otros tipos de contenido.',
    'shaders': 'Programas que se ejecutan en la GPU para crear efectos visuales y gráficos avanzados. Los shaders permiten manipular píxeles, vértices y geometría para crear visuales complejos y efectos en tiempo real.',
    'db': 'Sistemas de bases de datos para almacenar, organizar y recuperar información. Incluye bases de datos relacionales, NoSQL y servicios en la nube para gestión de datos.',
    'ides': 'Entornos de Desarrollo Integrado que facilitan la escritura, prueba y depuración de código. Proporcionan herramientas como editores de código, depuradores y funciones de autocompletado.',
    'languages': 'Lenguajes de programación utilizados para desarrollar aplicaciones, sitios web y experiencias interactivas. Cada lenguaje tiene sus propias características, sintaxis y casos de uso.',
    'llm': 'Modelos de Lenguaje de Gran Escala (Large Language Models) que utilizan aprendizaje profundo para generar y comprender texto. Son útiles para asistencia en programación, generación de contenido y más.',
    'frontend': 'Frameworks para desarrollo de interfaces de usuario web. Facilitan la creación de aplicaciones web interactivas y reactivas con componentes reutilizables.',
    'os': 'Sistemas Operativos que sirven como plataforma base para ejecutar aplicaciones y software. Cada sistema operativo tiene sus propias características, limitaciones y ventajas.',
    'soportes': 'Medios físicos y digitales donde se pueden implementar y mostrar proyectos interactivos. Incluye dispositivos, plataformas y formatos para la distribución de contenido.',
    'protocolos': 'Estándares y protocolos de comunicación que permiten la interacción entre diferentes sistemas, dispositivos y aplicaciones. Facilitan el intercambio de datos y la interoperabilidad.',
    'software-multimedia': 'Aplicaciones especializadas para la creación, edición y procesamiento de contenido multimedia como video, audio, gráficos 3D y efectos visuales.',
    'glosario': 'Términos y conceptos fundamentales relacionados con la programación, el desarrollo de software y las tecnologías creativas. Sirve como referencia para entender la terminología técnica.',
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
    'guipper': 'Software de programación visual para la creación de gráficos generativos en tiempo real. Open source. Se usa para visuales en vivo, VJ, instalaciones interactivas, arte generativo.',
    'mapping': 'Técnica que consiste en proyectar imágenes sobre superficies reales para conseguir efectos de movimiento o 3D. Se usa para instalaciones artísticas, eventos, espectáculos, publicidad, arquitectura.',
    'livecoding': 'Práctica de programación en vivo donde el código se escribe y modifica en tiempo real como parte de una actuación artística o musical. Implica la creación de visuales o sonidos mediante la escritura de código frente a una audiencia, combinando programación con improvisación artística. Se utiliza en performances, instalaciones interactivas y eventos artísticos.',
    'vibecoding': 'Práctica de programación utilizando exclusivamente modelos de lenguaje y editores de texto. Permite desarrollar código de manera fluida y conversacional, aprovechando las capacidades de los LLMs para generar, explicar y modificar código sin necesidad de entornos de desarrollo complejos.',
    'programacion': 'Arte de crear instrucciones para que una computadora realice tareas específicas. Conceptos básicos: IF (estructura condicional que ejecuta código si se cumple una condición), Ciclos repetitivos (do, while, for: estructuras que repiten código un número determinado de veces), Clases (plantillas para crear objetos), Objetos (instancias de clases con propiedades y métodos), Listeners (funciones que esperan y responden a eventos).',
    'prompting': 'Técnica para comunicarse eficazmente con modelos de IA mediante instrucciones precisas. Consejos para programar bien: 1) Mantener el código simple y legible, 2) Comentar adecuadamente, 3) Seguir convenciones de nomenclatura, 4) Dividir problemas complejos en partes más pequeñas, 5) Realizar pruebas frecuentes, 6) Optimizar solo cuando sea necesario, 7) Practicar la refactorización, 8) Mantener un control de versiones.',
    'consola': 'Interfaz de línea de comandos que permite interactuar con el sistema operativo o con un programa mediante texto. Se usa para ejecutar comandos, depurar aplicaciones, monitorear procesos y realizar tareas administrativas sin necesidad de una interfaz gráfica.',
    'script': 'Archivo de texto que contiene una serie de instrucciones que son ejecutadas secuencialmente por un intérprete. Los scripts se utilizan para automatizar tareas, configurar sistemas, procesar datos y crear funcionalidades en aplicaciones web y de escritorio.',
    'compilado-interpretado': 'Los lenguajes compilados (como C++, Rust) traducen todo el código a lenguaje máquina antes de la ejecución, resultando en programas más rápidos pero menos flexibles. Los lenguajes interpretados (como Python, JavaScript) traducen el código línea por línea durante la ejecución, ofreciendo mayor flexibilidad pero menor rendimiento.',
    'formatos-exe': 'Archivos ejecutables que contienen instrucciones en código máquina que pueden ser ejecutadas directamente por el sistema operativo. Incluyen .exe (Windows), .app (macOS), .apk (Android), entre otros. Estos archivos son el resultado final del proceso de compilación de un programa.',
    'drivers': 'Software especializado que permite la comunicación entre el sistema operativo y el hardware de la computadora. Los drivers actúan como traductores entre los dispositivos físicos y el software, permitiendo que componentes como tarjetas gráficas, impresoras o controladores funcionen correctamente.',
    'mcp': 'Model-Controller-Presenter, un patrón arquitectónico de software que extiende el MVC (Model-View-Controller) para separar mejor las responsabilidades. Se utiliza para estructurar aplicaciones complejas, mejorar la testabilidad y mantener un código más limpio y modular.',
    'ejemplos-shaders': 'Colección de ejemplos prácticos de shaders GLSL que muestran diferentes efectos visuales y técnicas de programación gráfica. Útil para aprender y experimentar con shaders desde un nivel básico hasta avanzado.',
    'editor-shaders-live': 'Herramienta online para escribir, editar y visualizar shaders GLSL en tiempo real. Permite experimentar con código de shaders y ver los resultados inmediatamente, facilitando el aprendizaje y la iteración rápida.'
};
