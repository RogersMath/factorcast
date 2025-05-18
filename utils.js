// utils.js

function qs(selector) { /* ... (as before) ... */ return document.querySelector(selector); }
function qsa(selector) { /* ... (as before) ... */ return document.querySelectorAll(selector); }
function updateText(elementId, text) { /* ... (as before) ... */
    const element = qs(elementId);
    if (element) element.textContent = text;
    else console.warn(`Element with ID '${elementId}' not found for updateText.`);
}
function showElement(elementIdOrNode) { /* ... (as before) ... */
    const element = typeof elementIdOrNode === 'string' ? qs(elementIdOrNode) : elementIdOrNode;
    if (element) element.classList.remove('hidden');
    else console.warn(`Element '${elementIdOrNode}' not found for showElement.`);
}
function hideElement(elementIdOrNode) { /* ... (as before) ... */
    const element = typeof elementIdOrNode === 'string' ? qs(elementIdOrNode) : elementIdOrNode;
    if (element) element.classList.add('hidden');
    else console.warn(`Element '${elementIdOrNode}' not found for hideElement.`);
}
function getRandomInt(min, max) { /* ... (as before) ... */
    min = Math.ceil(min); max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function cleanInput(str) { /* ... (as before) ... */
    if (typeof str !== 'string') return '';
    let cleaned = str.trim().toLowerCase();
    cleaned = cleaned.replace(/\s*([\(\)\+\-\*\/\^])\s*/g, '$1');
    cleaned = cleaned.replace(/\s+/g, '');
    return cleaned;
}
function shuffleArray(array) { /* ... (as before) ... */
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function getRandomVariable(excludeList = []) { /* ... (as before) ... */
    const varChars = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q'];
    let availableVars = varChars.filter(v => !excludeList.includes(v));
    if (availableVars.length === 0) availableVars = varChars;
    return availableVars[getRandomInt(0, availableVars.length - 1)];
}
function formatTermForDisplay(coefficient, variable = "", exponentHTML = "") { /* ... (as before) ... */
    if (coefficient === 0 && variable) return "";
    if (coefficient === 0 && !variable) return "0";
    let coeffStr = "";
    if (coefficient === 1 && variable) coeffStr = "";
    else if (coefficient === -1 && variable) coeffStr = "-";
    else coeffStr = coefficient.toString();
    return `${coeffStr}${variable}${exponentHTML}`;
}
function formatExpressionForDisplay(terms) { /* ... (as before) ... */
    const validTerms = terms.filter(term => term !== "" && term !== null && typeof term !== 'undefined');
    if (validTerms.length === 0) return "0";
    let expression = validTerms[0];
    for (let i = 1; i < validTerms.length; i++) {
        const term = validTerms[i];
        if (term.startsWith('-')) expression += ` - ${term.substring(1)}`;
        else expression += ` + ${term}`;
    }
    return expression;
}
function getRandomNonZeroInt(min, max) { /* ... (as before) ... */
    let num; do { num = getRandomInt(min, max); } while (num === 0); return num;
}
function generateUniqueRandomInts(count, min, max) { /* ... (as before) ... */
    if (count > (max - min + 1) || count < 0) { console.warn("Cannot generate requested count..."); return null; }
    if (count === 0) return [];
    const uniques = new Set(); let attempts = 0; const maxAttempts = count * 10 > 100 ? count * 10 : 100;
    while (uniques.size < count && attempts < maxAttempts) { uniques.add(getRandomInt(min, max)); attempts++; }
    if (uniques.size < count) { console.warn("Failed to generate enough unique numbers..."); return null; }
    return Array.from(uniques);
}
function calculateGCD(a, b) { /* ... (as before) ... */
    a = Math.abs(a); b = Math.abs(b);
    while (b) { let t = b; b = a % b; a = t; } return a;
}

/**
 * Plays a sound effect by its ID.
 * @param {string} soundId The ID of the <audio> element for the SFX.
 */
function playSoundEffectById(soundId) {
    const audioElement = qs(`#${soundId}`);
    const mainMusic = qs('#background-music'); // Assumes backgroundMusic is always present
    const volSlider = qs('#volume-slider'); // Assumes volumeSlider is always present

    // Only play SFX if main music isn't globally muted (if mainMusic element exists)
    if (audioElement && (!mainMusic || !mainMusic.muted)) {
        audioElement.currentTime = 0; // Rewind
        // Set SFX volume relative to music volume (if volume slider exists)
        audioElement.volume = volSlider ? parseFloat(volSlider.value) * 0.8 : 0.4; // Default to 0.4 if no slider
        audioElement.play().catch(error => console.warn(`SFX (${soundId}) play prevented:`, error));
    }
}
