// Variables globales de configuración
const CONFIG = {
    distNode: 400,          // Distancia entre nodos
    primaryNodeSize: 150,   // Tamaño de los nodos primarios (categorías)
    secondaryNodeSize: 120, // Tamaño de los nodos secundarios
    nodeFontSize: 16,       // Tamaño de fuente para nodos secundarios
    categoryFontSize: 18    // Tamaño de fuente para categorías
};

// Descripciones de los nodos para mostrar en hover
const NODE_INFO = {
    'unity': 'Motor de juegos multiplataforma con potentes capacidades gráficas y físicas.',
    'unreal': 'Motor de juegos de alta fidelidad visual, ideal para proyectos AAA y experiencias inmersivas.',
    'godot': 'Motor de código abierto con soporte para 2D y 3D, ideal para desarrolladores independientes.',
    'p5': 'Biblioteca JavaScript para programación creativa con enfoque en artes visuales y web.',
    'three': 'Biblioteca JavaScript para crear y mostrar gráficos 3D animados en navegadores web.',
    'babylon': 'Framework de JavaScript para crear juegos y experiencias 3D en navegadores web.',
    'tone': 'Framework de audio web para crear experiencias musicales interactivas.',
    'comfy': 'Interfaz gráfica para flujos de trabajo de IA generativa, especialmente para imágenes.',
    'n8n': 'Plataforma de automatización de flujos de trabajo con integración de IA.',
    'cursor': 'Editor de código con asistencia de IA integrada para programación.',
    'trae': 'Asistente de programación basado en IA para desarrollo de software.',
    'v0': 'Herramienta de generación de interfaces con IA.',
    'windsurf': 'Plataforma de desarrollo con asistencia de IA.',
    'shadertoy': 'Plataforma web para crear y compartir shaders en tiempo real.',
    'glsl': 'Lenguaje de sombreado para gráficos OpenGL.',
    'hlsl': 'Lenguaje de sombreado de alto nivel para DirectX.',
    'bookofshaders': 'Guía paso a paso para aprender programación de shaders.',
    'firebase': 'Plataforma de desarrollo con base de datos en tiempo real y servicios en la nube.',
    'mongodb': 'Base de datos NoSQL orientada a documentos, flexible y escalable.',
    'sql': 'Lenguaje estándar para gestionar bases de datos relacionales.',
    'cpp': 'Lenguaje de programación de propósito general con control de bajo nivel.',
    'php': 'Lenguaje de programación para desarrollo web del lado del servidor.',
    'javascript': 'Lenguaje de programación interpretado para desarrollo web interactivo.',
    'python': 'Lenguaje de programación de alto nivel con sintaxis clara y legible.',
    'typescript': 'Superconjunto de JavaScript con tipado estático opcional.',
    'java': 'Lenguaje de programación orientado a objetos, portable y de propósito general.'
};

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
            
            // Motores Gráficos
            { data: { id: 'unity', label: 'Unity', url: 'https://unity.com/' } },
            { data: { id: 'unreal', label: 'Unreal Engine', url: 'https://www.unrealengine.com/' } },
            { data: { id: 'godot', label: 'Godot', url: 'https://godotengine.org/' } },
            
            // Frameworks Web
            { data: { id: 'p5', label: 'P5.js', url: 'https://p5js.org/es/' } },
            { data: { id: 'three', label: 'Three.js', url: 'https://threejs.org/docs/' } },
            { data: { id: 'babylon', label: 'Babylon.js', url: 'https://www.babylonjs.com/' } },
            { data: { id: 'tone', label: 'Tone.js', url: 'https://tonejs.github.io/' } },
            
            // Herramientas IA
            { data: { id: 'comfy', label: 'ComfyUI', url: 'https://github.com/comfyanonymous/ComfyUI' } },
            { data: { id: 'n8n', label: 'n8n', url: 'https://n8n.io/' } },
            
            // IDEs
            { data: { id: 'cursor', label: 'Cursor Editor', url: 'https://cursor.sh/' } },
            { data: { id: 'trae', label: 'Trae AI', url: 'https://www.trae.ai/' } },
            { data: { id: 'v0', label: 'v0.dev', url: 'https://v0.dev/' } },
            { data: { id: 'windsurf', label: 'Windsurf', url: 'https://www.windsurf.io/' } },
            
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
            { data: { id: 'php', label: 'PHP', url: 'https://www.php.net/' } },
            { data: { id: 'javascript', label: 'JavaScript', url: 'https://developer.mozilla.org/es/docs/Web/JavaScript' } },
            { data: { id: 'python', label: 'Python', url: 'https://www.python.org/' } },
            { data: { id: 'typescript', label: 'TypeScript', url: 'https://www.typescriptlang.org/' } },
            { data: { id: 'java', label: 'Java', url: 'https://www.java.com/' } },
            
            // Conexiones principales con el nodo raíz
            { data: { id: 'root-engines', source: 'root', target: 'engines' } },
            { data: { id: 'root-frameworks', source: 'root', target: 'frameworks' } },
            { data: { id: 'root-ia', source: 'root', target: 'ia' } },
            { data: { id: 'root-shaders', source: 'root', target: 'shaders' } },
            { data: { id: 'root-db', source: 'root', target: 'db' } },
            { data: { id: 'root-ides', source: 'root', target: 'ides' } },
            { data: { id: 'root-languages', source: 'root', target: 'languages' } },
            
            // Conexiones de categorías a sus elementos
            // Motores Gráficos
            { data: { id: 'engines-unity', source: 'engines', target: 'unity' } },
            { data: { id: 'engines-unreal', source: 'engines', target: 'unreal' } },
            { data: { id: 'engines-godot', source: 'engines', target: 'godot' } },
            
            // Frameworks Web
            { data: { id: 'frameworks-p5', source: 'frameworks', target: 'p5' } },
            { data: { id: 'frameworks-three', source: 'frameworks', target: 'three' } },
            { data: { id: 'frameworks-babylon', source: 'frameworks', target: 'babylon' } },
            { data: { id: 'frameworks-tone', source: 'frameworks', target: 'tone' } },
            
            // Herramientas IA
            { data: { id: 'ia-comfy', source: 'ia', target: 'comfy' } },
            { data: { id: 'ia-n8n', source: 'ia', target: 'n8n' } },
            
            // IDEs
            { data: { id: 'ides-cursor', source: 'ides', target: 'cursor' } },
            { data: { id: 'ides-trae', source: 'ides', target: 'trae' } },
            { data: { id: 'ides-v0', source: 'ides', target: 'v0' } },
            { data: { id: 'ides-windsurf', source: 'ides', target: 'windsurf' } },
            
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
            { data: { id: 'languages-php', source: 'languages', target: 'php' } },
            { data: { id: 'languages-javascript', source: 'languages', target: 'javascript' } },
            { data: { id: 'languages-python', source: 'languages', target: 'python' } },
            { data: { id: 'languages-typescript', source: 'languages', target: 'typescript' } },
            { data: { id: 'languages-java', source: 'languages', target: 'java' } },
            
            // Algunas conexiones adicionales entre nodos relacionados
            { data: { id: 'three-glsl', source: 'three', target: 'glsl' } },
            { data: { id: 'javascript-typescript', source: 'javascript', target: 'typescript' } },
            { data: { id: 'unity-cpp', source: 'unity', target: 'cpp' } },
            { data: { id: 'p5-javascript', source: 'p5', target: 'javascript' } },
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
                    'padding': '15px'
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
                    const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages'];
                    const index = categories.indexOf(node.id());
                    if (index !== -1) {
                        const angle = (2 * Math.PI * index) / categories.length;
                        const radius = 300;
                        return {
                            x: radius * Math.cos(angle),
                            y: radius * Math.sin(angle)
                        };
                    }
                }
                
                // Posiciones para nodos secundarios (segundo anillo)
                const categoryMap = {
                    'unity': 'engines', 'unreal': 'engines', 'godot': 'engines',
                    'p5': 'frameworks', 'three': 'frameworks', 'babylon': 'frameworks', 'tone': 'frameworks',
                    'comfy': 'ia', 'n8n': 'ia',
                    'cursor': 'ides', 'trae': 'ides', 'v0': 'ides', 'windsurf': 'ides',
                    'shadertoy': 'shaders', 'glsl': 'shaders', 'hlsl': 'shaders', 'bookofshaders': 'shaders',
                    'firebase': 'db', 'mongodb': 'db', 'sql': 'db',
                    'cpp': 'languages', 'php': 'languages', 'javascript': 'languages', 
                    'python': 'languages', 'typescript': 'languages', 'java': 'languages'
                };
                
                const parentCategory = categoryMap[node.id()];
                if (parentCategory) {
                    const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages'];
                    const categoryIndex = categories.indexOf(parentCategory);
                    
                    // Obtener nodos hermanos (misma categoría)
                    const siblings = Object.keys(categoryMap).filter(key => categoryMap[key] === parentCategory);
                    const siblingIndex = siblings.indexOf(node.id());
                    
                    if (categoryIndex !== -1 && siblingIndex !== -1) {
                        const categoryAngle = (2 * Math.PI * categoryIndex) / categories.length;
                        const siblingOffset = (siblingIndex - (siblings.length - 1) / 2) * (Math.PI / 12);
                        const radius = 600;
                        
                        return {
                            x: radius * Math.cos(categoryAngle + siblingOffset),
                            y: radius * Math.sin(categoryAngle + siblingOffset)
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
        autoungrabify: false  // Permitir arrastrar nodos
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
    document.getElementById('cy').appendChild(infoBox);
    
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
    
    // Mostrar información al hacer hover sobre un nodo
    cy.on('mouseover', 'node', function(evt){
        var node = evt.target;
        var nodeId = node.id();
        var nodeInfo = NODE_INFO[nodeId];
        
        if (nodeInfo && !node.data('type')) { // Solo para nodos que no son categorías
            infoBox.textContent = nodeInfo;
            infoBox.style.display = 'block';
            
            // Posicionar cerca del cursor
            infoBox.style.left = (evt.renderedPosition.x + 20) + 'px';
            infoBox.style.top = (evt.renderedPosition.y + 20) + 'px';
        }
    });
    
    cy.on('mouseout', 'node', function(){
        infoBox.style.display = 'none';
    });
    
    // Actualizar posición del infoBox al mover el mouse
    cy.on('mousemove', 'node', function(evt){
        if (infoBox.style.display === 'block') {
            infoBox.style.left = (evt.renderedPosition.x + 20) + 'px';
            infoBox.style.top = (evt.renderedPosition.y + 20) + 'px';
        }
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
                    const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages'];
                    const index = categories.indexOf(node.id());
                    if (index !== -1) {
                        const angle = (2 * Math.PI * index) / categories.length;
                        const radius = 300;
                        return {
                            x: radius * Math.cos(angle),
                            y: radius * Math.sin(angle)
                        };
                    }
                }
                
                // Posiciones para nodos secundarios (segundo anillo)
                const categoryMap = {
                    'unity': 'engines', 'unreal': 'engines', 'godot': 'engines',
                    'p5': 'frameworks', 'three': 'frameworks', 'babylon': 'frameworks', 'tone': 'frameworks',
                    'comfy': 'ia', 'n8n': 'ia',
                    'cursor': 'ides', 'trae': 'ides', 'v0': 'ides', 'windsurf': 'ides',
                    'shadertoy': 'shaders', 'glsl': 'shaders', 'hlsl': 'shaders', 'bookofshaders': 'shaders',
                    'firebase': 'db', 'mongodb': 'db', 'sql': 'db',
                    'cpp': 'languages', 'php': 'languages', 'javascript': 'languages', 
                    'python': 'languages', 'typescript': 'languages', 'java': 'languages'
                };
                
                const parentCategory = categoryMap[node.id()];
                if (parentCategory) {
                    const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages'];
                    const categoryIndex = categories.indexOf(parentCategory);
                    
                    // Obtener nodos hermanos (misma categoría)
                    const siblings = Object.keys(categoryMap).filter(key => categoryMap[key] === parentCategory);
                    const siblingIndex = siblings.indexOf(node.id());
                    
                    if (categoryIndex !== -1 && siblingIndex !== -1) {
                        const categoryAngle = (2 * Math.PI * categoryIndex) / categories.length;
                        const siblingOffset = (siblingIndex - (siblings.length - 1) / 2) * (Math.PI / 12);
                        const radius = 600;
                        
                        return {
                            x: radius * Math.cos(categoryAngle + siblingOffset),
                            y: radius * Math.sin(categoryAngle + siblingOffset)
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
    
    // Activar fullscreen automáticamente si está en la URL
    if (autoFullscreen) {
        setTimeout(function() {
            var elem = document.getElementById('cy');
            try {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.mozRequestFullScreen) {
                    elem.mozRequestFullScreen();
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                }
                document.getElementById('fullscreen').textContent = 'Salir';
            } catch (err) {
                console.error('Error al activar pantalla completa automáticamente:', err);
            }
        }, 1000); // Pequeño retraso para asegurar que todo está cargado
    }
    
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
});
