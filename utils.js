// utils.js
console.log("UTILS.JS: Script loaded and parsed.");

function qs(selector) {
    return document.querySelector(selector);
}

function qsa(selector) {
    return document.querySelectorAll(selector);
}

function updateText(elementId, text) {
    const element = qs(elementId);
    if (element) {
        element.textContent = text;
    } else {
        console.error(`UTILS.JS: updateText - Element with ID '${elementId}' not found.`);
    }
}

function showElement(elementIdOrNode) {
    const element = typeof elementIdOrNode === 'string' ? qs(elementIdOrNode) : elementIdOrNode;
    if (element) {
        element.classList.remove('hidden');
    } else {
        // console.warn(`UTILS.JS: showElement - Element '${elementIdOrNode}' not found or is null.`);
    }
}

function hideElement(elementIdOrNode) {
    const element = typeof elementIdOrNode === 'string' ? qs(elementIdOrNode) : elementIdOrNode;
    if (element) {
        element.classList.add('hidden');
    } else {
        // console.warn(`UTILS.JS: hideElement - Element '${elementIdOrNode}' not found or is null.`);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cleanInput(str) {
    if (typeof str !== 'string') return '';
    let cleaned = str.trim().toLowerCase();
    cleaned = cleaned.replace(/\s*([\(\)\+\-\*\/\^])\s*/g, '$1');
    cleaned = cleaned.replace(/\s+/g, '');
    return cleaned;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function calculateGCD(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a === 0 ? Math.abs(a) : a; // GCD of 0 and x is |x|
}

function getRandomVariable(excludeList = []) {
    const varChars = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q'];
    let availableVars = varChars.filter(v => !excludeList.includes(v));
    if (availableVars.length === 0) availableVars = varChars;
    return availableVars[getRandomInt(0, availableVars.length - 1)];
}

function formatTermForDisplay(coefficient, variable = "", exponentHTML = "") {
    if (coefficient === 0) {
        return variable ? "" : "0"; // 0x is "", standalone 0 is "0"
    }
    let coeffStr = "";
    if (coefficient === 1 && variable) coeffStr = "";
    else if (coefficient === -1 && variable) coeffStr = "-";
    else coeffStr = coefficient.toString();
    return `${coeffStr}${variable}${exponentHTML}`;
}

function formatExpressionForDisplay(terms) {
    const validTerms = terms.filter(term => term !== "" && term !== null && typeof term !== 'undefined');
    if (validTerms.length === 0) return "0";
    let expression = validTerms[0];
    for (let i = 1; i < validTerms.length; i++) {
        const term = validTerms[i];
        if (term.startsWith('-')) {
            expression += ` - ${term.substring(1)}`;
        } else if (term === "0" && expression !== "0") { // Don't add "+ 0" unless expression is just "0"
            // Do nothing
        } else {
            expression += ` + ${term}`;
        }
    }
    // If expression ended up being just "0 + something" or "0 - something"
    if (expression.startsWith("0 + ")) expression = expression.substring(4);
    else if (expression.startsWith("0 - ")) expression = "-" + expression.substring(4);
    return expression;
}

function getRandomNonZeroInt(min, max) {
    let num;
    do {
        num = getRandomInt(min, max);
    } while (num === 0);
    return num;
}

function playSoundEffectById(soundId) {
    const audioElement = qs(`#${soundId}`);
    const mainMusic = qs('#background-music');
    const volSlider = qs('#volume-slider');

    if (audioElement && (!mainMusic || !mainMusic.muted)) {
        audioElement.currentTime = 0;
        audioElement.volume = volSlider ? parseFloat(volSlider.value) * 0.8 : 0.4;
        audioElement.play().catch(error => console.warn(`SFX (${soundId}) play error:`, error));
    } else if (!audioElement) {
        console.warn(`Sound effect element with ID '${soundId}' not found.`);
    }
}
