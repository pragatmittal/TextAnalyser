
const debouncedAnalyzer = (function() {
    'use strict';
    
    let isAnalyzing = false;
    let analysisQueue = [];
    let lastAnalysisTime = 0;
    let currentAnalysisId = null;
    
    /**
     * Main analysis function using function expression
     * @param {string} text - Text to analyze
     * @param {string} analysisId - Unique identifier for this analysis
     */
    const performAnalysis = function(text, analysisId) {
        // Check if this analysis is still relevant
        if (analysisId !== currentAnalysisId) {
            return; // Skip outdated analysis
        }
        
        isAnalyzing = true;
        showLoadingState();
        
        try {
            const results = statisticsEngine.getComprehensiveStatistics(text);
            
            if (analysisId === currentAnalysisId && window.ui) {
                window.ui.updateResults(results);
                hideLoadingState();
                utils.showMessage('Analysis completed successfully', 'success', 2000);
            }
        } catch (error) {
            console.error('Analysis error:', error);
            if (analysisId === currentAnalysisId) {
                hideLoadingState();
                utils.showMessage('Analysis failed. Please try again.', 'error', 3000);
            }
        } finally {
            if (analysisId === currentAnalysisId) {
                isAnalyzing = false;
            }
        }
    };
    
    /**
     * Debounced analysis function using function expression
     */
    const debouncedAnalysis = utils.debounce(function(text, analysisId) {
        if (analysisId === currentAnalysisId) {
            performAnalysis(text, analysisId);
        }
    }, config.processing.debounceDelay);
    
    /**
     * Show loading state using arrow function
     */
    const showLoadingState = () => {
        const loadingOverlay = document.getElementById('loading-overlay');
        const statusElement = document.getElementById('analysis-status');
        
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
            loadingOverlay.setAttribute('aria-hidden', 'false');
        }
        
        if (statusElement) {
            statusElement.textContent = 'Analyzing text...';
            statusElement.style.color = 'blue';
        }
    };
    
    /**
     * Hide loading state using arrow function
     */
    const hideLoadingState = () => {
        const loadingOverlay = document.getElementById('loading-overlay');
        const statusElement = document.getElementById('analysis-status');
        
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
            loadingOverlay.setAttribute('aria-hidden', 'true');
        }
        
        if (statusElement) {
            statusElement.textContent = 'Analysis complete';
            statusElement.style.color = 'green';
        }
    };
    
    /**
     * Generate unique analysis ID
     * @returns {string} Unique identifier
     */
    const generateAnalysisId = function() {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    
    /**
     * Analyze text with debouncing and queue management
     * @param {string} text - Text to analyze
     * @returns {Promise} Promise that resolves when analysis is complete
     */
    const analyzeText = function(text) {
        return new Promise((resolve, reject) => {
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                reject(new Error('Invalid or empty text input'));
                return;
            }
            
            const analysisId = generateAnalysisId();
            currentAnalysisId = analysisId;
            
            analysisQueue = [];
            
            analysisQueue.push({ text, analysisId, resolve, reject });
            
            debouncedAnalysis(text, analysisId);
            
            setTimeout(() => {
                if (analysisId === currentAnalysisId && isAnalyzing) {
                    currentAnalysisId = null;
                    reject(new Error('Analysis timeout'));
                }
            }, 10000); // 10 second timeout
        });
    };
    
    /**
     * Force immediate analysis (bypasses debouncing)
     * @param {string} text - Text to analyze
     */
    const forceAnalysis = function(text) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            console.warn('Cannot analyze empty text');
            return;
        }
        
        const analysisId = generateAnalysisId();
        currentAnalysisId = analysisId;
        
        analysisQueue = [];
        
        performAnalysis(text, analysisId);
    };
    
    /**
     * Cancel current analysis
     */
    const cancelAnalysis = function() {
        currentAnalysisId = null;
        analysisQueue = [];
        isAnalyzing = false;
        hideLoadingState();
        
        const statusElement = document.getElementById('analysis-status');
        if (statusElement) {
            statusElement.textContent = 'Analysis cancelled';
            statusElement.style.color = 'orange';
        }
    };
    
    /**
     * Check if analysis is currently running
     * @returns {boolean} True if analysis is in progress
     */
    const isAnalysisRunning = function() {
        return isAnalyzing;
    };
    
    /**
     * Get analysis statistics
     * @returns {object} Analysis performance statistics
     */
    const getAnalysisStats = function() {
        return {
            isAnalyzing,
            queueLength: analysisQueue.length,
            lastAnalysisTime,
            currentAnalysisId
        };
    };
    
    /**
     * Handle analyze button click using function expression
     */
    const handleAnalyzeClick = function() {
        const textInput = document.getElementById('text-input');
        if (!textInput) return;
        
        const text = textInput.value.trim();
        if (text.length === 0) {
            utils.showMessage('Please enter some text to analyze', 'warning', 3000);
            return;
        }
        
        forceAnalysis(text);
    };
    
    /**
     * Initialize the debounced analyzer
     */
    const initialize = function() {
        const analyzeBtn = document.getElementById('analyze-btn');
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', handleAnalyzeClick);
        }
        
        console.log('Debounced analyzer initialized');
    };
    
    return {
        analyzeText,
        forceAnalysis,
        cancelAnalysis,
        isAnalysisRunning,
        getAnalysisStats,
        handleAnalyzeClick,
        initialize
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = debouncedAnalyzer;
} else if (typeof window !== 'undefined') {
    window.debouncedAnalyzer = debouncedAnalyzer;
}
