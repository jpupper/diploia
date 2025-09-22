// Archivo principal del mapa de herramientas
// Este archivo contiene la funcionalidad del mapa y utiliza los datos de los archivos separados
// Los datos (CONFIG, NODE_INFO) se cargan desde mapa_data.js
// Los elementos y conexiones se cargan desde mapa_elements.js y mapa_connections.js

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
        elements: [...getMapElements(), ...getMapConnections()],
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
                    const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages', 'llm', 'frontend', 'os', 'soportes', 'protocolos', 'software-multimedia', 'entornos', 'glosario'];
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
                    'p5': 'frameworks', 'three': 'frameworks', 'babylon': 'frameworks', 'tone': 'frameworks', 'websockets': 'frameworks', 'ml5': 'frameworks', 'hydra': 'frameworks', 'xampp': 'frameworks',
                    'comfy': 'ia', 'n8n': 'ia', 'pinokio': 'ia',
                    'cursor': 'ides', 'trae': 'ides', 'v0': 'ides', 'windsurf': 'ides', 'visual-studio': 'ides',
                    'shadertoy': 'shaders', 'glsl': 'shaders', 'hlsl': 'shaders', 'bookofshaders': 'shaders', 'ejemplos-shaders': 'shaders', 'editor-shaders-live': 'shaders',
                    'firebase': 'db', 'mongodb': 'db', 'sql': 'db',
                    'cpp': 'languages', 'php': 'languages', 'javascript': 'languages', 
                    'python': 'languages', 'typescript': 'languages', 'java': 'languages', 'csharp': 'languages',
                    'html': 'languages', 'css': 'languages', 'json': 'languages', 'r': 'languages', 'arduino': 'languages', 'assembler': 'languages',
                    'react': 'frontend', 'vue': 'frontend', 'svelte': 'frontend', 'angular': 'frontend', 'nextjs': 'frontend',
                    'chatgpt': 'llm', 'deepseek': 'llm', 'gemini': 'llm', 'kimi': 'llm', 'claude': 'llm',
                    'windows': 'os', 'linux': 'os', 'mac': 'os', 'android': 'os', 'ios': 'os',
                    'pantalla-touch': 'soportes', 'instalaciones-fisicas': 'soportes', 'raspberry-pi': 'soportes', 'pantalla-led': 'soportes', 'proyector': 'soportes', 'sitio-web': 'soportes', 'compilado-apk': 'soportes', 'virtual-production': 'soportes', 'vr': 'soportes', 'ar': 'soportes', 'sonido': 'soportes', 'videojuegos': 'soportes', 'mapping': 'soportes', 'nft': 'soportes',
                    'websockets': 'protocolos', 'spout': 'protocolos', 'syphon': 'protocolos', 'ndi': 'protocolos', 'webrtc': 'protocolos', 'osc': 'protocolos', 'api': 'protocolos', 'midi': 'protocolos',
                    'resolume': 'software-multimedia', 'blender': 'software-multimedia', 'paquete-adobe': 'software-multimedia', 'obs': 'software-multimedia', 'cinema4d': 'software-multimedia', 'ableton': 'software-multimedia', 'puredata': 'software-multimedia', 'guipper': 'software-multimedia', 'gitbash': 'software-multimedia',
                    'docker': 'entornos', 'venv': 'entornos', 'conda': 'entornos', 'nodejs': 'entornos',
                    'livecoding': 'glosario', 'vibecoding': 'glosario', 'programacion': 'glosario', 'prompting': 'glosario', 'consola': 'glosario', 'script': 'glosario', 'compilado-interpretado': 'glosario', 'drivers': 'glosario', 'mcp': 'glosario', 'repositorio': 'glosario', 'github': 'glosario', 'git': 'glosario'
                };
                
                const parentCategory = categoryMap[node.id()];
                if (parentCategory) {
                    const categories = ['engines', 'frameworks', 'ia', 'shaders', 'db', 'ides', 'languages', 'llm', 'frontend', 'os', 'soportes', 'protocolos', 'software-multimedia', 'entornos', 'glosario'];
                    const categoryIndex = categories.indexOf(parentCategory);
                    
                    // Obtener nodos hermanos (misma categoría)
                    const siblings = Object.keys(categoryMap).filter(key => categoryMap[key] === parentCategory);
                    const siblingIndex = siblings.indexOf(node.id());
                    
                    if (categoryIndex !== -1 && siblingIndex !== -1) {
                        const categoryAngle = (2 * Math.PI * categoryIndex) / categories.length;
                        
                        // Algoritmo mejorado para distribución de nodos secundarios
                        let siblingOffset;
                        let radius = CONFIG.categoryDistances[parentCategory] || 500;
                        
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
    infoBox.style.backgroundColor = 'rgba(10, 10, 20, 0.9)'; // Fondo más oscuro y menos transparente
    infoBox.style.color = '#fff';
    infoBox.style.padding = '15px'; // Padding aumentado
    infoBox.style.borderRadius = '8px'; // Bordes más redondeados
    infoBox.style.minWidth = '400px'; // Ancho mínimo aumentado
    infoBox.style.maxWidth = '500px'; // Ancho máximo aumentado
    infoBox.style.boxShadow = '0 4px 20px rgba(255, 105, 180, 0.4), 0 0 15px rgba(138, 43, 226, 0.4)'; // Sombra con colores del tema
    infoBox.style.zIndex = '1000';
    infoBox.style.pointerEvents = 'none';
    infoBox.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    infoBox.style.opacity = 0;
    infoBox.style.transform = 'translateY(10px)';
    infoBox.style.border = '1px solid rgba(255, 105, 180, 0.5)'; // Borde con color del tema
    infoBox.style.backdropFilter = 'blur(5px)'; // Efecto de desenfoque
    
    // Estilos para los elementos internos del infoBox
    const style = document.createElement('style');
    style.textContent = `
        #node-hover-info h3 {
            color: #ff69b4; /* Color del tema para títulos */
            margin-top: 0;
            margin-bottom: 10px;
            font-size: ${CONFIG.popupTitleFontSize}px;
            border-bottom: 1px solid rgba(255, 105, 180, 0.3);
            padding-bottom: 5px;
        }
        #node-hover-info p {
            margin: 8px 0;
            line-height: 1.5;
            font-size: ${CONFIG.popupTextFontSize}px;
        }
        #node-hover-info strong {
            color: #ff9edb; /* Color más claro y visible para etiquetas */
            font-weight: bold;
            font-size: ${CONFIG.popupSubtitleFontSize}px;
        }
    `;
    document.head.appendChild(style);
    
    document.getElementById('cy').appendChild(infoBox);
    
    // Variables para la animación de líneas discontinuas
    let dashOffset = 0;
    let animationActive = true;
    let dashAnimationId;
    
    // Función optimizada para animar líneas discontinuas
    function animateDashLines() {
        if (!animationActive) return;
        
        // Incrementar el offset
        dashOffset = (dashOffset + 1) % 12;
        
        // Aplicar el nuevo offset usando CSS en lugar de actualizar cada línea individualmente
        const styleSheet = document.styleSheets[0];
        let dashRule = null;
        
        // Buscar si ya existe una regla para las líneas discontinuas
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i].selectorText === '.dash-animated') {
                dashRule = styleSheet.cssRules[i];
                break;
            }
        }
        
        // Si no existe, crear una nueva regla
        if (!dashRule) {
            const ruleIndex = styleSheet.insertRule('.dash-animated { line-dash-offset: 0; }', styleSheet.cssRules.length);
            dashRule = styleSheet.cssRules[ruleIndex];
        }
        
        // Actualizar el valor de line-dash-offset
        dashRule.style.setProperty('line-dash-offset', dashOffset);
        
        // Programar la próxima animación
        dashAnimationId = requestAnimationFrame(animateDashLines);
    }
    
    // Agregar clase a todas las líneas discontinuas
    cy.style()
        .selector('edge[type="secondary"]')
        .style({
            'line-style': 'dashed',
            'line-dash-pattern': [6, 3],
            'line-color': 'rgba(138, 43, 226, 0.6)',
            'target-arrow-color': '#8a2be2',
            'transition-property': 'line-color, target-arrow-color, width, opacity',
            'transition-duration': '0.3s'
        })
        .update();
    
    cy.$('edge[type="secondary"]').addClass('dash-animated');
    
    // Iniciar la animación
    animateDashLines();
    
    // Detener la animación cuando la pestaña no esté visible para ahorrar recursos
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            animationActive = false;
            if (dashAnimationId) {
                cancelAnimationFrame(dashAnimationId);
            }
        } else {
            animationActive = true;
            animateDashLines();
        }
    });
    
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
            // Usar innerHTML en lugar de textContent para permitir HTML
            infoBox.innerHTML = nodeInfo;
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
    
    // Función de reset
    document.getElementById('reset').addEventListener('click', function() {
        cy.fit();
        cy.center();
        cy.zoom(1);
    });
    
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
});
