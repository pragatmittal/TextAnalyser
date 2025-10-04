/**
 * Main Application Module
 * Initializes and coordinates all components of the Text Analyzer application
 * Uses function expressions and arrow functions for initialization
 */

// Main application object using object literal
const TextAnalyzerApp = {
    
    // Application state
    isInitialized: false,
    components: {},
    
    /**
     * Initialize all application components using function expression
     */
    initialize: function() {
        console.log('Initializing Text Analyzer Application...');
        
        try {
            // Initialize components in dependency order
            this.initializeComponents();
            
            // Set up global error handling
            this.setupErrorHandling();
            
            // Set up keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('Text Analyzer Application initialized successfully');
            utils.showMessage('Application ready! Start typing to analyze your text.', 'success', 3000);
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            utils.showMessage('Failed to initialize application. Please refresh the page.', 'error', 5000);
        }
    },
    
    /**
     * Initialize all components using arrow function
     */
    initializeComponents: () => {
        // Initialize UI components
        if (window.ui && typeof window.ui.initialize === 'function') {
            window.ui.initialize();
            TextAnalyzerApp.components.ui = window.ui;
        }
        
        // Initialize input processor
        if (window.inputProcessor && typeof window.inputProcessor.initialize === 'function') {
            window.inputProcessor.initialize();
            TextAnalyzerApp.components.inputProcessor = window.inputProcessor;
        }
        
        // Initialize debounced analyzer
        if (window.debouncedAnalyzer && typeof window.debouncedAnalyzer.initialize === 'function') {
            window.debouncedAnalyzer.initialize();
            TextAnalyzerApp.components.debouncedAnalyzer = window.debouncedAnalyzer;
        }
        
        // Initialize main analyzer
        if (window.analyzer && typeof window.analyzer.initialize === 'function') {
            window.analyzer.initialize();
            TextAnalyzerApp.components.analyzer = window.analyzer;
        }
    },
    
    /**
     * Set up global error handling using function expression
     */
    setupErrorHandling: function() {
        // Global error handler
        window.addEventListener('error', function(event) {
            console.error('Global error:', event.error);
            utils.showMessage('An unexpected error occurred. Please try again.', 'error', 4000);
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled promise rejection:', event.reason);
            utils.showMessage('An error occurred while processing. Please try again.', 'error', 4000);
            event.preventDefault();
        });
    },
    
    /**
     * Set up keyboard shortcuts using arrow function
     */
    setupKeyboardShortcuts: () => {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + Enter: Force analysis
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                if (TextAnalyzerApp.components.debouncedAnalyzer) {
                    TextAnalyzerApp.components.debouncedAnalyzer.handleAnalyzeClick();
                }
            }
            
            // Ctrl/Cmd + K: Clear text
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                if (TextAnalyzerApp.components.inputProcessor) {
                    TextAnalyzerApp.components.inputProcessor.handleClearClick();
                }
            }
            
            // Ctrl/Cmd + C: Copy results (when not in input field)
            if ((event.ctrlKey || event.metaKey) && event.key === 'c' && 
                event.target.tagName !== 'TEXTAREA' && event.target.tagName !== 'INPUT') {
                event.preventDefault();
                if (TextAnalyzerApp.components.ui) {
                    TextAnalyzerApp.components.ui.copyResults();
                }
            }
        });
    },
    
    /**
     * Get application status using arrow function
     * @returns {object} Application status information
     */
    getStatus: () => {
        return {
            isInitialized: TextAnalyzerApp.isInitialized,
            componentsLoaded: Object.keys(TextAnalyzerApp.components),
            timestamp: new Date().toISOString()
        };
    },
    
    /**
     * Reset application to initial state using function expression
     */
    reset: function() {
        console.log('Resetting Text Analyzer Application...');
        
        // Clear all component states
        if (this.components.ui) {
            this.components.ui.clearResults();
        }
        
        if (this.components.analyzer) {
            this.components.analyzer.clearHistory();
        }
        
        // Clear text input
        const textInput = document.getElementById('text-input');
        if (textInput) {
            textInput.value = '';
            textInput.focus();
        }
        
        utils.showMessage('Application reset successfully', 'success', 2000);
    },
    
    /**
     * Handle application errors using function expression
     * @param {Error} error - Error object
     * @param {string} context - Context where error occurred
     */
    handleError: function(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        
        const errorMessage = `Error in ${context}: ${error.message}`;
        utils.showMessage(errorMessage, 'error', 4000);
    }
};

// Application startup using anonymous function
(function() {
    'use strict';
    
    // Wait for DOM to be ready
    const initializeApp = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
            return;
        }
        
        // Initialize the application
        TextAnalyzerApp.initialize();
    };
    
    // Start initialization
    initializeApp();
    
    // Make app globally available for debugging
    window.TextAnalyzerApp = TextAnalyzerApp;
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextAnalyzerApp;
}
