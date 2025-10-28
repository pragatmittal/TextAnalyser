
const TextAnalyzerApp = {
    
    isInitialized: false,
    components: {},
    preferences: null,
    cache: null,
    
 
    initialize: function() {
        console.log('Initializing Text Analyzer Application...');
        
        try {
            this.initializeStorage();
            
            this.initializeComponents();
            
            this.initializeAdvancedFeatures();
            
            this.setupErrorHandling();
            
            this.setupKeyboardShortcuts();
            
            this.loadPreferences();
            
            this.isInitialized = true;
            
            console.log('Text Analyzer Application initialized successfully');
            console.log('API Status:', TextAnalyzerAPI.getStatus());
            
            UIUpdater.showToast('Application ready! Start typing to analyze your text.', 'success', 3000);
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            UIUpdater.showToast('Failed to initialize application. Please refresh the page.', 'error', 5000);
        }
    },
    
    
    initializeStorage: function() {
        this.preferences = new PreferencesManager();
        this.cache = new CacheManager();
        
        console.log(' Storage systems initialized');
    },
    
    initializeComponents: () => {
        if (window.ui && typeof window.ui.initialize === 'function') {
            window.ui.initialize();
            TextAnalyzerApp.components.ui = window.ui;
        }
        
        if (window.inputProcessor && typeof window.inputProcessor.initialize === 'function') {
            window.inputProcessor.initialize();
            TextAnalyzerApp.components.inputProcessor = window.inputProcessor;
        }
        
        if (window.debouncedAnalyzer && typeof window.debouncedAnalyzer.initialize === 'function') {
            window.debouncedAnalyzer.initialize();
            TextAnalyzerApp.components.debouncedAnalyzer = window.debouncedAnalyzer;
        }
        
        if (window.analyzer && typeof window.analyzer.initialize === 'function') {
            window.analyzer.initialize();
            TextAnalyzerApp.components.analyzer = window.analyzer;
        }
        
        console.log(' Core components initialized');
    },
    
   
    initializeAdvancedFeatures: function() {
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAnalysis());
        }
        
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }
        
        console.log(' Advanced features initialized');
    },
    
   
    loadPreferences: function() {
        const prefs = this.preferences.getAllPreferences();
        
        if (prefs.theme) {
            document.body.setAttribute('data-theme', prefs.theme);
        }
        
        if (prefs.fontSize) {
            document.documentElement.style.setProperty('--base-font-size', `${prefs.fontSize}px`);
        }
        
        console.log(' User preferences loaded:', prefs);
    },
    
   
    exportAnalysis: async function() {
        const textarea = document.getElementById('text-input');
        if (!textarea || !textarea.value.trim()) {
            UIUpdater.showToast('No text to analyze', 'warning', 2000);
            return;
        }
        
        try {
            const analysis = TextAnalyzerAPI.analyze(textarea.value);
            
            const exporter = new ExportManager({ format: 'json', prettify: true });
            
            const jsonData = exporter.toJSON(analysis);
            
            const filename = `text-analysis-${Date.now()}.json`;
            exporter.downloadFile(jsonData, filename, 'application/json');
            
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
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = settingsHTML;
        document.body.appendChild(modalContainer);
        
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
            modalContainer.remove();
        });
        
        document.getElementById('cancel-settings-btn').addEventListener('click', () => {
            modalContainer.remove();
        });
    },
    
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

(function() {
    'use strict';
    
    const initializeApp = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
            return;
        }
        
        TextAnalyzerApp.initialize();
    };
    
    initializeApp();
    
    window.TextAnalyzerApp = TextAnalyzerApp;
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextAnalyzerApp;
}
