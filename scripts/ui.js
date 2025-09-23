/**
 * Advanced Text Analyzer - UI Module
 * User interface management using arrow functions for event handlers
 */

// UI State management using object literal
const UIState = {
    currentAnalysis: null,
    isAnalyzing: false,
    elements: {},
    eventCleanupFunctions: [],
    lastInputValue: '',
    inputTimer: null
};

// DOM element references using arrow function initialization
const initializeElements = () => {
    UIState.elements = {
        // Input elements
        textInput: Utils.dom.get(SELECTORS.textInput),
        charCount: Utils.dom.get(SELECTORS.charCount),
        
        // Control buttons
        analyzeBtn: Utils.dom.get(SELECTORS.analyzeBtn),
        clearBtn: Utils.dom.get(SELECTORS.clearBtn),
        exportBtn: Utils.dom.get(SELECTORS.exportBtn),
        copyBtn: Utils.dom.get(SELECTORS.copyBtn),
        
        // Progress elements
        progressContainer: Utils.dom.get(SELECTORS.progressContainer),
        progressFill: Utils.dom.get(SELECTORS.progressFill),
        progressText: Utils.dom.get(SELECTORS.progressText),
        
        // Statistics panel elements
        wordCount: Utils.dom.get(SELECTORS.wordCount),
        charCountResult: Utils.dom.get(SELECTORS.charCountResult),
        sentenceCount: Utils.dom.get(SELECTORS.sentenceCount),
        paragraphCount: Utils.dom.get(SELECTORS.paragraphCount),
        avgWordsPerSentence: Utils.dom.get(SELECTORS.avgWordsPerSentence),
        avgSyllablesPerWord: Utils.dom.get(SELECTORS.avgSyllablesPerWord),
        
        // Readability panel elements
        fleschScore: Utils.dom.get(SELECTORS.fleschScore),
        fleschBar: Utils.dom.get(SELECTORS.fleschBar),
        fleschInterpretation: Utils.dom.get(SELECTORS.fleschInterpretation),
        fkGrade: Utils.dom.get(SELECTORS.fkGrade),
        fkBar: Utils.dom.get(SELECTORS.fkBar),
        fkInterpretation: Utils.dom.get(SELECTORS.fkInterpretation),
        
        // Grade panel elements
        gradeLevel: Utils.dom.get(SELECTORS.gradeLevel),
        gradeExplanation: Utils.dom.get(SELECTORS.gradeExplanation),
        readingTimeSlow: Utils.dom.get(SELECTORS.readingTimeSlow),
        readingTimeAvg: Utils.dom.get(SELECTORS.readingTimeAvg),
        readingTimeFast: Utils.dom.get(SELECTORS.readingTimeFast),
        
        // Insights panel
        insightsContent: Utils.dom.get(SELECTORS.insightsContent),
        
        // Toast container
        toastContainer: Utils.dom.get(SELECTORS.toastContainer)
    };
};

// Event handlers using arrow functions
const handleTextInput = EventUtils.debounce(() => {
    const text = UIState.elements.textInput.value;
    const charCount = text.length;
    const maxChars = CONFIG.validation.maxCharacters;
    
    // Update character count
    Utils.dom.setText(UIState.elements.charCount, `${Utils.format.number(charCount)} / ${Utils.format.number(maxChars)} characters`);
    
    // Update button states
    const hasText = text.trim().length > 0;
    const isValid = charCount <= maxChars && Utils.text.countWords(text) >= CONFIG.validation.minWords;
    
    UIState.elements.analyzeBtn.disabled = !hasText || !isValid;
    
    // Add visual feedback for character limit
    if (charCount > maxChars * 0.9) {
        Utils.dom.addClass(UIState.elements.charCount, 'char-count-warning');
    } else {
        Utils.dom.removeClass(UIState.elements.charCount, 'char-count-warning');
    }
    
    // Store last input value
    UIState.lastInputValue = text;
}, 300);

const handleAnalyzeClick = async () => {
    const text = UIState.elements.textInput.value.trim();
    
    if (!text) {
        showToast(CONFIG.messages.errors.emptyText, 'error');
        return;
    }
    
    try {
        UIState.isAnalyzing = true;
        updateButtonStates(true);
        
        // Show progress bar with animation
        await showProgressBar();
        
        // Perform analysis with progress updates
        const analysis = await performAnalysisWithProgress(text);
        
        // Update UI with results
        updateAnalysisResults(analysis);
        
        // Store current analysis
        UIState.currentAnalysis = analysis;
        
        // Enable export/copy buttons
        updateButtonStates(false, true);
        
        // Show success message
        showToast(CONFIG.messages.success.analysisDone, 'success');
        
    } catch (error) {
        console.error('Analysis failed:', error);
        showToast(error.message || CONFIG.messages.errors.analysisError, 'error');
    } finally {
        UIState.isAnalyzing = false;
        updateButtonStates(false);
        hideProgressBar();
    }
};

const handleClearClick = () => {
    // Clear input
    UIState.elements.textInput.value = '';
    
    // Reset character count
    Utils.dom.setText(UIState.elements.charCount, '0 / 10,000 characters');
    
    // Reset all results
    resetAnalysisResults();
    
    // Update button states
    UIState.elements.analyzeBtn.disabled = true;
    updateButtonStates(false, false);
    
    // Clear stored analysis
    UIState.currentAnalysis = null;
    UIState.lastInputValue = '';
    
    // Focus back to text input
    UIState.elements.textInput.focus();
    
    // Show success message
    showToast(CONFIG.messages.success.textCleared, 'info');
};

const handleExportClick = () => {
    if (!UIState.currentAnalysis) {
        showToast('No analysis data to export', 'error');
        return;
    }
    
    try {
        // For now, export as JSON (can be extended to show format selection)
        const exportResult = exportAnalysis(UIState.currentAnalysis, 'json');
        
        // Download the file
        DataUtils.exportToFile(
            exportResult.data,
            exportResult.filename,
            exportResult.mimeType
        );
        
        showToast(CONFIG.messages.success.resultsExported, 'success');
        
    } catch (error) {
        console.error('Export failed:', error);
        showToast(CONFIG.messages.errors.exportError, 'error');
    }
};

const handleCopyClick = async () => {
    if (!UIState.currentAnalysis) {
        showToast('No analysis data to copy', 'error');
        return;
    }
    
    try {
        // Format analysis for copying (as text format)
        const exportResult = exportAnalysis(UIState.currentAnalysis, 'txt');
        
        // Copy to clipboard
        await navigator.clipboard.writeText(exportResult.data);
        
        showToast(CONFIG.messages.success.resultsCopied, 'success');
        
    } catch (error) {
        console.error('Copy failed:', error);
        
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            const exportResult = exportAnalysis(UIState.currentAnalysis, 'txt');
            textArea.value = exportResult.data;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            showToast(CONFIG.messages.success.resultsCopied, 'success');
        } catch (fallbackError) {
            showToast(CONFIG.messages.errors.copyError, 'error');
        }
    }
};

// Progress bar management using arrow functions
const showProgressBar = () => {
    return new Promise(resolve => {
        Utils.dom.setAttr(UIState.elements.progressContainer, 'aria-hidden', 'false');
        Utils.dom.setAttr(UIState.elements.progressFill, 'aria-valuenow', '0');
        UIState.elements.progressFill.style.width = '0%';
        
        // Use setTimeout to ensure the element is visible before animating
        setTimeout(() => {
            resolve();
        }, 100);
    });
};

const hideProgressBar = () => {
    setTimeout(() => {
        Utils.dom.setAttr(UIState.elements.progressContainer, 'aria-hidden', 'true');
        UIState.elements.progressFill.style.width = '0%';
        Utils.dom.setAttr(UIState.elements.progressFill, 'aria-valuenow', '0');
    }, 500);
};

const updateProgress = (percentage, message) => {
    UIState.elements.progressFill.style.width = `${percentage}%`;
    Utils.dom.setAttr(UIState.elements.progressFill, 'aria-valuenow', percentage);
    Utils.dom.setText(UIState.elements.progressText, message);
};

// Perform analysis with progress updates using anonymous functions
const performAnalysisWithProgress = (text) => {
    return new Promise((resolve, reject) => {
        const steps = CONFIG.animations.progressSteps;
        let currentStep = 0;
        
        const runStep = () => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                updateProgress(step.progress, step.text);
                currentStep++;
                
                // Use anonymous function for setTimeout callback
                setTimeout(() => {
                    runStep();
                }, CONFIG.animations.delays.progressStep);
            } else {
                // Actual analysis happens after progress animation
                try {
                    const analysis = analyzeText(text);
                    updateProgress(100, 'Analysis complete!');
                    
                    // Small delay before resolving
                    setTimeout(() => {
                        resolve(analysis);
                    }, 200);
                } catch (error) {
                    reject(error);
                }
            }
        };
        
        runStep();
    });
};

// UI update functions using arrow functions
const updateAnalysisResults = (analysis) => {
    // Update statistics
    updateStatisticsPanel(analysis.statistics);
    
    // Update readability scores
    updateReadabilityPanel(analysis.readability);
    
    // Update grade level
    updateGradeLevelPanel(analysis.gradeLevel);
    
    // Update insights
    updateInsightsPanel(analysis.insights);
};

const updateStatisticsPanel = (statistics) => {
    Utils.dom.setText(UIState.elements.wordCount, Utils.format.number(statistics.words));
    Utils.dom.setText(UIState.elements.charCountResult, Utils.format.number(statistics.characters));
    Utils.dom.setText(UIState.elements.sentenceCount, Utils.format.number(statistics.sentences));
    Utils.dom.setText(UIState.elements.paragraphCount, Utils.format.number(statistics.paragraphs));
    Utils.dom.setText(UIState.elements.avgWordsPerSentence, statistics.averageWordsPerSentence);
    Utils.dom.setText(UIState.elements.avgSyllablesPerWord, statistics.averageSyllablesPerWord);
};

const updateReadabilityPanel = (readability) => {
    // Flesch Reading Ease
    const fleschScore = readability.fleschReadingEase.score;
    const fleschLevel = readability.fleschReadingEase.level;
    
    Utils.dom.setText(UIState.elements.fleschScore, fleschScore);
    Utils.dom.setAttr(UIState.elements.fleschScore, 'data-score', fleschScore);
    Utils.dom.setText(UIState.elements.fleschInterpretation, readability.fleschReadingEase.interpretation);
    
    // Animate progress bar
    Utils.animation.animateProgress(UIState.elements.fleschBar, readability.fleschReadingEase.percentage);
    Utils.dom.setAttr(UIState.elements.fleschBar, 'data-level', fleschLevel);
    
    // Flesch-Kincaid Grade
    const fkGrade = readability.fleschKincaidGrade.score;
    const fkLevel = readability.fleschKincaidGrade.level;
    
    Utils.dom.setText(UIState.elements.fkGrade, fkGrade);
    Utils.dom.setAttr(UIState.elements.fkGrade, 'data-score', fkGrade);
    Utils.dom.setText(UIState.elements.fkInterpretation, readability.fleschKincaidGrade.interpretation);
    
    // Animate progress bar
    Utils.animation.animateProgress(UIState.elements.fkBar, readability.fleschKincaidGrade.percentage);
    Utils.dom.setAttr(UIState.elements.fkBar, 'data-level', fkLevel);
};

const updateGradeLevelPanel = (gradeLevel) => {
    const grade = gradeLevel.overall.grade;
    const level = gradeLevel.overall.level;
    const description = gradeLevel.overall.description;
    
    // Update grade display
    const gradeDisplay = UIState.elements.gradeLevel;
    const gradeNumber = gradeDisplay.querySelector('.grade-number');
    const gradeLabel = gradeDisplay.querySelector('.grade-label');
    
    if (gradeNumber && gradeLabel) {
        Utils.dom.setText(gradeNumber, grade);
        Utils.dom.setText(gradeLabel, Utils.format.capitalize(level));
    }
    
    Utils.dom.setAttr(gradeDisplay, 'data-level', level);
    Utils.dom.setText(UIState.elements.gradeExplanation, description);
    
    // Update reading times
    if (gradeLevel.readingTime) {
        Utils.dom.setText(UIState.elements.readingTimeSlow, gradeLevel.readingTime.slow.total);
        Utils.dom.setText(UIState.elements.readingTimeAvg, gradeLevel.readingTime.average.total);
        Utils.dom.setText(UIState.elements.readingTimeFast, gradeLevel.readingTime.fast.total);
    }
};

const updateInsightsPanel = (insights) => {
    const container = UIState.elements.insightsContent;
    
    if (!insights || (!insights.strengths.length && !insights.improvements.length)) {
        Utils.dom.setHTML(container, '<p class="no-insights">No specific insights available for this text.</p>');
        return;
    }
    
    let html = `<div class="overall-assessment"><p><strong>Overall Assessment:</strong> ${insights.overallAssessment}</p></div>`;
    
    if (insights.strengths.length > 0) {
        html += '<div class="insights-section strengths">';
        html += '<h4 class="insights-title">✅ Strengths</h4>';
        html += '<ul class="insights-list">';
        insights.strengths.forEach(strength => {
            html += `<li>${strength}</li>`;
        });
        html += '</ul></div>';
    }
    
    if (insights.improvements.length > 0) {
        html += '<div class="insights-section improvements">';
        html += '<h4 class="insights-title">⚠️ Areas for Improvement</h4>';
        html += '<ul class="insights-list">';
        insights.improvements.forEach(improvement => {
            html += `<li>${improvement}</li>`;
        });
        html += '</ul></div>';
    }
    
    if (insights.recommendations.length > 0) {
        html += '<div class="insights-section recommendations">';
        html += '<h4 class="insights-title">💡 Recommendations</h4>';
        html += '<ul class="insights-list">';
        insights.recommendations.forEach(recommendation => {
            html += `<li>${recommendation}</li>`;
        });
        html += '</ul></div>';
    }
    
    Utils.dom.setHTML(container, html);
};

const resetAnalysisResults = () => {
    // Reset statistics
    const statsElements = [
        UIState.elements.wordCount,
        UIState.elements.charCountResult,
        UIState.elements.sentenceCount,
        UIState.elements.paragraphCount,
        UIState.elements.avgWordsPerSentence,
        UIState.elements.avgSyllablesPerWord
    ];
    
    statsElements.forEach(element => {
        if (element) Utils.dom.setText(element, '0');
    });
    
    // Reset readability
    Utils.dom.setText(UIState.elements.fleschScore, '0');
    Utils.dom.setText(UIState.elements.fkGrade, '0');
    Utils.dom.setText(UIState.elements.fleschInterpretation, 'No analysis yet');
    Utils.dom.setText(UIState.elements.fkInterpretation, 'No analysis yet');
    
    // Reset progress bars
    UIState.elements.fleschBar.style.width = '0%';
    UIState.elements.fkBar.style.width = '0%';
    
    // Reset grade level
    const gradeNumber = UIState.elements.gradeLevel.querySelector('.grade-number');
    const gradeLabel = UIState.elements.gradeLevel.querySelector('.grade-label');
    if (gradeNumber) Utils.dom.setText(gradeNumber, '-');
    if (gradeLabel) Utils.dom.setText(gradeLabel, 'No Analysis');
    
    Utils.dom.setAttr(UIState.elements.gradeLevel, 'data-level', 'none');
    Utils.dom.setText(UIState.elements.gradeExplanation, 'Enter text to see grade level analysis');
    
    // Reset reading times
    const readingTimeElements = [
        UIState.elements.readingTimeSlow,
        UIState.elements.readingTimeAvg,
        UIState.elements.readingTimeFast
    ];
    
    readingTimeElements.forEach(element => {
        if (element) Utils.dom.setText(element, '0 min');
    });
    
    // Reset insights
    Utils.dom.setHTML(UIState.elements.insightsContent, '<p class="no-insights">Analyze text to see insights and recommendations</p>');
};

// Button state management using arrow functions
const updateButtonStates = (isAnalyzing, hasResults = false) => {
    UIState.elements.analyzeBtn.disabled = isAnalyzing;
    UIState.elements.clearBtn.disabled = isAnalyzing;
    UIState.elements.exportBtn.disabled = isAnalyzing || !hasResults;
    UIState.elements.copyBtn.disabled = isAnalyzing || !hasResults;
    
    // Update button text when analyzing
    if (isAnalyzing) {
        const originalText = UIState.elements.analyzeBtn.textContent;
        UIState.elements.analyzeBtn.innerHTML = '<span class="btn-icon">⏳</span>Analyzing...';
        
        // Store original text to restore later
        UIState.elements.analyzeBtn.dataset.originalText = originalText;
    } else if (UIState.elements.analyzeBtn.dataset.originalText) {
        UIState.elements.analyzeBtn.innerHTML = '<span class="btn-icon">🔍</span>Analyze Text';
        delete UIState.elements.analyzeBtn.dataset.originalText;
    }
};

// Toast notification system using arrow functions
const showToast = (message, type = 'info', duration = CONFIG.animations.delays.toastDuration) => {
    const toast = Utils.dom.create('div', {
        class: `toast toast-${type}`,
        role: 'alert'
    }, message);
    
    UIState.elements.toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        Utils.dom.addClass(toast, 'show');
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        Utils.dom.removeClass(toast, 'show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, CONFIG.animations.delays.fadeOut);
    }, duration);
};

// Event listener setup using arrow functions
const setupEventListeners = () => {
    // Input event with debouncing
    if (UIState.elements.textInput) {
        const cleanup1 = EventUtils.on(UIState.elements.textInput, 'input', handleTextInput);
        UIState.eventCleanupFunctions.push(cleanup1);
    }
    
    // Button click events
    if (UIState.elements.analyzeBtn) {
        const cleanup2 = EventUtils.on(UIState.elements.analyzeBtn, 'click', handleAnalyzeClick);
        UIState.eventCleanupFunctions.push(cleanup2);
    }
    
    if (UIState.elements.clearBtn) {
        const cleanup3 = EventUtils.on(UIState.elements.clearBtn, 'click', handleClearClick);
        UIState.eventCleanupFunctions.push(cleanup3);
    }
    
    if (UIState.elements.exportBtn) {
        const cleanup4 = EventUtils.on(UIState.elements.exportBtn, 'click', handleExportClick);
        UIState.eventCleanupFunctions.push(cleanup4);
    }
    
    if (UIState.elements.copyBtn) {
        const cleanup5 = EventUtils.on(UIState.elements.copyBtn, 'click', handleCopyClick);
        UIState.eventCleanupFunctions.push(cleanup5);
    }
    
    // Keyboard shortcuts
    const handleKeyboard = (event) => {
        // Ctrl/Cmd + Enter to analyze
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            if (!UIState.elements.analyzeBtn.disabled) {
                handleAnalyzeClick();
            }
        }
        
        // Ctrl/Cmd + Delete to clear
        if ((event.ctrlKey || event.metaKey) && event.key === 'Delete') {
            event.preventDefault();
            handleClearClick();
        }
    };
    
    const cleanup6 = EventUtils.on(document, 'keydown', handleKeyboard);
    UIState.eventCleanupFunctions.push(cleanup6);
};

// Cleanup function
const cleanup = () => {
    UIState.eventCleanupFunctions.forEach(cleanupFn => {
        if (typeof cleanupFn === 'function') {
            cleanupFn();
        }
    });
    UIState.eventCleanupFunctions = [];
};

// Initialize UI using arrow function
const initializeUI = () => {
    initializeElements();
    setupEventListeners();
    
    // Set initial state
    UIState.elements.analyzeBtn.disabled = true;
    UIState.elements.exportBtn.disabled = true;
    UIState.elements.copyBtn.disabled = true;
    
    // Focus on text input
    if (UIState.elements.textInput) {
        UIState.elements.textInput.focus();
    }
    
    console.log('Text Analyzer UI initialized successfully');
};

// Make UI functions available globally
window.UIState = UIState;
window.initializeUI = initializeUI;
window.showToast = showToast;
window.updateAnalysisResults = updateAnalysisResults;
window.resetAnalysisResults = resetAnalysisResults;
window.cleanup = cleanup;