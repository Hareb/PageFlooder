// ==================== GAME STATE ====================
const gameState = {
    waterLevel: 0,
    currentLevel: 0,
    score: 0,
    timer: 0,
    timerInterval: null,
    isLevelComplete: false
};

// ==================== LEVELS CONFIGURATION ====================
const levels = [
    {
        title: "Niveau 1: Sauve le Logo",
        objective: "Fais flotter le logo au-dessus de la ligne rouge",
        targetPosition: 20, // % from top
        targetElement: ".logo",
        checkCondition: (element, waterLevel) => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const targetY = windowHeight * 0.20;
            const waterHeight = windowHeight * (waterLevel / 100);
            const waterTop = windowHeight - waterHeight;

            // Logo must be above target AND above water
            return rect.top < targetY && rect.bottom < waterTop;
        }
    },
    {
        title: "Niveau 2: Submerge les Publicités",
        objective: "Noie TOUTES les publicités (cartes dorées) sous l'eau",
        targetPosition: null,
        targetElement: ".ad-card",
        checkCondition: (elements, waterLevel) => {
            const windowHeight = window.innerHeight;
            const waterHeight = windowHeight * (waterLevel / 100);
            const waterTop = windowHeight - waterHeight;

            // All ads must be completely submerged
            return Array.from(elements).every(ad => {
                const rect = ad.getBoundingClientRect();
                return rect.bottom > waterTop; // Completely underwater
            });
        }
    },
    {
        title: "Niveau 3: Équilibre Parfait",
        objective: "Fais flotter le Header SANS noyer le Hero",
        targetPosition: 30,
        targetElement: [".site-header", ".hero"],
        checkCondition: (elements, waterLevel) => {
            const windowHeight = window.innerHeight;
            const waterHeight = windowHeight * (waterLevel / 100);
            const waterTop = windowHeight - waterHeight;
            const targetY = windowHeight * 0.30;

            const header = elements[0];
            const hero = elements[1];
            const headerRect = header.getBoundingClientRect();
            const heroRect = hero.getBoundingClientRect();

            // Header above target, Hero NOT submerged
            return headerRect.top < targetY && heroRect.top < waterTop;
        }
    },
    {
        title: "Niveau 4: Tri Sélectif",
        objective: "Noie les images lourdes, garde les textes à flot",
        targetPosition: null,
        targetElement: null,
        checkCondition: (_, waterLevel) => {
            const windowHeight = window.innerHeight;
            const waterHeight = windowHeight * (waterLevel / 100);
            const waterTop = windowHeight - waterHeight;

            const heavyElements = document.querySelectorAll('[data-density="heavy"], [data-density="very-heavy"]');
            const lightElements = document.querySelectorAll('[data-density="light"]');

            const allHeavySubmerged = Array.from(heavyElements).every(el => {
                const rect = el.getBoundingClientRect();
                return rect.bottom > waterTop;
            });

            const allLightFloating = Array.from(lightElements).every(el => {
                const rect = el.getBoundingClientRect();
                return rect.top < waterTop;
            });

            return allHeavySubmerged && allLightFloating;
        }
    },
    {
        title: "Niveau 5: Chaos Contrôlé",
        objective: "Garde exactement 50% du site sous l'eau",
        targetPosition: 50,
        targetElement: null,
        checkCondition: (_, waterLevel) => {
            return Math.abs(waterLevel - 50) < 2; // ±2% tolerance
        }
    }
];

// ==================== DOM ELEMENTS ====================
const water = document.getElementById('water');
const waterSlider = document.getElementById('water-slider');
const waterPercentage = document.getElementById('water-percentage');
const levelTitle = document.getElementById('level-title');
const objectiveText = document.getElementById('objective');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const resetBtn = document.getElementById('reset-btn');
const nextLevelBtn = document.getElementById('next-level-btn');
const targetZone = document.getElementById('target-zone');
const victoryModal = document.getElementById('victory-modal');
const victoryMessage = document.getElementById('victory-message');
const modalNextBtn = document.getElementById('modal-next-btn');

// ==================== DENSITY CONFIGURATIONS ====================
const densityConfig = {
    'very-heavy': { sinkSpeed: 4, floatThreshold: 40, buoyancy: -30 },
    'heavy': { sinkSpeed: 3, floatThreshold: 50, buoyancy: -15 },
    'medium': { sinkSpeed: 1, floatThreshold: 60, buoyancy: 5 },
    'light': { sinkSpeed: -1, floatThreshold: 70, buoyancy: 20 }
};

// ==================== INITIALIZATION ====================
function init() {
    loadLevel(gameState.currentLevel);
    startTimer();

    // Event listeners
    waterSlider.addEventListener('input', handleWaterLevelChange);
    resetBtn.addEventListener('click', resetLevel);
    nextLevelBtn.addEventListener('click', goToNextLevel);
    modalNextBtn.addEventListener('click', () => {
        victoryModal.classList.remove('active');
        goToNextLevel();
    });

    // Start physics loop
    setInterval(updatePhysics, 50);
}

// ==================== LEVEL MANAGEMENT ====================
function loadLevel(levelIndex) {
    if (levelIndex >= levels.length) {
        showGameComplete();
        return;
    }

    const level = levels[levelIndex];
    gameState.isLevelComplete = false;
    gameState.waterLevel = 0;

    // Update UI
    levelTitle.textContent = level.title;
    objectiveText.textContent = level.objective;
    waterSlider.value = 0;
    waterPercentage.textContent = '0%';
    water.style.height = '0%';
    nextLevelBtn.style.display = 'none';

    // Show/hide target zone
    if (level.targetPosition !== null) {
        targetZone.style.display = 'block';
        targetZone.style.top = level.targetPosition + '%';
    } else {
        targetZone.style.display = 'none';
    }

    // Reset all elements
    resetAllElements();
}

function resetLevel() {
    loadLevel(gameState.currentLevel);
}

function goToNextLevel() {
    gameState.currentLevel++;
    gameState.score += 100 + (gameState.timer * 2);
    scoreDisplay.textContent = gameState.score;
    loadLevel(gameState.currentLevel);
}

function showGameComplete() {
    victoryMessage.textContent = `🎉 Félicitations ! Tu as complété tous les niveaux ! Score final : ${gameState.score}`;
    victoryModal.classList.add('active');
    modalNextBtn.textContent = 'Rejouer';
    modalNextBtn.onclick = () => {
        gameState.currentLevel = 0;
        gameState.score = 0;
        gameState.timer = 0;
        scoreDisplay.textContent = '0';
        timerDisplay.textContent = '0';
        victoryModal.classList.remove('active');
        loadLevel(0);
    };
}

// ==================== WATER CONTROL ====================
function handleWaterLevelChange(e) {
    const value = parseInt(e.target.value);
    gameState.waterLevel = value;
    water.style.height = value + '%';
    waterPercentage.textContent = value + '%';

    checkObjective();
}

// ==================== PHYSICS ENGINE ====================
function updatePhysics() {
    const elements = document.querySelectorAll('[data-density]');
    const windowHeight = window.innerHeight;
    const waterHeight = windowHeight * (gameState.waterLevel / 100);
    const waterTop = windowHeight - waterHeight;

    elements.forEach(element => {
        const density = element.getAttribute('data-density');
        const config = densityConfig[density];

        if (!config) return;

        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + (rect.height / 2);
        const elementBottom = rect.bottom;

        // Check if element is in water
        const isInWater = elementCenter > waterTop;
        const isSubmerged = elementBottom > waterTop;

        // Remove all physics classes
        element.classList.remove('floating', 'sinking', 'submerged', 'wobbling');

        if (isInWater) {
            // Calculate how deep in water
            const depthInWater = elementCenter - waterTop;
            const waterDepthPercent = (depthInWater / waterHeight) * 100;

            // Apply buoyancy based on density
            if (waterDepthPercent < config.floatThreshold) {
                // Element is floating
                element.classList.add('floating', 'wobbling');

                // Calculate vertical displacement based on buoyancy
                const displacement = config.buoyancy * (gameState.waterLevel / 100);
                element.style.transform = `translateY(${displacement}px)`;
            } else {
                // Element is sinking
                element.classList.add('sinking');
                const sinkAmount = config.sinkSpeed * (waterDepthPercent / 100) * 50;
                element.style.transform = `translateY(${sinkAmount}px)`;
            }

            // Mark as submerged if fully underwater
            if (isSubmerged) {
                element.classList.add('submerged');
            }
        } else {
            // Element is above water - reset transform
            element.style.transform = '';
        }
    });
}

function resetAllElements() {
    const elements = document.querySelectorAll('[data-density]');
    elements.forEach(element => {
        element.classList.remove('floating', 'sinking', 'submerged', 'wobbling');
        element.style.transform = '';
    });
}

// ==================== OBJECTIVE CHECKING ====================
function checkObjective() {
    if (gameState.isLevelComplete) return;

    const level = levels[gameState.currentLevel];

    if (!level) return;

    let targetElements;

    if (level.targetElement) {
        if (Array.isArray(level.targetElement)) {
            targetElements = level.targetElement.map(selector => document.querySelector(selector));
        } else {
            const queriedElements = document.querySelectorAll(level.targetElement);
            targetElements = queriedElements.length === 1 ? queriedElements[0] : queriedElements;
        }
    }

    const isComplete = level.checkCondition(targetElements, gameState.waterLevel);

    if (isComplete) {
        onLevelComplete();
    }
}

function onLevelComplete() {
    gameState.isLevelComplete = true;

    // Show success
    victoryMessage.textContent = `Temps: ${gameState.timer}s | Bonus: +${100 + gameState.timer * 2} points`;
    victoryModal.classList.add('active');
    nextLevelBtn.style.display = 'inline-block';

    // Add bonus points
    gameState.score += 50;
    scoreDisplay.textContent = gameState.score;
}

// ==================== TIMER ====================
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        timerDisplay.textContent = gameState.timer;
    }, 1000);
}

// ==================== START GAME ====================
document.addEventListener('DOMContentLoaded', init);
