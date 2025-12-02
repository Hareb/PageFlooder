// ==================== DOM FLOOD - CONTENT SCRIPT ====================
// This script is injected into every webpage and enables water flooding

(function() {
    'use strict';

    // Prevent multiple injections
    if (window.domFloodActive) return;

    // ==================== STATE ====================
    const state = {
        active: false,
        waterLevel: 0,
        mode: 'chaos', // 'chaos' or 'zen'
        elementsCount: 0,
        floatingCount: 0,
        physicsInterval: null,
        uiElements: {}
    };

    // ==================== DENSITY DETECTION ====================
    const densityRules = {
        // Very Heavy (sink first)
        'very-heavy': [
            { tag: 'video', priority: 100 },
            { tag: 'iframe', priority: 100 },
            { class: /video|player|embed/i, priority: 90 },
            { tag: 'object', priority: 80 },
            { tag: 'embed', priority: 80 }
        ],

        // Heavy (sink quickly)
        'heavy': [
            { tag: 'img', priority: 70 },
            { tag: 'picture', priority: 70 },
            { tag: 'canvas', priority: 65 },
            { tag: 'svg', priority: 60 },
            { tag: 'footer', priority: 55 },
            { class: /image|photo|banner|ad|advertisement/i, priority: 50 }
        ],

        // Medium (balanced)
        'medium': [
            { tag: 'button', priority: 45 },
            { tag: 'input', priority: 45 },
            { tag: 'select', priority: 45 },
            { tag: 'textarea', priority: 45 },
            { tag: 'form', priority: 40 },
            { tag: 'nav', priority: 40 },
            { tag: 'aside', priority: 35 },
            { tag: 'section', priority: 30 },
            { tag: 'article', priority: 30 },
            { tag: 'div', priority: 25 },
            { class: /card|box|container|widget/i, priority: 35 }
        ],

        // Light (float easily)
        'light': [
            { tag: 'h1', priority: 20 },
            { tag: 'h2', priority: 20 },
            { tag: 'h3', priority: 20 },
            { tag: 'h4', priority: 20 },
            { tag: 'h5', priority: 20 },
            { tag: 'h6', priority: 20 },
            { tag: 'p', priority: 15 },
            { tag: 'span', priority: 15 },
            { tag: 'a', priority: 15 },
            { tag: 'li', priority: 10 },
            { tag: 'ul', priority: 10 },
            { tag: 'ol', priority: 10 },
            { tag: 'header', priority: 15 },
            { class: /text|title|heading|label/i, priority: 20 }
        ]
    };

    const densityConfig = {
        'very-heavy': { sinkSpeed: 4, floatThreshold: 30, buoyancy: -40 },
        'heavy': { sinkSpeed: 3, floatThreshold: 45, buoyancy: -20 },
        'medium': { sinkSpeed: 1, floatThreshold: 60, buoyancy: 5 },
        'light': { sinkSpeed: -1, floatThreshold: 75, buoyancy: 25 }
    };

    // ==================== ELEMENT DETECTION ====================
    function assignDensity(element) {
        // Skip already processed or UI elements
        if (element.hasAttribute('data-flood-density')) return;
        if (element.id && element.id.startsWith('dom-flood-')) return;

        const tagName = element.tagName.toLowerCase();
        const className = element.className || '';

        let bestMatch = { density: 'medium', priority: 0 };

        // Check all density rules
        for (const [density, rules] of Object.entries(densityRules)) {
            for (const rule of rules) {
                let matches = false;

                // Tag match
                if (rule.tag && tagName === rule.tag) {
                    matches = true;
                }

                // Class match
                if (rule.class && typeof className === 'string' && className.match(rule.class)) {
                    matches = true;
                }

                if (matches && rule.priority > bestMatch.priority) {
                    bestMatch = { density, priority: rule.priority };
                }
            }
        }

        element.setAttribute('data-flood-density', bestMatch.density);
    }

    function scanAndTagElements() {
        const elements = document.querySelectorAll('body *:not(script):not(style):not(noscript)');

        let count = 0;
        elements.forEach(element => {
            // Only tag visible elements with some size
            const rect = element.getBoundingClientRect();
            if (rect.width > 10 && rect.height > 10) {
                assignDensity(element);
                count++;
            }
        });

        state.elementsCount = count;
        updateStats();

        console.log(`🌊 DOM Flood: Tagged ${count} elements`);
    }

    // ==================== UI CREATION ====================
    function createUI() {
        // Remove existing UI if any
        removeUI();

        // Create main UI container
        const ui = document.createElement('div');
        ui.id = 'dom-flood-ui';
        ui.innerHTML = `
            <div id="dom-flood-header">
                <span id="dom-flood-title">🌊 DOM Flood</span>
                <button id="dom-flood-close">×</button>
            </div>

            <div id="dom-flood-stats">
                <div>
                    <strong>Éléments</strong>
                    <span id="dom-flood-count">0</span>
                </div>
                <div>
                    <strong>Flottants</strong>
                    <span id="dom-flood-floating">0</span>
                </div>
            </div>

            <div id="dom-flood-control">
                <label for="dom-flood-slider">💧 Niveau d'eau</label>
                <input type="range" id="dom-flood-slider" min="0" max="100" value="0">
                <div id="dom-flood-percentage">0%</div>
            </div>

            <div id="dom-flood-modes">
                <button class="dom-flood-mode-btn active" data-mode="chaos">🌊 Chaos</button>
                <button class="dom-flood-mode-btn" data-mode="zen">🧘 Zen</button>
            </div>

            <div id="dom-flood-info">
                <strong>Mode Chaos:</strong> Éléments flottent et coulent selon leur densité<br>
                <strong>Mode Zen:</strong> Animation douce et harmonieuse
            </div>
        `;

        document.body.appendChild(ui);

        // Create water overlay
        const water = document.createElement('div');
        water.id = 'dom-flood-water';
        document.body.appendChild(water);

        // Store references
        state.uiElements = {
            ui,
            water,
            slider: document.getElementById('dom-flood-slider'),
            percentage: document.getElementById('dom-flood-percentage'),
            count: document.getElementById('dom-flood-count'),
            floating: document.getElementById('dom-flood-floating'),
            closeBtn: document.getElementById('dom-flood-close'),
            modeBtns: document.querySelectorAll('.dom-flood-mode-btn')
        };

        // Add event listeners
        attachEventListeners();
    }

    function removeUI() {
        const existingUI = document.getElementById('dom-flood-ui');
        const existingWater = document.getElementById('dom-flood-water');

        if (existingUI) existingUI.remove();
        if (existingWater) existingWater.remove();
    }

    function attachEventListeners() {
        const { slider, closeBtn, modeBtns } = state.uiElements;

        // Water level control
        slider.addEventListener('input', handleWaterChange);

        // Close button
        closeBtn.addEventListener('click', deactivate);

        // Mode buttons
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                state.mode = mode;

                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    function handleWaterChange(e) {
        const value = parseInt(e.target.value);
        state.waterLevel = value;

        state.uiElements.water.style.height = value + '%';
        state.uiElements.percentage.textContent = value + '%';
    }

    function updateStats() {
        if (!state.uiElements.count) return;

        state.uiElements.count.textContent = state.elementsCount;
        state.uiElements.floating.textContent = state.floatingCount;
    }

    // ==================== PHYSICS ENGINE ====================
    function updatePhysics() {
        if (!state.active) return;

        const elements = document.querySelectorAll('[data-flood-density]');
        const windowHeight = window.innerHeight;
        const waterHeight = windowHeight * (state.waterLevel / 100);
        const waterTop = windowHeight - waterHeight;

        let floatingCount = 0;

        elements.forEach(element => {
            // Skip if element is no longer in DOM
            if (!element.isConnected) return;

            const density = element.getAttribute('data-flood-density');
            const config = densityConfig[density];

            if (!config) return;

            const rect = element.getBoundingClientRect();
            const elementCenter = rect.top + (rect.height / 2);
            const elementBottom = rect.bottom;

            // Check if element is in water
            const isInWater = elementCenter > waterTop;
            const isSubmerged = elementBottom > waterTop;

            // Remove all physics classes
            element.classList.remove('dom-flood-floating', 'dom-flood-sinking', 'dom-flood-submerged', 'dom-flood-wobbling');

            if (isInWater && state.waterLevel > 0) {
                // Calculate depth in water
                const depthInWater = elementCenter - waterTop;
                const waterDepthPercent = (depthInWater / waterHeight) * 100;

                if (state.mode === 'chaos') {
                    // Chaos mode: realistic physics
                    if (waterDepthPercent < config.floatThreshold) {
                        // Element is floating
                        element.classList.add('dom-flood-floating', 'dom-flood-wobbling');
                        floatingCount++;

                        const displacement = config.buoyancy * (state.waterLevel / 100);
                        element.style.transform = `translateY(${displacement}px)`;
                    } else {
                        // Element is sinking
                        element.classList.add('dom-flood-sinking');
                        const sinkAmount = config.sinkSpeed * (waterDepthPercent / 100) * 50;
                        element.style.transform = `translateY(${sinkAmount}px)`;
                    }
                } else {
                    // Zen mode: gentle floating only
                    element.classList.add('dom-flood-floating');
                    floatingCount++;

                    const displacement = 15 * Math.sin(Date.now() / 1000 + element.getBoundingClientRect().top / 100);
                    element.style.transform = `translateY(${displacement}px)`;
                }

                // Mark as submerged if fully underwater
                if (isSubmerged) {
                    element.classList.add('dom-flood-submerged');
                }
            } else {
                // Element is above water - reset transform
                element.style.transform = '';
            }
        });

        state.floatingCount = floatingCount;
        updateStats();
    }

    function startPhysics() {
        if (state.physicsInterval) return;

        state.physicsInterval = setInterval(updatePhysics, 50);
    }

    function stopPhysics() {
        if (state.physicsInterval) {
            clearInterval(state.physicsInterval);
            state.physicsInterval = null;
        }
    }

    function resetElements() {
        const elements = document.querySelectorAll('[data-flood-density]');
        elements.forEach(element => {
            element.classList.remove('dom-flood-floating', 'dom-flood-sinking', 'dom-flood-submerged', 'dom-flood-wobbling');
            element.style.transform = '';
            element.removeAttribute('data-flood-density');
        });
    }

    // ==================== ACTIVATION ====================
    function activate() {
        if (state.active) return;

        console.log('🌊 DOM Flood: Activating...');
        state.active = true;

        createUI();
        scanAndTagElements();
        startPhysics();

        console.log('🌊 DOM Flood: Active!');
    }

    function deactivate() {
        if (!state.active) return;

        console.log('🌊 DOM Flood: Deactivating...');
        state.active = false;

        stopPhysics();
        resetElements();
        removeUI();

        state.waterLevel = 0;
        state.elementsCount = 0;
        state.floatingCount = 0;

        console.log('🌊 DOM Flood: Deactivated');
    }

    // ==================== MESSAGE LISTENER ====================
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'activate') {
            activate();
            sendResponse({ success: true });
        } else if (request.action === 'deactivate') {
            deactivate();
            sendResponse({ success: true });
        } else if (request.action === 'getStatus') {
            sendResponse({ active: state.active });
        }

        return true;
    });

    // ==================== INITIALIZATION ====================
    // Mark as loaded
    window.domFloodActive = true;

    console.log('🌊 DOM Flood: Content script loaded. Use extension popup to activate.');
})();
