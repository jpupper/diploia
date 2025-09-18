document.addEventListener('DOMContentLoaded', function() {
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
                    'font-size': '16px',
                    'font-weight': 'bold',
                    'text-wrap': 'wrap',
                    'text-max-width': '100px',
                    'width': '120px',
                    'height': '120px',
                    'padding': '15px'
                }
            },
            {
                selector: 'node[type="category"]',
                style: {
                    'background-color': '#8a2be2',
                    'border-color': '#ff69b4',
                    'border-width': 3,
                    'font-size': '18px',
                    'width': '150px',
                    'height': '150px',
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
            name: 'concentric',
            padding: 80,
            startAngle: 3/2 * Math.PI,
            sweep: 2 * Math.PI,
            equidistant: true,
            minNodeSpacing: 100,
            concentric: function(node) {
                if (node.id() === 'root') return 10;
                if (node.data('type') === 'category') return 8;
                return 1;
            },
            levelWidth: function() { return 1; },
            animate: true
        },
        minZoom: 0.2,
        maxZoom: 3,
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        autounselectify: false,
        autoungrabify: true  // Deshabilitar arrastrar nodos
    });
    
    // Agregar interactividad para abrir enlaces
    cy.on('tap', 'node', function(evt){
        var node = evt.target;
        var url = node.data('url');
        if (url) {
            window.open(url, '_blank');
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
            name: 'concentric',
            padding: 80,
            startAngle: 3/2 * Math.PI,
            sweep: 2 * Math.PI,
            equidistant: true,
            minNodeSpacing: 100,
            concentric: function(node) {
                if (node.id() === 'root') return 10;
                if (node.data('type') === 'category') return 8;
                return 1;
            },
            levelWidth: function() { return 1; },
            animate: true
        }).run();
        cy.fit();
        cy.center();
    });
    
    document.getElementById('fit').addEventListener('click', function() {
        cy.fit();
    });
    
    // Función de pantalla completa
    document.getElementById('fullscreen').addEventListener('click', function() {
        var elem = document.getElementById('cy');
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
            this.textContent = 'Salir';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
            this.textContent = 'Pantalla Completa';
        }
    });
    
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
