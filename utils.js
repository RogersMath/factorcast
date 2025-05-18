// Snippet to ADD to utils.js

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers using Euclidean algorithm.
 * @param {number} a
 * @param {number} b
 * @returns {number} The GCD of a and b.
 */
function calculateGCD(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

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
 * @param {string|Element} elementIdOrNode The ID of the element or the element itself
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
 * @param {string|Element} elementIdOrNode The ID of the element or the element itself
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
    let cleaned = str.trim().toLowerCase();
    cleaned = cleaned.replace(/\s*([\(\)\+\-\*\/\^])\s*/g, '$1');
    cleaned = cleaned.replace(/\s+/g, '');
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

// --- NEW UTILITY FUNCTIONS FOR ALGEBRA ---

/**
 * Returns a random variable character from a predefined list.
 * @param {string[]} excludeList - An array of variables to exclude.
 * @returns {string} A random variable character.
 */
function getRandomVariable(excludeList = []) {
    const varChars = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q'];
    let availableVars = varChars.filter(v => !excludeList.includes(v));
    if (availableVars.length === 0) availableVars = varChars; // Fallback
    return availableVars[getRandomInt(0, availableVars.length - 1)];
}

/**
 * Formats a single algebraic term for display.
 * Handles coefficients of 1, -1, and 0 correctly.
 * Example: formatTermForDisplay(2, "x", "<sup>2</sup>") -> "2x<sup>2</sup>"
 *          formatTermForDisplay(1, "y") -> "y"
 *          formatTermForDisplay(-1, "z") -> "-z"
 *          formatTermForDisplay(5) -> "5"
 *          formatTermForDisplay(0, "x") -> "" (term is zero, won't be displayed unless it's a standalone 0)
 * @param {number} coefficient The coefficient.
 * @param {string} [variable=""] The variable string (e.g., "x").
 * @param {string} [exponentHTML=""] The exponent string, already formatted with HTML (e.g., "<sup>2</sup>").
 * @returns {string} The formatted term string for display.
 */
function formatTermForDisplay(coefficient, variable = "", exponentHTML = "") {
    if (coefficient === 0 && variable) { // e.g. 0x, 0y^2
        return ""; // This term is zero, so it won't be part of the expression unless it's the only term
    }
    if (coefficient === 0 && !variable) { // e.g. just the number 0
        return "0";
    }

    let coeffStr = "";
    if (coefficient === 1 && variable) {
        coeffStr = ""; // "1x" becomes "x"
    } else if (coefficient === -1 && variable) {
        coeffStr = "-"; // "-1x" becomes "-x"
    } else {
        coeffStr = coefficient.toString();
    }

    return `${coeffStr}${variable}${exponentHTML}`;
}


/**
 * Constructs an algebraic expression string from an array of term objects or strings for display.
 * Terms should be pre-formatted by formatTermForDisplay.
 * Example: formatExpressionForDisplay(["2x<sup>2</sup>", "-3x", "5"]) -> "2x<sup>2</sup> - 3x + 5"
 * @param {string[]} terms An array of term strings.
 * @returns {string} The formatted expression string.
 */
function formatExpressionForDisplay(terms) {
    const validTerms = terms.filter(term => term !== "" && term !== null && typeof term !== 'undefined');

    if (validTerms.length === 0) return "0"; // If all terms were zero or empty

    let expression = validTerms[0]; // Start with the first term

    for (let i = 1; i < validTerms.length; i++) {
        const term = validTerms[i];
        if (term.startsWith('-')) {
            expression += ` - ${term.substring(1)}`; // " - 3x"
        } else {
            expression += ` + ${term}`; // " + 5"
        }
    }
    return expression;
}


/**
 * Generates a random integer between min and max (inclusive), ensuring it's not zero.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomNonZeroInt(min, max) {
    let num;
    do {
        num = getRandomInt(min, max);
    } while (num === 0);
    return num;
}

/**
 * Generates a specified count of unique random integers within a given range.
 * @param {number} count The number of unique integers to generate.
 * @param {number} min The minimum value (inclusive).
 * @param {number} max The maximum value (inclusive).
 * @returns {number[]|null} An array of unique random integers, or null if not possible.
 */
function generateUniqueRandomInts(count, min, max) {
    if (count > (max - min + 1) || count < 0) {
        console.warn("Cannot generate requested count of unique numbers from the given range.");
        return null;
    }
    if (count === 0) return [];

    const uniques = new Set();
    // Safety break for very small ranges to prevent infinite loops if logic is flawed
    let attempts = 0; 
    const maxAttempts = count * 10 > 100 ? count * 10 : 100; 

    while (uniques.size < count && attempts < maxAttempts) {
        uniques.add(getRandomInt(min, max));
        attempts++;
    }
    if (uniques.size < count) { // Could not find enough unique numbers
        console.warn("Failed to generate enough unique numbers after max attempts.");
        return null; 
    }
    return Array.from(uniques);
}
