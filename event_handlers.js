// event_handlers.js
console.log("EVENT_HANDLERS.JS: Script loaded.");

// Assumes player, FACTORING_SKILLS, gameTitle, currentProblem, etc. are global from main.js
// Assumes ui_feedback.js functions (provideUserFeedback, addStoryMessage, etc.) are global
// Assumes laboratory.js functions (showLabSkillOptions, startFactoringPractice) are global
// Assumes utils.js functions (cleanInput, getRandomInt, playSoundEffectById) are global
// Assumes DOM elements (answerInput, backgroundMusic, muteBtn, volumeSlider, etc.) are global from dom_elements.js

let musicStarted = false; // Keep musicStarted local to this module or pass as param if needed elsewhere

function setupAudioControls() {
    console.log("EVENT_HANDLERS.JS: setupAudioControls called");
    if (!backgroundMusic) console.warn("EVENT_HANDLERS.JS: backgroundMusic element is null");
    if (!volumeSlider) console.warn("EVENT_HANDLERS.JS: volumeSlider element is null");
    if (!muteBtn) console.warn("EVENT_HANDLERS.JS: muteBtn element is null");

    if (backgroundMusic && volumeSlider) {
        try { backgroundMusic.volume = parseFloat(volumeSlider.value); }
        catch(e) { console.error("Error setting initial music volume:", e); }
    }
    if (muteBtn && backgroundMusic) {
        try { muteBtn.textContent = backgroundMusic.muted ? '🔇' : '🔊'; }
        catch(e) { console.error("Error setting initial mute button text:", e); }
    }
}

function attemptToStartMusic() {
    console.log("EVENT_HANDLERS.JS: attemptToStartMusic called");
    if (!musicStarted && backgroundMusic) {
        backgroundMusic.play().then(() => {
            musicStarted = true;
            console.log("EVENT_HANDLERS.JS: Background music started.");
        }).catch(error => {
            console.warn("EVENT_HANDLERS.JS: Music autoplay/play was prevented or failed.", error);
        });
    } else if (!backgroundMusic) {
        console.warn("EVENT_HANDLERS.JS: Background music element not found. Cannot start music.");
    }
}

function handleSubmitAnswer() {
    console.log("EVENT_HANDLERS.JS: handleSubmitAnswer called");
    if (!currentProblem) {
        provideUserFeedback("No active problem.", UI_FEEDBACK_CONSTANTS.PROBLEM_FAIL);
        return;
    }
    if (!answerInput) {
        console.error("EVENT_HANDLERS.JS: answerInput is null in handleSubmitAnswer");
        return;
    }
    const userAnswer = answerInput.value;
    if (!userAnswer.trim()) {
        provideUserFeedback("Please enter an answer.", UI_FEEDBACK_CONSTANTS.NEUTRAL_INFO);
        return;
    }

    // Ensure player object is available
    if (!player || !player.stats) {
        console.error("EVENT_HANDLERS.JS: Player object or player.stats not initialized!");
        return;
    }
    player.stats.problemsAttempted++;
    const cleanedUserAnswer = cleanInput(userAnswer);
    let correctStep = false;
    let problemFullySolved = false;
    let feedbackMsg = "";
    let feedbackType = UI_FEEDBACK_CONSTANTS.PROMPT;

    // --- Actual Answer Checking Logic ---
    if (currentProblem.type === "monomial_gcf") {
        if (currentFactoringStep === 1) {
            const correctGCF = currentProblem.details.gcf;
            if (cleanedUserAnswer === correctGCF) {
                feedbackMsg = "Correct GCF! Now enter the remaining expression (e.g., (x+y)):";
                currentFactoringStep = 2; correctStep = true; feedbackType = UI_FEEDBACK_CONSTANTS.STEP_CORRECT;
            } else {
                feedbackMsg = `Incorrect GCF. Expected: ${currentProblem.details.gcf}.`;
                problemFullySolved = true; correctStep = false; feedbackType = UI_FEEDBACK_CONSTANTS.PROBLEM_FAIL;
            }
        } else if (currentFactoringStep === 2) {
            const correctRemaining = currentProblem.details.remainingExpr;
            if (cleanedUserAnswer === correctRemaining) {
                feedbackMsg = "Factoring complete and correct!";
                correctStep = true; problemFullySolved = true; feedbackType = UI_FEEDBACK_CONSTANTS.PROBLEM_SUCCESS;
            } else {
                feedbackMsg = `Incorrect remaining expression. Expected: ${currentProblem.details.remainingExpr}.`;
                problemFullySolved = true; correctStep = false; feedbackType = UI_FEEDBACK_CONSTANTS.PROBLEM_FAIL;
            }
        }
    } else if (["dots", "trinomial_a1"].includes(currentProblem.type)) {
        if (currentFactoringStep === 1) {
            if (expectedFactors.includes(cleanedUserAnswer)) {
                feedbackMsg = "Correct! Enter the second factor:";
                expectedFactors.splice(expectedFactors.indexOf(cleanedUserAnswer), 1);
                currentFactoringStep = 2; correctStep = true; feedbackType = UI_FEEDBACK_CONSTANTS.STEP_CORRECT;
            } else {
                feedbackMsg = `Incorrect first factor. Expected one of: ${currentProblem.details.factors.join(' or ')}.`;
                problemFullySolved = true; correctStep = false; feedbackType = UI_FEEDBACK_CONSTANTS.PROBLEM_FAIL;
            }
        } else if (currentFactoringStep === 2) {
            if (expectedFactors.includes(cleanedUserAnswer)) {
                feedbackMsg = "Factoring complete and correct!";
                correctStep = true; problemFullySolved = true; feedbackType = UI_FEEDBACK_CONSTANTS.PROBLEM_SUCCESS;
            } else {
                const expectedFactor2 = expectedFactors.length > 0 ? expectedFactors[0] : "the other factor";
                feedbackMsg = `Incorrect second factor. Expected: ${expectedFactor2}.`;
                problemFullySolved = true; correctStep = false; feedbackType = UI_FEEDBACK_CONSTANTS.PROBLEM_FAIL;
            }
        }
    }
    // --- End Actual Answer Checking ---

    let prefix = "";
    if (currentProblem && player.trainingProgress.skillKeyInProgress === currentProblem.skillKey && currentProblem.skillKey > player.skillLevel &&
        (feedbackType === UI_FEEDBACK_CONSTANTS.PROMPT || feedbackType === UI_FEEDBACK_CONSTANTS.STEP_CORRECT)) {
        prefix = `Training (${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}): `;
    }
    provideUserFeedback(prefix + feedbackMsg, feedbackType);

    if (correctStep && !problemFullySolved) {
        if (answerInput) { answerInput.value = ""; answerInput.focus(); }
        return;
    }

    const lastProblemSkillKey = currentProblem ? currentProblem.skillKey : null;

    if (correctStep && problemFullySolved) {
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
                    updatePlayerStatsDisplay(); // From ui_feedback.js
                } else {
                    addStoryMessage(`Correct! Streak for ${FACTORING_SKILLS[lastProblemSkillKey]}: ${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}. Keep going!`, "info");
                }
            }
        } else { // Practicing an already mastered skill
            const goldReward = getRandomInt(1, 5); player.gold += goldReward;
            addStoryMessage(`You reinforce your knowledge and find ${goldReward} gold dust.`, "info");
            updatePlayerStatsDisplay(); // From ui_feedback.js
        }
    } else if ((!correctStep && problemFullySolved) || (correctStep === false && feedbackType === UI_FEEDBACK_CONSTANTS.PROBLEM_FAIL)) {
        player.stats.problemsIncorrect++;
        if (lastProblemSkillKey && player.trainingProgress.skillKeyInProgress === lastProblemSkillKey && lastProblemSkillKey > player.skillLevel) {
            addStoryMessage(`Incorrect. Your training streak for ${FACTORING_SKILLS[lastProblemSkillKey]} has been reset.`, "error");
            player.trainingProgress.correctStreak = 0;
        }
    }

    if (problemFullySolved) {
        setTimeout(() => {
            clearProblemRelatedUI(); // From ui_feedback.js
            if (player.trainingProgress.skillKeyInProgress &&
                lastProblemSkillKey &&
                lastProblemSkillKey === player.trainingProgress.skillKeyInProgress &&
                player.skillLevel < lastProblemSkillKey) {
                startFactoringPractice(player.trainingProgress.skillKeyInProgress); // From laboratory.js
            } else {
                showLabSkillOptions(); // From laboratory.js
            }
        }, 2000);
    }
}

function setupAllEventListeners() {
    console.log("EVENT_HANDLERS.JS: setupAllEventListeners called");

    if (labBtn) labBtn.addEventListener('click', () => { attemptToStartMusic(); enterLaboratory(); });
    else console.warn("EVENT_HANDLERS.JS: Lab button not found.");

    if (shopBtn) shopBtn.addEventListener('click', () => {
        attemptToStartMusic(); addStoryMessage("The Wandering Emporium is currently closed...", "info");
        clearProblemRelatedUI(); if(labOptionsArea) hideElement(labOptionsArea); if(spellDisplayArea) hideElement(spellDisplayArea);
    }); else console.warn("EVENT_HANDLERS.JS: Shop button not found.");

    if (exploreBtn) exploreBtn.addEventListener('click', () => {
        attemptToStartMusic(); addStoryMessage("The wilds of Algebraria are vast and dangerous...", "info");
        clearProblemRelatedUI(); if(labOptionsArea) hideElement(labOptionsArea); if(spellDisplayArea) hideElement(spellDisplayArea);
    }); else console.warn("EVENT_HANDLERS.JS: Explore button not found.");

    if (spellbookBtn) spellbookBtn.addEventListener('click', () => {
        attemptToStartMusic(); addStoryMessage("You consult your spellbook...", "info");
        clearProblemRelatedUI(); if(labOptionsArea) hideElement(labOptionsArea);
        displaySpellbookUI(); // From ui_feedback.js
    }); else console.warn("EVENT_HANDLERS.JS: Spellbook button not found.");

    if (submitAnswerBtn) submitAnswerBtn.addEventListener('click', () => { attemptToStartMusic(); handleSubmitAnswer(); });
    else console.warn("EVENT_HANDLERS.JS: Submit Answer button not found.");

    if (answerInput) answerInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { attemptToStartMusic(); handleSubmitAnswer(); } });
    else console.warn("EVENT_HANDLERS.JS: Answer input not found.");
    
    // Audio control listeners
    if (muteBtn && backgroundMusic) {
        muteBtn.addEventListener('click', () => {
            backgroundMusic.muted = !backgroundMusic.muted;
            muteBtn.textContent = backgroundMusic.muted ? '🔇' : '🔊';
        });
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
    console.log("EVENT_HANDLERS.JS: setupAllEventListeners finished.");
}
