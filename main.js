// main.js

// --- DOM Element References ---
const storyDisplay = qs('#story-display'); /* ... (all other consts as before) ... */
const problemArea = qs('#problem-area');
const stepInstructionArea = qs('#step-instruction-area');
const answerInput = qs('#answer-input');
const submitAnswerBtn = qs('#submit-answer-btn');
const feedbackArea = qs('#feedback-area');
const gameTitle = qs('main#main-content > h1');
const backgroundMusic = qs('#background-music'); // For checking mute status
const volumeSlider = qs('#volume-slider'); // For SFX volume
const sfxCorrectStep = qs('#sfx-correct-step'); // Not directly used, playSoundEffectById takes ID
const sfxSuccessSolve = qs('#sfx-success-solve'); // Not directly used
const muteBtn = qs('#mute-btn');

const labBtn = qs('#lab-btn'); /* ... */
const shopBtn = qs('#shop-btn');
const exploreBtn = qs('#explore-btn');
const spellbookBtn = qs('#spellbook-btn');
const labOptionsArea = qs('#lab-options-area');
const spellDisplayArea = qs('#spell-display-area');
const statHp = qs('#stat-hp'); /* ... */
const statMp = qs('#stat-mp');
const statGold = qs('#stat-gold');
const statSkill = qs('#stat-skill');

// --- Game State Variables ---
let player = {}; /* ... (all other state vars as before) ... */
let currentProblem = null;
let currentFactoringStep = 0;
let expectedFactors = [];
let musicStarted = false; // For background music

const FACTORING_SKILLS = { /* ... */ };
const MAX_SKILL_LEVEL = Object.keys(FACTORING_SKILLS).length - 1;
const DAMAGE_SCALING_FACTOR = 0.75;
const PROBLEMS_TO_MASTER_SKILL = 5;

// Feedback types (constants)
const FEEDBACK_TYPE = {
    PROMPT: 'prompt', // Neutral prompt for next step
    STEP_CORRECT: 'step_correct', // Intermediate step correct
    PROBLEM_SUCCESS: 'problem_success', // Entire problem solved correctly
    PROBLEM_FAIL: 'problem_fail', // Entire problem failed
    NEUTRAL_INFO: 'neutral_info' // General non-gameplay info
};

// --- Initialization & UI Updates ---
function initializePlayer() { /* ... (as before) ... */ }
function updatePlayerStatsUI() { /* ... (as before) ... */ }
function displayInitialMessage() { /* ... (as before) ... */ }
function addStoryMessage(message, type = "normal") { /* ... (as before) ... */ }

// NEW/MODIFIED: Centralized feedback function
function provideUserFeedback(message, feedbackType = FEEDBACK_TYPE.PROMPT) {
    let targetArea = stepInstructionArea; // Default to step instruction area
    let clearPreviousFeedback = true;
    let addClass = '';

    switch (feedbackType) {
        case FEEDBACK_TYPE.PROMPT:
            // Message displayed in stepInstructionArea
            break;
        case FEEDBACK_TYPE.STEP_CORRECT:
            playSoundEffectById('sfx-correct-step');
            // Message displayed in stepInstructionArea
            break;
        case FEEDBACK_TYPE.PROBLEM_SUCCESS:
            playSoundEffectById('sfx-success-solve');
            targetArea = feedbackArea; // Final success goes to main feedback area
            addClass = 'feedback-correct';
            break;
        case FEEDBACK_TYPE.PROBLEM_FAIL:
            targetArea = feedbackArea; // Final fail goes to main feedback area
            addClass = 'feedback-incorrect';
            // Optionally play a "fail" sound effect here if you add one
            break;
        case FEEDBACK_TYPE.NEUTRAL_INFO: // For things like "Please enter an answer"
             targetArea = stepInstructionArea; // Or feedbackArea if preferred
             clearPreviousFeedback = false; // Don't clear if it's a quick prompt
            break;
    }

    if (clearPreviousFeedback && targetArea === feedbackArea) {
        hideElement(stepInstructionArea); // Hide step instruction if final feedback is shown
    } else if (clearPreviousFeedback && targetArea === stepInstructionArea) {
        hideElement(feedbackArea); // Hide final feedback if step instruction is shown
    }
    
    targetArea.textContent = message;
    targetArea.className = 'display-area'; // Reset classes before adding new one
    if (addClass) targetArea.classList.add(addClass);
    showElement(targetArea);
}


function clearProblemArea() {
    problemArea.innerHTML = ""; hideElement(problemArea);
    provideUserFeedback("", FEEDBACK_TYPE.PROMPT); // Clear step instruction area implicitly
    hideElement(stepInstructionArea); // Explicitly hide
    hideElement(feedbackArea);    // Explicitly hide
    hideElement(qs('#input-area')); answerInput.value = "";
    currentProblem = null; currentFactoringStep = 0; expectedFactors = [];
}
function enterLaboratory() { /* ... (as before) ... */ }
function showLabOptions() { /* ... (as before) ... */ }
function startPractice(skillKeyToPractice) { /* ... (as before, using provideUserFeedback for initial prompt) ... */
    // ... (logic to choose problem) ...
    if (problemData && problemData.problemString) {
        // ... (set currentProblem) ...
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
        provideUserFeedback(instruction, FEEDBACK_TYPE.PROMPT); // Use new feedback function
    } else { /* ... */ }
}

// --- REFACTORED Problem Generation (ensure these are the latest from previous response) ---
function generateGCFProblemJS(difficultyTier = 1) { /* ... (as refactored before) ... */ }
function generateDOTSProblemJS(difficultyTier = 1) { /* ... (as refactored before) ... */ }
function generateTrinomialA1ProblemJS(difficultyTier = 1) { /* ... (as refactored before) ... */ }

// --- Answer Checking ---
function handleSubmitAnswer() {
    if (!currentProblem) {
        provideUserFeedback("No active problem.", FEEDBACK_TYPE.PROBLEM_FAIL); // Or NEUTRAL_INFO
        return;
    }
    const userAnswer = answerInput.value;
    if (!userAnswer.trim()) {
        provideUserFeedback("Please enter an answer.", FEEDBACK_TYPE.NEUTRAL_INFO);
        return;
    }

    player.stats.problemsAttempted++;
    const cleanedUserAnswer = cleanInput(userAnswer);
    let correctStep = false;
    let problemFullySolved = false;
    let feedbackMsg = "";
    let feedbackType = FEEDBACK_TYPE.PROMPT; // Default for next step

    if (currentProblem.type === "monomial_gcf") {
        if (currentFactoringStep === 1) {
            const correctGCF = currentProblem.details.gcf;
            if (cleanedUserAnswer === correctGCF) {
                feedbackMsg = "Correct GCF! Now enter the remaining expression (e.g., (x+y)):";
                currentFactoringStep = 2; correctStep = true; feedbackType = FEEDBACK_TYPE.STEP_CORRECT;
            } else {
                feedbackMsg = `Incorrect GCF. Expected: ${currentProblem.details.gcf}.`;
                problemFullySolved = true; correctStep = false; feedbackType = FEEDBACK_TYPE.PROBLEM_FAIL;
            }
        } else if (currentFactoringStep === 2) {
            const correctRemaining = currentProblem.details.remainingExpr;
            if (cleanedUserAnswer === correctRemaining) {
                feedbackMsg = "Factoring complete and correct!";
                correctStep = true; problemFullySolved = true; feedbackType = FEEDBACK_TYPE.PROBLEM_SUCCESS;
            } else {
                feedbackMsg = `Incorrect remaining expression. Expected: ${currentProblem.details.remainingExpr}.`;
                problemFullySolved = true; correctStep = false; feedbackType = FEEDBACK_TYPE.PROBLEM_FAIL;
            }
        }
    } else if (["dots", "trinomial_a1"].includes(currentProblem.type)) {
        if (currentFactoringStep === 1) {
            if (expectedFactors.includes(cleanedUserAnswer)) {
                feedbackMsg = "Correct! Enter the second factor:";
                expectedFactors.splice(expectedFactors.indexOf(cleanedUserAnswer), 1);
                currentFactoringStep = 2; correctStep = true; feedbackType = FEEDBACK_TYPE.STEP_CORRECT;
            } else {
                feedbackMsg = `Incorrect first factor. Expected one of: ${currentProblem.details.factors.join(' or ')}.`;
                problemFullySolved = true; correctStep = false; feedbackType = FEEDBACK_TYPE.PROBLEM_FAIL;
            }
        } else if (currentFactoringStep === 2) {
            if (expectedFactors.includes(cleanedUserAnswer)) {
                feedbackMsg = "Factoring complete and correct!";
                correctStep = true; problemFullySolved = true; feedbackType = FEEDBACK_TYPE.PROBLEM_SUCCESS;
            } else {
                const expectedFactor2 = expectedFactors.length > 0 ? expectedFactors[0] : "the other factor";
                feedbackMsg = `Incorrect second factor. Expected: ${expectedFactor2}.`;
                problemFullySolved = true; correctStep = false; feedbackType = FEEDBACK_TYPE.PROBLEM_FAIL;
            }
        }
    }

    // Add training prefix if applicable
    let prefix = "";
    if (player.trainingProgress.skillKeyInProgress === currentProblem.skillKey && currentProblem.skillKey > player.skillLevel &&
        (feedbackType === FEEDBACK_TYPE.PROMPT || feedbackType === FEEDBACK_TYPE.STEP_CORRECT) ) { // Only for prompts/intermediate steps
        prefix = `Training (${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}): `;
    }
    provideUserFeedback(prefix + feedbackMsg, feedbackType);


    if (correctStep && !problemFullySolved) { // Intermediate correct step, already handled by provideUserFeedback
        answerInput.value = ""; answerInput.focus();
        return; // Wait for next input
    }

    // --- Logic for a fully resolved problem (correct or incorrect at the last step) ---
    const lastProblemSkillKey = currentProblem ? currentProblem.skillKey : null;

    if (correctStep && problemFullySolved) { // Problem was fully and correctly solved
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
        } else { // Practicing an already mastered skill
            const goldReward = getRandomInt(1, 5); player.gold += goldReward;
            addStoryMessage(`You reinforce your knowledge and find ${goldReward} gold dust.`, "info");
            updatePlayerStatsUI();
        }
    } else if ((!correctStep && problemFullySolved) || (correctStep === false && feedbackType === FEEDBACK_TYPE.PROBLEM_FAIL)) { // Problem was incorrect
        player.stats.problemsIncorrect++;
        if (lastProblemSkillKey && player.trainingProgress.skillKeyInProgress === lastProblemSkillKey && lastProblemSkillKey > player.skillLevel) {
            addStoryMessage(`Incorrect. Your training streak for ${FACTORING_SKILLS[lastProblemSkillKey]} has been reset.`, "error");
            player.trainingProgress.correctStreak = 0;
        }
    }

    if (problemFullySolved) { // Only proceed to next state if problem is done
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
        }, 2000); // Shortened timeout for quicker flow after feedback
    }
}

// --- Audio Controls and Game Start (ensure latest versions) ---
function setupAudioControls() { /* ... (as before) ... */
    if (backgroundMusic && volumeSlider) backgroundMusic.volume = parseFloat(volumeSlider.value);
    if (muteBtn && backgroundMusic) muteBtn.textContent = backgroundMusic.muted ? '🔇' : '🔊';
}
function attemptToStartMusic() { /* ... (as before) ... */
    if (!musicStarted && backgroundMusic) {
        backgroundMusic.play().then(() => { musicStarted = true; console.log("BG music started."); })
            .catch(error => console.warn("Music autoplay prevented.", error));
    }
}
function setupEventListeners() { /* ... (as before, ensure attemptToStartMusic() calls are there) ... */
    labBtn.addEventListener('click', () => { attemptToStartMusic(); enterLaboratory(); });
    shopBtn.addEventListener('click', () => { attemptToStartMusic(); addStoryMessage("Shop closed...", "info"); /*...*/ });
    exploreBtn.addEventListener('click', () => { attemptToStartMusic(); addStoryMessage("Wilds vast...", "info"); /*...*/ });
    spellbookBtn.addEventListener('click', () => { attemptToStartMusic(); addStoryMessage("Consult spellbook...", "info"); /*...*/ displaySpellbook(); });
    submitAnswerBtn.addEventListener('click', () => { attemptToStartMusic(); handleSubmitAnswer(); });
    answerInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { attemptToStartMusic(); handleSubmitAnswer(); } });
    if (muteBtn && backgroundMusic) {
        muteBtn.addEventListener('click', () => { backgroundMusic.muted = !backgroundMusic.muted; muteBtn.textContent = backgroundMusic.muted ? '🔇' : '🔊'; });
    }
    if (volumeSlider && backgroundMusic) {
        volumeSlider.addEventListener('input', () => { /* ... (volume logic as before) ... */
            backgroundMusic.volume = parseFloat(volumeSlider.value);
            if (muteBtn) { // Ensure muteBtn exists before trying to update its textContent
                if (backgroundMusic.volume > 0 && backgroundMusic.muted) {
                    backgroundMusic.muted = false; muteBtn.textContent = '🔊';
                } else if (backgroundMusic.volume === 0 && !backgroundMusic.muted) {
                    muteBtn.textContent = '🔇';
                } else if (backgroundMusic.volume > 0 && !backgroundMusic.muted) {
                    muteBtn.textContent = '🔊'; // Ensure it's speaker if unmuted and volume > 0
                }
            }
        });
    }
}
function displaySpellbook() { /* ... (as before) ... */ }
function initGame() { /* ... (as before) ... */
    initializePlayer(); setupAudioControls(); updatePlayerStatsUI(); displayInitialMessage(); setupEventListeners();
    hideElement(labOptionsArea); hideElement(problemArea); hideElement(qs('#input-area'));
    hideElement(stepInstructionArea); hideElement(feedbackArea); hideElement(spellDisplayArea);
}

document.addEventListener('DOMContentLoaded', initGame);
