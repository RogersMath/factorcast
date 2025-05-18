// ui_feedback.js
console.log("UI_FEEDBACK.JS: Script loaded.");

// Assumes DOM elements like storyDisplay, stepInstructionArea, feedbackArea, etc.
// are globally available after being initialized by dom_elements.js -> selectAndLogDOMElements()

// Feedback types (constants) - These need to be accessible by other files too,
// so either main.js defines them globally or this file is always loaded before main.js if main needs them.
// For now, let's define them here, and main.js can refer to them as UI_FEEDBACK.TYPES.
const UI_FEEDBACK_CONSTANTS = { // Renamed to avoid conflict if main.js has FEEDBACK_TYPE
    PROMPT: 'prompt',
    STEP_CORRECT: 'step_correct',
    PROBLEM_SUCCESS: 'problem_success',
    PROBLEM_FAIL: 'problem_fail',
    NEUTRAL_INFO: 'neutral_info'
};

function displayInitialMessage() {
    console.log("UI_FEEDBACK.JS: displayInitialMessage called");
    if (!storyDisplay) { console.error("UI_FEEDBACK.JS: storyDisplay is null!"); return; }
    // Assumes `player.name` is globally accessible from main.js, or pass player object
    storyDisplay.innerHTML = `<p>Welcome, ${player.name}! The land of Algebraria is troubled by a Great Discontinuity. Only by mastering the ancient art of Factoring can you hope to restore balance. Your journey begins...</p>`;
}

function addStoryMessage(message, type = "normal") {
    if (!storyDisplay) { console.error("UI_FEEDBACK.JS: storyDisplay is null!"); return; }
    const p = document.createElement('p');
    p.textContent = message;
    if (type !== "normal") p.classList.add(type); // Make sure CSS has .success, .error, .info
    storyDisplay.appendChild(p);
    storyDisplay.scrollTop = storyDisplay.scrollHeight;
}

function provideUserFeedback(message, feedbackType = UI_FEEDBACK_CONSTANTS.PROMPT) {
    if (!stepInstructionArea || !feedbackArea) {
        console.error("UI_FEEDBACK.JS: Feedback areas (stepInstructionArea or feedbackArea) not initialized!");
        return;
    }
    let targetArea = stepInstructionArea;
    let addClass = '';

    switch (feedbackType) {
        case UI_FEEDBACK_CONSTANTS.PROMPT:
            // message displayed in stepInstructionArea
            break;
        case UI_FEEDBACK_CONSTANTS.STEP_CORRECT:
            playSoundEffectById('sfx-correct-step'); // Assumes playSoundEffectById is global from utils.js
            // message displayed in stepInstructionArea
            break;
        case UI_FEEDBACK_CONSTANTS.PROBLEM_SUCCESS:
            playSoundEffectById('sfx-success-solve');
            targetArea = feedbackArea;
            addClass = 'feedback-correct';
            break;
        case UI_FEEDBACK_CONSTANTS.PROBLEM_FAIL:
            targetArea = feedbackArea;
            addClass = 'feedback-incorrect';
            break;
        case UI_FEEDBACK_CONSTANTS.NEUTRAL_INFO:
            // message displayed in stepInstructionArea
            break;
    }

    if (targetArea === feedbackArea) {
        if (stepInstructionArea) hideElement(stepInstructionArea);
    } else if (targetArea === stepInstructionArea) {
        if (feedbackArea) hideElement(feedbackArea);
    }

    targetArea.textContent = message;
    targetArea.className = 'display-area'; // Reset classes
    if (addClass) targetArea.classList.add(addClass); // Ensure .feedback-correct / .feedback-incorrect exist in CSS
    if (message) showElement(targetArea); // Only show if there's a message
    else hideElement(targetArea); // Hide if message is empty
}

function clearProblemRelatedUI() {
    console.log("UI_FEEDBACK.JS: clearProblemRelatedUI called");
    if (problemArea) problemArea.innerHTML = "";
    hideElement(problemArea);

    provideUserFeedback("", UI_FEEDBACK_CONSTANTS.PROMPT); // Clear instruction text
    hideElement(stepInstructionArea); // Ensure it's hidden
    hideElement(feedbackArea);    // Ensure it's hidden

    const inputAreaDiv = qs('#input-area'); // Select locally as it's frequently toggled
    if (inputAreaDiv) hideElement(inputAreaDiv);
    if (answerInput) answerInput.value = "";
}

function updatePlayerStatsDisplay() {
    console.log("UI_FEEDBACK.JS: updatePlayerStatsDisplay called");
    if (!player || Object.keys(player).length === 0) {
        console.warn("UI_FEEDBACK.JS: player object not initialized for stats display"); return;
    }
    if (!statHp || !statMp || !statGold || !statSkill) {
        console.error("UI_FEEDBACK.JS: One or more stat display DOM elements are null!"); return;
    }
    // Assumes FACTORING_SKILLS is globally accessible from main.js, or pass it
    statHp.textContent = `HP: ${player.hp}/${player.maxHp}`;
    statMp.textContent = `MP: ${player.mp}/${player.maxMp}`;
    statGold.textContent = `Gold: ${player.gold}`;
    statSkill.textContent = `Skill: ${FACTORING_SKILLS[player.skillLevel]}`;
}

function displaySpellbookUI() {
    // Assumes player and spellDisplayArea are global
    if (!spellDisplayArea) { console.error("UI_FEEDBACK.JS: spellDisplayArea is null!"); return; }
    if (!player) { console.error("UI_FEEDBACK.JS: player object not found for spellbook display"); return; }

    spellDisplayArea.innerHTML = '<h3>Your Spellbook:</h3>';
    if (player.spellbook.length === 0) {
        spellDisplayArea.innerHTML += '<p>Your spellbook is empty.</p>';
    } else {
        player.spellbook.forEach(spell => {
            const card = document.createElement('div');
            card.classList.add('spell-card');
            // Assumes SPELL_TEMPLATES might be needed if spell object doesn't have all details
            // Or that player.spellbook items are complete objects
            card.innerHTML = `
                <div class="emoji-art">${spell.emoji || '?'}</div>
                <div class="spell-name">${spell.name}</div>
                <div class="spell-cost">MP: ${spell.mpCost}</div>
                <div class="spell-desc" style="font-size:0.8em; color: #ccc;">${spell.description}</div>
            `;
            spellDisplayArea.appendChild(card);
        });
    }
    showElement(spellDisplayArea);
}
