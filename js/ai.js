// AI Integration using Hugging Face Inference API

// API configuration
const HF_API_URL = `https://api-inference.huggingface.co/models/${CONFIG.HF_API_MODEL || "google/flan-t5-base"}`;
const HF_API_KEY = CONFIG.HF_API_KEY || ""; // Get API key from config.js

// Function to ask AI for hints
async function askAI() {
    const queryInput = document.getElementById('aiQuery');
    const query = queryInput.value.trim();
    if (!query) return;
    
    // Check token limit (250 characters for Flan-T5-base)
    if (query.length > 250) {
        alert("Your question exceeds the 250 character limit. Please shorten it.");
        return;
    }

    const responseDiv = document.getElementById('aiResponse');
    responseDiv.classList.remove('hidden');
    responseDiv.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>AI is analyzing...';

    try {
        const response = await generateAIResponse(query);
        responseDiv.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-robot text-green-400 mr-2 mt-1"></i>
                <div>${response}</div>
            </div>
        `;
    } catch (error) {
        responseDiv.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-exclamation-triangle text-red-400 mr-2 mt-1"></i>
                <div>Sorry, I couldn't process your request. Please try again later.</div>
            </div>
        `;
        console.error("AI API Error:", error);
    }

    queryInput.value = '';
    document.getElementById('tokenCounter').textContent = '0/250';
}

// Generate AI response using Hugging Face API
async function generateAIResponse(query) {
    // If API key is not set, use fallback responses
    if (!HF_API_KEY) {
        return generateFallbackResponse(query);
    }
    
    // Create context from game state
    const context = `
        You are an AI detective assistant helping solve a mystery about a stolen ancient Buddhist manuscript from Nalanda ruins in India.
        
        Current evidence: ${gameState.evidence.join(', ')}
        Current clues: ${gameState.clues.join(', ')}
        Suspects: ${gameState.suspects.map(s => `${s.name} (${s.role}, Suspicion: ${s.suspicion})`).join(', ')}
        
        Based on this information, provide a thoughtful analysis or hint about the case. Be concise and insightful.
        
        Player question: ${query}
    `;
    
    try {
        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: context,
                parameters: {
                    max_new_tokens: 150,
                    temperature: 0.7,
                    top_p: 0.9,
                    do_sample: true
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        return result[0].generated_text.replace(context, "").trim();
    } catch (error) {
        console.error("Error calling Hugging Face API:", error);
        return generateFallbackResponse(query);
    }
}

// Generate character response using Hugging Face API
async function generateCharacterResponse(characterName, personality, question) {
    // If API key is not set, use fallback responses
    if (!HF_API_KEY) {
        const response = generateFallbackCharacterResponse(characterName, question);
        updateCharacterDialogue(characterName, question, response);
        return;
    }
    
    // Check token limit for character questions
    if (question.length > 250) {
        const fallbackResponse = "I'm sorry, your question is too long for me to process. Could you ask something shorter?";
        updateCharacterDialogue(characterName, question, fallbackResponse);
        return;
    }
    
    const prompt = `
        ${personality}
        
        The setting is the ancient ruins of Nalanda in India, where a rare Buddhist manuscript has been stolen.
        
        Player: ${question}
        
        ${characterName}:
    `;
    
    try {
        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 150,
                    temperature: 0.8,
                    top_p: 0.9,
                    do_sample: true
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        const aiResponse = result[0].generated_text.replace(prompt, "").trim();
        updateCharacterDialogue(characterName, question, aiResponse);
    } catch (error) {
        console.error("Error calling Hugging Face API for character response:", error);
        const fallbackResponse = generateFallbackCharacterResponse(characterName, question);
        updateCharacterDialogue(characterName, question, fallbackResponse);
    }
}

// Update character dialogue with response
function updateCharacterDialogue(characterName, question, response) {
    const dialogueDiv = document.getElementById('characterDialogue');
    const lastMessage = dialogueDiv.querySelector('div:last-child');
    
    if (lastMessage) {
        lastMessage.innerHTML = `
            <p class="text-sm text-orange-300">You: ${question}</p>
            <p class="mt-2">${characterName}: ${response}</p>
        `;
    }
}

// Fallback responses when API is not available
function generateFallbackResponse(query) {
    const responses = [
        "Based on the evidence, I notice the thief had inside knowledge of the security system.",
        "The timing of the theft (2:47 AM) suggests someone familiar with the guard rotation schedule.",
        "The sophisticated lock tampering indicates technical expertise - look for someone with engineering background.",
        "The torn fabric suggests a struggle or hasty escape. Check for anyone with recent injuries.",
        "Consider who had the most to gain from the manuscript's disappearance - financial motive is often key.",
        "The camera malfunction was too convenient to be coincidence. Someone planned this carefully.",
        "The Japanese silk fabric is an important clue. Who would have access to such material?",
        "The valid keycard usage suggests either someone stole Dr. Sharma's card or she might be involved.",
        "Brother Tenzin's knowledge of the monastery might give him unique access paths others wouldn't know about.",
        "Raj's technical skills could explain the camera malfunction, but would he have a motive?"
    ];
    
    // Try to find a contextually relevant response based on query keywords
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes("kenji") || queryLower.includes("japanese") || queryLower.includes("fabric")) {
        return "The Japanese silk fabric is quite distinctive. Kenji would have access to such material, but would he risk his academic reputation? Consider his recent behavior and any pressure he might be under.";
    }
    
    if (queryLower.includes("sharma") || queryLower.includes("keycard")) {
        return "Dr. Sharma's keycard was used, but she claims it was stolen. Consider who had access to her quarters and when the card might have been taken. Is she telling the truth, or could she have a hidden motive?";
    }
    
    if (queryLower.includes("tenzin") || queryLower.includes("monk") || queryLower.includes("monastery")) {
        return "Brother Tenzin knows the monastery better than anyone. He might know secret passages or vulnerabilities in the security system that others wouldn't. His spiritual demeanor could be genuine or a clever disguise.";
    }
    
    if (queryLower.includes("raj") || queryLower.includes("assistant") || queryLower.includes("camera")) {
        return "Raj has the technical skills to disable the security cameras. As a research assistant, he might feel undervalued or overlooked. Check if he has financial troubles or connections to collectors interested in the manuscript.";
    }
    
    // Default to random response if no keywords match
    return responses[Math.floor(Math.random() * responses.length)];
}

// Fallback character responses
function generateFallbackCharacterResponse(characterName, question) {
    const responses = {
        "Kenji Tanaka": [
            "I was working late in the library, translating ancient texts. The manuscript was... how do you say... very important to my research.",
            "I noticed Brother Tenzin acting strangely lately. He seemed worried about something.",
            "Raj-kun has been asking many questions about the security system. Perhaps too many questions.",
            "My work here is purely academic. I have no interest in stealing artifacts, only in studying them.",
            "The collector from Tokyo? Yes, I know of him. He has... questionable methods of acquiring artifacts."
        ],
        "Brother Tenzin": [
            "The wind whispers of deception in these sacred halls. Not all who seek knowledge do so with pure heart.",
            "As Buddha taught, attachment leads to suffering. Someone was too attached to worldly treasures.",
            "I saw shadows moving in the courtyard that night, but the mind can play tricks in darkness.",
            "The manuscript contains wisdom beyond material value. Its theft serves no spiritual purpose.",
            "Sometimes the most obvious path is a distraction from the truth hidden in plain sight."
        ],
        "Raj Kumar": [
            "Bro, I was coding all night for my thesis. You can check my GitHub commits if you want!",
            "That Japanese guy has been super secretive about his research. And he knows way too much about our security.",
            "Dr. Sharma has been under pressure from the university board. Maybe she needed to... you know, make some money?",
            "The security system here is a joke. I've been telling them to upgrade it for months.",
            "That collector guy was offering serious cash. Not that I'd ever sell out, but someone might have been tempted."
        ],
        "Dr. Sharma": [
            "My entire career is built on academic integrity. I would never compromise that for any price.",
            "I'm worried about Kenji. He's been asking unusual questions about the manuscript's value on the black market.",
            "My keycard was in my room all night. Someone must have taken it while I was sleeping.",
            "The university has been threatening to cut our funding. Without this manuscript, we might lose everything.",
            "Brother Tenzin sometimes wanders the grounds at night. He claims it's for meditation, but who knows?"
        ]
    };
    
    const characterResponses = responses[characterName] || ["I'm not sure about that..."];
    return characterResponses[Math.floor(Math.random() * characterResponses.length)];
}

// Add token counter functionality
document.addEventListener('DOMContentLoaded', function() {
    const queryInput = document.getElementById('aiQuery');
    const tokenCounter = document.getElementById('tokenCounter');
    
    if (queryInput && tokenCounter) {
        queryInput.addEventListener('input', function() {
            const currentLength = this.value.length;
            tokenCounter.textContent = `${currentLength}/250`;
            
            // Visual feedback when approaching/exceeding limit
            if (currentLength > 250) {
                tokenCounter.classList.add('text-red-500');
                tokenCounter.classList.remove('text-yellow-400');
            } else if (currentLength > 200) {
                tokenCounter.classList.add('text-orange-400');
                tokenCounter.classList.remove('text-yellow-400', 'text-red-500');
            } else {
                tokenCounter.classList.add('text-yellow-400');
                tokenCounter.classList.remove('text-orange-400', 'text-red-500');
            }
        });
    }
});