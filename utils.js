// utils.js

/**
 * Shorthand for document.querySelector.
 * @param {string} selector CSS selector
 * @returns {Element|null} The first matching element or null
 */
function qs(selector) {
    return document.querySelector(selector);
}

/**
 * Shorthand for document.querySelectorAll.
 * @param {string} selector CSS selector
 * @returns {NodeList} A static NodeList of matching elements
 */
function qsa(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Updates the text content of an HTML element.
 * @param {string} elementId The ID of the element
 * @param {string} text The text to set
 */
function updateText(elementId, text) {
    const element = qs(elementId);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`Element with ID '${elementId}' not found for updateText.`);
    }
}

/**
 * Shows an HTML element by removing a 'hidden' class.
 * @param {string} elementId The ID of the element
 */
function showElement(elementIdOrNode) {
    const element = typeof elementIdOrNode === 'string' ? qs(elementIdOrNode) : elementIdOrNode;
    if (element) {
        element.classList.remove('hidden');
    } else {
        console.warn(`Element '${elementIdOrNode}' not found for showElement.`);
    }
}

/**
 * Hides an HTML element by adding a 'hidden' class.
 * @param {string} elementId The ID of the element
 */
function hideElement(elementIdOrNode) {
    const element = typeof elementIdOrNode === 'string' ? qs(elementIdOrNode) : elementIdOrNode;
    if (element) {
        element.classList.add('hidden');
    } else {
        console.warn(`Element '${elementIdOrNode}' not found for hideElement.`);
    }
}

/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 * @param {number} min Minimum value
 * @param {number} max Maximum value
 * @returns {number} A random integer
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Cleans user input string: removes extra spaces and converts to lowercase.
 * Parentheses and operators are kept.
 * @param {string} str The input string
 * @returns {string} The cleaned string
 */
function cleanInput(str) {
    if (typeof str !== 'string') return '';
    // Remove leading/trailing whitespace, then multiple spaces between words/operators
    // Keep parentheses and math operators intact.
    let cleaned = str.trim().toLowerCase();
    // Remove spaces around operators like +, -, *, / (but not inside parentheses for terms like "x - 2")
    // This is tricky. A simpler approach for now:
    // Remove all spaces, except potentially one if it's between a number and a variable (e.g. "2 x" -> "2x")
    // or part of a multi-term factor.
    // For now, let's just remove spaces that are not inside parentheses and not essential.
    // A basic clean:
    cleaned = cleaned.replace(/\s*([\(\)\+\-\*\/\^])\s*/g, '$1'); // Remove spaces around operators and parens
    cleaned = cleaned.replace(/\s+/g, ''); // Remove any remaining multiple spaces
    return cleaned;
}

/**
 * Shuffles an array in place.
 * @param {Array} array The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
