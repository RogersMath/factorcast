// main.js

// --- DOM Element References ---
const storyDisplay = qs('#story-display');
const problemArea = qs('#problem-area');
const stepInstructionArea = qs('#step-instruction-area');
const answerInput = qs('#answer-input');
const submitAnswerBtn = qs('#submit-answer-btn');
const feedbackArea = qs('#feedback-area');
const gameTitle = qs('main#main-content > h1');

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
function initializePlayer() {
    player = {
        name: "Arithmancer", hp: 50, maxHp: 50, mp: 30, maxMp: 30, gold: 20, skillLevel: 0,
        spellbook: [{ ...SPELL_TEMPLATES["gcf_spark"] }], inventory: { "healing_potion": 1 },
        stats: { problemsAttempted: 0, problemsCorrect: 0, problemsIncorrect: 0 },
        trainingProgress: { skillKeyInProgress: null, correctStreak: 0, targetStreak: PROBLEMS_TO_MASTER_SKILL }
    };
}
function updatePlayerStatsUI() {
    if (!player || Object.keys(player).length === 0) return;
    updateText('#stat-hp', `HP: ${player.hp}/${player.maxHp}`);
    updateText('#stat-mp', `MP: ${player.mp}/${player.maxMp}`);
    updateText('#stat-gold', `Gold: ${player.gold}`);
    updateText('#stat-skill', `Skill: ${FACTORING_SKILLS[player.skillLevel]}`);
}
function displayInitialMessage() {
    storyDisplay.innerHTML = `<p>Welcome, ${player.name}! The land of Algebraria is troubled by a Great Discontinuity. Only by mastering the ancient art of Factoring can you hope to restore balance. Your journey begins...</p>`;
}
function addStoryMessage(message, type = "normal") {
    const p = document.createElement('p'); p.textContent = message;
    if(type !== "normal") p.classList.add(type);
    storyDisplay.appendChild(p); storyDisplay.scrollTop = storyDisplay.scrollHeight;
}
function displayFinalFeedback(message, isCorrect) {
    feedbackArea.textContent = message; feedbackArea.className = 'display-area';
    if (isCorrect === true) feedbackArea.classList.add('feedback-correct');
    else if (isCorrect === false) feedbackArea.classList.add('feedback-incorrect');
    showElement(feedbackArea);
}
function displayStepInstruction(instruction) {
    if (instruction) { stepInstructionArea.textContent = instruction; showElement(stepInstructionArea); } 
    else { hideElement(stepInstructionArea); }
}
function clearProblemArea() {
    problemArea.innerHTML = ""; hideElement(problemArea); displayStepInstruction(null);
    hideElement(qs('#input-area')); answerInput.value = ""; hideElement(feedbackArea);
    currentProblem = null; currentFactoringStep = 0; expectedFactors = [];
}
function enterLaboratory() {
    addStoryMessage("You enter the Aetherium Laboratory. Ancient symbols glow faintly on the walls.");
    clearProblemArea(); hideElement(spellDisplayArea); showLabOptions();
}
function showLabOptions() {
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
function startPractice(skillKeyToPractice) {
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

// --- REFACTORED Problem Generation ---

// Snippet for main.js - REPLACE the entire generateGCFProblemJS function

function generateGCFProblemJS(difficultyTier = 1) {
    const v1 = getRandomVariable();
    let problemString, finalNumericGCF, variableGCF = "", remainingExpr;

    const type = getRandomInt(1, 3);

    if (type === 1) { // GCF is purely numerical: e.g., 18x + 12y -> 6(3x + 2y)
        let n1 = getRandomInt(1, 6) * getRandomInt(2, 4); // Create numbers with likely common factors
        let n2 = getRandomInt(1, 6) * getRandomInt(2, 4);
        // Ensure n1 and n2 are not trivially 1 or the same after multiplication if they are small
        if (n1 === n2 && n1 < 10) n2 = n1 + getRandomInt(2,6); // Make them different
        while (calculateGCD(n1, n2) <= 1 && (n1 > 1 || n2 > 1) ) { // Ensure GCF > 1 if possible
             n1 = getRandomInt(1, 6) * getRandomInt(2, 4);
             n2 = getRandomInt(1, 6) * getRandomInt(2, 4);
             if (n1 === n2 && n1 < 10) n2 = n1 + getRandomInt(2,6);
        }
        if (calculateGCD(n1,n2) === 0 && (n1!==0 || n2!==0)) { // Should not happen if n1,n2 are non-zero usually
             finalNumericGCF = (n1!==0) ? Math.abs(n1) : Math.abs(n2); // if one is 0, gcf is the other
        } else {
            finalNumericGCF = calculateGCD(n1, n2);
        }


        const c1 = getRandomNonZeroInt(1, 3); // Multiplier for v1 term inside parenthesis
        const c2 = getRandomNonZeroInt(1, 3); // Multiplier for v2 term inside parenthesis
        const v2 = getRandomVariable([v1]);

        const term1Coeff = finalNumericGCF * c1;
        const term2Coeff = finalNumericGCF * c2;
        // Recalculate true GCF of final coefficients
        finalNumericGCF = calculateGCD(term1Coeff, term2Coeff);


        const term1Display = formatTermForDisplay(term1Coeff, v1);
        const term2Display = formatTermForDisplay(term2Coeff, v2);
        problemString = formatExpressionForDisplay([term1Display, term2Display]);
        
        const gcfForProblem = finalNumericGCF.toString();
        
        const remTerm1Coeff = term1Coeff / finalNumericGCF;
        const remTerm2Coeff = term2Coeff / finalNumericGCF;
        const remTerm1Display = formatTermForDisplay(remTerm1Coeff, v1);
        const remTerm2Display = formatTermForDisplay(remTerm2Coeff, v2);
        remainingExpr = `(${formatExpressionForDisplay([remTerm1Display, remTerm2Display])})`;
        
        return { problemString, details: { gcf: cleanInput(gcfForProblem), remainingExpr: cleanInput(remainingExpr) } };

    } else if (type === 2) { // GCF includes a variable: e.g., 12x^2 + 18x -> 6x(2x + 3)
        let n1_base = getRandomInt(1, 4);
        let n2_base = getRandomInt(1, 4);
        let common_mult = getRandomInt(1,4); // Can be 1 if no extra common numeric factor desired

        let term1Coeff = n1_base * common_mult;
        let term2Coeff = n2_base * common_mult;

        // Ensure coefficients are not both 1 if possible, to make GCF interesting
        if (term1Coeff === 1 && term2Coeff === 1) {
            term1Coeff = getRandomInt(2,5); // Make at least one larger
        }
        
        finalNumericGCF = calculateGCD(term1Coeff, term2Coeff);
        variableGCF = v1; // The common variable is v1

        const term1Display = formatTermForDisplay(term1Coeff, v1, "<sup>2</sup>");
        const term2Display = formatTermForDisplay(term2Coeff, v1);
        problemString = formatExpressionForDisplay([term1Display, term2Display]);

        const gcfForProblem = formatTermForDisplay(finalNumericGCF, variableGCF);
        
        const remTerm1Coeff = term1Coeff / finalNumericGCF;
        const remTerm2Coeff = term2Coeff / finalNumericGCF;

        const remTerm1Display = formatTermForDisplay(remTerm1Coeff, v1); // v1^2 / v1 = v1
        const remTerm2Display = formatTermForDisplay(remTerm2Coeff);       // v1 / v1 = constant
        remainingExpr = `(${formatExpressionForDisplay([remTerm1Display, remTerm2Display])})`;

        return { problemString, details: { gcf: cleanInput(gcfForProblem), remainingExpr: cleanInput(remainingExpr) } };

    } else { // Numerical GCF with a constant term: e.g., 18x + 12 -> 6(3x + 2)
        let n1_base = getRandomInt(1, 6); 
        let n2_base = getRandomInt(1, 6); 
        let common_mult = getRandomInt(2,4); // Ensure a common factor > 1

        let term1Coeff = n1_base * common_mult;
        let term2Num = n2_base * common_mult;

        // Recalculate true GCF of final coefficients
        finalNumericGCF = calculateGCD(term1Coeff, term2Num);

        const term1Display = formatTermForDisplay(term1Coeff, v1);
        const term2Display = formatTermForDisplay(term2Num);
        problemString = formatExpressionForDisplay([term1Display, term2Display]);
        
        const gcfForProblem = finalNumericGCF.toString();
        
        const remTerm1Coeff = term1Coeff / finalNumericGCF;
        const remTerm2Num = term2Num / finalNumericGCF;

        const remTerm1Display = formatTermForDisplay(remTerm1Coeff, v1);
        const remTerm2Display = formatTermForDisplay(remTerm2Num);
        remainingExpr = `(${formatExpressionForDisplay([remTerm1Display, remTerm2Display])})`;
        
        return { problemString, details: { gcf: cleanInput(gcfForProblem), remainingExpr: cleanInput(remainingExpr) } };
    }
}


function generateDOTSProblemJS(difficultyTier = 1) {
    const v = getRandomVariable();
    let problemString, factor1Str, factor2Str;

    if (difficultyTier > 1 && Math.random() < 0.4) { // k^2*v^2 - m^2
        const k = getRandomInt(2, 5);
        const m = getRandomNonZeroInt(1, 7);
        
        const term1Display = formatTermForDisplay(k * k, v, "<sup>2</sup>");
        const term2Display = formatTermForDisplay(- (m * m)); 
        problemString = formatExpressionForDisplay([term1Display, term2Display]);

        const factorTermK = formatTermForDisplay(k, v);
        const factorTermM = m.toString();
        factor1Str = `(${factorTermK}-${factorTermM})`;
        factor2Str = `(${factorTermK}+${factorTermM})`;

    } else { // v^2 - a^2
        const a = getRandomNonZeroInt(2, 10);
        
        const term1Display = formatTermForDisplay(1, v, "<sup>2</sup>");
        const term2Display = formatTermForDisplay(- (a * a));
        problemString = formatExpressionForDisplay([term1Display, term2Display]);

        factor1Str = `(${v}-${a})`;
        factor2Str = `(${v}+${a})`;
    }
    return { problemString, details: { factors: [cleanInput(factor1Str), cleanInput(factor2Str)].sort() } };
}


function generateTrinomialA1ProblemJS(difficultyTier = 1) {
    const v = getRandomVariable();
    let p = getRandomNonZeroInt(-7, 7);
    let q = getRandomNonZeroInt(-7, 7);

    while (p + q === 0) { 
        q = getRandomNonZeroInt(-7, 7);
        if (p === -q && q !== 0) q = getRandomNonZeroInt(-7,7); 
        else if (q === 0) q = getRandomNonZeroInt(-7,7); // ensure q is not zero if p makes b zero
    }
    
    const b = p + q;
    const c = p * q;

    const term1Display = formatTermForDisplay(1, v, "<sup>2</sup>"); 
    const term2Display = formatTermForDisplay(b, v);                
    const term3Display = formatTermForDisplay(c);                   
    problemString = formatExpressionForDisplay([term1Display, term2Display, term3Display].filter(t => t !== "" || c === 0)); // Allow "0" if c is 0


    const factor1Str = `(${v}${p > 0 ? '+' : ''}${p})`.replace('+-', '-');
    const factor2Str = `(${v}${q > 0 ? '+' : ''}${q})`.replace('+-', '-');
    
    return { problemString, details: { factors: [cleanInput(factor1Str), cleanInput(factor2Str)].sort() } };
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

    if (correctStep && !problemFullySolved) {
        answerInput.value = ""; answerInput.focus(); let prefix = "";
        if (player.trainingProgress.skillKeyInProgress === currentProblem.skillKey && currentProblem.skillKey > player.skillLevel) {
            prefix = `Training (${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}): `;
        }
        displayStepInstruction(prefix + stepInstructionMsg);
        return;
    }

    displayFinalFeedback(finalFeedbackMsg, correctStep);

    // Store skillKey before currentProblem is cleared
    const lastProblemSkillKey = currentProblem ? currentProblem.skillKey : null;


    if (correctStep) {
        player.stats.problemsCorrect++;
        if (gameTitle) {
            gameTitle.classList.add('title-epic-pulse');
            gameTitle.addEventListener('animationend', () => { if (gameTitle) gameTitle.classList.remove('title-epic-pulse'); }, { once: true });
        }
        if (lastProblemSkillKey && lastProblemSkillKey > player.skillLevel) { // Check lastProblemSkillKey exists
            if (player.trainingProgress.skillKeyInProgress === lastProblemSkillKey) {
                player.trainingProgress.correctStreak++;
                if (player.trainingProgress.correctStreak >= player.trainingProgress.targetStreak) {
                    player.skillLevel = lastProblemSkillKey; // Use lastProblemSkillKey
                    addStoryMessage(`Mastered! You have achieved ${FACTORING_SKILLS[player.skillLevel]}! Your Arithmancer rank is now: ${FACTORING_SKILLS[player.skillLevel]}.`, "success");
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
    } else { // Incorrect problem
        player.stats.problemsIncorrect++;
        if (lastProblemSkillKey && player.trainingProgress.skillKeyInProgress === lastProblemSkillKey && lastProblemSkillKey > player.skillLevel) { // Check lastProblemSkillKey
            addStoryMessage(`Incorrect. Your training streak for ${FACTORING_SKILLS[lastProblemSkillKey]} has been reset.`, "error");
            player.trainingProgress.correctStreak = 0;
        }
    }

    setTimeout(() => {
        clearProblemArea(); // This sets currentProblem to null
        if (player.trainingProgress.skillKeyInProgress && 
            lastProblemSkillKey && 
            lastProblemSkillKey === player.trainingProgress.skillKeyInProgress && 
            player.skillLevel < lastProblemSkillKey) {
            startPractice(player.trainingProgress.skillKeyInProgress);
        } else {
            showLabOptions();
        }
    }, 2500);
}

// --- Event Listeners & Game Start ---
function setupEventListeners() {
    labBtn.addEventListener('click', enterLaboratory);
    submitAnswerBtn.addEventListener('click', handleSubmitAnswer);
    answerInput.addEventListener('keypress', function(event) { if (event.key === 'Enter') { handleSubmitAnswer(); } });
    shopBtn.addEventListener('click', () => { 
        addStoryMessage("The Wandering Emporium is currently closed for restocking. Check back later!", "info");
        clearProblemArea(); hideElement(labOptionsArea); hideElement(spellDisplayArea); 
    });
    exploreBtn.addEventListener('click', () => { 
        addStoryMessage("The wilds of Algebraria are vast and dangerous. Combat system coming soon!", "info");
        clearProblemArea(); hideElement(labOptionsArea); hideElement(spellDisplayArea); 
    });
    spellbookBtn.addEventListener('click', () => { 
        addStoryMessage("You consult your spellbook...", "info");
        clearProblemArea(); hideElement(labOptionsArea); 
        displaySpellbook(); 
    });
}
function displaySpellbook() {
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
function initGame() {
    initializePlayer(); updatePlayerStatsUI(); displayInitialMessage(); setupEventListeners();
    hideElement(labOptionsArea); hideElement(problemArea); hideElement(qs('#input-area'));
    hideElement(stepInstructionArea); hideElement(feedbackArea); hideElement(spellDisplayArea);
}

document.addEventListener('DOMContentLoaded', initGame);
