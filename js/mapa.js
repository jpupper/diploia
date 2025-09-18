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
            { data: { id: 'cursor', label: 'Cursor Editor', url: 'https://cursor.sh/' } },
            { data: { id: 'trae', label: 'Trae AI', url: 'https://www.trae.ai/' } },
            { data: { id: 'v0', label: 'v0.dev', url: 'https://v0.dev/' } },
            { data: { id: 'comfy', label: 'ComfyUI', url: 'https://github.com/comfyanonymous/ComfyUI' } },
            { data: { id: 'n8n', label: 'n8n', url: 'https://n8n.io/' } },
            
            // Shaders
            { data: { id: 'shadertoy', label: 'Shadertoy', url: 'https://www.shadertoy.com/' } },
            { data: { id: 'glsl', label: 'GLSL', url: 'https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)' } },
            { data: { id: 'bookofshaders', label: 'Book of Shaders', url: 'https://thebookofshaders.com/?lan=es' } },
            
            // Bases de Datos
            { data: { id: 'firebase', label: 'Firebase', url: 'https://firebase.google.com/' } },
            { data: { id: 'mongodb', label: 'MongoDB', url: 'https://www.mongodb.com/' } },
            
            // Conexiones no jerárquicas
            { data: { id: 'unity-three', source: 'unity', target: 'three' } },
            { data: { id: 'p5-tone', source: 'p5', target: 'tone' } },
            { data: { id: 'comfy-n8n', source: 'comfy', target: 'n8n' } },
            { data: { id: 'shadertoy-glsl', source: 'shadertoy', target: 'glsl' } },
            { data: { id: 'three-glsl', source: 'three', target: 'glsl' } },
            { data: { id: 'babylon-three', source: 'babylon', target: 'three' } },
            { data: { id: 'cursor-v0', source: 'cursor', target: 'v0' } },
            { data: { id: 'firebase-n8n', source: 'firebase', target: 'n8n' } },
            { data: { id: 'p5-shadertoy', source: 'p5', target: 'shadertoy' } },
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
            name: 'cose',
            padding: 50,
            nodeRepulsion: 8000,
            idealEdgeLength: 150,
            nodeOverlap: 30,
            animate: true,
            randomize: false
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
            name: 'cose',
            padding: 50,
            nodeRepulsion: 8000,
            idealEdgeLength: 150,
            nodeOverlap: 30,
            animate: true,
            randomize: false
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
