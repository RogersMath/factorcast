// main.js

// --- DOM Element References ---
const storyDisplay = qs('#story-display');
const problemArea = qs('#problem-area');
const stepInstructionArea = qs('#step-instruction-area');
const answerInput = qs('#answer-input');
const submitAnswerBtn = qs('#submit-answer-btn');
const feedbackArea = qs('#feedback-area');
const gameTitle = qs('#game-header h1'); // <<< Get reference to the title

const labBtn = qs('#lab-btn');
const shopBtn = qs('#shop-btn');
const exploreBtn = qs('#explore-btn');
const spellbookBtn = qs('#spellbook-btn');

const labOptionsArea = qs('#lab-options-area');
const spellDisplayArea = qs('#spell-display-area');

const statHp = qs('#stat-hp');
const statMp = qs('#stat-mp');
const statGold = qs('#stat-gold');
const statSkill = qs('#stat-skill');

// --- Game State Variables ---
let player = {};
let currentProblem = null;
let currentFactoringStep = 0;
let expectedFactors = [];

const FACTORING_SKILLS = {
    0: "Novice", 1: "Greatest Common Factor (GCF)", 2: "Difference of Two Squares (DOTS)",
    3: "Trinomials (a=1)", 4: "Perfect Square Trinomials (PST)",
    5: "Trinomials (a>1) / Grouping", 6: "Sum of Cubes", 7: "Difference of Cubes"
};
const MAX_SKILL_LEVEL = Object.keys(FACTORING_SKILLS).length - 1;
const DAMAGE_SCALING_FACTOR = 0.75;
const PROBLEMS_TO_MASTER_SKILL = 5;

// --- Initialization & UI Updates ---
function initializePlayer() { /* ... (no changes here) ... */ 
    player = {
        name: "Arithmancer", hp: 50, maxHp: 50, mp: 30, maxMp: 30, gold: 20, skillLevel: 0,
        spellbook: [{ ...SPELL_TEMPLATES["gcf_spark"] }], inventory: { "healing_potion": 1 },
        stats: { problemsAttempted: 0, problemsCorrect: 0, problemsIncorrect: 0 },
        trainingProgress: { skillKeyInProgress: null, correctStreak: 0, targetStreak: PROBLEMS_TO_MASTER_SKILL }
    };
}
function updatePlayerStatsUI() { /* ... (no changes here) ... */ 
    if (!player || Object.keys(player).length === 0) return;
    updateText('#stat-hp', `HP: ${player.hp}/${player.maxHp}`);
    updateText('#stat-mp', `MP: ${player.mp}/${player.maxMp}`);
    updateText('#stat-gold', `Gold: ${player.gold}`);
    updateText('#stat-skill', `Skill: ${FACTORING_SKILLS[player.skillLevel]}`);
}
function displayInitialMessage() { /* ... (no changes here) ... */ 
    storyDisplay.innerHTML = `<p>Welcome, ${player.name}! The land of Algebraria is troubled by a Great Discontinuity. Only by mastering the ancient art of Factoring can you hope to restore balance. Your journey begins...</p>`;
}
function addStoryMessage(message, type = "normal") { /* ... (no changes here) ... */ 
    const p = document.createElement('p'); p.textContent = message;
    if(type !== "normal") p.classList.add(type);
    storyDisplay.appendChild(p); storyDisplay.scrollTop = storyDisplay.scrollHeight;
}
function displayFinalFeedback(message, isCorrect) { /* ... (no changes here) ... */ 
    feedbackArea.textContent = message; feedbackArea.className = 'display-area';
    if (isCorrect === true) feedbackArea.classList.add('feedback-correct');
    else if (isCorrect === false) feedbackArea.classList.add('feedback-incorrect');
    showElement(feedbackArea);
}
function displayStepInstruction(instruction) { /* ... (no changes here) ... */ 
    if (instruction) { stepInstructionArea.textContent = instruction; showElement(stepInstructionArea); } 
    else { hideElement(stepInstructionArea); }
}
function clearProblemArea() { /* ... (no changes here) ... */ 
    problemArea.innerHTML = ""; hideElement(problemArea); displayStepInstruction(null);
    hideElement(qs('#input-area')); answerInput.value = ""; hideElement(feedbackArea);
    currentProblem = null; currentFactoringStep = 0; expectedFactors = [];
}

// --- Laboratory Logic ---
function enterLaboratory() { /* ... (no changes here) ... */ 
    addStoryMessage("You enter the Aetherium Laboratory. Ancient symbols glow faintly on the walls.");
    clearProblemArea(); hideElement(spellDisplayArea); showLabOptions();
}
function showLabOptions() { /* ... (no changes here) ... */ 
    labOptionsArea.innerHTML = '<h3>Practice Factoring Skills:</h3>';
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
}
function startPractice(skillKeyToPractice) { /* ... (no changes here for the core logic, ensure it's the last full version) ... */ 
    if (skillKeyToPractice > player.skillLevel + 1 && skillKeyToPractice !== player.trainingProgress.skillKeyInProgress) {
        if(!(player.trainingProgress.skillKeyInProgress === skillKeyToPractice && skillKeyToPractice === player.skillLevel + 1)){
            addStoryMessage("You are not yet ready to train that skill."); return;
        }
    }
    hideElement(labOptionsArea); clearProblemArea();
    if (skillKeyToPractice > player.skillLevel) {
        if (player.trainingProgress.skillKeyInProgress !== skillKeyToPractice) {
            player.trainingProgress.skillKeyInProgress = skillKeyToPractice; player.trainingProgress.correctStreak = 0;
            addStoryMessage(`Beginning training for ${FACTORING_SKILLS[skillKeyToPractice]}. You need ${player.trainingProgress.targetStreak} correct problems to master it.`, "info");
        }
    } else { player.trainingProgress.skillKeyInProgress = null; }
    let problemData; let problemTypeForCheck;
    const difficultyTier = (skillKeyToPractice > player.skillLevel) ? 1 : getRandomInt(1, 2);
    switch (skillKeyToPractice) {
        case 1: problemData = generateGCFProblemJS(difficultyTier); problemTypeForCheck = "monomial_gcf"; break;
        case 2: problemData = generateDOTSProblemJS(difficultyTier); problemTypeForCheck = "dots"; break;
        case 3: problemData = generateTrinomialA1ProblemJS(difficultyTier); problemTypeForCheck = "trinomial_a1"; break;
        default: addStoryMessage(`Problem generation for ${FACTORING_SKILLS[skillKeyToPractice]} is not ready yet.`); showLabOptions(); return;
    }
    if (problemData && problemData.problemString) {
        currentProblem = { problemString: problemData.problemString, type: problemTypeForCheck, details: problemData.details, skillKey: skillKeyToPractice };
        problemArea.innerHTML = `Factor: ${currentProblem.problemString}`; showElement(problemArea);
        showElement(qs('#input-area')); answerInput.value = ""; answerInput.focus();
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
    } else { addStoryMessage("Failed to generate a problem. Please try again."); showLabOptions(); }
}

// --- Problem Generation (JS Versions with <sup> tags) ---
function generateGCFProblemJS(difficultyTier = 1) { /* ... (ensure this is the version using <sup>) ... */ 
    const varChars = ['x', 'y', 'a', 'b', 'm', 'n']; let var1 = varChars[getRandomInt(0, varChars.length - 1)];
    let var2 = varChars[getRandomInt(0, varChars.length - 1)]; while (var2 === var1) var2 = varChars[getRandomInt(0, varChars.length - 1)];
    const type = getRandomInt(1, 3); let problemString, gcf, remainingExpr;
    if (type === 1) {
        const commonFactor = getRandomInt(2, 7); problemString = `${commonFactor}${var1} + ${commonFactor}${var2}`;
        gcf = commonFactor.toString(); remainingExpr = `(${var1}+${var2})`;
    } else if (type === 2) {
        let c1 = getRandomInt(1, 4); let c2_multiplier = getRandomInt(1,3); let c2 = c1 * c2_multiplier; 
        if (c1 === 1 && c2_multiplier === 1 && c1 === c2) c2 = getRandomInt(2,6) * c1;
        let numGcf = 1; for(let i = Math.min(c1,c2); i >=1; i--){ if(c1 % i === 0 && c2 % i === 0) { numGcf = i; break; } }
        const term1Str = (c1 === 1) ? `${var1}<sup>2</sup>` : `${c1}${var1}<sup>2</sup>`;
        const term2Str = (c2 === 1 && numGcf === 1) ? `${var1}` : `${c2}${var1}`; 
        problemString = `${term1Str} + ${term2Str}`;
        const gcfNumPart = numGcf > 1 ? numGcf.toString() : ""; gcf = `${gcfNumPart}${var1}`;
        const remCoeff1 = c1 / numGcf; const remCoeff2 = c2 / numGcf;
        const remTerm1 = (remCoeff1 === 1) ? var1 : `${remCoeff1}${var1}`; const remTerm2 = remCoeff2.toString();
        remainingExpr = `(${remTerm1}+${remTerm2})`;
    } else {
        const commonFactor = getRandomInt(2, 5); const m1 = getRandomInt(1, 4); let m2 = getRandomInt(2, 5); 
        while (m1 === m2 && commonFactor*m1 === commonFactor*m2 ) m2 = getRandomInt(1,4);
        const c1_val = commonFactor * m1; const c2_const = commonFactor * m2;
        problemString = `${c1_val}${var1} + ${c2_const}`; gcf = commonFactor.toString();
        remainingExpr = `(${m1}${var1}+${m2})`;
    }
    return { problemString, details: { gcf, remainingExpr } };
}
function generateDOTSProblemJS(difficultyTier = 1) { /* ... (ensure this is the version using <sup>) ... */ 
    const varChars = ['x', 'y', 'z', 'a', 'b']; const variable = varChars[getRandomInt(0, varChars.length - 1)];
    let problemString, factor1, factor2;
    if (difficultyTier > 1 && Math.random() < 0.4) {
        const k = getRandomInt(2, 5); let m = getRandomInt(2, 7); while (m === k) m = getRandomInt(2,7); 
        const term1 = (k===1) ? `${variable}<sup>2</sup>` : `${k*k}${variable}<sup>2</sup>`; const term2 = `${m*m}`;
        problemString = `${term1} - ${term2}`; factor1 = `(${k}${variable}-${m})`; factor2 = `(${k}${variable}+${m})`;
    } else { 
        const a = getRandomInt(2, 10); problemString = `${variable}<sup>2</sup> - ${a*a}`;
        factor1 = `(${variable}-${a})`; factor2 = `(${variable}+${a})`;
    }
    return { problemString, details: { factors: [factor1, factor2].sort() } };
}
function generateTrinomialA1ProblemJS(difficultyTier = 1) { /* ... (ensure this is the version using <sup>) ... */ 
    const varChars = ['x', 'y', 'm', 'p']; const variable = varChars[getRandomInt(0, varChars.length - 1)];
    let p = getRandomInt(1, 7) * (Math.random() < 0.5 ? 1 : -1); let q = getRandomInt(1, 7) * (Math.random() < 0.5 ? 1 : -1);
    while (p === 0) p = getRandomInt(1, 7) * (Math.random() < 0.5 ? 1 : -1);
    while (q === 0 || q === -p) q = getRandomInt(1, 7) * (Math.random() < 0.5 ? 1 : -1);
    while (p + q === 0) {
        p = getRandomInt(1, 7) * (Math.random() < 0.5 ? 1 : -1); while (p === 0) p = getRandomInt(1, 7) * (Math.random() < 0.5 ? 1 : -1);
        q = getRandomInt(1, 7) * (Math.random() < 0.5 ? 1 : -1); while (q === 0 || q === -p) q = getRandomInt(1, 7) * (Math.random() < 0.5 ? 1 : -1);
    }
    const b = p + q; const c = p * q;
    let problemString = `${variable}<sup>2</sup>`;
    if (b === 1) problemString += ` + ${variable}`; else if (b === -1) problemString += ` - ${variable}`;
    else problemString += (b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`) + variable;
    if (c !== 0) { problemString += (c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`); }
    const factor1 = `(${variable}${p > 0 ? '+' : ''}${p})`.replace('+-', '-');
    const factor2 = `(${variable}${q > 0 ? '+' : ''}${q})`.replace('+-', '-');
    return { problemString, details: { factors: [factor1, factor2].sort() } };
}

// --- Answer Checking ---
function handleSubmitAnswer() {
    if (!currentProblem) {
        displayFinalFeedback("No active problem.", false);
        return;
    }
    const userAnswer = answerInput.value;
    if (!userAnswer.trim()) {
        displayStepInstruction("Please enter an answer.");
        return;
    }

    player.stats.problemsAttempted++;
    const cleanedUserAnswer = cleanInput(userAnswer);
    let correctStep = false;
    let problemFullySolved = false;
    let stepInstructionMsg = "";
    let finalFeedbackMsg = "";

    if (currentProblem.type === "monomial_gcf") {
        // ... GCF checking logic (no changes for animation) ...
        if (currentFactoringStep === 1) {
            const correctGCF = cleanInput(currentProblem.details.gcf);
            if (cleanedUserAnswer === correctGCF) {
                stepInstructionMsg = "Correct GCF! Now enter the remaining expression (e.g., (x+y)):";
                currentFactoringStep = 2; correctStep = true;
            } else {
                finalFeedbackMsg = `Incorrect GCF. Expected: ${currentProblem.details.gcf}.`;
                problemFullySolved = true; correctStep = false;
            }
        } else if (currentFactoringStep === 2) {
            const correctRemaining = cleanInput(currentProblem.details.remainingExpr);
            if (cleanedUserAnswer === correctRemaining) {
                finalFeedbackMsg = "Factoring complete and correct!";
                correctStep = true; problemFullySolved = true;
            } else {
                finalFeedbackMsg = `Incorrect remaining expression. Expected: ${currentProblem.details.remainingExpr}.`;
                problemFullySolved = true; correctStep = false;
            }
        }
    } else if (["dots", "trinomial_a1"].includes(currentProblem.type)) {
        // ... DOTS/Trinomial checking logic (no changes for animation) ...
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

    if (correctStep && !problemFullySolved) {
        answerInput.value = "";
        answerInput.focus();
        let prefix = "";
        if (player.trainingProgress.skillKeyInProgress === currentProblem.skillKey && currentProblem.skillKey > player.skillLevel) {
            prefix = `Training (${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}): `;
        }
        displayStepInstruction(prefix + stepInstructionMsg);
        return;
    }

    displayFinalFeedback(finalFeedbackMsg, correctStep);

    if (correctStep) {
        player.stats.problemsCorrect++;
        // <<< MODIFIED: Trigger title animation on fully correct problem >>>
        gameTitle.classList.add('title-epic-pulse');
        // Remove class after animation to allow re-triggering
        gameTitle.addEventListener('animationend', () => {
            gameTitle.classList.remove('title-epic-pulse');
        }, { once: true }); // {once: true} ensures listener is auto-removed

        if (currentProblem.skillKey > player.skillLevel) {
            // ... Training progress logic (no changes for animation) ...
            if (player.trainingProgress.skillKeyInProgress === currentProblem.skillKey) {
                player.trainingProgress.correctStreak++;
                if (player.trainingProgress.correctStreak >= player.trainingProgress.targetStreak) {
                    player.skillLevel = currentProblem.skillKey;
                    addStoryMessage(`Mastered! You have achieved ${FACTORING_SKILLS[player.skillLevel]}! Your Arithmancer rank is now: ${FACTORING_SKILLS[player.skillLevel]}.`, "success");
                    player.trainingProgress.skillKeyInProgress = null; player.trainingProgress.correctStreak = 0;
                    updatePlayerStatsUI();
                } else {
                     addStoryMessage(`Correct! Streak for ${FACTORING_SKILLS[currentProblem.skillKey]}: ${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}. Keep going!`, "info");
                }
            }
        } else {
            // ... Gold reward logic (no changes for animation) ...
            const goldReward = getRandomInt(1, 5); player.gold += goldReward;
            addStoryMessage(`You reinforce your knowledge and find ${goldReward} gold dust.`, "info");
            updatePlayerStatsUI();
        }
    } else {
        // ... Incorrect answer logic (no changes for animation) ...
        player.stats.problemsIncorrect++;
        if (player.trainingProgress.skillKeyInProgress === currentProblem.skillKey && currentProblem.skillKey > player.skillLevel) {
            addStoryMessage(`Incorrect. Your training streak for ${FACTORING_SKILLS[currentProblem.skillKey]} has been reset.`, "error");
            player.trainingProgress.correctStreak = 0;
        }
    }

    setTimeout(() => {
        clearProblemArea();
        if (player.trainingProgress.skillKeyInProgress && currentProblem.skillKey === player.trainingProgress.skillKeyInProgress && player.skillLevel < currentProblem.skillKey) {
            startPractice(player.trainingProgress.skillKeyInProgress);
        } else {
            showLabOptions();
        }
    }, 2500);
}

// --- Event Listeners & Game Start ---
function setupEventListeners() { /* ... (no changes here) ... */ 
    labBtn.addEventListener('click', enterLaboratory);
    submitAnswerBtn.addEventListener('click', handleSubmitAnswer);
    answerInput.addEventListener('keypress', function(event) { if (event.key === 'Enter') { handleSubmitAnswer(); } });
    shopBtn.addEventListener('click', () => { addStoryMessage("The Wandering Emporium is closed...", "info"); clearProblemArea(); /*...*/ });
    exploreBtn.addEventListener('click', () => { addStoryMessage("The wilds are vast...", "info"); clearProblemArea(); /*...*/ });
    spellbookBtn.addEventListener('click', () => { addStoryMessage("You consult your spellbook...", "info"); clearProblemArea(); /*...*/ displaySpellbook(); });
}
function displaySpellbook() { /* ... (no changes here) ... */ 
    spellDisplayArea.innerHTML = '<h3>Your Spellbook:</h3>';
    if (player.spellbook.length === 0) { spellDisplayArea.innerHTML += '<p>Your spellbook is empty.</p>'; } 
    else {
        player.spellbook.forEach(spell => {
            const card = document.createElement('div'); card.classList.add('spell-card');
            card.innerHTML = `<div class="emoji-art">${spell.emoji}</div><div class="spell-name">${spell.name}</div><div class="spell-cost">MP: ${spell.mpCost}</div><div class="spell-desc" style="font-size:0.8em; color: #ccc;">${spell.description}</div>`;
            spellDisplayArea.appendChild(card);
        });
    }
    showElement(spellDisplayArea);
}
function initGame() { /* ... (no changes here) ... */ 
    initializePlayer(); updatePlayerStatsUI(); displayInitialMessage(); setupEventListeners();
    hideElement(labOptionsArea); hideElement(problemArea); hideElement(qs('#input-area'));
    hideElement(stepInstructionArea); hideElement(feedbackArea); hideElement(spellDisplayArea);
}

document.addEventListener('DOMContentLoaded', initGame);
