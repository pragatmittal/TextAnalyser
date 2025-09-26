/**
 * Advanced Text Analyzer - Input Processing Module
 * Enhanced input handling with debouncing and real-time processing
 * Uses self-invoking functions, function expressions, and arrow functions
 */

// Self-invoking function for module initialization (IIFE)
const InputProcessor = (function() {
    'use strict';
    
    // Private module state using object literal
    const moduleState = {
        initialized: false,
        activeInputs: new Map(),
        processingQueue: [],
        debounceTimers: new Map(),
        performanceMetrics: {
            totalProcesses: 0,
            averageProcessTime: 0,
            lastProcessTime: 0
        }
    };
    
    // Configuration object using destructuring-ready structure
    const {
        validation: { minWords, maxCharacters, patterns },
        animations: { delays },
        messages: { errors, info }
    } = CONFIG;
    
    // Input processor initialization using function expression
    const initializeProcessor = function() {
        if (moduleState.initialized) {
            console.warn('Input processor already initialized');
            return;
        }
        
        console.log('🔧 Initializing Input Processor Module...');
        
        // Setup performance monitoring
        setupPerformanceMonitoring();
        
        // Initialize input tracking
        initializeInputTracking();
        
        // Setup global event delegation
        setupEventDelegation();
        
        moduleState.initialized = true;
        console.log('✅ Input Processor Module initialized successfully');
    };
    
    // Performance monitoring setup using arrow functions
    const setupPerformanceMonitoring = () => {
        // Monitor processing queue size
        const queueMonitor = setInterval(() => {
            if (moduleState.processingQueue.length > 10) {
                console.warn('⚠️ Input processing queue is getting large:', moduleState.processingQueue.length);
            }
        }, 5000);
        
        // Memory usage tracking
        if ('memory' in performance) {
            const memoryMonitor = setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.85) {
                    console.warn('⚠️ High memory usage in input processor');
                    // Clear old entries to free memory
                    cleanupOldEntries();
                }
            }, 10000);
        }
    };
    
    // Input tracking initialization using function expression
    const initializeInputTracking = function() {
        // Create input registry for active text inputs
        const textInputs = document.querySelectorAll('textarea, input[type="text"]');
        
        textInputs.forEach(input => {
            const inputId = input.id || `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            moduleState.activeInputs.set(inputId, {
                element: input,
                lastValue: '',
                lastProcessTime: 0,
                changeCount: 0,
                processingActive: false
            });
        });
        
        console.log(`📝 Tracking ${moduleState.activeInputs.size} input elements`);
    };
    
    // Global event delegation setup using arrow functions
    const setupEventDelegation = () => {
        // Use event delegation for better performance
        document.addEventListener('input', (event) => {
            if (event.target.matches('textarea, input[type="text"]')) {
                handleInputChange(event);
            }
        });
        
        document.addEventListener('paste', (event) => {
            if (event.target.matches('textarea, input[type="text"]')) {
                handlePasteEvent(event);
            }
        });
        
        document.addEventListener('keydown', (event) => {
            if (event.target.matches('textarea, input[type="text"]')) {
                handleKeydownEvent(event);
            }
        });
    };
    
    // Main input change handler using function expression with debouncing
    const handleInputChange = EventUtils.debounce(function(event) {
        const element = event.target;
        const inputId = element.id || `temp_${Date.now()}`;
        const currentValue = element.value;
        
        // Get or create input tracking data
        let inputData = moduleState.activeInputs.get(inputId);
        if (!inputData) {
            inputData = {
                element: element,
                lastValue: '',
                lastProcessTime: 0,
                changeCount: 0,
                processingActive: false
            };
            moduleState.activeInputs.set(inputId, inputData);
        }
        
        // Skip if value hasn't changed or if already processing
        if (currentValue === inputData.lastValue || inputData.processingActive) {
            return;
        }
        
        // Update tracking data
        inputData.lastValue = currentValue;
        inputData.changeCount++;
        inputData.processingActive = true;
        
        // Process input asynchronously
        processInputAsync(inputId, currentValue)
            .then(result => {
                handleProcessingResult(inputId, result);
            })
            .catch(error => {
                handleProcessingError(inputId, error);
            })
            .finally(() => {
                inputData.processingActive = false;
                inputData.lastProcessTime = performance.now();
            });
        
    }, delays.progressStep);
    
    // Asynchronous input processing using arrow function
    const processInputAsync = async (inputId, value) => {
        const startTime = performance.now();
        
        try {
            // Add to processing queue
            moduleState.processingQueue.push({
                inputId,
                timestamp: startTime,
                status: 'processing'
            });
            
            // Perform text preprocessing pipeline
            const preprocessedText = await preprocessTextPipeline(value);
            
            // Perform input validation
            const validationResult = performInputValidation(preprocessedText);
            
            // Extract text properties using destructuring
            const textProperties = extractTextProperties(preprocessedText);
            
            // Calculate processing metrics
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            
            updatePerformanceMetrics(processingTime);
            
            // Remove from processing queue
            moduleState.processingQueue = moduleState.processingQueue.filter(
                item => item.inputId !== inputId
            );
            
            return {
                inputId,
                preprocessedText,
                validation: validationResult,
                properties: textProperties,
                performance: {
                    processingTime,
                    timestamp: endTime
                }
            };
            
        } catch (error) {
            // Remove from processing queue on error
            moduleState.processingQueue = moduleState.processingQueue.filter(
                item => item.inputId !== inputId
            );
            throw error;
        }
    };
    
    // Text preprocessing pipeline using arrow functions
    const preprocessTextPipeline = async (text) => {
        // Pipeline stages using arrow functions for transformations
        const stages = [
            // Stage 1: Basic cleaning
            (text) => text.trim(),
            
            // Stage 2: Normalize whitespace
            (text) => text.replace(/\s+/g, ' '),
            
            // Stage 3: Handle special characters
            (text) => text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"'),
            
            // Stage 4: Remove excessive punctuation
            (text) => text.replace(/([.!?]){2,}/g, '$1'),
            
            // Stage 5: Handle line breaks
            (text) => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'),
            
            // Stage 6: Clean up paragraph breaks
            (text) => text.replace(/\n{3,}/g, '\n\n')
        ];
        
        // Apply pipeline stages sequentially
        return stages.reduce((processedText, stage) => {
            try {
                return stage(processedText);
            } catch (error) {
                console.warn('Pipeline stage error:', error);
                return processedText; // Return unmodified text on error
            }
        }, text);
    };
    
    // Input validation using for loops with break/continue statements
    const performInputValidation = function(text) {
        const validationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            metrics: {
                length: text.length,
                wordCount: 0,
                sentenceCount: 0
            }
        };
        
        // Basic validation rules array
        const validationRules = [
            { type: 'length', min: 1, max: maxCharacters },
            { type: 'words', min: minWords, max: 5000 },
            { type: 'sentences', min: 1, max: 1000 },
            { type: 'characters', forbidden: ['<', '>', '{', '}'] },
            { type: 'patterns', required: /[a-zA-Z]/ }
        ];
        
        // Validate each rule using for loop with break/continue
        for (let i = 0; i < validationRules.length; i++) {
            const rule = validationRules[i];
            
            try {
                switch (rule.type) {
                    case 'length':
                        if (text.length < rule.min) {
                            validationResult.errors.push(errors.emptyText);
                            validationResult.isValid = false;
                            continue; // Skip to next rule
                        }
                        if (text.length > rule.max) {
                            validationResult.errors.push(errors.textTooLong);
                            validationResult.isValid = false;
                        }
                        validationResult.metrics.length = text.length;
                        break;
                        
                    case 'words':
                        const wordCount = Utils.text.countWords(text);
                        validationResult.metrics.wordCount = wordCount;
                        
                        if (wordCount < rule.min) {
                            validationResult.warnings.push(errors.textTooShort);
                        }
                        if (wordCount > rule.max) {
                            validationResult.warnings.push('Text is very long and may take time to process');
                        }
                        break;
                        
                    case 'sentences':
                        const sentenceCount = Utils.text.countSentences(text);
                        validationResult.metrics.sentenceCount = sentenceCount;
                        
                        if (sentenceCount < rule.min && validationResult.metrics.wordCount > 10) {
                            validationResult.warnings.push('Text appears to be missing sentence punctuation');
                        }
                        if (sentenceCount > rule.max) {
                            validationResult.warnings.push('Text is extremely long');
                        }
                        break;
                        
                    case 'characters':
                        // Check for forbidden characters
                        for (let j = 0; j < rule.forbidden.length; j++) {
                            const forbiddenChar = rule.forbidden[j];
                            if (text.includes(forbiddenChar)) {
                                validationResult.warnings.push(`Contains potentially problematic character: ${forbiddenChar}`);
                                break; // Found one forbidden char, move to next rule
                            }
                        }
                        break;
                        
                    case 'patterns':
                        if (!rule.required.test(text)) {
                            validationResult.errors.push('Text must contain alphabetic characters');
                            validationResult.isValid = false;
                        }
                        break;
                        
                    default:
                        continue; // Skip unknown rule types
                }
            } catch (validationError) {
                console.error(`Validation rule ${rule.type} failed:`, validationError);
                continue; // Continue with next rule on error
            }
        }
        
        return validationResult;
    };
    
    // Text properties extraction using destructuring
    const extractTextProperties = (text) => {
        // Basic text analysis with destructuring assignments
        const words = text.match(patterns.word) || [];
        const sentences = text.split(patterns.sentence).filter(s => s.trim().length > 0);
        const paragraphs = text.split(patterns.paragraph).filter(p => p.trim().length > 0);
        
        // Destructure word analysis
        const wordAnalysis = analyzeWords(words);
        const { 
            totalWords, 
            averageLength, 
            longestWord, 
            shortestWord,
            commonWords 
        } = wordAnalysis;
        
        // Destructure sentence analysis
        const sentenceAnalysis = analyzeSentences(sentences);
        const {
            totalSentences,
            averageWordsPerSentence,
            longestSentence,
            shortestSentence
        } = sentenceAnalysis;
        
        // Destructure character analysis
        const characterAnalysis = analyzeCharacters(text);
        const {
            totalCharacters,
            charactersNoSpaces,
            specialCharacters,
            punctuationCount
        } = characterAnalysis;
        
        return {
            words: {
                count: totalWords,
                average: averageLength,
                longest: longestWord,
                shortest: shortestWord,
                common: commonWords
            },
            sentences: {
                count: totalSentences,
                averageWords: averageWordsPerSentence,
                longest: longestSentence,
                shortest: shortestSentence
            },
            characters: {
                total: totalCharacters,
                noSpaces: charactersNoSpaces,
                special: specialCharacters,
                punctuation: punctuationCount
            },
            paragraphs: {
                count: paragraphs.length,
                averageSentences: totalSentences / paragraphs.length || 0
            }
        };
    };
    
    // Word analysis helper using function expression
    const analyzeWords = function(words) {
        if (!words.length) {
            return {
                totalWords: 0,
                averageLength: 0,
                longestWord: '',
                shortestWord: '',
                commonWords: []
            };
        }
        
        // Calculate word statistics using for loop with break/continue
        let totalLength = 0;
        let longest = '';
        let shortest = words[0];
        const wordFreq = {};
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i].toLowerCase();
            
            // Skip empty words
            if (!word) continue;
            
            totalLength += word.length;
            
            // Update longest word
            if (word.length > longest.length) {
                longest = word;
            }
            
            // Update shortest word
            if (word.length < shortest.length) {
                shortest = word;
            }
            
            // Count word frequency
            wordFreq[word] = (wordFreq[word] || 0) + 1;
            
            // Break early if processing too many words for performance
            if (i > 5000) {
                console.warn('⚠️ Large text detected, truncating word analysis');
                break;
            }
        }
        
        // Find most common words
        const commonWords = Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);
        
        return {
            totalWords: words.length,
            averageLength: Utils.math.round(totalLength / words.length),
            longestWord: longest,
            shortestWord: shortest,
            commonWords
        };
    };
    
    // Sentence analysis helper using arrow functions
    const analyzeSentences = (sentences) => {
        if (!sentences.length) {
            return {
                totalSentences: 0,
                averageWordsPerSentence: 0,
                longestSentence: '',
                shortestSentence: ''
            };
        }
        
        let totalWords = 0;
        let longest = '';
        let shortest = sentences[0];
        
        sentences.forEach(sentence => {
            const wordCount = Utils.text.countWords(sentence);
            totalWords += wordCount;
            
            if (sentence.length > longest.length) {
                longest = sentence;
            }
            
            if (sentence.length < shortest.length) {
                shortest = sentence;
            }
        });
        
        return {
            totalSentences: sentences.length,
            averageWordsPerSentence: Utils.math.round(totalWords / sentences.length),
            longestSentence: longest.trim(),
            shortestSentence: shortest.trim()
        };
    };
    
    // Character analysis helper using function expression
    const analyzeCharacters = function(text) {
        let charactersNoSpaces = 0;
        let specialCharacters = 0;
        let punctuationCount = 0;
        
        // Analyze each character using for loop
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            if (char !== ' ' && char !== '\n' && char !== '\t') {
                charactersNoSpaces++;
            }
            
            if (/[^a-zA-Z0-9\s]/.test(char)) {
                specialCharacters++;
                
                if (/[.!?,:;]/.test(char)) {
                    punctuationCount++;
                }
            }
            
            // Performance break for very long texts
            if (i > 50000) {
                console.warn('⚠️ Very large text detected, truncating character analysis');
                break;
            }
        }
        
        return {
            totalCharacters: text.length,
            charactersNoSpaces,
            specialCharacters,
            punctuationCount
        };
    };
    
    // Handle paste events with special processing
    const handlePasteEvent = (event) => {
        setTimeout(() => {
            // Process pasted content after paste event completes
            const element = event.target;
            const pastedText = element.value;
            
            // Special handling for large pastes
            if (pastedText.length > 5000) {
                console.log('📋 Large paste detected, optimizing processing');
                
                // Show processing indicator for large pastes
                if (window.showToast) {
                    showToast(info.analyzing, 'info', 1000);
                }
            }
        }, 100);
    };
    
    // Handle special keydown events
    const handleKeydownEvent = (event) => {
        const { key, ctrlKey, metaKey, altKey } = event;
        
        // Handle special key combinations
        if ((ctrlKey || metaKey) && key === 'v') {
            // Paste event will be handled separately
            return;
        }
        
        if ((ctrlKey || metaKey) && key === 'a') {
            // Select all - might affect performance metrics
            const element = event.target;
            if (element.value.length > 10000) {
                console.log('📝 Large text selection detected');
            }
        }
    };
    
    // Processing result handler using arrow functions
    const handleProcessingResult = (inputId, result) => {
        const inputData = moduleState.activeInputs.get(inputId);
        if (!inputData) return;
        
        // Extract validation and properties using destructuring
        const { 
            validation: { isValid, errors, warnings, metrics },
            properties,
            performance 
        } = result;
        
        // Update UI elements if they exist
        updateInputFeedback(inputData.element, { isValid, errors, warnings, metrics });
        
        // Dispatch custom event with processing results
        const customEvent = new CustomEvent('textProcessed', {
            detail: {
                inputId,
                result,
                element: inputData.element
            }
        });
        
        inputData.element.dispatchEvent(customEvent);
        
        // Log processing metrics in development
        if (window.location.hostname === 'localhost') {
            console.log(`📊 Input processed: ${inputId}, ${performance.processingTime.toFixed(2)}ms`);
        }
    };
    
    // Processing error handler using function expression
    const handleProcessingError = function(inputId, error) {
        console.error(`❌ Input processing error for ${inputId}:`, error);
        
        const inputData = moduleState.activeInputs.get(inputId);
        if (!inputData) return;
        
        // Show error feedback
        if (window.showToast) {
            showToast('Input processing error occurred', 'error');
        }
        
        // Reset processing state
        inputData.processingActive = false;
    };
    
    // Update input feedback UI using arrow functions
    const updateInputFeedback = (element, { isValid, errors, warnings, metrics }) => {
        // Remove existing feedback classes
        element.classList.remove('input-valid', 'input-invalid', 'input-warning');
        
        // Add appropriate feedback class
        if (!isValid && errors.length > 0) {
            element.classList.add('input-invalid');
        } else if (warnings.length > 0) {
            element.classList.add('input-warning');
        } else {
            element.classList.add('input-valid');
        }
        
        // Update ARIA attributes for accessibility
        if (errors.length > 0) {
            element.setAttribute('aria-invalid', 'true');
            element.setAttribute('aria-describedby', 'input-errors');
        } else {
            element.removeAttribute('aria-invalid');
            element.removeAttribute('aria-describedby');
        }
    };
    
    // Performance metrics update using arrow functions
    const updatePerformanceMetrics = (processingTime) => {
        moduleState.performanceMetrics.totalProcesses++;
        moduleState.performanceMetrics.lastProcessTime = processingTime;
        
        // Calculate running average
        const { totalProcesses, averageProcessTime } = moduleState.performanceMetrics;
        moduleState.performanceMetrics.averageProcessTime = 
            (averageProcessTime * (totalProcesses - 1) + processingTime) / totalProcesses;
    };
    
    // Cleanup old entries to prevent memory leaks
    const cleanupOldEntries = () => {
        const cutoffTime = performance.now() - 300000; // 5 minutes ago
        
        moduleState.activeInputs.forEach((data, inputId) => {
            if (data.lastProcessTime < cutoffTime && !data.element.isConnected) {
                moduleState.activeInputs.delete(inputId);
            }
        });
        
        // Clear old timers
        moduleState.debounceTimers.forEach((timer, inputId) => {
            if (!moduleState.activeInputs.has(inputId)) {
                clearTimeout(timer);
                moduleState.debounceTimers.delete(inputId);
            }
        });
    };
    
    // Public API using object literal with method definitions
    return {
        // Initialization
        init: initializeProcessor,
        
        // Main processing methods
        processText: processInputAsync,
        preprocessText: preprocessTextPipeline,
        validateInput: performInputValidation,
        extractProperties: extractTextProperties,
        
        // Utility methods
        getActiveInputs: () => Array.from(moduleState.activeInputs.keys()),
        getProcessingQueue: () => [...moduleState.processingQueue],
        getPerformanceMetrics: () => ({ ...moduleState.performanceMetrics }),
        
        // Cleanup
        cleanup: cleanupOldEntries,
        
        // State management
        isInitialized: () => moduleState.initialized
    };
    
})(); // IIFE - Self-invoking function immediately executes

// Make InputProcessor available globally
window.InputProcessor = InputProcessor;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', InputProcessor.init);
} else {
    InputProcessor.init();
}

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputProcessor;
}