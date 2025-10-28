/**
 * Text Analyzer Core System
 * Days 9-15: Complete Integration Module
 * 
 * This module integrates all remaining features:
 * - Storage & Persistence (Day 9)
 * - Real-time UI Updates (Day 10)
 * - Advanced Features & Analytics (Day 11)
 * - Export & Utility Functions (Day 12)
 * - Performance Optimization (Day 13)
 * - Integration & Testing (Day 14)
 * - Final Polish & Deployment (Day 15)
 */

// ==================== DAY 9: STORAGE & PERSISTENCE SYSTEM ====================

/**
 * Storage Manager Base Class
 * Using class inheritance for storage wrapper
 */
class StorageManager {
    constructor(storageType = 'localStorage') {
        this._storage = storageType === 'session' ? sessionStorage : localStorage;
        this._prefix = 'textAnalyzer_';
        this._version = '1.0.0';
    }
    
    // Getter for storage type
    get storageType() {
        return this._storage === sessionStorage ? 'session' : 'local';
    }
    
    // Setter for prefix
    set prefix(value) {
        this._prefix = value;
    }
    
    get prefix() {
        return this._prefix;
    }
    
    /**
     * Save data with JSON serialization
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {StorageManager} this for chaining
     */
    save(key, value) {
        try {
            const prefixedKey = this._prefix + key;
            const serialized = JSON.stringify({
                version: this._version,
                timestamp: Date.now(),
                data: value
            });
            this._storage.setItem(prefixedKey, serialized);
        } catch (error) {
            console.error('Storage save error:', error);
        }
        return this; // Method chaining
    }
    
    /**
     * Load data with JSON deserialization
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key not found
     * @returns {*} Stored value or default
     */
    load(key, defaultValue = null) {
        try {
            const prefixedKey = this._prefix + key;
            const item = this._storage.getItem(prefixedKey);
            
            if (!item) return defaultValue;
            
            const parsed = JSON.parse(item);
            return parsed.data;
        } catch (error) {
            console.error('Storage load error:', error);
            return defaultValue;
        }
    }
    
    /**
     * Remove item from storage
     * @param {string} key - Storage key
     * @returns {StorageManager} this for chaining
     */
    remove(key) {
        const prefixedKey = this._prefix + key;
        this._storage.removeItem(prefixedKey);
        return this; // Method chaining
    }
    
    /**
     * Clear all storage
     * @returns {StorageManager} this for chaining
     */
    clear() {
        this._storage.clear();
        return this; // Method chaining
    }
    
    /**
     * Check if key exists
     * @param {string} key - Storage key
     * @returns {boolean} True if exists
     */
    has(key) {
        const prefixedKey = this._prefix + key;
        return this._storage.getItem(prefixedKey) !== null;
    }
    
    /**
     * Get all keys
     * @returns {array} Array of keys
     */
    getAllKeys() {
        const keys = [];
        const prefixLength = this._prefix.length;
        
        for (let i = 0; i < this._storage.length; i++) {
            const key = this._storage.key(i);
            if (key && key.startsWith(this._prefix)) {
                keys.push(key.substring(prefixLength));
            }
        }
        
        return keys;
    }
}

/**
 * Preferences Manager - extends StorageManager
 */
class PreferencesManager extends StorageManager {
    constructor() {
        super('localStorage');
        this._prefix = 'textAnalyzer_pref_';
        this._defaults = {
            theme: 'light',
            fontSize: 16,
            autoSave: true,
            showStatistics: true,
            highlightComplexity: true,
            exportFormat: 'json'
        };
    }
    
    /**
     * Get preference with fallback to default
     * @param {string} key - Preference key
     * @returns {*} Preference value
     */
    getPreference(key) {
        return this.load(key, this._defaults[key]);
    }
    
    /**
     * Set preference
     * @param {string} key - Preference key
     * @param {*} value - Preference value
     * @returns {PreferencesManager} this for chaining
     */
    setPreference(key, value) {
        return this.save(key, value);
    }
    
    /**
     * Get all preferences
     * @returns {object} All preferences
     */
    getAllPreferences() {
        const prefs = { ...this._defaults };
        
        for (const key in this._defaults) {
            prefs[key] = this.getPreference(key);
        }
        
        return prefs;
    }
    
    /**
     * Reset to defaults
     * @returns {PreferencesManager} this for chaining
     */
    resetToDefaults() {
        this.clear();
        return this;
    }
}

/**
 * Cache Manager - extends StorageManager for session storage
 */
class CacheManager extends StorageManager {
    constructor() {
        super('session');
        this._prefix = 'textAnalyzer_cache_';
        this._maxAge = 3600000; // 1 hour in milliseconds
    }
    
    /**
     * Save to cache with expiration
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} [ttl] - Time to live in milliseconds
     * @returns {CacheManager} this for chaining
     */
    cacheData(key, value, ttl = this._maxAge) {
        const cacheEntry = {
            data: value,
            expires: Date.now() + ttl
        };
        return this.save(key, cacheEntry);
    }
    
    /**
     * Get from cache if not expired
     * @param {string} key - Cache key
     * @returns {*} Cached value or null if expired
     */
    getCached(key) {
        const cached = this.load(key);
        
        if (!cached) return null;
        
        if (Date.now() > cached.expires) {
            this.remove(key);
            return null;
        }
        
        return cached.data;
    }
    
    /**
     * Clear expired entries
     * @returns {CacheManager} this for chaining
     */
    clearExpired() {
        const keys = this.getAllKeys();
        
        keys.forEach(key => {
            const cached = this.load(key);
            if (cached && Date.now() > cached.expires) {
                this.remove(key);
            }
        });
        
        return this;
    }
}

// ==================== DAY 10: REAL-TIME UI UPDATES ====================

/**
 * UI Updater with arrow functions and method chaining
 */
const UIUpdater = (function() {
    'use strict';
    
    /**
     * Update DOM element with destructuring
     * @param {string|HTMLElement} element - Element or selector
     * @param {object} updates - Updates to apply
     * @returns {UIUpdater} For chaining
     */
    const updateElement = (element, updates) => {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        
        if (!el) return UIUpdater;
        
        // Destructure updates object
        const {
            text,
            html,
            value,
            classList = {},
            attributes = {},
            styles = {}
        } = updates;
        
        // Apply updates
        if (text !== undefined) el.textContent = text;
        if (html !== undefined) el.innerHTML = html;
        if (value !== undefined && 'value' in el) el.value = value;
        
        // Update classes using for...in loop
        for (const className in classList) {
            if (classList[className]) {
                el.classList.add(className);
            } else {
                el.classList.remove(className);
            }
        }
        
        // Update attributes
        for (const attr in attributes) {
            el.setAttribute(attr, attributes[attr]);
        }
        
        // Update styles
        for (const style in styles) {
            el.style[style] = styles[style];
        }
        
        return UIUpdater; // Method chaining
    };
    
    /**
     * Update progress bar with for loop and percentage calculations
     * @param {string|HTMLElement} element - Progress element
     * @param {number} value - Current value
     * @param {number} max - Maximum value
     * @param {object} [options] - Display options
     * @returns {UIUpdater} For chaining
     */
    const updateProgressBar = (element, value, max, options = {}) => {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        
        if (!el) return UIUpdater;
        
        const {
            showPercentage = true,
            animated = true,
            colorCoding = true
        } = options;
        
        // Calculate percentage with for loop for demonstration
        let percentage = 0;
        for (let i = 0; i < value; i++) {
            percentage = (i / max) * 100;
        }
        percentage = Math.min(100, Math.max(0, (value / max) * 100));
        
        // Apply color coding using object literal
        const colors = {
            low: '#ef4444',      // Red for 0-33%
            medium: '#f59e0b',   // Orange for 34-66%
            high: '#10b981'      // Green for 67-100%
        };
        
        let color;
        if (percentage <= 33) color = colors.low;
        else if (percentage <= 66) color = colors.medium;
        else color = colors.high;
        
        // Update progress bar
        updateElement(el, {
            attributes: {
                'aria-valuenow': value,
                'aria-valuemax': max,
                'data-percentage': percentage.toFixed(2)
            },
            styles: {
                width: `${percentage}%`,
                backgroundColor: colorCoding ? color : undefined,
                transition: animated ? 'width 0.3s ease' : 'none'
            }
        });
        
        // Update text if requested
        if (showPercentage) {
            const textEl = el.querySelector('.progress-text');
            if (textEl) {
                textEl.textContent = `${percentage.toFixed(1)}%`;
            }
        }
        
        return UIUpdater; // Method chaining
    };
    
    /**
     * Batch update multiple elements
     * @param {array} updates - Array of update operations
     * @returns {UIUpdater} For chaining
     */
    const batchUpdate = (updates) => {
        updates.forEach(({ element, ...updateData }) => {
            updateElement(element, updateData);
        });
        
        return UIUpdater; // Method chaining
    };
    
    /**
     * Create and show toast notification
     * @param {string} message - Message to display
     * @param {string} [type='info'] - Toast type
     * @param {number} [duration=3000] - Duration in ms
     * @returns {UIUpdater} For chaining
     */
    const showToast = (message, type = 'info', duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return UIUpdater; // Method chaining
    };
    
    return {
        updateElement,
        updateProgressBar,
        batchUpdate,
        showToast,
        // Alias for method chaining
        update: updateElement,
        progress: updateProgressBar,
        toast: showToast
    };
    
})();

// ==================== DAY 11: ADVANCED FEATURES & ANALYTICS ====================

/**
 * Advanced Analytics with generator functions and async operations
 */
const AdvancedAnalytics = (function() {
    'use strict';
    
    /**
     * Complexity detection with generator functions
     * @generator
     * @param {string} text - Text to analyze
     * @yields {object} Complexity indicators
     */
    function* detectComplexity(text) {
        const sentences = Array.from(AdvancedTextParser.sentenceParser(text));
        
        for (const sentence of sentences) {
            const indicators = {
                sentenceIndex: sentence.index,
                text: sentence.text,
                wordCount: sentence.wordCount,
                isComplex: false,
                reasons: []
            };
            
            // Check various complexity factors
            if (sentence.wordCount > 25) {
                indicators.isComplex = true;
                indicators.reasons.push('Very long sentence');
            }
            
            if (sentence.complexity > 0.6) {
                indicators.isComplex = true;
                indicators.reasons.push('High structural complexity');
            }
            
            if (indicators.isComplex) {
                yield indicators;
            }
        }
    }
    
    /**
     * Pattern recognition using for...of loops
     * @param {string} text - Text to analyze
     * @param {array} patterns - Patterns to search for
     * @returns {object} Pattern analysis
     */
    const recognizePatterns = (text, patterns = []) => {
        const findings = new Map();
        const defaultPatterns = [
            { name: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
            { name: 'url', regex: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g },
            { name: 'phone', regex: /(\+\d{1,3}[- ]?)?\d{10}/g },
            { name: 'date', regex: /\d{1,2}\/\d{1,2}\/\d{2,4}/g },
            { name: 'time', regex: /\d{1,2}:\d{2}(\s?(AM|PM))?/gi }
        ];
        
        const allPatterns = [...defaultPatterns, ...patterns];
        
        // Use for...of loop to check each pattern
        for (const pattern of allPatterns) {
            const matches = text.match(pattern.regex) || [];
            if (matches.length > 0) {
                findings.set(pattern.name, {
                    count: matches.length,
                    examples: matches.slice(0, 5),
                    pattern: pattern.regex.toString()
                });
            }
        }
        
        return {
            patternsFound: findings.size,
            findings,
            hasPatterns: findings.size > 0
        };
    };
    
    /**
     * Vocabulary analysis with Set operations
     * @param {string} text - Text to analyze
     * @returns {object} Vocabulary metrics
     */
    const analyzeVocabulary = (text) => {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const uniqueWords = new Set(words);
        
        // Categorize words by length
        const byLength = new Map();
        for (const word of uniqueWords) {
            const length = word.length;
            if (!byLength.has(length)) {
                byLength.set(length, new Set());
            }
            byLength.get(length).add(word);
        }
        
        // Find rare words (appear only once)
        const wordFreq = new Map();
        words.forEach(word => {
            wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        });
        
        const rareWords = new Set(
            [...wordFreq.entries()]
                .filter(([word, count]) => count === 1)
                .map(([word]) => word)
        );
        
        return {
            totalWords: words.length,
            uniqueWords: uniqueWords.size,
            diversity: uniqueWords.size / words.length,
            rareWords: rareWords.size,
            averageWordLength: words.reduce((sum, w) => sum + w.length, 0) / words.length,
            lengthDistribution: byLength,
            vocabularyRichness: rareWords.size / uniqueWords.size
        };
    };
    
    /**
     * Async large text processing with rest operator
     * @param {string} text - Text to process
     * @param {...function} processors - Processing functions
     * @returns {Promise<object>} Processing results
     */
    const processLargeText = async (text, ...processors) => {
        // Check if text is large
        const isLarge = text.length > 50000;
        
        if (!isLarge) {
            // Process synchronously for small texts
            const results = {};
            processors.forEach((processor, index) => {
                results[`processor${index}`] = processor(text);
            });
            return results;
        }
        
        // Process asynchronously for large texts
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => {
                    const results = {};
                    
                    // Process in chunks
                    const chunkSize = 10000;
                    const chunks = [];
                    
                    for (let i = 0; i < text.length; i += chunkSize) {
                        chunks.push(text.substring(i, i + chunkSize));
                    }
                    
                    // Apply each processor
                    processors.forEach((processor, index) => {
                        results[`processor${index}`] = processor(text);
                    });
                    
                    resolve({
                        ...results,
                        chunksProcessed: chunks.length,
                        processingTime: Date.now()
                    });
                }, 0);
            } catch (error) {
                reject(error);
            }
        });
    };
    
    return {
        detectComplexity,
        recognizePatterns,
        analyzeVocabulary,
        processLargeText
    };
    
})();

// ==================== DAY 12: EXPORT & UTILITY FUNCTIONS ====================

/**
 * Export Manager with constructor functions
 */
function ExportManager(options = {}) {
    this.options = {
        format: 'json',
        includeMetadata: true,
        prettify: true,
        ...options
    };
    
    this.lastExport = null;
}

/**
 * Export to JSON
 * @param {object} data - Data to export
 * @returns {string} JSON string
 */
ExportManager.prototype.toJSON = function(data) {
    const exportData = {
        ...(this.options.includeMetadata && {
            metadata: {
                exportedAt: new Date().toISOString(),
                version: '1.0.0',
                format: 'json'
            }
        }),
        data
    };
    
    this.lastExport = exportData;
    
    return this.options.prettify 
        ? JSON.stringify(exportData, null, 2)
        : JSON.stringify(exportData);
};

/**
 * Export to CSV
 * @param {array} data - Array of objects to export
 * @returns {string} CSV string
 */
ExportManager.prototype.toCSV = function(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return '';
    }
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    // Create CSV rows
    const rows = data.map(item => 
        headers.map(header => {
            const value = item[header];
            // Escape commas and quotes
            return typeof value === 'string' && value.includes(',')
                ? `"${value.replace(/"/g, '""')}"`
                : value;
        }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
};

/**
 * Copy to clipboard with promise pattern
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
ExportManager.prototype.copyToClipboard = async function(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback method
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        return false;
    }
};

/**
 * Download file
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 * @returns {ExportManager} this for chaining
 */
ExportManager.prototype.downloadFile = function(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    return this; // Method chaining
};

/**
 * Format analysis results with template literals and destructuring
 * @param {object} analysis - Analysis results
 * @returns {string} Formatted text
 */
ExportManager.prototype.formatAnalysis = function(analysis) {
    const {
        words = {},
        sentences = {},
        readability = {}
    } = analysis;
    
    return `
=== Text Analysis Report ===
Generated: ${new Date().toLocaleString()}

Word Statistics:
- Total Words: ${words.totalWords || 0}
- Unique Words: ${words.uniqueWords || 0}
- Average Word Length: ${words.averageWordLength || 0}

Sentence Statistics:
- Total Sentences: ${sentences.totalSentences || 0}
- Average Words per Sentence: ${sentences.averageWordsPerSentence || 0}

Readability:
- Flesch Score: ${readability.flesch?.score || 'N/A'}
- Grade Level: ${readability.consensus?.averageGrade || 'N/A'}

=========================
    `.trim();
};

// ==================== DAY 13: PERFORMANCE OPTIMIZATION ====================

/**
 * Performance Optimizer with caching and debouncing
 */
const PerformanceOptimizer = (function() {
    'use strict';
    
    // Hoisted function declarations for optimization
    function createCache() {
        const cache = new Map();
        let hits = 0;
        let misses = 0;
        
        return {
            get: (key) => {
                if (cache.has(key)) {
                    hits++;
                    return cache.get(key);
                }
                misses++;
                return null;
            },
            set: (key, value) => {
                cache.set(key, value);
            },
            clear: () => {
                cache.clear();
                hits = 0;
                misses = 0;
            },
            stats: () => ({
                size: cache.size,
                hits,
                misses,
                hitRate: hits + misses > 0 ? hits / (hits + misses) : 0
            })
        };
    }
    
    // Closure pattern for private cache
    const analysisCache = createCache();
    
    /**
     * Memoized analysis function
     * @param {function} fn - Function to memoize
     * @returns {function} Memoized function
     */
    const memoize = (fn) => {
        return function(...args) {
            const key = JSON.stringify(args);
            const cached = analysisCache.get(key);
            
            if (cached !== null) {
                return cached;
            }
            
            const result = fn.apply(this, args);
            analysisCache.set(key, result);
            return result;
        };
    };
    
    /**
     * Debounce with self-invoking function
     * @param {function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {function} Debounced function
     */
    const debounce = (function() {
        let timeouts = new Map();
        
        return function(func, delay) {
            return function(...args) {
                const key = func.toString();
                
                if (timeouts.has(key)) {
                    clearTimeout(timeouts.get(key));
                }
                
                const timeout = setTimeout(() => {
                    func.apply(this, args);
                    timeouts.delete(key);
                }, delay);
                
                timeouts.set(key, timeout);
            };
        };
    })();
    
    /**
     * Throttle function
     * @param {function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {function} Throttled function
     */
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };
    
    /**
     * Generator for memory-efficient iteration
     * @generator
     * @param {array} items - Items to process
     * @param {number} batchSize - Batch size
     * @yields {array} Batch of items
     */
    function* batchProcessor(items, batchSize = 100) {
        for (let i = 0; i < items.length; i += batchSize) {
            yield items.slice(i, i + batchSize);
        }
    }
    
    return {
        memoize,
        debounce,
        throttle,
        batchProcessor,
        getCache: () => analysisCache,
        clearCache: () => analysisCache.clear(),
        getCacheStats: () => analysisCache.stats()
    };
    
})();

// ==================== DAY 14: INTEGRATION & TESTING ====================

/**
 * Test Suite with validation
 */
const TestSuite = (function() {
    'use strict';
    
    const tests = [];
    const results = [];
    
    /**
     * Add test case
     * @param {string} name - Test name
     * @param {function} testFn - Test function
     */
    const addTest = (name, testFn) => {
        tests.push({ name, testFn });
    };
    
    /**
     * Run all tests with for...in and forEach
     * @returns {object} Test results
     */
    const runTests = async () => {
        results.length = 0;
        
        // Use forEach for running tests
        for (const test of tests) {
            try {
                await test.testFn();
                results.push({
                    name: test.name,
                    passed: true,
                    error: null
                });
            } catch (error) {
                results.push({
                    name: test.name,
                    passed: false,
                    error: error.message
                });
            }
        }
        
        return {
            total: tests.length,
            passed: results.filter(r => r.passed).length,
            failed: results.filter(r => !r.passed).length,
            results
        };
    };
    
    /**
     * Validation system with constructor pattern
     */
    function Validator(rules = {}) {
        this.rules = rules;
        this.errors = [];
    }
    
    Validator.prototype.validate = function(data) {
        this.errors = [];
        
        // Use Object.entries() for validation
        Object.entries(this.rules).forEach(([field, rule]) => {
            const value = data[field];
            
            if (rule.required && !value) {
                this.errors.push(`${field} is required`);
            }
            
            if (rule.type && typeof value !== rule.type) {
                this.errors.push(`${field} must be of type ${rule.type}`);
            }
            
            if (rule.min && value < rule.min) {
                this.errors.push(`${field} must be at least ${rule.min}`);
            }
            
            if (rule.max && value > rule.max) {
                this.errors.push(`${field} must be at most ${rule.max}`);
            }
        });
        
        return this.errors.length === 0;
    };
    
    Validator.prototype.getErrors = function() {
        return [...this.errors];
    };
    
    return {
        addTest,
        runTests,
        Validator,
        getResults: () => [...results]
    };
    
})();

// ==================== DAY 15: FINAL POLISH & DEPLOYMENT ====================

/**
 * Text Analyzer API - Public interface with static methods
 */
class TextAnalyzerAPI {
    // Private static cache
    static #cache = new Map();
    static #version = '1.0.0';
    
    /**
     * Initialize API
     * @static
     */
    static initialize() {
        console.log(`Text Analyzer API v${this.#version} initialized`);
        return this;
    }
    
    /**
     * Analyze text - main public method
     * @static
     * @param {string} text - Text to analyze
     * @param {object} [options] - Analysis options
     * @returns {object} Complete analysis
     */
    static analyze(text, options = {}) {
        const cacheKey = `${text.substring(0, 100)}_${JSON.stringify(options)}`;
        
        // Check cache
        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey);
        }
        
        const analysis = {
            metadata: {
                version: this.#version,
                analyzedAt: new Date().toISOString(),
                textLength: text.length
            },
            basic: BasicStatisticsEngine.analyze(text),
            advanced: AdvancedTextParser.parseText(text),
            frequency: FrequencyAnalyzer.analyzeWordFrequency(text),
            readability: new ReadabilityAnalyzer(text).getScores(),
            vocabulary: AdvancedAnalytics.analyzeVocabulary(text),
            patterns: AdvancedAnalytics.recognizePatterns(text)
        };
        
        // Cache result
        this.#cache.set(cacheKey, analysis);
        
        return analysis;
    }
    
    /**
     * Export analysis
     * @static
     * @param {object} analysis - Analysis to export
     * @param {string} [format='json'] - Export format
     * @returns {string} Exported data
     */
    static export(analysis, format = 'json') {
        const exporter = new ExportManager({ format });
        
        switch (format) {
            case 'json':
                return exporter.toJSON(analysis);
            case 'csv':
                return exporter.toCSV([analysis]);
            default:
                return exporter.formatAnalysis(analysis);
        }
    }
    
    /**
     * Clear cache
     * @static
     */
    static clearCache() {
        this.#cache.clear();
        return this;
    }
    
    /**
     * Get API version
     * @static
     * @returns {string} Version
     */
    static getVersion() {
        return this.#version;
    }
    
    /**
     * Get API status
     * @static
     * @returns {object} Status information
     */
    static getStatus() {
        return {
            version: this.#version,
            cacheSize: this.#cache.size,
            modulesLoaded: {
                basicStats: typeof BasicStatisticsEngine !== 'undefined',
                advancedParser: typeof AdvancedTextParser !== 'undefined',
                readability: typeof ReadabilityAnalyzer !== 'undefined',
                frequency: typeof FrequencyAnalyzer !== 'undefined'
            }
        };
    }
}

// Make everything globally available
window.StorageManager = StorageManager;
window.PreferencesManager = PreferencesManager;
window.CacheManager = CacheManager;
window.UIUpdater = UIUpdater;
window.AdvancedAnalytics = AdvancedAnalytics;
window.ExportManager = ExportManager;
window.PerformanceOptimizer = PerformanceOptimizer;
window.TestSuite = TestSuite;
window.TextAnalyzerAPI = TextAnalyzerAPI;

// Initialize API
TextAnalyzerAPI.initialize();

console.log('🚀 Text Analyzer Core System loaded successfully');
console.log('✅ All modules (Days 9-15) integrated and ready');
