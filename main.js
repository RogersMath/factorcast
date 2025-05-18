// main.js - Reverted State with Extensive Logging

console.log("MAIN.JS: Script loaded. DOMContentLoaded listener will attach initGame.");

// --- DOM Element References ---
// These will be selected once the DOM is ready, inside initGame or called by it.
// Declaring them here with `let` allows them to be assigned later.
let storyDisplay, problemArea, stepInstructionArea, answerInput, submitAnswerBtn, feedbackArea,
    gameTitle, backgroundMusic, volumeSlider, muteBtn,
    labBtn, shopBtn, exploreBtn, spellbookBtn,
    labOptionsArea, spellDisplayArea,
    statHp, statMp, statGold, statSkill;

function selectDOMElements() {
    console.log("MAIN.JS: selectDOMElements called.");
    storyDisplay = qs('#story-display');
    console.log("#story-display selected:", storyDisplay);
    problemArea = qs('#problem-area');
    console.log("#problem-area selected:", problemArea);
    stepInstructionArea = qs('#step-instruction-area');
    console.log("#step-instruction-area selected:", stepInstructionArea);
    answerInput = qs('#answer-input');
    console.log("#answer-input selected:", answerInput);
    submitAnswerBtn = qs('#submit-answer-btn');
    console.log("#submit-answer-btn selected:", submitAnswerBtn);
    feedbackArea = qs('#feedback-area');
    console.log("#feedback-area selected:", feedbackArea);
    gameTitle = qs('main#main-content > h1');
    console.log("main#main-content > h1 selected (gameTitle):", gameTitle);
    backgroundMusic = qs('#background-music');
    console.log("#background-music selected:", backgroundMusic);
    volumeSlider = qs('#volume-slider');
    console.log("#volume-slider selected:", volumeSlider);
    muteBtn = qs('#mute-btn');
    console.log("#mute-btn selected:", muteBtn);

    labBtn = qs('#lab-btn');
    console.log("#lab-btn selected:", labBtn);
    shopBtn = qs('#shop-btn');
    console.log("#shop-btn selected:", shopBtn);
    exploreBtn = qs('#explore-btn');
    console.log("#explore-btn selected:", exploreBtn);
    spellbookBtn = qs('#spellbook-btn');
    console.log("#spellbook-btn selected:", spellbookBtn);

    labOptionsArea = qs('#lab-options-area'); // THIS IS CRITICAL FOR THE ERROR
    console.log("#lab-options-area selected:", labOptionsArea);

    spellDisplayArea = qs('#spell-display-area');
    console.log("#spell-display-area selected:", spellDisplayArea);

    statHp = qs('#stat-hp');
    console.log("#stat-hp selected:", statHp);
    statMp = qs('#stat-mp');
    console.log("#stat-mp selected:", statMp);
    statGold = qs('#stat-gold');
    console.log("#stat-gold selected:", statGold);
    statSkill = qs('#stat-skill');
    console.log("#stat-skill selected:", statSkill);
    console.log("MAIN.JS: selectDOMElements finished.");
}


// --- Game State Variables ---
let player = {};
let currentProblem = null;
let currentFactoringStep = 0;
let expectedFactors = [];
let musicStarted = false;

const FACTORING_SKILLS = {
    0: "Novice", 1: "Greatest Common Factor (GCF)", 2: "Difference of Two Squares (DOTS)",
    3: "Trinomials (a=1)", 4: "Perfect Square Trinomials (PST)",
    5: "Trinomials (a>1) / Grouping", 6: "Sum of Cubes", 7: "Difference of Cubes"
};
const MAX_SKILL_LEVEL = Object.keys(FACTORING_SKILLS).length - 1;
const DAMAGE_SCALING_FACTOR = 0.75;
const PROBLEMS_TO_MASTER_SKILL = 5;

// --- Initialization & UI Updates ---
function initializePlayer() {
    console.log("MAIN.JS: initializePlayer called");
    player = {
        name: "Arithmancer", hp: 50, maxHp: 50, mp: 30, maxMp: 30, gold: 20, skillLevel: 0,
        spellbook: [{ ...SPELL_TEMPLATES["gcf_spark"] }], inventory: { "healing_potion": 1 },
        stats: { problemsAttempted: 0, problemsCorrect: 0, problemsIncorrect: 0 },
        trainingProgress: { skillKeyInProgress: null, correctStreak: 0, targetStreak: PROBLEMS_TO_MASTER_SKILL }
    };
}
function updatePlayerStatsUI() {
    console.log("MAIN.JS: updatePlayerStatsUI called");
    if (!player || Object.keys(player).length === 0) {
        console.warn("MAIN.JS: updatePlayerStatsUI - player not initialized"); return;
    }
    if (!statHp || !statMp || !statGold || !statSkill) {
        console.error("MAIN.JS: updatePlayerStatsUI - One or more stat display elements are null! Check selectDOMElements()."); return;
    }
    updateText('#stat-hp', `HP: ${player.hp}/${player.maxHp}`);
    updateText('#stat-mp', `MP: ${player.mp}/${player.maxMp}`);
    updateText('#stat-gold', `Gold: ${player.gold}`);
    updateText('#stat-skill', `Skill: ${FACTORING_SKILLS[player.skillLevel]}`);
}
function displayInitialMessage() {
    console.log("MAIN.JS: displayInitialMessage called");
    if (!storyDisplay) { console.error("MAIN.JS: displayInitialMessage - storyDisplay is null! Check selectDOMElements()."); return; }
    storyDisplay.innerHTML = `<p>Welcome, ${player.name}! The land of Algebraria is troubled by a Great Discontinuity. Only by mastering the ancient art of Factoring can you hope to restore balance. Your journey begins...</p>`;
}
function addStoryMessage(message, type = "normal") {
    // console.log(`MAIN.JS: addStoryMessage called with: "${message}", type: ${type}`); // Can be too verbose
    if (!storyDisplay) { console.error("MAIN.JS: addStoryMessage - storyDisplay is null! Check selectDOMElements()."); return; }
    const p = document.createElement('p'); p.textContent = message;
    if(type !== "normal") p.classList.add(type);
    storyDisplay.appendChild(p); storyDisplay.scrollTop = storyDisplay.scrollHeight;
}

function displayFinalFeedback(message, isCorrect) {
    console.log(`MAIN.JS: displayFinalFeedback called with: "${message}", isCorrect: ${isCorrect}`);
    if (!feedbackArea) { console.error("MAIN.JS: displayFinalFeedback - feedbackArea is null! Check selectDOMElements()."); return; }
    feedbackArea.textContent = message;
    feedbackArea.className = 'display-area';
    if (isCorrect === true) feedbackArea.classList.add('feedback-correct');
    else if (isCorrect === false) feedbackArea.classList.add('feedback-incorrect');
    showElement(feedbackArea); // Assumes feedbackArea itself is valid if we reach here
}
function displayStepInstruction(instruction) {
    // console.log(`MAIN.JS: displayStepInstruction called with: "${instruction}"`); // Can be too verbose
    if (!stepInstructionArea) { console.error("MAIN.JS: displayStepInstruction - stepInstructionArea is null! Check selectDOMElements()."); return; }
    if (instruction) {
        stepInstructionArea.textContent = instruction;
        showElement(stepInstructionArea);
    } else {
        hideElement(stepInstructionArea);
    }
}

function clearProblemArea() {
    console.log("MAIN.JS: clearProblemArea called");
    if (problemArea) problemArea.innerHTML = ""; else console.warn("MAIN.JS: clearProblemArea - problemArea is null");
    hideElement(problemArea); // utils.js hideElement will warn if problemArea is null

    displayStepInstruction(null); 
    
    hideElement(feedbackArea);

    const inputAreaDiv = qs('#input-area'); // Select locally as it's often hidden/shown
    if (inputAreaDiv) hideElement(inputAreaDiv);
    else console.warn("MAIN.JS: clearProblemArea - #input-area div is null");
    
    if (answerInput) answerInput.value = "";
    else console.warn("MAIN.JS: clearProblemArea - answerInput is null");

    currentProblem = null; currentFactoringStep = 0; expectedFactors = [];
}
function enterLaboratory() {
    console.log("MAIN.JS: enterLaboratory called");
    addStoryMessage("You enter the Aetherium Laboratory. Ancient symbols glow faintly on the walls.");
    clearProblemArea();
    hideElement(spellDisplayArea);
    showLabOptions();
}
function showLabOptions() {
    console.log("MAIN.JS: showLabOptions called. Current labOptionsArea:", labOptionsArea);
    if (!labOptionsArea) {
        console.error("MAIN.JS: showLabOptions - labOptionsArea is NULL! This is the critical error point. Check ID in HTML and timing of selectDOMElements().");
        addStoryMessage("Error: Laboratory interface failed to load. Element 'lab-options-area' missing.", "error");
        return; // Prevent a crash
    }
    labOptionsArea.innerHTML = '<h3>Practice Factoring Skills:</h3>'; // The line that was erroring
    const nextSkillToLearnLevel = player.skillLevel + 1;
    for (let i = 1; i <= MAX_SKILL_LEVEL; i++) {
        const skillKey = i; const skillName = FACTORING_SKILLS[skillKey];
        const button = document.createElement('button'); button.classList.add('action-button', 'lab-skill-btn');
        button.dataset.skillKey = skillKey; let buttonText = "";
        if (skillKey <= player.skillLevel) { buttonText = `Practice: ${skillName}`; } 
        else if (skillKey === nextSkillToLearnLevel) {
            buttonText = `Train: ${skillName} (New!)`;
            if (player.trainingProgress.skillKeyInProgress === skillKey) {
                buttonText += ` [${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}]`;
            }
            button.classList.add('train-new-skill-btn');
        } else { buttonText = `${skillName} (Locked)`; button.disabled = true; }
        button.textContent = buttonText; button.addEventListener('click', () => startPractice(skillKey));
        labOptionsArea.appendChild(button);
    }
    showElement(labOptionsArea);
    console.log("MAIN.JS: showLabOptions finished.");
}
function startPractice(skillKeyToPractice) {
    console.log(`MAIN.JS: startPractice called for skillKey: ${skillKeyToPractice}`);
    if (skillKeyToPractice > player.skillLevel + 1 && skillKeyToPractice !== player.trainingProgress.skillKeyInProgress) {
        if(!(player.trainingProgress.skillKeyInProgress === skillKeyToPractice && skillKeyToPractice === player.skillLevel + 1)){
            addStoryMessage("You are not yet ready to train that skill."); return;
        }
    }
    hideElement(labOptionsArea);
    clearProblemArea();
    if (skillKeyToPractice > player.skillLevel) {
        if (player.trainingProgress.skillKeyInProgress !== skillKeyToPractice) {
            player.trainingProgress.skillKeyInProgress = skillKeyToPractice; player.trainingProgress.correctStreak = 0;
            addStoryMessage(`Beginning training for ${FACTORING_SKILLS[skillKeyToPractice]}. You need ${player.trainingProgress.targetStreak} correct problems to master it.`, "info");
        }
    } else { player.trainingProgress.skillKeyInProgress = null; }
    let problemData; let problemTypeForCheck;
    const difficultyTier = (skillKeyToPractice > player.skillLevel) ? 1 : getRandomInt(1, 2);
    console.log(`MAIN.JS: startPractice - Generating problem for skill ${skillKeyToPractice}, tier ${difficultyTier}`);
    switch (skillKeyToPractice) {
        case 1: problemData = generateGCFProblemJS_reverted(difficultyTier); problemTypeForCheck = "monomial_gcf"; break;
        case 2: problemData = generateDOTSProblemJS_reverted(difficultyTier); problemTypeForCheck = "dots"; break;
        case 3: problemData = generateTrinomialA1ProblemJS_reverted(difficultyTier); problemTypeForCheck = "trinomial_a1"; break;
        default: addStoryMessage(`Problem generation for ${FACTORING_SKILLS[skillKeyToPractice]} is not ready yet.`); showLabOptions(); return;
    }
    console.log("MAIN.JS: startPractice - Problem data generated:", problemData);
    if (problemData && problemData.problemString) {
        currentProblem = { problemString: problemData.problemString, type: problemTypeForCheck, details: problemData.details, skillKey: skillKeyToPractice };
        if (!problemArea) { console.error("MAIN.JS: startPractice - problemArea is null!"); return; }
        problemArea.innerHTML = `Factor: ${currentProblem.problemString}`; showElement(problemArea);
        
        const inputAreaDiv = qs('#input-area');
        if (!inputAreaDiv) { console.error("MAIN.JS: startPractice - #input-area div is null!"); return; }
        showElement(inputAreaDiv);
        
        if (!answerInput) { console.error("MAIN.JS: startPractice - answerInput is null!"); return; }
        answerInput.value = ""; answerInput.focus();
        
        let instruction = "";
        if (currentProblem.type === "monomial_gcf") { currentFactoringStep = 1; instruction = "Enter the GCF:"; } 
        else if (["dots", "trinomial_a1"].includes(currentProblem.type)) {
            currentFactoringStep = 1; expectedFactors = currentProblem.details.factors.map(f => cleanInput(f));
            instruction = "Enter the first factor (e.g., (x-3)):";
        }
        if (player.trainingProgress.skillKeyInProgress === skillKeyToPractice && skillKeyToPractice > player.skillLevel) {
            instruction = `Training (${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}): ${instruction}`;
        }
        displayStepInstruction(instruction);
    } else { 
        console.error("MAIN.JS: startPractice - Failed to generate problemData or problemString.");
        addStoryMessage("Failed to generate a problem. Please try again.", "error"); 
        showLabOptions(); 
    }
}

// --- Problem Generation (Reverted versions - these are simplified placeholders for now) ---
// Make sure to paste the actual "reverted" problem generator functions here.
// For brevity, I'm putting simplified ones. Use the ones from the previous "reverted" response.
function formatTermManual(coeff, vari, expo = "") {
    if (coeff === 0 && vari) return ""; if (coeff === 0 && !vari) return "0";
    let cStr = (coeff === 1 && vari) ? "" : (coeff === -1 && vari) ? "-" : coeff.toString();
    return `${cStr}${vari}${expo}`;
}
function formatExprManual(terms) {
    const valid = terms.filter(t => t !== ""); if (valid.length === 0) return "0";
    let expr = valid[0];
    for (let i = 1; i < valid.length; i++) { expr += valid[i].startsWith('-') ? ` - ${valid[i].substring(1)}` : ` + ${valid[i]}`; }
    return expr;
}
function generateGCFProblemJS_reverted(difficultyTier = 1) { /* ... PASTE FULL REVERTED GCF GENERATOR HERE ... */ 
    const varChars = ['x', 'y']; const v1 = varChars[0]; const v2 = varChars[1];
    let n1 = getRandomInt(1,3) * 6; let n2 = getRandomInt(1,3) * 6;
    let actualGCF = calculateGCD(n1,n2);
    return {problemString: `${n1}${v1} + ${n2}${v2}`, details: {gcf: actualGCF.toString(), remainingExpr: `(${(n1/actualGCF)}${v1}+${(n2/actualGCF)}${v2})`}};
}
function generateDOTSProblemJS_reverted(difficultyTier = 1) { /* ... PASTE FULL REVERTED DOTS GENERATOR HERE ... */
    const v = 'x'; const a = getRandomInt(2,5); 
    return {problemString: `${v}<sup>2</sup> - ${a*a}`, details: {factors: [`(${v}-${a})`, `(${v}+${a})`]}};
}
function generateTrinomialA1ProblemJS_reverted(difficultyTier = 1) { /* ... PASTE FULL REVERTED TRINOMIAL GENERATOR HERE ... */
    const v = 'x'; const p = getRandomInt(1,5); const q = getRandomInt(1,5);
    return {problemString: `${v}<sup>2</sup> + ${p+q}${v} + ${p*q}`, details: {factors: [`(${v}+${p})`, `(${v}+${q})`]}};
}


// --- Answer Checking ---
function handleSubmitAnswer() {
    if (!currentProblem) { displayFinalFeedback("No active problem.", false); return; }
    const userAnswer = answerInput.value;
    if (!userAnswer.trim()) { displayStepInstruction("Please enter an answer."); return; }

    player.stats.problemsAttempted++;
    const cleanedUserAnswer = cleanInput(userAnswer);
    let correctStep = false; let problemFullySolved = false;
    let stepInstructionMsg = ""; let finalFeedbackMsg = "";

    if (currentProblem.type === "monomial_gcf") {
        if (currentFactoringStep === 1) {
            const correctGCF = currentProblem.details.gcf;
            if (cleanedUserAnswer === correctGCF) {
                stepInstructionMsg = "Correct GCF! Now enter the remaining expression (e.g., (x+y)):";
                currentFactoringStep = 2; correctStep = true;
            } else {
                finalFeedbackMsg = `Incorrect GCF. Expected: ${currentProblem.details.gcf}.`;
                problemFullySolved = true; correctStep = false;
            }
        } else if (currentFactoringStep === 2) {
            const correctRemaining = currentProblem.details.remainingExpr;
            if (cleanedUserAnswer === correctRemaining) {
                finalFeedbackMsg = "Factoring complete and correct!";
                correctStep = true; problemFullySolved = true;
            } else {
                finalFeedbackMsg = `Incorrect remaining expression. Expected: ${currentProblem.details.remainingExpr}.`;
                problemFullySolved = true; correctStep = false;
            }
        }
    } else if (["dots", "trinomial_a1"].includes(currentProblem.type)) {
        if (currentFactoringStep === 1) {
            if (expectedFactors.includes(cleanedUserAnswer)) {
                stepInstructionMsg = "Correct! Enter the second factor:";
                expectedFactors.splice(expectedFactors.indexOf(cleanedUserAnswer), 1);
                currentFactoringStep = 2; correctStep = true;
            } else {
                finalFeedbackMsg = `Incorrect first factor. Expected one of: ${currentProblem.details.factors.join(' or ')}.`;
                problemFullySolved = true; correctStep = false;
            }
        } else if (currentFactoringStep === 2) {
            if (expectedFactors.includes(cleanedUserAnswer)) {
                finalFeedbackMsg = "Factoring complete and correct!";
                correctStep = true; problemFullySolved = true;
            } else {
                const expectedFactor2 = expectedFactors.length > 0 ? expectedFactors[0] : "the other factor";
                finalFeedbackMsg = `Incorrect second factor. Expected: ${expectedFactor2}.`;
                problemFullySolved = true; correctStep = false;
            }
        }
    }

    if (correctStep && !problemFullySolved) { // Intermediate correct step
        answerInput.value = ""; answerInput.focus();
        let prefix = "";
        if (player.trainingProgress.skillKeyInProgress === currentProblem.skillKey && currentProblem.skillKey > player.skillLevel) {
            prefix = `Training (${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}): `;
        }
        displayStepInstruction(prefix + stepInstructionMsg); // Display step instruction
        // NO SFX here in reverted version
        return;
    }

    // This point is reached if problem is fully resolved (correctly or incorrectly at final step)
    displayFinalFeedback(finalFeedbackMsg, correctStep); // Display final feedback

    const lastProblemSkillKey = currentProblem ? currentProblem.skillKey : null;

    if (correctStep && problemFullySolved) {
        // NO SFX here in reverted version
        player.stats.problemsCorrect++;
        if (gameTitle) {
            gameTitle.classList.add('title-epic-pulse');
            gameTitle.addEventListener('animationend', () => { if (gameTitle) gameTitle.classList.remove('title-epic-pulse'); }, { once: true });
        }
        if (lastProblemSkillKey && lastProblemSkillKey > player.skillLevel) {
            if (player.trainingProgress.skillKeyInProgress === lastProblemSkillKey) {
                player.trainingProgress.correctStreak++;
                if (player.trainingProgress.correctStreak >= player.trainingProgress.targetStreak) {
                    player.skillLevel = lastProblemSkillKey;
                    addStoryMessage(`Mastered! You have achieved ${FACTORING_SKILLS[player.skillLevel]}! Rank: ${FACTORING_SKILLS[player.skillLevel]}.`, "success");
                    player.trainingProgress.skillKeyInProgress = null; player.trainingProgress.correctStreak = 0;
                    updatePlayerStatsUI();
                } else {
                     addStoryMessage(`Correct! Streak for ${FACTORING_SKILLS[lastProblemSkillKey]}: ${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}. Keep going!`, "info");
                }
            }
        } else {
            const goldReward = getRandomInt(1, 5); player.gold += goldReward;
            addStoryMessage(`You reinforce your knowledge and find ${goldReward} gold dust.`, "info");
            updatePlayerStatsUI();
        }
    } else if (!correctStep && problemFullySolved) {
        player.stats.problemsIncorrect++;
        if (lastProblemSkillKey && player.trainingProgress.skillKeyInProgress === lastProblemSkillKey && lastProblemSkillKey > player.skillLevel) {
            addStoryMessage(`Incorrect. Your training streak for ${FACTORING_SKILLS[lastProblemSkillKey]} has been reset.`, "error");
            player.trainingProgress.correctStreak = 0;
        }
    }

    if (problemFullySolved) {
        setTimeout(() => {
            clearProblemArea();
            if (player.trainingProgress.skillKeyInProgress && 
                lastProblemSkillKey && 
                lastProblemSkillKey === player.trainingProgress.skillKeyInProgress && 
                player.skillLevel < lastProblemSkillKey) {
                startPractice(player.trainingProgress.skillKeyInProgress);
            } else {
                showLabOptions();
            }
        }, 2000);
    }
}


// --- Audio Controls and Game Start ---
function setupAudioControls() {
    console.log("MAIN.JS: setupAudioControls called");
    if (!backgroundMusic) console.warn("MAIN.JS: setupAudioControls - backgroundMusic element is null");
    if (!volumeSlider) console.warn("MAIN.JS: setupAudioControls - volumeSlider element is null");
    if (!muteBtn) console.warn("MAIN.JS: setupAudioControls - muteBtn element is null");

    if (backgroundMusic && volumeSlider) backgroundMusic.volume = parseFloat(volumeSlider.value);
    if (muteBtn && backgroundMusic) muteBtn.textContent = backgroundMusic.muted ? '🔇' : '🔊';
}
function attemptToStartMusic() {
    console.log("MAIN.JS: attemptToStartMusic called");
    if (!musicStarted && backgroundMusic) {
        backgroundMusic.play().then(() => { musicStarted = true; console.log("BG music started."); })
            .catch(error => console.warn("Music autoplay prevented/failed. Check browser console for details.", error));
    } else if (!backgroundMusic) {
        console.warn("MAIN.JS: attemptToStartMusic - Background music element not found.");
    }
}
function setupEventListeners() {
    console.log("MAIN.JS: setupEventListeners called");
    if(labBtn) labBtn.addEventListener('click', () => { attemptToStartMusic(); enterLaboratory(); });
    else console.warn("MAIN.JS: Lab button not found or null");

    if(shopBtn) shopBtn.addEventListener('click', () => { attemptToStartMusic(); addStoryMessage("Shop closed...", "info"); clearProblemArea(); hideElement(labOptionsArea); hideElement(spellDisplayArea); });
    else console.warn("MAIN.JS: Shop button not found or null");
    
    if(exploreBtn) exploreBtn.addEventListener('click', () => { attemptToStartMusic(); addStoryMessage("Wilds vast...", "info"); clearProblemArea(); hideElement(labOptionsArea); hideElement(spellDisplayArea); });
    else console.warn("MAIN.JS: Explore button not found or null");

    if(spellbookBtn) spellbookBtn.addEventListener('click', () => { attemptToStartMusic(); addStoryMessage("Consult spellbook...", "info"); clearProblemArea(); hideElement(labOptionsArea); displaySpellbook(); });
    else console.warn("MAIN.JS: Spellbook button not found or null");

    if(submitAnswerBtn) submitAnswerBtn.addEventListener('click', () => { attemptToStartMusic(); handleSubmitAnswer(); });
    else console.warn("MAIN.JS: Submit Answer button not found or null");

    if(answerInput) answerInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { attemptToStartMusic(); handleSubmitAnswer(); } });
    else console.warn("MAIN.JS: Answer input not found or null");
    
    if (muteBtn && backgroundMusic) {
        muteBtn.addEventListener('click', () => { backgroundMusic.muted = !backgroundMusic.muted; muteBtn.textContent = backgroundMusic.muted ? '🔇' : '🔊'; });
    }
    if (volumeSlider && backgroundMusic) {
        volumeSlider.addEventListener('input', () => {
            backgroundMusic.volume = parseFloat(volumeSlider.value);
            if (muteBtn) {
                if (backgroundMusic.volume > 0 && backgroundMusic.muted) {
                    backgroundMusic.muted = false; muteBtn.textContent = '🔊';
                } else if (backgroundMusic.volume === 0 && !backgroundMusic.muted) {
                    muteBtn.textContent = '🔇';
                } else if (backgroundMusic.volume > 0 && !backgroundMusic.muted) {
                    muteBtn.textContent = '🔊';
                }
            }
        });
    }
    console.log("MAIN.JS: setupEventListeners finished.");
}
function displaySpellbook() { /* ... (as before, ensure it's the latest working version) ... */ }

function initGame() {
    console.log("MAIN.JS: initGame called (from DOMContentLoaded).");
    selectDOMElements(); // Select all DOM elements now that DOM is ready
    initializePlayer(); 
    setupAudioControls(); 
    updatePlayerStatsUI(); 
    displayInitialMessage(); 
    setupEventListeners();
    
    console.log("MAIN.JS: initGame - Hiding initial elements.");
    hideElement(labOptionsArea); 
    hideElement(problemArea);
    const inputAreaDiv = qs('#input-area'); // Select locally as it's often hidden/shown
    hideElement(inputAreaDiv); 
    hideElement(stepInstructionArea); 
    hideElement(feedbackArea); 
    hideElement(spellDisplayArea);
    console.log("MAIN.JS: initGame finished.");
}

document.addEventListener('DOMContentLoaded', initGame);
console.log("MAIN.JS: Script end - DOMContentLoaded listener attached.");
