
const inputProcessor = (function() {
    'use strict';
    
    let currentText = '';
    let isValidInput = false;
    let validationErrors = [];
    let lastProcessedText = '';
    
    /**
     * Debounced input handler using function expression
     * Prevents excessive processing during typing
     */
    const debouncedInputHandler = utils.debounce(function(text) {
        if (text !== lastProcessedText) {
            lastProcessedText = text;
            processTextInput(text);
        }
    }, config.processing.debounceDelay);
    
    /**
     * Input validation using for loops with break and continue statements
     * @param {string} text - Text to validate
     * @returns {object} Validation result
     */
    const validateInput = function(text) {
        const errors = [];
        const processing = config.processing;
        let isValid = true;
        
        for (let i = 0; i < 6; i++) {
            switch (i) {
                case 0:
                    if (!text || typeof text !== 'string') {
                        errors.push('Input must be valid text');
                        isValid = false;
                        break; // Stop validation on critical error
                    }
                    continue; // Skip to next validation if this passes
                    
                case 1:
                    // Check minimum length
                    if (text.trim().length < processing.minTextLength) {
                        errors.push(`Text must be at least ${processing.minTextLength} character long`);
                        // Don't break here, continue with other validations
                    }
                    continue;
                    
                case 2:
                    // Check maximum length
                    if (text.length > processing.maxTextLength) {
                        errors.push(`Text exceeds maximum length of ${processing.maxTextLength} characters`);
                        isValid = false;
                        break; // Stop on critical error
                    }
                    continue;
                    
                case 3:
                    // Check for extremely long words using continue to skip valid words
                    const words = text.split(/\s+/);
                    for (let j = 0; j < words.length; j++) {
                        const word = words[j];
                        if (word.length > processing.maxWordLength) {
                            errors.push(`Word "${word.substring(0, 20)}..." is too long (${processing.maxWordLength} character limit)`);
                            // Use continue to skip remaining words in this validation
                            continue;
                        }
                    }
                    continue;
                    
                case 4:
                    // Check for potentially harmful content
                    const sanitized = utils.sanitizeText(text);
                    if (sanitized.length < text.length * 0.8) {
                        errors.push('Text contains potentially harmful content that was removed');
                        isValid = false;
                        break; // Stop on critical error
                    }
                    continue;
                    
                case 5:
                    // Check for empty content after processing
                    if (text.trim().length === 0) {
                        errors.push('Text appears to be empty after processing');
                        isValid = false;
                        break; // Stop on critical error
                    }
                    continue;
            }
            break; // Break the main validation loop if any critical error occurs
        }
        
        return {
            isValid,
            errors,
            hasErrors: errors.length > 0
        };
    };
    
    /**
     * Process text input with validation and analysis preparation
     * @param {string} text - Raw input text
     */
    const processTextInput = function(text) {
        // Validate input first
        const validation = validateInput(text);
        isValidInput = validation.isValid;
        validationErrors = validation.errors;
        
        // Update current text state
        currentText = text;
        
        // Update UI based on validation results
        updateInputStatus(validation);
        
        // If input is valid, trigger analysis
        if (isValidInput && text.trim().length > 0) {
            triggerAnalysis(text);
        } else {
            clearAnalysisResults();
        }
    };
    
    /**
     * Update input status in the UI
     * @param {object} validation - Validation result object
     */
    const updateInputStatus = function(validation) {
        const statusElement = document.getElementById('analysis-status');
        const charCounter = document.querySelector('.char-counter');
        
        if (!statusElement || !charCounter) return;
        
        // Update character counter
        charCounter.textContent = `${currentText.length} characters`;
        
        // Update status based on validation
        if (!validation.hasErrors) {
            statusElement.textContent = 'Ready for analysis';
            statusElement.style.color = '';
        } else if (validation.isValid) {
            statusElement.textContent = 'Valid with warnings';
            statusElement.style.color = 'orange';
        } else {
            statusElement.textContent = 'Input has errors';
            statusElement.style.color = 'red';
        }
    };
    
    /**
     * Trigger text analysis using function expression
     */
    const triggerAnalysis = function(text) {
        // Use function expression for analysis callback
        const analyzeCallback = function() {
            if (window.analyzer && typeof window.analyzer.analyzeText === 'function') {
                window.analyzer.analyzeText(text);
            }
        };
        
        // Execute analysis
        analyzeCallback();
    };
    
    /**
     * Clear analysis results
     */
    const clearAnalysisResults = function() {
        if (window.ui && typeof window.ui.clearResults === 'function') {
            window.ui.clearResults();
        }
    };
    
    /**
     * Handle input events using arrow function for event listeners
     * @param {Event} event - Input event
     */
    const handleInputEvent = (event) => {
        const text = event.target.value;
        debouncedInputHandler(text);
    };
    
    /**
     * Handle paste events using arrow function
     * @param {Event} event - Paste event
     */
    const handlePasteEvent = (event) => {
        // Small delay to ensure paste content is available
        setTimeout(() => {
            const text = event.target.value;
            debouncedInputHandler(text);
        }, 10);
    };
    
    /**
     * Handle clear button click using function expression
     */
    const handleClearClick = function() {
        const textInput = document.getElementById('text-input');
        if (textInput) {
            textInput.value = '';
            textInput.focus();
        }
        currentText = '';
        lastProcessedText = '';
        isValidInput = false;
        validationErrors = [];
        clearAnalysisResults();
        updateInputStatus({ isValid: true, errors: [], hasErrors: false });
    };
    
    /**
     * Initialize input processing system
     */
    const initialize = function() {
        const textInput = document.getElementById('text-input');
        const clearBtn = document.getElementById('clear-btn');
        
        if (!textInput) {
            console.error('Text input element not found');
            return;
        }
        
        // Add event listeners using arrow functions
        textInput.addEventListener('input', handleInputEvent);
        textInput.addEventListener('paste', handlePasteEvent);
        
        // Add clear button listener using function expression
        if (clearBtn) {
            clearBtn.addEventListener('click', handleClearClick);
        }
        
        // Initialize with empty state
        updateInputStatus({ isValid: true, errors: [], hasErrors: false });
        
        console.log('Input processor initialized successfully');
    };
    
    /**
     * Get current input state
     * @returns {object} Current input state
     */
    const getCurrentState = function() {
        return {
            text: currentText,
            isValid: isValidInput,
            errors: [...validationErrors], // Create copy of errors array
            lastProcessed: lastProcessedText
        };
    };
    
    /**
     * Manually trigger input processing
     * @param {string} text - Text to process
     */
    const processText = function(text) {
        if (typeof text !== 'string') {
            console.error('Invalid text input provided');
            return;
        }
        processTextInput(text);
    };
    
    /**
     * Set custom debounce delay
     * @param {number} delay - Delay in milliseconds
     */
    const setDebounceDelay = function(delay) {
        if (typeof delay === 'number' && delay > 0) {
            // Recreate debounced handler with new delay
            debouncedInputHandler = utils.debounce(function(text) {
                if (text !== lastProcessedText) {
                    lastProcessedText = text;
                    processTextInput(text);
                }
            }, delay);
        }
    };
    
    // Public API using object literal
    return {
        initialize,
        processText,
        getCurrentState,
        setDebounceDelay,
        validateInput,
        handleClearClick
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = inputProcessor;
} else if (typeof window !== 'undefined') {
    window.inputProcessor = inputProcessor;
}
