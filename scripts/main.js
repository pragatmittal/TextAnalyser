/**
 * Advanced Text Analyzer - Main Application File
 * Application initialization using IIFE (Immediately Invoked Function Expression)
 */

// Self-invoking function for initialization using IIFE
(function() {
    'use strict';
    
    // Application state using object literal
    const App = {
        version: '1.0.0',
        isInitialized: false,
        startTime: null,
        features: {
            analytics: true,
            persistence: true,
            shortcuts: true,
            animations: true
        },
        stats: {
            sessionsTotal: 0,
            analysesPerformed: 0,
            totalWordsAnalyzed: 0,
            averageAnalysisTime: 0
        }
    };
    
    // Initialization sequence using function expression
    const initializeApp = function() {
        console.log('🚀 Starting Advanced Text Analyzer...');
        App.startTime = performance.now();
        
        try {
            // Check browser compatibility
            if (!checkBrowserCompatibility()) {
                showCompatibilityWarning();
                return;
            }
            
            // Load user preferences
            loadUserPreferences();
            
            // Initialize UI components
            initializeUI();
            
            // Initialize advanced input processing modules
            initializeInputProcessingModules();
            
            // Setup analytics if enabled
            if (App.features.analytics) {
                initializeAnalytics();
            }
            
            // Load session data
            if (App.features.persistence) {
                loadSessionData();
            }
            
            // Setup keyboard shortcuts
            if (App.features.shortcuts) {
                setupGlobalShortcuts();
            }
            
            // Initialize performance monitoring
            setupPerformanceMonitoring();
            
            // Mark as initialized
            App.isInitialized = true;
            
            const initTime = performance.now() - App.startTime;
            console.log(`✅ Application initialized successfully in ${initTime.toFixed(2)}ms`);
            
            // Show welcome message if first time
            if (isFirstTimeUser()) {
                showWelcomeMessage();
            }
            
            // Setup periodic tasks
            setupPeriodicTasks();
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            ErrorUtils.logError(error, { context: 'app_initialization' });
            showInitializationError(error);
        }
    };
    
    // Browser compatibility check using arrow function
    const checkBrowserCompatibility = () => {
        const requiredFeatures = [
            'localStorage',
            'Promise',
            'fetch',
            'addEventListener',
            'querySelector',
            'classList'
        ];
        
        return requiredFeatures.every(feature => {
            const hasFeature = feature in window || 
                              (feature === 'classList' && 'classList' in document.createElement('div')) ||
                              (feature === 'querySelector' && 'querySelector' in document);
            
            if (!hasFeature) {
                console.warn(`Missing required feature: ${feature}`);
            }
            
            return hasFeature;
        });
    };
    
    // User preferences management using function expression
    const loadUserPreferences = function() {
        const defaultPreferences = {
            theme: 'light',
            autoSave: true,
            showAnimations: true,
            defaultAnalysisTemplate: 'default',
            keyboardShortcuts: true,
            notifications: true,
            analyticsEnabled: true
        };
        
        const savedPreferences = Utils.storage.load('userPreferences', defaultPreferences);
        
        // Apply preferences
        Object.assign(App.features, {
            animations: savedPreferences.showAnimations,
            shortcuts: savedPreferences.keyboardShortcuts,
            analytics: savedPreferences.analyticsEnabled
        });
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', savedPreferences.theme);
        
        console.log('📋 User preferences loaded:', savedPreferences);
    };
    
    // Advanced input processing modules initialization using function expression
    const initializeInputProcessingModules = function() {
        console.log('🔧 Initializing Advanced Input Processing System...');
        
        try {
            // Check TextPreprocessor module availability
            if (typeof TextPreprocessor !== 'undefined') {
                console.log('✅ TextPreprocessor module loaded and ready');
            } else {
                console.warn('⚠️ TextPreprocessor module not found');
            }
            
            // Check DebouncedAnalyzer module availability
            if (typeof DebouncedAnalyzer !== 'undefined') {
                console.log('✅ DebouncedAnalyzer module loaded and ready');
            } else {
                console.warn('⚠️ DebouncedAnalyzer module not found');
            }
            
            // Initialize InputProcessor module (should be last as it may depend on others)
            if (typeof InputProcessor !== 'undefined') {
                // InputProcessor auto-initializes, but we can call init again safely
                InputProcessor.init();
                console.log('✅ InputProcessor module initialized');
                
                // Setup event listeners for the main text input
                setupAdvancedInputHandling();
            } else {
                console.warn('⚠️ InputProcessor module not found');
            }
            
            console.log('🚀 Advanced Input Processing System fully initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize input processing modules:', error);
            ErrorUtils.logError(error, { context: 'input_processing_initialization' });
        }
    };
    
    // Setup advanced input handling using arrow function
    const setupAdvancedInputHandling = () => {
        const textInput = document.getElementById('text-input');
        const analyzeBtn = document.getElementById('analyze-btn');
        
        if (!textInput) {
            console.warn('⚠️ Text input element not found');
            return;
        }
        
        // Create a debounced analyzer function using the DebouncedAnalyzer module
        const debouncedAnalyzer = DebouncedAnalyzer.createDebounce((text, metadata) => {
            // Process text through the TextPreprocessor pipeline
            const preprocessedText = TextPreprocessor.process(text);
            
            // Validate input using InputProcessor
            const validationResult = InputProcessor.validateInput(preprocessedText);
            
            // Extract text properties using InputProcessor
            const properties = InputProcessor.extractProperties(preprocessedText);
            
            // Update UI with processed text information
            updateInputMetadata({
                wordCount: properties.words.count,
                charCount: properties.characters.total,
                isValid: validationResult.isValid,
                estimatedReadingTime: Math.ceil(properties.words.count / 250), // ~250 words per minute
                validationErrors: validationResult.errors
            });
            
            // Enable/disable analyze button based on validation
            if (analyzeBtn) {
                analyzeBtn.disabled = !validationResult.isValid;
            }
            
            // Auto-save if feature is enabled
            if (App.features.persistence && validationResult.isValid) {
                saveSessionData();
            }
            
        }, 500, {
            maxDelay: 2000,
            loadFactor: true
        });
        
        // Add input event listener with debounced processing
        textInput.addEventListener('input', (event) => {
            const text = event.target.value;
            
            // Call debounced analyzer with current text
            debouncedAnalyzer(text, {
                timestamp: Date.now(),
                element: event.target
            });
        });
        
        // Add paste event handling
        textInput.addEventListener('paste', (event) => {
            setTimeout(() => {
                // Process pasted content after paste completes
                const text = event.target.value;
                if (text.length > 5000) {
                    console.log('📋 Large paste detected, optimizing processing');
                    if (window.showToast) {
                        showToast('Processing large text...', 'info', 1000);
                    }
                }
                debouncedAnalyzer(text, {
                    timestamp: Date.now(),
                    element: event.target,
                    isPaste: true
                });
            }, 100);
        });
        
        console.log('🎯 Advanced input handling setup complete');
    };
    
    // Update input metadata display using arrow function
    const updateInputMetadata = (metadata) => {
        const { wordCount, charCount, isValid, estimatedReadingTime, validationErrors } = metadata;
        
        // Update character count display
        const charCountElement = document.getElementById('char-count');
        if (charCountElement) {
            const maxChars = CONFIG.validation.maxCharacters;
            charCountElement.textContent = `${charCount} / ${maxChars.toLocaleString()} characters`;
            charCountElement.classList.toggle('near-limit', charCount > maxChars * 0.9);
            charCountElement.classList.toggle('over-limit', charCount > maxChars);
        }
        
        // Update word count if element exists
        const wordCountElement = document.getElementById('word-count');
        if (wordCountElement) {
            wordCountElement.textContent = `${wordCount.toLocaleString()} words`;
        }
        
        // Update reading time if element exists
        const readingTimeElement = document.getElementById('reading-time');
        if (readingTimeElement && estimatedReadingTime) {
            readingTimeElement.textContent = `~${estimatedReadingTime} min read`;
        }
    };
    
    // Update validation UI using arrow function
    const updateValidationUI = (isValid, errors) => {
        const inputWrapper = document.querySelector('.input-wrapper');
        const textInput = document.getElementById('text-input');
        
        if (!inputWrapper || !textInput) return;
        
        // Apply validation classes
        inputWrapper.classList.toggle('valid', isValid);
        inputWrapper.classList.toggle('invalid', !isValid);
        textInput.classList.toggle('valid', isValid);
        textInput.classList.toggle('invalid', !isValid);
        
        // Show/hide validation errors
        let errorContainer = document.getElementById('validation-errors');
        
        if (errors && errors.length > 0) {
            if (!errorContainer) {
                errorContainer = document.createElement('div');
                errorContainer.id = 'validation-errors';
                errorContainer.className = 'validation-errors';
                inputWrapper.appendChild(errorContainer);
            }
            
            errorContainer.innerHTML = errors.map(error => 
                `<span class="validation-error">${error}</span>`
            ).join('');
            errorContainer.style.display = 'block';
        } else if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    };
    
    // Show input error using arrow function
    const showInputError = (message) => {
        // Create or update error notification
        const errorNotification = document.createElement('div');
        errorNotification.className = 'error-notification';
        errorNotification.innerHTML = `
            <span class="error-icon">⚠️</span>
            <span class="error-message">${message}</span>
            <button class="error-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        // Insert at the top of the main container
        const mainContainer = document.querySelector('.app-main .container');
        if (mainContainer) {
            mainContainer.insertBefore(errorNotification, mainContainer.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorNotification.parentElement) {
                    errorNotification.remove();
                }
            }, 5000);
        }
    };
    
    // Analytics initialization using arrow function
    const initializeAnalytics = () => {
        // Load previous session stats
        App.stats = Utils.storage.load('analyticsData', App.stats);
        App.stats.sessionsTotal++;
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                saveSessionData();
            }
        });
        
        // Track window beforeunload for session cleanup
        window.addEventListener('beforeunload', () => {
            saveSessionData();
        });
        
        console.log('📊 Analytics initialized. Session #', App.stats.sessionsTotal);
    };
    
    // Session data management using function expressions
    const loadSessionData = function() {
        const sessionData = Utils.storage.load('currentSession', null);
        
        if (sessionData && sessionData.timestamp) {
            const timeDiff = Date.now() - sessionData.timestamp;
            
            // If session is less than 1 hour old, restore it
            if (timeDiff < 3600000) { // 1 hour in milliseconds
                if (sessionData.textInput && Utils.dom.get('#text-input')) {
                    Utils.dom.get('#text-input').value = sessionData.textInput;
                    console.log('📱 Previous session restored');
                }
            } else {
                // Clear old session data
                Utils.storage.remove('currentSession');
            }
        }
    };
    
    const saveSessionData = function() {
        if (!App.features.persistence) return;
        
        const textInput = Utils.dom.get('#text-input');
        if (textInput && textInput.value.trim()) {
            const sessionData = {
                textInput: textInput.value,
                timestamp: Date.now(),
                version: App.version
            };
            
            Utils.storage.save('currentSession', sessionData);
        }
        
        // Save analytics data
        Utils.storage.save('analyticsData', App.stats);
    };
    
    // Global keyboard shortcuts using arrow function
    const setupGlobalShortcuts = () => {
        const shortcuts = {
            'F1': () => showHelpModal(),
            'F5': () => location.reload(),
            'Escape': () => {
                // Close any open modals or clear selection
                if (Utils.dom.get('#text-input')) {
                    Utils.dom.get('#text-input').blur();
                }
            }
        };
        
        document.addEventListener('keydown', (event) => {
            const key = event.key;
            
            if (shortcuts[key] && !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.preventDefault();
                shortcuts[key]();
            }
        });
        
        console.log('⌨️ Global keyboard shortcuts initialized');
    };
    
    // Performance monitoring using arrow functions
    const setupPerformanceMonitoring = () => {
        // Monitor memory usage if available
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                    console.warn('⚠️ High memory usage detected');
                }
            }, 30000); // Check every 30 seconds
        }
        
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.duration > 50) { // Tasks longer than 50ms
                            console.warn(`🐌 Long task detected: ${entry.duration}ms`);
                        }
                    });
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.log('Long task observer not supported');
            }
        }
    };
    
    // Periodic tasks setup using anonymous functions
    const setupPeriodicTasks = () => {
        // Auto-save every 30 seconds if there's content
        setInterval(() => {
            saveSessionData();
        }, 30000);
        
        // Cleanup old data every 5 minutes
        setInterval(() => {
            cleanupOldData();
        }, 300000);
        
        // Memory cleanup every 2 minutes
        setInterval(() => {
            if (typeof window.gc === 'function') {
                window.gc(); // Force garbage collection if available
            }
        }, 120000);
    };
    
    // Data cleanup using arrow function
    const cleanupOldData = () => {
        const keys = ['currentSession', 'analyticsData', 'userPreferences'];
        keys.forEach(key => {
            const data = Utils.storage.load(key, null);
            if (data && data.timestamp && (Date.now() - data.timestamp) > 7 * 24 * 60 * 60 * 1000) { // 7 days
                Utils.storage.remove(key);
                console.log(`🧹 Cleaned up old data: ${key}`);
            }
        });
    };
    
    // First time user check using function expression
    const isFirstTimeUser = function() {
        return !Utils.storage.load('hasVisited', false);
    };
    
    // UI feedback functions using arrow functions
    const showCompatibilityWarning = () => {
        const message = `
            <div style="padding: 20px; background: #f44336; color: white; text-align: center; font-family: Arial, sans-serif;">
                <h3>⚠️ Browser Compatibility Issue</h3>
                <p>Your browser doesn't support all features required by the Advanced Text Analyzer.</p>
                <p>Please update your browser or use a modern browser like Chrome, Firefox, or Safari.</p>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', message);
    };
    
    const showInitializationError = (error) => {
        const message = `
            <div style="padding: 20px; background: #ff9800; color: white; text-align: center; font-family: Arial, sans-serif;">
                <h3>🔧 Initialization Error</h3>
                <p>The application encountered an error during startup.</p>
                <p>Error: ${error.message}</p>
                <p>Please refresh the page or contact support if the problem persists.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px; background: white; color: #ff9800; border: none; cursor: pointer; border-radius: 4px;">
                    Refresh Page
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', message);
    };
    
    const showWelcomeMessage = () => {
        setTimeout(() => {
            if (window.showToast) {
                showToast('Welcome to Advanced Text Analyzer! 🎉 Paste your text and click Analyze to get started.', 'info', 5000);
            }
            Utils.storage.save('hasVisited', true);
        }, 1000);
    };
    
    const showHelpModal = () => {
        const helpContent = `
            <div style="max-width: 600px; padding: 20px;">
                <h2>📖 Advanced Text Analyzer - Help</h2>
                <h3>🚀 Getting Started</h3>
                <ul>
                    <li>Paste or type your text in the input area</li>
                    <li>Click "Analyze Text" or press Ctrl/Cmd + Enter</li>
                    <li>View your results in the panels below</li>
                </ul>
                
                <h3>⌨️ Keyboard Shortcuts</h3>
                <ul>
                    <li><strong>Ctrl/Cmd + Enter:</strong> Analyze text</li>
                    <li><strong>Ctrl/Cmd + Delete:</strong> Clear all</li>
                    <li><strong>F1:</strong> Show this help</li>
                    <li><strong>Esc:</strong> Clear focus</li>
                </ul>
                
                <h3>📊 Understanding Results</h3>
                <ul>
                    <li><strong>Flesch Reading Ease:</strong> Higher scores = easier to read (0-100)</li>
                    <li><strong>Flesch-Kincaid Grade:</strong> U.S. school grade level required</li>
                    <li><strong>Reading Time:</strong> Estimated time for different reading speeds</li>
                </ul>
                
                <p style="margin-top: 20px; padding: 10px; background: #e3f2fd; border-radius: 4px;">
                    <strong>💡 Tip:</strong> Aim for a Flesch score of 60+ and grade level of 8-12 for general audiences.
                </p>
            </div>
        `;
        
        // Simple modal implementation
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.7); z-index: 10000; display: flex; 
            align-items: center; justify-content: center; font-family: Arial, sans-serif;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white; border-radius: 8px; max-height: 80vh; overflow-y: auto;
            position: relative;
        `;
        modalContent.innerHTML = helpContent + `
            <button onclick="this.closest('[style*=\"fixed\"]').remove()" 
                    style="position: absolute; top: 10px; right: 15px; background: none; 
                           border: none; font-size: 24px; cursor: pointer;">×</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };
    
    // Enhanced analytics tracking using function expressions
    const trackAnalysis = function(analysisResult) {
        if (!App.features.analytics || !analysisResult) return;
        
        App.stats.analysesPerformed++;
        App.stats.totalWordsAnalyzed += analysisResult.statistics.words || 0;
        
        // Calculate average analysis time (simplified)
        const currentTime = performance.now();
        if (App.startTime) {
            const analysisTime = currentTime - App.startTime;
            App.stats.averageAnalysisTime = (App.stats.averageAnalysisTime + analysisTime) / 2;
        }
        
        // Log interesting statistics
        if (App.stats.analysesPerformed % 10 === 0) {
            console.log(`📈 Analytics: ${App.stats.analysesPerformed} analyses performed, ${App.stats.totalWordsAnalyzed} total words analyzed`);
        }
        
        saveSessionData();
    };
    
    // Error handling wrapper using arrow function
    const withErrorHandling = (fn, context = 'unknown') => {
        return function(...args) {
            try {
                return fn.apply(this, args);
            } catch (error) {
                ErrorUtils.logError(error, { context, args });
                
                if (window.showToast) {
                    showToast('An unexpected error occurred. Please try again.', 'error');
                }
                
                throw error;
            }
        };
    };
    
    // Development mode helpers (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.App = App;
        window.clearAllData = () => {
            Utils.storage.clear();
            location.reload();
        };
        window.showStats = () => {
            console.table(App.stats);
        };
        console.log('🔧 Development mode enabled. Available commands: clearAllData(), showStats()');
    }
    
    // Make tracking function globally available
    window.trackAnalysis = trackAnalysis;
    
    // DOM ready check and initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        // DOM is already loaded
        initializeApp();
    }
    
    console.log('📋 Main application script loaded');
    
})(); // IIFE end - Self-invoking function immediately executes

// Service Worker registration (if available) using anonymous function
(function() {
    if ('serviceWorker' in navigator && 'caches' in window) {
        window.addEventListener('load', function() {
            // Service worker could be added here for offline functionality
            console.log('🔧 Service Worker support available (not implemented yet)');
        });
    }
})();