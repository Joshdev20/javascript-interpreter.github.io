function interpretCode() {
    const code = document.getElementById('code').value;
    const outputDiv = document.getElementById('output');
    const resultDiv = document.getElementById('result');

    if (!code.trim()) {
        outputDiv.innerHTML = "Please enter some JavaScript code.";
        resultDiv.innerHTML = "";
        return;
    }

    try {
        checkSyntax(code);
        const explanation = advancedInterpretation(code);
        outputDiv.innerHTML = `<h2>Code Interpretation</h2><p>${explanation}</p>`;

        // Capture the output
        const output = executeCode(code);
        resultDiv.innerHTML = `<h2>Execution Output</h2><p>${output}</p>`;
    } catch (error) {
        outputDiv.innerHTML = `<h2>Error</h2><p>${error.message}</p>`;
        resultDiv.innerHTML = "";
    }
}

// Syntax check function
function checkSyntax(code) {
    try {
        checkBraces(code);
        new Function(code); // Check for syntax errors
    } catch (e) {
        throw new Error(`Syntax Error: ${e.message}`);
    }

    detectDeclaredVariables(code); // Keep this for variable detection
}

// Function to detect declared variables
function detectDeclaredVariables(code) {
    const declaredVars = new Set();
    const lines = code.split('\n');

    lines.forEach(line => {
        // Match variable declarations for var, let, and const
        const varDeclarations = line.match(/(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*(?:\s*,\s*[a-zA-Z_$][a-zA-Z0-9_$]*)*)/g);
        if (varDeclarations) {
            varDeclarations.forEach(decl => {
                const varNames = decl.split(' ')[1].split(',');
                varNames.forEach(varName => {
                    declaredVars.add(varName.trim());
                });
            });
        }
    });

    return declaredVars;
}

// Function to check for unmatched braces
function checkBraces(code) {
    const stack = [];
    for (let i = 0; i < code.length; i++) {
        if (code[i] === '{' || code[i] === '(' || code[i] === '[') {
            stack.push(code[i]);
        } else if (code[i] === '}' || code[i] === ')' || code[i] === ']') {
            const last = stack.pop();
            if (!isValidPair(last, code[i])) {
                throw new Error(`Unmatched brace at character ${i + 1}.`);
            }
        }
    }
    if (stack.length > 0) {
        throw new Error(`Unmatched opening brace(s) detected: ${stack.join(', ')}`);
    }
}

// Helper function to validate brace pairs
function isValidPair(open, close) {
    return (open === '{' && close === '}') ||
           (open === '(' && close === ')') ||
           (open === '[' && close === ']');
}

// Function to get variable type
function getVariableType(value) {
    if (value === 'undefined') return 'undefined';
    if (value === 'null') return 'object'; // Special case for null
    if (Array.isArray(value)) return 'array';
    return typeof value;
}

// Advanced interpretation function
function advancedInterpretation(code) {
    const explanations = [];
    const lines = code.split('\n').map(line => line.trim());

    lines.forEach((line, index) => {
        // Variable declarations (case-sensitive)
        const varDeclaration = line.match(/(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(.*?);?/);
        if (varDeclaration) {
            const type = getVariableType(varDeclaration[3].trim());
            explanations.push(`Line ${index + 1}: "${varDeclaration[2]}" is a ${type} variable declared with "${varDeclaration[1]}".`);
        }

        // Function declarations (case-sensitive)
        if (/^function /.test(line)) {
            const functionName = line.match(/^function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
            if (functionName) {
                explanations.push(`Line ${index + 1}: "${functionName[1]}" is a function that will perform a set of instructions when called.`);
            }
        }

        // Arrow functions
        if (/const\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*\(.*?\)\s*=>/.test(line)) {
            const arrowFunc = line.match(/const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
            explanations.push(`Line ${index + 1}: "${arrowFunc[1]}" is an arrow function.`);
        }

        // Loops
        if (/^for\(|^while\(/.test(line)) {
            const loopType = /^for/.test(line) ? "for loop" : "while loop";
            explanations.push(`Line ${index + 1}: This is a "${loopType}" that repeats code execution based on a condition.`);
        }

        // Conditionals
        if (/^if\(|^else/.test(line)) {
            explanations.push(`Line ${index + 1}: This is a conditional statement (if/else) that executes code based on a condition.`);
        }

        // Console logs
        if (/console\.log\(/.test(line)) {
            explanations.push(`Line ${index + 1}: This line logs output to the browser's console.`);
        }

        // Errors and exceptions
        if (/try\s*{/.test(line)) {
            explanations.push(`Line ${index + 1}: A try block to handle code that may throw errors.`);
        }

        // Detect DOM manipulations
        if (/document\.getElementById\(/.test(line)) {
            explanations.push(`Line ${index + 1}: This line accesses an HTML element by its ID using DOM manipulation.`);
        }

        // Check for comments
        if (/\/\//.test(line)) {
            explanations.push(`Line ${index + 1}: This is a comment. Comments are not executed as code.`);
        }
    });

    if (explanations.length === 0) {
        return "This is valid JavaScript, but it contains no recognizable patterns for interpretation.";
    }

    return explanations.join('\n');
}

// Function to execute the code and capture output
function executeCode(code) {
    let output = '';
    const originalLog = console.log;

    console.log = function(message) {
        output += message + '<br>'; // Capture output
    };

    try {
        new Function(code)(); // Execute the code
    } catch (e) {
        output = `Execution Error: ${e.message}`;
    } finally {
        console.log = originalLog; // Restore original console.log
    }

    return output || 'No output generated.';
}