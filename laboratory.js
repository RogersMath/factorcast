// laboratory.js
console.log("LABORATORY.JS: Script loaded.");

// Assumes player, FACTORING_SKILLS, MAX_SKILL_LEVEL, PROBLEMS_TO_MASTER_SKILL are global from main.js
// Assumes problem_generators.js functions (generateGCFProblem etc.) are global
// Assumes ui_feedback.js functions (addStoryMessage, clearProblemRelatedUI, provideUserFeedback etc.) are global
// Assumes utils.js functions (getRandomInt, cleanInput) are global
// Assumes DOM elements (labOptionsArea, problemArea, answerInput etc.) are global from dom_elements.js

function enterLaboratory() {
    console.log("LABORATORY.JS: enterLaboratory called");
    if (!labOptionsArea || !spellDisplayArea) {
        console.error("LABORATORY.JS: Missing critical UI elements (labOptionsArea or spellDisplayArea)");
        addStoryMessage("Error: Cannot open laboratory. Interface elements missing.", "error");
        return;
    }
    addStoryMessage("You enter the Aetherium Laboratory. Ancient symbols glow faintly on the walls.");
    clearProblemRelatedUI(); // From ui_feedback.js
    hideElement(spellDisplayArea);
    showLabSkillOptions();
}

function showLabSkillOptions() {
    console.log("LABORATORY.JS: showLabSkillOptions called.");
    if (!labOptionsArea) {
        console.error("LABORATORY.JS: labOptionsArea is null! Cannot display skill options.");
        return;
    }
    if (!player) {
        console.error("LABORATORY.JS: player object not found for lab options.");
        return;
    }

    labOptionsArea.innerHTML = '<h3>Practice Factoring Skills:</h3>';
    const nextSkillToLearnLevel = player.skillLevel + 1;

    for (let i = 1; i <= MAX_SKILL_LEVEL; i++) {
        const skillKey = i;
        const skillName = FACTORING_SKILLS[skillKey]; // Assumes FACTORING_SKILLS is global
        const button = document.createElement('button');
        button.classList.add('action-button', 'lab-skill-btn');
        button.dataset.skillKey = skillKey;
        let buttonText = "";

        if (skillKey <= player.skillLevel) {
            buttonText = `Practice: ${skillName}`;
        } else if (skillKey === nextSkillToLearnLevel) {
            buttonText = `Train: ${skillName} (New!)`;
            if (player.trainingProgress.skillKeyInProgress === skillKey) {
                buttonText += ` [${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}]`;
            }
            button.classList.add('train-new-skill-btn'); // For distinct styling
        } else {
            buttonText = `${skillName} (Locked)`;
            button.disabled = true;
        }
        button.textContent = buttonText;
        button.addEventListener('click', () => startFactoringPractice(skillKey));
        labOptionsArea.appendChild(button);
    }
    showElement(labOptionsArea);
}

function startFactoringPractice(skillKeyToPractice) {
    console.log(`LABORATORY.JS: startFactoringPractice for skill ${skillKeyToPractice}`);
    if (!player) { console.error("LABORATORY.JS: player object not found for practice."); return; }

    if (skillKeyToPractice > player.skillLevel + 1 && 
        !(player.trainingProgress.skillKeyInProgress === skillKeyToPractice && skillKeyToPractice === player.skillLevel + 1)) {
        addStoryMessage("You are not yet ready to train that skill.");
        return;
    }

    if (labOptionsArea) hideElement(labOptionsArea);
    clearProblemRelatedUI(); // From ui_feedback.js

    if (skillKeyToPractice > player.skillLevel) { // This is a skill being trained for mastery
        if (player.trainingProgress.skillKeyInProgress !== skillKeyToPractice) {
            player.trainingProgress.skillKeyInProgress = skillKeyToPractice;
            player.trainingProgress.correctStreak = 0;
            addStoryMessage(`Beginning training for ${FACTORING_SKILLS[skillKeyToPractice]}. You need ${player.trainingProgress.targetStreak} correct problems to master it.`, "info");
        }
    } else {
        // Practicing an already mastered skill
        player.trainingProgress.skillKeyInProgress = null;
    }

    let problemData;
    let problemTypeForCheck; // For setting currentProblem.type
    const difficultyTier = (skillKeyToPractice > player.skillLevel) ? 1 : getRandomInt(1, 2);

    console.log(`LABORATORY.JS: Generating problem for skill ${skillKeyToPractice}, tier ${difficultyTier}`);
    switch (skillKeyToPractice) {
        case 1: problemData = generateGCFProblem(difficultyTier); problemTypeForCheck = "monomial_gcf"; break;
        case 2: problemData = generateDOTSProblem(difficultyTier); problemTypeForCheck = "dots"; break;
        case 3: problemData = generateTrinomialA1Problem(difficultyTier); problemTypeForCheck = "trinomial_a1"; break;
        // Add cases for PST, Trinomial a>1, Cubes later, calling their respective functions
        // from problem_generators.js
        default:
            addStoryMessage(`Problem generation for ${FACTORING_SKILLS[skillKeyToPractice]} is not ready yet.`, "info");
            showLabSkillOptions(); // Go back to options
            return;
    }
    console.log("LABORATORY.JS: Problem data generated:", problemData);

    if (problemData && problemData.problemString) {
        // currentProblem, currentFactoringStep, expectedFactors are global from main.js
        currentProblem = {
            problemString: problemData.problemString,
            type: problemTypeForCheck,
            details: problemData.details,
            skillKey: skillKeyToPractice
        };
        
        if (!problemArea || !answerInput) { 
            console.error("LABORATORY.JS: Problem area or answer input DOM element missing!");
            addStoryMessage("Error: Cannot display problem. UI elements missing.", "error");
            return;
        }
        problemArea.innerHTML = `Factor: ${currentProblem.problemString}`;
        showElement(problemArea);
        
        const inputAreaDiv = qs('#input-area'); // Select locally
        if (!inputAreaDiv) { console.error("LABORATORY.JS: #input-area div is null!"); return; }
        showElement(inputAreaDiv);
        
        answerInput.value = "";
        answerInput.focus();
        
        let instruction = "";
        if (currentProblem.type === "monomial_gcf") {
            currentFactoringStep = 1; // Expect GCF
            instruction = "Enter the GCF:";
        } else if (["dots", "trinomial_a1"].includes(currentProblem.type)) {
            currentFactoringStep = 1; // Expect first factor
            expectedFactors = currentProblem.details.factors.map(f => cleanInput(f));
            instruction = "Enter the first factor (e.g., (x-3)):";
        }
        // Add training prefix if applicable
        if (player.trainingProgress.skillKeyInProgress === skillKeyToPractice && skillKeyToPractice > player.skillLevel) {
            instruction = `Training (${player.trainingProgress.correctStreak}/${player.trainingProgress.targetStreak}): ${instruction}`;
        }
        provideUserFeedback(instruction, UI_FEEDBACK_CONSTANTS.PROMPT); // From ui_feedback.js
    } else {
        console.error("LABORATORY.JS: Failed to generate problemData or problemString.");
        addStoryMessage("Failed to generate a problem. Please try again.", "error");
        showLabSkillOptions();
    }
}
