// dom_elements.js
console.log("DOM_ELEMENTS.JS: Script loaded.");

// Declare variables in the global scope for other scripts to access
// These will be assigned when selectAndLogDOMElements is called.
let storyDisplay, problemArea, stepInstructionArea, answerInput, submitAnswerBtn, feedbackArea,
    gameTitle, backgroundMusic, volumeSlider, muteBtn,
    labBtn, shopBtn, exploreBtn, spellbookBtn,
    labOptionsArea, spellDisplayArea,
    statHp, statMp, statGold, statSkill;

function selectAndLogDOMElements() {
    console.log("DOM_ELEMENTS.JS: selectAndLogDOMElements called.");
    let allCriticalFound = true;

    storyDisplay = qs('#story-display');
    if (!storyDisplay) { console.error("DOM_ELEMENTS.JS: #story-display not found"); allCriticalFound = false; }
    problemArea = qs('#problem-area');
    if (!problemArea) { console.error("DOM_ELEMENTS.JS: #problem-area not found"); allCriticalFound = false; }
    stepInstructionArea = qs('#step-instruction-area');
    if (!stepInstructionArea) { console.error("DOM_ELEMENTS.JS: #step-instruction-area not found"); allCriticalFound = false; }
    answerInput = qs('#answer-input');
    if (!answerInput) { console.error("DOM_ELEMENTS.JS: #answer-input not found"); allCriticalFound = false; }
    submitAnswerBtn = qs('#submit-answer-btn');
    if (!submitAnswerBtn) { console.error("DOM_ELEMENTS.JS: #submit-answer-btn not found"); allCriticalFound = false; }
    feedbackArea = qs('#feedback-area');
    if (!feedbackArea) { console.error("DOM_ELEMENTS.JS: #feedback-area not found"); allCriticalFound = false; }
    gameTitle = qs('main#main-content > h1');
    if (!gameTitle) { console.warn("DOM_ELEMENTS.JS: main#main-content > h1 (gameTitle) not found"); } // Warn, might not be critical for all functions
    
    backgroundMusic = qs('#background-music');
    if (!backgroundMusic) { console.warn("DOM_ELEMENTS.JS: #background-music not found"); }
    volumeSlider = qs('#volume-slider');
    if (!volumeSlider) { console.warn("DOM_ELEMENTS.JS: #volume-slider not found"); }
    muteBtn = qs('#mute-btn');
    if (!muteBtn) { console.warn("DOM_ELEMENTS.JS: #mute-btn not found"); }

    labBtn = qs('#lab-btn');
    if (!labBtn) { console.error("DOM_ELEMENTS.JS: #lab-btn not found"); allCriticalFound = false; }
    shopBtn = qs('#shop-btn');
    if (!shopBtn) { console.error("DOM_ELEMENTS.JS: #shop-btn not found"); allCriticalFound = false; }
    exploreBtn = qs('#explore-btn');
    if (!exploreBtn) { console.error("DOM_ELEMENTS.JS: #explore-btn not found"); allCriticalFound = false; }
    spellbookBtn = qs('#spellbook-btn');
    if (!spellbookBtn) { console.error("DOM_ELEMENTS.JS: #spellbook-btn not found"); allCriticalFound = false; }
    
    labOptionsArea = qs('#lab-options-area');
    if (!labOptionsArea) { console.error("DOM_ELEMENTS.JS: #lab-options-area not found! CRITICAL."); allCriticalFound = false; }
    
    spellDisplayArea = qs('#spell-display-area');
    if (!spellDisplayArea) { console.error("DOM_ELEMENTS.JS: #spell-display-area not found! CRITICAL."); allCriticalFound = false; }

    statHp = qs('#stat-hp');
    if (!statHp) { console.error("DOM_ELEMENTS.JS: #stat-hp not found"); allCriticalFound = false; }
    statMp = qs('#stat-mp');
    if (!statMp) { console.error("DOM_ELEMENTS.JS: #stat-mp not found"); allCriticalFound = false; }
    statGold = qs('#stat-gold');
    if (!statGold) { console.error("DOM_ELEMENTS.JS: #stat-gold not found"); allCriticalFound = false; }
    statSkill = qs('#stat-skill');
    if (!statSkill) { console.error("DOM_ELEMENTS.JS: #stat-skill not found"); allCriticalFound = false; }
    
    console.log("DOM_ELEMENTS.JS: selectAndLogDOMElements finished. Critical elements found status:", allCriticalFound);
    return allCriticalFound;
}
