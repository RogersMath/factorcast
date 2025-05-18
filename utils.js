// utils.js

console.log("UTILS.JS: Script loaded and parsed.");

function qs(selector) {
    // console.log(`UTILS.JS: qs selecting: ${selector}`);
    const element = document.querySelector(selector);
    // if (!element) console.warn(`UTILS.JS: qs found no element for: ${selector}`);
    return element;
}

function qsa(selector) {
    // console.log(`UTILS.JS: qsa selecting: ${selector}`);
    const elements = document.querySelectorAll(selector);
    // if (elements.length === 0) console.warn(`UTILS.JS: qsa found no elements for: ${selector}`);
    return elements;
}

function updateText(elementId, text) {
    // console.log(`UTILS.JS: updateText for #${elementId} with: "${text}"`);
    const element = qs(elementId);
    if (element) {
        element.textContent = text;
    } else {
        console.error(`UTILS.JS: updateText - Element with ID '${elementId}' not found.`);
    }
}

function showElement(elementIdOrNode) {
    // console.log(`UTILS.JS: showElement for:`, elementIdOrNode);
    const element = typeof elementIdOrNode === 'string' ? qs(elementIdOrNode) : elementIdOrNode;
    if (element) {
        element.classList.remove('hidden');
    } else {
        console.warn(`UTILS.JS: showElement - Element '${elementIdOrNode}' not found or is null.`);
    }
}

function hideElement(elementIdOrNode) {
    // console.log(`UTILS.JS: hideElement for:`, elementIdOrNode);
    const element = typeof elementIdOrNode === 'string' ? qs(elementIdOrNode) : elementIdOrNode;
    if (element) {
        element.classList.add('hidden');
    } else {
        console.warn(`UTILS.JS: hideElement - Element '${elementIdOrNode}' not found or is null.`);
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
    return a;
}
