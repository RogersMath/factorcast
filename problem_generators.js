// problem_generators.js
console.log("PROBLEM_GENERATORS.JS: Script loaded and parsed.");

function generateGCFProblem(difficultyTier = 1) {
    console.log("PROBLEM_GENERATORS.JS: generateGCFProblem called");
    const v1 = getRandomVariable();
    let problemString, gcfForProblemDetails, remainingExprDetails;
    const type = getRandomInt(1, 3);

    if (type === 1) { // Purely numerical GCF: e.g., 18x + 12y -> 6(3x + 2y)
        let n1_base = getRandomInt(1, 4);
        let n2_base = getRandomInt(1, 4);
        let commonFactor = getRandomInt(2, 5); // This will be the GCF's numeric part

        let term1Coeff = n1_base * commonFactor;
        let term2Coeff = n2_base * commonFactor;
        
        // Recalculate actual GCF in case n1_base and n2_base shared a factor
        const actualNumericGCF = calculateGCD(term1Coeff, term2Coeff);

        const v2 = getRandomVariable([v1]);
        const term1Display = formatTermForDisplay(term1Coeff, v1);
        const term2Display = formatTermForDisplay(term2Coeff, v2);
        problemString = formatExpressionForDisplay([term1Display, term2Display]);

        gcfForProblemDetails = actualNumericGCF.toString();
        
        const remTerm1Display = formatTermForDisplay(term1Coeff / actualNumericGCF, v1);
        const remTerm2Display = formatTermForDisplay(term2Coeff / actualNumericGCF, v2);
        remainingExprDetails = `(${formatExpressionForDisplay([remTerm1Display, remTerm2Display])})`;

    } else if (type === 2) { // GCF includes a variable: e.g., 12x^2 + 18x -> 6x(2x + 3)
        let c1_base = getRandomInt(1, 4);
        let c2_base = getRandomInt(1, 4);
        let commonFactor = getRandomInt(1, 4); // Numeric part of GCF, can be 1

        let term1Coeff = c1_base * commonFactor;
        let term2Coeff = c2_base * commonFactor;

        if (term1Coeff === 0 && term2Coeff === 0) { // Avoid 0 + 0
            term1Coeff = getRandomNonZeroInt(1,5);
        }
        
        const actualNumericGCF = calculateGCD(term1Coeff, term2Coeff);
        const variableGCF = v1;

        const term1Display = formatTermForDisplay(term1Coeff, v1, "<sup>2</sup>");
        const term2Display = formatTermForDisplay(term2Coeff, v1);
        problemString = formatExpressionForDisplay([term1Display, term2Display]);

        gcfForProblemDetails = formatTermForDisplay(actualNumericGCF, variableGCF);
        
        const remTerm1Display = formatTermForDisplay(term1Coeff / actualNumericGCF, v1);
        const remTerm2Display = formatTermForDisplay(term2Coeff / actualNumericGCF);
        remainingExprDetails = `(${formatExpressionForDisplay([remTerm1Display, remTerm2Display].filter(t => t !== ""))})`;
        if (remainingExprDetails === "()") remainingExprDetails = "(0)";


    } else { // Numerical GCF with a constant term: e.g., 18x + 12 -> 6(3x + 2)
        let c1_base = getRandomInt(1, 4);
        let c2_base_const = getRandomInt(1, 4);
        let commonFactor = getRandomInt(2, 5); // Ensure GCF > 1

        let term1Coeff = c1_base * commonFactor;
        let term2Num = c2_base_const * commonFactor;
        
        const actualNumericGCF = calculateGCD(term1Coeff, term2Num);

        const term1Display = formatTermForDisplay(term1Coeff, v1);
        const term2Display = formatTermForDisplay(term2Num);
        problemString = formatExpressionForDisplay([term1Display, term2Display]);
        
        gcfForProblemDetails = actualNumericGCF.toString();
        
        const remTerm1Display = formatTermForDisplay(term1Coeff / actualNumericGCF, v1);
        const remTerm2Display = formatTermForDisplay(term2Num / actualNumericGCF);
        remainingExprDetails = `(${formatExpressionForDisplay([remTerm1Display, remTerm2Display])})`;
    }
    return { problemString, details: { gcf: cleanInput(gcfForProblemDetails), remainingExpr: cleanInput(remainingExprDetails) } };
}

function generateDOTSProblem(difficultyTier = 1) {
    console.log("PROBLEM_GENERATORS.JS: generateDOTSProblem called");
    const v = getRandomVariable();
    let problemString, factor1Str, factor2Str;

    if (difficultyTier > 1 && Math.random() < 0.4) {
        const k = getRandomInt(2, 5); 
        const m = getRandomNonZeroInt(1, 7); 
        
        const term1Display = formatTermForDisplay(k * k, v, "<sup>2</sup>");
        const term2Display = formatTermForDisplay(-(m * m));
        problemString = formatExpressionForDisplay([term1Display, term2Display]);

        const factorTermKDisplay = formatTermForDisplay(k,v);
        factor1Str = `(${factorTermKDisplay}-${m})`;
        factor2Str = `(${factorTermKDisplay}+${m})`;
    } else {
        const a = getRandomNonZeroInt(2, 10);
        const term1Display = formatTermForDisplay(1, v, "<sup>2</sup>");
        const term2Display = formatTermForDisplay(-(a * a));
        problemString = formatExpressionForDisplay([term1Display, term2Display]);

        factor1Str = `(${v}-${a})`;
        factor2Str = `(${v}+${a})`;
    }
    return { problemString, details: { factors: [cleanInput(factor1Str), cleanInput(factor2Str)].sort() } };
}

function generateTrinomialA1Problem(difficultyTier = 1) {
    console.log("PROBLEM_GENERATORS.JS: generateTrinomialA1Problem called");
    const v = getRandomVariable();
    let p = getRandomNonZeroInt(-7, 7);
    let q = getRandomNonZeroInt(-7, 7);

    while (p + q === 0) { // Avoid b=0 which is DOTS
        q = getRandomNonZeroInt(-7, 7);
         // Ensure q actually changes if it was the problematic one
        if (p === -q && q !== 0) q = getRandomNonZeroInt(-7,7); 
        else if (q === 0) q = getRandomNonZeroInt(-7,7);
    }
    
    const b = p + q;
    const c = p * q;

    const term1Display = formatTermForDisplay(1, v, "<sup>2</sup>");
    const term2Display = formatTermForDisplay(b, v);
    const term3Display = formatTermForDisplay(c);
    problemString = formatExpressionForDisplay([term1Display, term2Display, term3Display].filter(t => t !== "" || (t==="0" && c===0) )); // Keep "0" if c is 0 and other terms are zero

    const factor1Str = `(${v}${p > 0 ? '+' : ''}${p})`.replace('+-', '-');
    const factor2Str = `(${v}${q > 0 ? '+' : ''}${q})`.replace('+-', '-');
    
    return { problemString, details: { factors: [cleanInput(factor1Str), cleanInput(factor2Str)].sort() } };
}

// Add generatePSTProblem, generateTrinomialAGreater1Problem, generateSumOfCubesProblem, generateDiffOfCubesProblem here later
