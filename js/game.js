// Game State
let gameState = {
    currentScene: 'intro',
    evidence: [],
    clues: [],
    suspects: [],
    inventory: [],
    score: 0,
    visitedScenes: []
};

// Characters with AI personalities
const characters = {
    "Kenji Tanaka": {
        personality: "You are Kenji Tanaka, a meticulous Japanese researcher studying Buddhist manuscripts. You are polite but nervous, and you have been working late nights recently on translation work. You speak formally and occasionally use Japanese terms.",
        avatar: "🇯🇵",
        background: "Visiting researcher from Tokyo University"
    },
    "Brother Tenzin": {
        personality: "You are Brother Tenzin, a wise Buddhist monk who speaks in riddles and metaphors. You are protective of the monastery's treasures but believe in karma and justice. You often reference Buddhist teachings.",
        avatar: "🧘‍♂️",
        background: "Monastery keeper for 20 years"
    },
    "Raj Kumar": {
        personality: "You are Raj Kumar, an ambitious young research assistant from NITK. You are eager to prove yourself but sometimes feel overshadowed by others. You speak casually and are tech-savvy.",
        avatar: "👨‍💻",
        background: "PhD student and research assistant"
    },
    "Dr. Sharma": {
        personality: "You are Dr. Sharma, a respected archaeologist who discovered the manuscript. You are protective of your team but worried about your reputation. You speak with authority but show concern.",
        avatar: "👩‍🔬",
        background: "Lead archaeologist, 15 years experience"
    }
};

// Initialize game
function startGame() {
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    
    // Add mobile detection and handling
    if (window.innerWidth < 768) {
        document.body.classList.add('mobile-device');
    }
    
    loadStoryData().then(() => {
        loadScene('intro');
        updateUI();
    });
    
    // Add event listeners for mobile-specific behaviors
    addMobileEventListeners();
}

// Load story data from JSON file
async function loadStoryData() {
    try {
        const response = await fetch('./data/story.json');
        window.storyData = await response.json();
        return storyData;
    } catch (error) {
        console.error('Error loading story data:', error);
        alert('Failed to load game data. Please refresh the page.');
    }
}

// Load a story scene
function loadScene(sceneId) {
    const scene = window.storyData[sceneId];
    if (!scene) return;

    gameState.currentScene = sceneId;
    gameState.visitedScenes.push(sceneId);

    // Update story text
    document.getElementById('storyText').innerHTML = `
        <h4 class="text-xl font-bold text-orange-400 mb-3">${scene.title}</h4>
        <p>${scene.text}</p>
    `;

    // Update choices
    const choicesContainer = document.getElementById('choicesContainer');
    choicesContainer.innerHTML = '';
    
    scene.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-left transition-colors';
        button.innerHTML = `<i class="fas fa-arrow-right mr-2"></i>${choice.text}`;
        button.onclick = () => handleChoice(choice.action);
        choicesContainer.appendChild(button);
    });

    // Add evidence and clues
    if (scene.evidence) {
        scene.evidence.forEach(item => addEvidence(item));
    }
    if (scene.clues) {
        scene.clues.forEach(item => addClue(item));
    }
    if (scene.suspects) {
        scene.suspects.forEach(suspect => addSuspect(suspect));
    }

    updateUI();
}

// Handle player choices
function handleChoice(action) {
    // Check if the action is a scene transition
    if (window.storyData[action]) {
        loadScene(action);
        return;
    }

    // Handle special actions
    switch(action) {
        case 'fabric':
            addEvidence("Mysterious torn fabric");
            addClue("Fabric appears to be from expensive clothing");
            break;
        case 'decode_puzzle':
        case 'symbols':
            openPuzzleModal();
            break;
        case 'fingerprints':
            addEvidence("Partial fingerprint");
            addClue("Fingerprint doesn't match any staff member");
            break;
        case 'talk_kenji':
            openCharacterModal("Kenji Tanaka");
            break;
        case 'talk_tenzin':
            openCharacterModal("Brother Tenzin");
            break;
        case 'talk_raj':
            openCharacterModal("Raj Kumar");
            break;
        case 'talk_sharma':
            openCharacterModal("Dr. Sharma");
            break;
        default:
            addClue(`Investigated: ${action}`);
    }
}

// Add evidence
function addEvidence(item) {
    if (!gameState.evidence.includes(item)) {
        gameState.evidence.push(item);
        updateUI();
    }
}

// Add clue
function addClue(item) {
    if (!gameState.clues.includes(item)) {
        gameState.clues.push(item);
        updateUI();
    }
}

// Add suspect
function addSuspect(suspect) {
    const exists = gameState.suspects.find(s => s.name === suspect.name);
    if (!exists) {
        gameState.suspects.push(suspect);
        updateUI();
    }
}

// Update UI elements
function updateUI() {
    // Update counters
    document.getElementById('evidenceCount').textContent = gameState.evidence.length;
    document.getElementById('clueCount').textContent = gameState.clues.length;

    // Update evidence list
    const evidenceList = document.getElementById('evidenceList');
    evidenceList.innerHTML = '';
    gameState.evidence.forEach(item => {
        const div = document.createElement('div');
        div.className = 'bg-yellow-900 bg-opacity-50 p-2 rounded text-sm';
        div.innerHTML = `<i class="fas fa-search mr-2"></i>${item}`;
        evidenceList.appendChild(div);
    });

    // Update suspects list
    const suspectsList = document.getElementById('suspectsList');
    suspectsList.innerHTML = '';
    gameState.suspects.forEach(suspect => {
        const div = document.createElement('div');
        div.className = 'bg-red-900 bg-opacity-50 p-2 rounded text-sm suspect-card cursor-pointer';
        div.innerHTML = `
            <div class="font-bold">${suspect.name}</div>
            <div class="text-xs text-gray-300">${suspect.role}</div>
            <div class="text-xs mt-1">
                <span class="bg-red-600 px-2 py-1 rounded">${suspect.suspicion}</span>
            </div>
        `;
        div.onclick = () => openCharacterModal(suspect.name);
        suspectsList.appendChild(div);
    });

    // Update clues list
    const cluesList = document.getElementById('cluesList');
    cluesList.innerHTML = '';
    gameState.clues.forEach(clue => {
        const div = document.createElement('div');
        div.className = 'bg-blue-900 bg-opacity-50 p-2 rounded';
        div.innerHTML = `<i class="fas fa-lightbulb mr-2"></i>${clue}`;
        cluesList.appendChild(div);
    });
}

// Character interaction
function openCharacterModal(characterName) {
    const character = characters[characterName];
    if (!character) return;

    document.getElementById('characterName').textContent = characterName;
    document.getElementById('characterImage').innerHTML = `<div class="text-6xl">${character.avatar}</div>`;
    document.getElementById('characterDialogue').innerHTML = `
        <p class="text-sm text-gray-300 mb-2">${character.background}</p>
        <p>"Hello, I'm ${characterName}. What would you like to know?"</p>
    `;
    
    document.getElementById('characterModal').classList.remove('hidden');
}

function closeCharacterModal() {
    document.getElementById('characterModal').classList.add('hidden');
}

function askCharacter() {
    const question = document.getElementById('playerQuestion').value.trim();
    if (!question) return;

    const characterName = document.getElementById('characterName').textContent;
    const character = characters[characterName];
    
    document.getElementById('characterDialogue').innerHTML += `
        <div class="mt-4 p-3 bg-gray-800 rounded">
            <p class="text-sm text-orange-300">You: ${question}</p>
            <p class="mt-2"><i class="fas fa-spinner fa-spin mr-2"></i>${characterName} is thinking...</p>
        </div>
    `;
    
    // Use AI to generate character response
    generateCharacterResponse(characterName, character.personality, question);
    
    document.getElementById('playerQuestion').value = '';
}

// Save game state
function saveGame() {
    localStorage.setItem('llmystery_save', JSON.stringify(gameState));
}

// Load game state
function loadGame() {
    const saved = localStorage.getItem('llmystery_save');
    if (saved) {
        gameState = JSON.parse(saved);
        loadStoryData().then(() => {
            loadScene(gameState.currentScene);
            updateUI();
        });
    }
}

// Auto-save periodically
setInterval(saveGame, 10000);

// Mobile-specific event listeners
function addMobileEventListeners() {
    // Handle virtual keyboard issues
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            // Scroll to the input when focused on mobile
            if (document.body.classList.contains('mobile-device')) {
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    });
    
    // Add touch feedback for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.classList.add('active-touch');
        });
        button.addEventListener('touchend', () => {
            button.classList.remove('active-touch');
        });
    });
    
    // Handle orientation changes
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
            document.body.classList.add('mobile-device');
        } else {
            document.body.classList.remove('mobile-device');
        }
    });
}

// Load saved game on page load
window.addEventListener('DOMContentLoaded', () => {
    // Check if mobile device
    if (window.innerWidth < 768) {
        document.body.classList.add('mobile-device');
    }
    
    const saved = localStorage.getItem('llmystery_save');
    if (saved) {
        const loadButton = document.createElement('button');
        loadButton.className = 'bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-xl detective-font mt-4';
        loadButton.innerHTML = '<i class="fas fa-save mr-2"></i>Continue Investigation';
        loadButton.onclick = loadGame;
        document.querySelector('#titleScreen').appendChild(loadButton);
    }
});