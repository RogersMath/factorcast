// main.js - Reverted State

// --- DOM Element References ---
const storyDisplay = qs('#story-display');
const problemArea = qs('#problem-area');
const stepInstructionArea = qs('#step-instruction-area');
const answerInput = qs('#answer-input');
const submitAnswerBtn = qs('#submit-answer-btn');
const feedbackArea = qs('#feedback-area');
const gameTitle = qs('main#main-content > h1');
const backgroundMusic = qs('#background-music');
const volumeSlider = qs('#volume-slider');
const muteBtn = qs('#mute-btn');
// SFX consts REMOVED
// const sfxCorrectStep = qs('#sfx-correct-step');
// const sfxSuccessSolve = qs('#sfx-success-solve');

const labBtn = qs('#lab-btn'); /* ... other buttons ... */
const shopBtn = qs('#shop-btn');
const exploreBtn = qs('#explore-btn');
const spellbookBtn = qs('#spellbook-btn');
const labOptionsArea = qs('#lab-options-area');
const spellDisplayArea = qs('#spell-display-area');
const statHp = qs('#stat-hp'); /* ... other stats ... */
const statMp = qs('#stat-mp');
const statGold = qs('#stat-gold');
const statSkill = qs('#stat-skill');

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

// Reverted feedback functions (simpler)
function displayFinalFeedback(message, isCorrect) {
    feedbackArea.textContent = message;
    feedbackArea.className = 'display-area';
    if (isCorrect === true) feedbackArea.classList.add('feedback-correct');
    else if (isCorrect === false) feedbackArea.classList.add('feedback-incorrect');
    showElement(feedbackArea);
}
function displayStepInstruction(instruction) {
    if (instruction) {
        stepInstructionArea.textContent = instruction;
        showElement(stepInstructionArea);
    } else {
        hideElement(stepInstructionArea);
    }
}

function clearProblemArea() {
    problemArea.innerHTML = ""; hideElement(problemArea);
    displayStepInstruction(null);
    hideElement(feedbackArea);
    hideElement(qs('#input-area')); answerInput.value = "";
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
        case 1: problemData = generateGCFProblemJS_reverted(difficultyTier); problemTypeForCheck = "monomial_gcf"; break;
        case 2: problemData = generateDOTSProblemJS_reverted(difficultyTier); problemTypeForCheck = "dots"; break;
        case 3: problemData = generateTrinomialA1ProblemJS_reverted(difficultyTier); problemTypeForCheck = "trinomial_a1"; break;
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

// --- Problem Generation (Reverted to pre-utils.js formatting abstraction, but with GCF fix and sup tags) ---

function formatTermManual(coeff, vari, expo = "") { // Simplified local formatter
    if (coeff === 0 && vari) return "";
    if (coeff === 0 && !vari) return "0";
    let cStr = "";
    if (coeff === 1 && vari) cStr = "";
    else if (coeff === -1 && vari) cStr = "-";
    else cStr = coeff.toString();
    return `${cStr}${vari}${expo}`;
}

function formatExprManual(terms) { // Simplified local formatter
    const valid = terms.filter(t => t !== "");
    if (valid.length === 0) return "0";
    let expr = valid[0];
    for (let i = 1; i < valid.length; i++) {
        if (valid[i].startsWith('-')) expr += ` - ${valid[i].substring(1)}`;
        else expr += ` + ${valid[i]}`;
    }
    return expr;
}


function generateGCFProblemJS_reverted(difficultyTier = 1) {
    const varChars = ['x', 'y', 'a', 'b', 'm', 'n'];
    let v1 = varChars[getRandomInt(0, varChars.length - 1)];
    let problemString, gcfForProblemDetails, remainingExprDetails;
    const type = getRandomInt(1, 3);

    if (type === 1) { // Purely numerical GCF
        let n1 = getRandomInt(2, 10) * getRandomInt(1,3);
        let n2 = getRandomInt(2, 10) * getRandomInt(1,3);
        while(calculateGCD(n1,n2) <= 1 && (n1 > 1 || n2 > 1)) { // Ensure GCF > 1
            n1 = getRandomInt(2, 10) * getRandomInt(1,3);
            n2 = getRandomInt(2, 10) * getRandomInt(1,3);
        }
        const actualGCF = calculateGCD(n1, n2);
        const v2 = varChars.filter(v => v !== v1)[getRandomInt(0, varChars.length - 2)];

        const term1Display = formatTermManual(n1, v1);
        const term2Display = formatTermManual(n2, v2);
        problemString = formatExprManual([term1Display, term2Display]);

        gcfForProblemDetails = actualGCF.toString();
        const remTerm1 = formatTermManual(n1 / actualGCF, v1);
        const remTerm2 = formatTermManual(n2 / actualGCF, v2);
        remainingExprDetails = `(${formatExprManual([remTerm1, remTerm2])})`;

    } else if (type === 2) { // GCF includes variable
        let c1 = getRandomInt(1, 5);
        let c2 = getRandomInt(1, 5);
        const commonVarPart = v1;
        const actualGCFNum = calculateGCD(c1, c2);

        const term1Display = formatTermManual(c1, v1, "<sup>2</sup>");
        const term2Display = formatTermManual(c2, v1);
        problemString = formatExprManual([term1Display, term2Display]);

        gcfForProblemDetails = formatTermManual(actualGCFNum, commonVarPart);
        const remTerm1 = formatTermManual(c1 / actualGCFNum, v1);
        const remTerm2 = formatTermManual(c2 / actualGCFNum, "");
        remainingExprDetails = `(${formatExprManual([remTerm1, remTerm2].filter(t => t !== "0"))})`;
        if (remainingExprDetails === "()") remainingExprDetails = "(0)";


    } else { // Numerical GCF, one var term, one const
        let n1 = getRandomInt(2, 10) * getRandomInt(1,3);
        let n_const = getRandomInt(2, 10) * getRandomInt(1,3);
         while(calculateGCD(n1,n_const) <= 1 && (n1 > 1 || n_const > 1)) {
            n1 = getRandomInt(2, 10) * getRandomInt(1,3);
            n_const = getRandomInt(2, 10) * getRandomInt(1,3);
        }
        const actualGCF = calculateGCD(n1, n_const);

        const term1Display = formatTermManual(n1, v1);
        const term2Display = formatTermManual(n_const, "");
        problemString = formatExprManual([term1Display, term2Display]);
        
        gcfForProblemDetails = actualGCF.toString();
        const remTerm1 = formatTermManual(n1 / actualGCF, v1);
        const remTerm2 = formatTermManual(n_const / actualGCF, "");
        remainingExprDetails = `(${formatExprManual([remTerm1, remTerm2])})`;
    }
    return { problemString, details: { gcf: cleanInput(gcfForProblemDetails), remainingExpr: cleanInput(remainingExprDetails) } };
}

function generateDOTSProblemJS_reverted(difficultyTier = 1) {
    const varChars = ['x', 'y', 'z'];
    const v = varChars[getRandomInt(0, varChars.length - 1)];
    let problemString, f1, f2;

    if (difficultyTier > 1 && Math.random() < 0.4) { // k^2v^2 - m^2
        const k = getRandomInt(2, 5);
        const m = getRandomInt(1, 7); // m can be 1
        const term1 = formatTermManual(k * k, v, "<sup>2</sup>");
        const term2 = formatTermManual(-(m * m), "");
        problemString = formatExprManual([term1, term2]);
        f1 = `(${formatTermManual(k,v)}-${m})`;
        f2 = `(${formatTermManual(k,v)}+${m})`;
    } else { // v^2 - a^2
        const a = getRandomInt(2, 10);
        const term1 = formatTermManual(1, v, "<sup>2</sup>");
        const term2 = formatTermManual(-(a * a), "");
        problemString = formatExprManual([term1, term2]);
        f1 = `(${v}-${a})`;
        f2 = `(${v}+${a})`;
    }
    return { problemString, details: { factors: [cleanInput(f1), cleanInput(f2)].sort() } };
}

function generateTrinomialA1ProblemJS_reverted(difficultyTier = 1) {
    const varChars = ['x', 'y', 'm'];
    const v = varChars[getRandomInt(0, varChars.length - 1)];
    let p, q;
    do {
        p = getRandomInt(-7, 7);
    } while (p === 0);
    do {
        q = getRandomInt(-7, 7);
    } while (q === 0 || p + q === 0); // Avoid q=0 and b=0 (which is DOTS)

    const b = p + q;
    const c = p * q;

    const term1 = formatTermManual(1, v, "<sup>2</sup>");
    const term2 = formatTermManual(b, v);
    const term3 = formatTermManual(c, "");
    problemString = formatExprManual([term1, term2, term3].filter(t => t !== "" || c === 0));
    if (problemString === "") problemString = "0";


    const f1 = `(${v}${p > 0 ? '+' : ''}${p})`.replace("+-", "-");
    const f2 = `(${v}${q > 0 ? '+' : ''}${q})`.replace("+-", "-");
    return { problemString, details: { factors: [cleanInput(f1), cleanInput(f2)].sort() } };
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
    if (backgroundMusic && volumeSlider) backgroundMusic.volume = parseFloat(volumeSlider.value);
    if (muteBtn && backgroundMusic) muteBtn.textContent = backgroundMusic.muted ? '🔇' : '🔊';
}
function attemptToStartMusic() {
    if (!musicStarted && backgroundMusic) {
        backgroundMusic.play().then(() => { musicStarted = true; console.log("BG music started."); })
            .catch(error => console.warn("Music autoplay prevented.", error));
    } else if (!backgroundMusic) {
        console.warn("Background music element not found.");
    }
}
function setupEventListeners() {
    labBtn.addEventListener('click', () => { attemptToStartMusic(); enterLaboratory(); });
    shopBtn.addEventListener('click', () => { attemptToStartMusic(); addStoryMessage("Shop closed...", "info"); clearProblemArea(); hideElement(labOptionsArea); hideElement(spellDisplayArea); });
    exploreBtn.addEventListener('click', () => { attemptToStartMusic(); addStoryMessage("Wilds vast...", "info"); clearProblemArea(); hideElement(labOptionsArea); hideElement(spellDisplayArea); });
    spellbookBtn.addEventListener('click', () => { attemptToStartMusic(); addStoryMessage("Consult spellbook...", "info"); clearProblemArea(); hideElement(labOptionsArea); displaySpellbook(); });
    submitAnswerBtn.addEventListener('click', () => { attemptToStartMusic(); handleSubmitAnswer(); });
    answerInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { attemptToStartMusic(); handleSubmitAnswer(); } });
    
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
}
function displaySpellbook() { /* ... (as before) ... */ }
function initGame() {
    initializePlayer(); setupAudioControls(); updatePlayerStatsUI(); displayInitialMessage(); setupEventListeners();
    hideElement(labOptionsArea); hideElement(problemArea); hideElement(qs('#input-area'));
    hideElement(stepInstructionArea); hideElement(feedbackArea); hideElement(spellDisplayArea);
}

document.addEventListener('DOMContentLoaded', initGame);
