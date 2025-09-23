/**
 * Advanced Text Analyzer - Utilities Module
 * Reusable utility functions using various JavaScript patterns
 */

// Utility namespace using object literal pattern
const Utils = {
    
    // DOM manipulation utilities using arrow functions
    dom: {
        // Get element by selector
        get: (selector) => document.querySelector(selector),
        
        // Get all elements by selector  
        getAll: (selector) => document.querySelectorAll(selector),
        
        // Set text content with null check
        setText: (element, text) => {
            if (element) element.textContent = text;
        },
        
        // Set HTML content with null check
        setHTML: (element, html) => {
            if (element) element.innerHTML = html;
        },
        
        // Add class to element
        addClass: (element, className) => {
            if (element && className) element.classList.add(className);
        },
        
        // Remove class from element
        removeClass: (element, className) => {
            if (element && className) element.classList.remove(className);
        },
        
        // Toggle class on element
        toggleClass: (element, className) => {
            if (element && className) element.classList.toggle(className);
        },
        
        // Check if element has class
        hasClass: (element, className) => {
            return element && element.classList.contains(className);
        },
        
        // Set attribute on element
        setAttr: (element, attribute, value) => {
            if (element) element.setAttribute(attribute, value);
        },
        
        // Get attribute from element
        getAttr: (element, attribute) => {
            return element ? element.getAttribute(attribute) : null;
        },
        
        // Show element
        show: (element) => {
            if (element) {
                element.style.display = '';
                element.removeAttribute('aria-hidden');
            }
        },
        
        // Hide element
        hide: (element) => {
            if (element) {
                element.style.display = 'none';
                element.setAttribute('aria-hidden', 'true');
            }
        },
        
        // Create element with optional attributes and text
        create: (tagName, attributes = {}, text = '') => {
            const element = document.createElement(tagName);
            
            Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
            
            if (text) element.textContent = text;
            
            return element;
        }
    },

    // Text processing utilities using function expressions
    text: {
        // Count words in text using function expression
        countWords: function(text) {
            if (!text || typeof text !== 'string') return 0;
            return text.trim().split(/\s+/).filter(word => word.length > 0).length;
        },

        // Count sentences using function expression
        countSentences: function(text) {
            if (!text || typeof text !== 'string') return 0;
            const sentences = text.match(/[.!?]+/g);
            return sentences ? sentences.length : 0;
        },

        // Count paragraphs using function expression
        countParagraphs: function(text) {
            if (!text || typeof text !== 'string') return 0;
            const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
            return paragraphs.length || 1;
        },

        // Count syllables in a word using function expression
        countSyllables: function(word) {
            if (!word || typeof word !== 'string') return 0;
            
            word = word.toLowerCase();
            if (word.length <= 3) return 1;
            
            // Count vowel groups
            let syllables = word.match(/[aeiouy]+/gi) || [];
            
            // Subtract silent e
            if (word.endsWith('e')) syllables.pop();
            
            return Math.max(syllables.length, 1);
        },

        // Get word frequency using function expression
        getWordFrequency: function(text) {
            if (!text) return {};
            
            const words = text.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 0);
            
            const frequency = {};
            words.forEach(word => {
                frequency[word] = (frequency[word] || 0) + 1;
            });
            
            return frequency;
        },

        // Clean text for analysis
        clean: (text) => {
            return text ? text.replace(/\s+/g, ' ').trim() : '';
        },

        // Extract sentences from text
        extractSentences: (text) => {
            if (!text) return [];
            return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        }
    },

    // Mathematical calculations using arrow functions
    math: {
        // Calculate average
        average: (numbers) => {
            if (!Array.isArray(numbers) || numbers.length === 0) return 0;
            return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
        },

        // Round to specified decimal places
        round: (number, decimals = 2) => {
            return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
        },

        // Calculate percentage
        percentage: (value, total, decimals = 1) => {
            if (total === 0) return 0;
            return Utils.math.round((value / total) * 100, decimals);
        },

        // Clamp number between min and max
        clamp: (number, min, max) => {
            return Math.min(Math.max(number, min), max);
        },

        // Calculate Flesch Reading Ease score
        fleschReadingEase: (totalWords, totalSentences, totalSyllables) => {
            if (totalWords === 0 || totalSentences === 0) return 0;
            
            const avgWordsPerSentence = totalWords / totalSentences;
            const avgSyllablesPerWord = totalSyllables / totalWords;
            
            return Utils.math.round(
                206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
            );
        },

        // Calculate Flesch-Kincaid Grade Level
        fleschKincaidGrade: (totalWords, totalSentences, totalSyllables) => {
            if (totalWords === 0 || totalSentences === 0) return 0;
            
            const avgWordsPerSentence = totalWords / totalSentences;
            const avgSyllablesPerWord = totalSyllables / totalWords;
            
            return Utils.math.round(
                (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59
            );
        }
    },

    // Validation utilities using arrow functions
    validation: {
        // Validate text input
        validateText: (text) => {
            const errors = [];
            
            if (!text || text.trim().length === 0) {
                errors.push(CONFIG.messages.errors.emptyText);
                return { isValid: false, errors };
            }
            
            if (text.length > CONFIG.validation.maxCharacters) {
                errors.push(CONFIG.messages.errors.textTooLong);
            }
            
            const wordCount = Utils.text.countWords(text);
            if (wordCount < CONFIG.validation.minWords) {
                errors.push(CONFIG.messages.errors.textTooShort);
            }
            
            return {
                isValid: errors.length === 0,
                errors,
                wordCount,
                charCount: text.length
            };
        },

        // Validate email format
        isValidEmail: (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        // Check if value is numeric
        isNumeric: (value) => {
            return !isNaN(parseFloat(value)) && isFinite(value);
        }
    },

    // Formatting utilities using function expressions
    format: {
        // Format number with commas
        number: function(num) {
            return new Intl.NumberFormat().format(num);
        },

        // Format time duration
        time: function(minutes) {
            if (minutes < 1) {
                const seconds = Math.round(minutes * 60);
                return `${seconds} sec`;
            } else if (minutes < 60) {
                return `${Math.round(minutes)} min`;
            } else {
                const hours = Math.floor(minutes / 60);
                const remainingMins = Math.round(minutes % 60);
                return `${hours}h ${remainingMins}m`;
            }
        },

        // Format percentage
        percentage: function(value, decimals = 1) {
            return `${value.toFixed(decimals)}%`;
        },

        // Format date
        date: function(date = new Date()) {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        // Capitalize first letter
        capitalize: function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        // Format file size
        fileSize: function(bytes) {
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            if (bytes === 0) return '0 Bytes';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
        }
    },

    // Animation utilities using arrow functions
    animation: {
        // Animate progress bar
        animateProgress: (element, targetValue, duration = 1000) => {
            if (!element) return;
            
            const startValue = parseFloat(element.style.width) || 0;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentValue = startValue + (targetValue - startValue) * easeOut;
                
                element.style.width = `${currentValue}%`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        },

        // Fade in element
        fadeIn: (element, duration = 300) => {
            if (!element) return Promise.resolve();
            
            return new Promise(resolve => {
                element.style.opacity = '0';
                element.style.display = 'block';
                
                const fadeInAnimation = element.animate([
                    { opacity: 0 },
                    { opacity: 1 }
                ], {
                    duration,
                    easing: 'ease-in-out'
                });
                
                fadeInAnimation.addEventListener('finish', () => {
                    element.style.opacity = '';
                    resolve();
                });
            });
        },

        // Fade out element
        fadeOut: (element, duration = 300) => {
            if (!element) return Promise.resolve();
            
            return new Promise(resolve => {
                const fadeOutAnimation = element.animate([
                    { opacity: 1 },
                    { opacity: 0 }
                ], {
                    duration,
                    easing: 'ease-in-out'
                });
                
                fadeOutAnimation.addEventListener('finish', () => {
                    element.style.display = 'none';
                    resolve();
                });
            });
        }
    },

    // Storage utilities using arrow functions
    storage: {
        // Save to localStorage
        save: (key, data) => {
            try {
                const serialized = JSON.stringify(data);
                localStorage.setItem(key, serialized);
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },

        // Load from localStorage
        load: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                return defaultValue;
            }
        },

        // Remove from localStorage
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        },

        // Clear all localStorage
        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    }
};

// Event handling utilities using function expressions
const EventUtils = {
    // Add event listener with automatic cleanup
    on: function(element, eventType, handler, options = {}) {
        if (!element || !eventType || !handler) return;
        
        element.addEventListener(eventType, handler, options);
        
        // Return cleanup function
        return function() {
            element.removeEventListener(eventType, handler, options);
        };
    },

    // Throttle function execution
    throttle: function(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        
        return function(...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    },

    // Debounce function execution
    debounce: function(func, delay) {
        let timeoutId;
        
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }
};

// Export utilities using anonymous functions for data processing
const DataUtils = {
    // Deep clone object using anonymous function
    deepClone: (function() {
        return function(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => DataUtils.deepClone(item));
            if (typeof obj === 'object') {
                const clonedObj = {};
                Object.keys(obj).forEach(key => {
                    clonedObj[key] = DataUtils.deepClone(obj[key]);
                });
                return clonedObj;
            }
        };
    })(),

    // Merge objects deeply
    deepMerge: function(target, source) {
        const result = { ...target };
        
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = DataUtils.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        });
        
        return result;
    },

    // Generate unique ID
    generateId: () => {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    },

    // Export data to file
    exportToFile: function(data, filename, mimeType = 'application/json') {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// Error handling utilities
const ErrorUtils = {
    // Create custom error
    createError: (message, type = 'Error', details = {}) => {
        const error = new Error(message);
        error.name = type;
        error.details = details;
        error.timestamp = new Date().toISOString();
        return error;
    },

    // Log error with context
    logError: (error, context = {}) => {
        console.error('Application Error:', {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        });
    },

    // Handle async errors
    handleAsync: (asyncFn) => {
        return async function(...args) {
            try {
                return await asyncFn.apply(this, args);
            } catch (error) {
                ErrorUtils.logError(error, { function: asyncFn.name, args });
                throw error;
            }
        };
    }
};

// Performance utilities
const PerformanceUtils = {
    // Measure execution time
    measure: function(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    },

    // Create performance timer
    createTimer: function(name) {
        const start = performance.now();
        
        return function() {
            const end = performance.now();
            console.log(`Timer ${name}: ${end - start} milliseconds`);
            return end - start;
        };
    }
};

// Make utilities available globally
window.Utils = Utils;
window.EventUtils = EventUtils;
window.DataUtils = DataUtils;
window.ErrorUtils = ErrorUtils;
window.PerformanceUtils = PerformanceUtils;