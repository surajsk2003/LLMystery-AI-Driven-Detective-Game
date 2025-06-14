// Puzzle functionality for the game

// Open the puzzle modal
function openPuzzleModal() {
    document.getElementById('puzzleModal').classList.remove('hidden');
    addClue("The symbols form a mathematical sequence: 1, 1, 2, 3...");
}

// Close the puzzle modal
function closePuzzleModal() {
    document.getElementById('puzzleModal').classList.add('hidden');
}

// Check the puzzle solution
function checkPuzzle() {
    const inputs = document.querySelectorAll('#puzzleModal input');
    const code = Array.from(inputs).map(input => input.value).join('');
    
    if (code === '1123') { // Fibonacci sequence start
        alert('Correct! You found a hidden key and a note: "The truth lies in the translation room."');
        addEvidence('Hidden key');
        addClue('Note: "The truth lies in the translation room"');
        closePuzzleModal();
        
        // Add a new scene option if it doesn't exist
        if (!gameState.visitedScenes.includes('translation_room')) {
            const choicesContainer = document.getElementById('choicesContainer');
            const newButton = document.createElement('button');
            newButton.className = 'w-full bg-green-700 hover:bg-green-600 p-3 rounded-lg text-left transition-colors mt-3';
            newButton.innerHTML = `<i class="fas fa-key mr-2"></i>Visit the translation room`;
            newButton.onclick = () => handleChoice('translation_room');
            choicesContainer.appendChild(newButton);
        }
    } else {
        alert('Wrong code. Think about the sequence pattern...');
    }
}

// Additional puzzles can be added here

// Memory matching puzzle
function createMemoryPuzzle() {
    const puzzleContainer = document.createElement('div');
    puzzleContainer.className = 'grid grid-cols-4 gap-2 mb-4';
    
    const symbols = ['🔍', '📜', '🗝️', '📚', '🔍', '📜', '🗝️', '📚'];
    const shuffledSymbols = shuffleArray([...symbols]);
    
    let flippedCards = [];
    let matchedPairs = 0;
    
    shuffledSymbols.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'bg-gray-700 h-16 flex items-center justify-center rounded cursor-pointer text-2xl';
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        card.innerHTML = '❓';
        
        card.addEventListener('click', () => {
            // Ignore if card is already flipped or matched
            if (card.innerHTML !== '❓' || flippedCards.includes(card)) return;
            
            // Flip the card
            card.innerHTML = symbol;
            flippedCards.push(card);
            
            // Check for match if we have 2 flipped cards
            if (flippedCards.length === 2) {
                const [card1, card2] = flippedCards;
                
                if (card1.dataset.symbol === card2.dataset.symbol) {
                    // Match found
                    card1.className = 'bg-green-700 h-16 flex items-center justify-center rounded text-2xl';
                    card2.className = 'bg-green-700 h-16 flex items-center justify-center rounded text-2xl';
                    flippedCards = [];
                    matchedPairs++;
                    
                    // Check if puzzle is complete
                    if (matchedPairs === symbols.length / 2) {
                        setTimeout(() => {
                            alert('You completed the memory puzzle! You found a hidden clue.');
                            addClue('The manuscript was photographed before it was stolen');
                        }, 500);
                    }
                } else {
                    // No match
                    setTimeout(() => {
                        card1.innerHTML = '❓';
                        card2.innerHTML = '❓';
                        flippedCards = [];
                    }, 1000);
                }
            }
        });
        
        puzzleContainer.appendChild(card);
    });
    
    return puzzleContainer;
}

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Riddle puzzle
function createRiddlePuzzle(riddle, answer, clueReward) {
    const container = document.createElement('div');
    
    const riddleText = document.createElement('p');
    riddleText.className = 'mb-4';
    riddleText.textContent = riddle;
    container.appendChild(riddleText);
    
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.className = 'w-full p-2 bg-gray-800 border border-gray-600 rounded text-white mb-4';
    inputField.placeholder = 'Your answer...';
    container.appendChild(inputField);
    
    const submitButton = document.createElement('button');
    submitButton.className = 'bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded w-full';
    submitButton.textContent = 'Submit Answer';
    submitButton.addEventListener('click', () => {
        const userAnswer = inputField.value.trim().toLowerCase();
        if (userAnswer === answer.toLowerCase()) {
            alert('Correct! You solved the riddle.');
            addClue(clueReward);
            closePuzzleModal();
        } else {
            alert('That\'s not quite right. Try again.');
        }
    });
    container.appendChild(submitButton);
    
    return container;
}