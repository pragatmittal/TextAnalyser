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
    preferences: null,
    cache: null,
    
    /**
     * Initialize all application components using function expression
     */
    initialize: function() {
        console.log('Initializing Text Analyzer Application...');
        
        try {
            // Initialize storage systems (Day 9)
            this.initializeStorage();
            
            // Initialize components in dependency order
            this.initializeComponents();
            
            // Initialize advanced features (Day 11)
            this.initializeAdvancedFeatures();
            
            // Set up global error handling
            this.setupErrorHandling();
            
            // Set up keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Load user preferences
            this.loadPreferences();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('Text Analyzer Application initialized successfully');
            console.log('API Status:', TextAnalyzerAPI.getStatus());
            
            UIUpdater.showToast('Application ready! Start typing to analyze your text.', 'success', 3000);
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            UIUpdater.showToast('Failed to initialize application. Please refresh the page.', 'error', 5000);
        }
    },
    
    /**
     * Initialize storage systems
     */
    initializeStorage: function() {
        this.preferences = new PreferencesManager();
        this.cache = new CacheManager();
        
        console.log('✅ Storage systems initialized');
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
        
        console.log('✅ Core components initialized');
    },
    
    /**
     * Initialize advanced features
     */
    initializeAdvancedFeatures: function() {
        // Add export button functionality
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAnalysis());
        }
        
        // Add settings functionality
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }
        
        console.log('✅ Advanced features initialized');
    },
    
    /**
     * Load user preferences
     */
    loadPreferences: function() {
        const prefs = this.preferences.getAllPreferences();
        
        // Apply theme
        if (prefs.theme) {
            document.body.setAttribute('data-theme', prefs.theme);
        }
        
        // Apply font size
        if (prefs.fontSize) {
            document.documentElement.style.setProperty('--base-font-size', `${prefs.fontSize}px`);
        }
        
        console.log('✅ User preferences loaded:', prefs);
    },
    
    /**
     * Export current analysis
     */
    exportAnalysis: async function() {
        const textarea = document.getElementById('text-input');
        if (!textarea || !textarea.value.trim()) {
            UIUpdater.showToast('No text to analyze', 'warning', 2000);
            return;
        }
        
        try {
            // Get complete analysis
            const analysis = TextAnalyzerAPI.analyze(textarea.value);
            
            // Create exporter
            const exporter = new ExportManager({ format: 'json', prettify: true });
            
            // Export to JSON
            const jsonData = exporter.toJSON(analysis);
            
            // Download file
            const filename = `text-analysis-${Date.now()}.json`;
            exporter.downloadFile(jsonData, filename, 'application/json');
            
            // Also copy to clipboard
            const copied = await exporter.copyToClipboard(jsonData);
            
            if (copied) {
                UIUpdater.showToast('Analysis exported and copied to clipboard!', 'success', 3000);
            } else {
                UIUpdater.showToast('Analysis exported successfully!', 'success', 3000);
            }
            
        } catch (error) {
            console.error('Export failed:', error);
            UIUpdater.showToast('Failed to export analysis', 'error', 3000);
        }
    },
    
    /**
     * Show settings modal
     */
    showSettings: function() {
        const prefs = this.preferences.getAllPreferences();
        
        const settingsHTML = `
            <div class="modal" id="settings-modal">
                <div class="modal-content">
                    <h2>Settings</h2>
                    <div class="settings-group">
                        <label>Theme:</label>
                        <select id="theme-select">
                            <option value="light" ${prefs.theme === 'light' ? 'selected' : ''}>Light</option>
                            <option value="dark" ${prefs.theme === 'dark' ? 'selected' : ''}>Dark</option>
                        </select>
                    </div>
                    <div class="settings-group">
                        <label>Font Size:</label>
                        <input type="number" id="font-size-input" min="12" max="24" value="${prefs.fontSize}">
                    </div>
                    <div class="settings-group">
                        <label>
                            <input type="checkbox" id="auto-save-check" ${prefs.autoSave ? 'checked' : ''}>
                            Auto-save preferences
                        </label>
                    </div>
                    <div class="modal-actions">
                        <button id="save-settings-btn">Save</button>
                        <button id="cancel-settings-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = settingsHTML;
        document.body.appendChild(modalContainer);
        
        // Setup event listeners
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
            modalContainer.remove();
        });
        
        document.getElementById('cancel-settings-btn').addEventListener('click', () => {
            modalContainer.remove();
        });
    },
    
    /**
     * Save settings
     */
    saveSettings: function() {
        const theme = document.getElementById('theme-select').value;
        const fontSize = parseInt(document.getElementById('font-size-input').value);
        const autoSave = document.getElementById('auto-save-check').checked;
        
        this.preferences
            .setPreference('theme', theme)
            .setPreference('fontSize', fontSize)
            .setPreference('autoSave', autoSave);
        
        this.loadPreferences();
        UIUpdater.showToast('Settings saved!', 'success', 2000);
    },
    
    /**
     * Set up global error handling using function expression
     */
    setupErrorHandling: function() {
        // Global error handler
        window.addEventListener('error', function(event) {
            console.error('Global error:', event.error);
            UIUpdater.showToast('An unexpected error occurred. Please try again.', 'error', 4000);
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
