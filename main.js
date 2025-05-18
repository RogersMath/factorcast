// main.js - Orchestrator
console.log("MAIN.JS: Script loaded. DOMContentLoaded listener will attach initGame.");

// --- Global Game Constants & State ---
// These are central to the game and can reside in main.js or their own config.js
const FACTORING_SKILLS = {
    0: "Novice", 1: "Greatest Common Factor (GCF)", 2: "Difference of Two Squares (DOTS)",
    3: "Trinomials (a=1)", 4: "Perfect Square Trinomials (PST)",
    5: "Trinomials (a>1) / Grouping", 6: "Sum of Cubes", 7: "Difference of Cubes"
};
const MAX_SKILL_LEVEL = Object.keys(FACTORING_SKILLS).length - 1;
const DAMAGE_SCALING_FACTOR = 0.75; // Example, for future combat
const PROBLEMS_TO_MASTER_SKILL = 5; // Number of correct problems in a row to master a new skill

// Player state object - this is the single source of truth for player data
let player = {};

// Variables for current problem context (managed by laboratory.js and event_handlers.js)
let currentProblem = null;
let currentFactoringStep = 0;
let expectedFactors = []; // For multi-factor problems

// --- Initialization ---
function initializePlayer() {
    console.log("MAIN.JS: initializePlayer called");
    player = {
        name: "Arithmancer",
        hp: 50, maxHp: 50,
        mp: 30, maxMp: 30,
        gold: 20,
        skillLevel: 0, // Corresponds to keys in FACTORING_SKILLS
        spellbook: [
            { ...SPELL_TEMPLATES["gcf_spark"] } // Assumes SPELL_TEMPLATES is global from cards.js
        ],
        inventory: {
            "healing_potion": 1 // Item ID from ITEM_TEMPLATES (from cards.js)
        },
        stats: {
            problemsAttempted: 0,
            problemsCorrect: 0,
            problemsIncorrect: 0,
        },
        trainingProgress: { // For tracking skill mastery
            skillKeyInProgress: null,
            correctStreak: 0,
            targetStreak: PROBLEMS_TO_MASTER_SKILL
        }
    };
}

// --- Main Game Initialization Function ---
function initGame() {
    console.log("MAIN.JS: initGame called (from DOMContentLoaded).");

    // Step 1: Select all DOM elements and log them (from dom_elements.js)
    // This also makes them globally available for other scripts.
    if (!selectAndLogDOMElements()) {
        console.error("MAIN.JS: initGame - CRITICAL FAILURE: Not all DOM elements were found. Game cannot proceed safely.");
        alert("Error initializing game: Critical UI elements missing. Check console (F12).");
        return;
    }
    console.log("MAIN.JS: initGame - DOM elements selected.");

    // Step 2: Initialize player state
    initializePlayer();
    console.log("MAIN.JS: initGame - Player initialized:", player);

    // Step 3: Setup audio controls (from event_handlers.js)
    setupAudioControls();
    console.log("MAIN.JS: initGame - Audio controls set up.");

    // Step 4: Initial UI updates (from ui_feedback.js)
    updatePlayerStatsDisplay(); // Update HP, MP, Gold, Skill displays
    displayInitialMessage();    // Show welcome message
    console.log("MAIN.JS: initGame - Initial UI displayed.");

    // Step 5: Setup all game event listeners (from event_handlers.js)
    setupAllEventListeners();
    console.log("MAIN.JS: initGame - Event listeners set up.");
    
    // Step 6: Hide elements that shouldn't be visible at start (using ui_feedback.js or utils.js)
    console.log("MAIN.JS: initGame - Hiding initial elements.");
    if (labOptionsArea) hideElement(labOptionsArea);
    if (problemArea) hideElement(problemArea);
    const inputAreaDiv = qs('#input-area'); // Select locally as it's frequently toggled
    if (inputAreaDiv) hideElement(inputAreaDiv);
    if (stepInstructionArea) hideElement(stepInstructionArea);
    if (feedbackArea) hideElement(feedbackArea);
    if (spellDisplayArea) hideElement(spellDisplayArea);
    
    console.log("MAIN.JS: initGame finished successfully.");
}

// --- Start the game once the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', initGame);
console.log("MAIN.JS: Script end - DOMContentLoaded listener attached.");
