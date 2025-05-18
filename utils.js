// utils.js - Reverted State
function qs(selector) { return document.querySelector(selector); }
function qsa(selector) { return document.querySelectorAll(selector); }

function updateText(elementId, text) {
    const element = qs(elementId);
    if (element) element.textContent = text;
    else console.warn(`Element with ID '${elementId}' not found for updateText.`);
}
function showElement(elementIdOrNode) {
    const element = typeof elementIdOrNode === 'string' ? qs(elementIdOrNode) : elementIdOrNode;
    if (element) element.classList.remove('hidden');
    else console.warn(`Element '${elementIdOrNode}' not found for showElement.`);
}
function hideElement(elementIdOrNode) {
    const element = typeof elementIdOrNode === 'string' ? qs(elementIdOrNode) : elementIdOrNode;
    if (element) element.classList.add('hidden');
    else console.warn(`Element '${elementIdOrNode}' not found for hideElement.`);
}
function getRandomInt(min, max) {
    min = Math.ceil(min); max = Math.floor(max);
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
// ADD BACK calculateGCD as it was used for the GCF fix
function calculateGCD(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { let t = b; b = a % b; a = t; } return a;
}
// REMOVE: getRandomVariable, formatTermForDisplay, formatExpressionForDisplay,
// getRandomNonZeroInt (unless used elsewhere, but GCF generator below will use getRandomInt),
// generateUniqueRandomInts, playSoundEffectById
