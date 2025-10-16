/**
 * Utility functions for Text Analyzer
 * Contains helper functions for formatting, calculations, and common operations
 */

// Utility object containing various helper functions
const utils = {
    
    /**
     * Format number with specified decimal places
     * @param {number} num - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number string
     */
    formatNumber: function(num, decimals = config.displayFormats.decimalPlaces) {
        return typeof num === 'number' && !isNaN(num) ? 
            num.toFixed(decimals) : '0.00';
    },
    
    /**
     * Format percentage with specified decimal places
     * @param {number} value - Value to convert to percentage
     * @param {number} total - Total value for percentage calculation
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted percentage string
     */
    formatPercentage: function(value, total, decimals = config.displayFormats.percentageDecimalPlaces) {
        if (!total || total === 0) return '0%';
        const percentage = (value / total) * 100;
        return `${utils.formatNumber(percentage, decimals)}%`;
    },
    
    /**
     * Format time duration in minutes and seconds
     * @param {number} minutes - Time in minutes
     * @returns {string} Formatted time string
     */
    formatReadingTime: function(minutes) {
        if (minutes < 1) {
            const seconds = Math.round(minutes * 60);
            return `${seconds} sec`;
        } else if (minutes < 60) {
            return `${utils.formatNumber(minutes, 1)} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = Math.round(minutes % 60);
            return `${hours}h ${remainingMinutes}m`;
        }
    },
    
    /**
     * Count syllables in a word using vowel counting method
     * @param {string} word - Word to count syllables for
     * @returns {number} Number of syllables
     */
    countSyllables: function(word) {
        if (!word || typeof word !== 'string') return 0;
        
        // Convert to lowercase and remove non-alphabetic characters
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (cleanWord.length === 0) return 0;
        
        // Count vowel groups
        const vowels = 'aeiouy';
        let syllableCount = 0;
        let previousWasVowel = false;
        
        // Use for loop to iterate through characters
        for (let i = 0; i < cleanWord.length; i++) {
            const char = cleanWord[i];
            const isVowel = vowels.includes(char);
            
            // Count syllable when transitioning from consonant to vowel
            if (isVowel && !previousWasVowel) {
                syllableCount++;
            }
            previousWasVowel = isVowel;
        }
        
        // Handle silent 'e' at the end
        if (cleanWord.endsWith('e') && syllableCount > 1) {
            syllableCount--;
        }
        
        // Ensure at least one syllable
        return Math.max(1, syllableCount);
    },
    
    /**
     * Calculate Flesch Reading Ease score
     * @param {number} avgSentenceLength - Average words per sentence
     * @param {number} avgSyllablesPerWord - Average syllables per word
     * @returns {number} Flesch Reading Ease score
     */
    calculateFleschScore: function(avgSentenceLength, avgSyllablesPerWord) {
        const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
        return Math.max(0, Math.min(100, score));
    },
    
    /**
     * Calculate Flesch-Kincaid Grade Level
     * @param {number} avgSentenceLength - Average words per sentence
     * @param {number} avgSyllablesPerWord - Average syllables per word
     * @returns {number} Grade level
     */
    calculateGradeLevel: function(avgSentenceLength, avgSyllablesPerWord) {
        const gradeLevel = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
        return Math.max(0, gradeLevel);
    },
    
    /**
     * Calculate Gunning Fog Index
     * @param {number} avgSentenceLength - Average words per sentence
     * @param {number} complexWordsPercentage - Percentage of complex words
     * @returns {number} Gunning Fog Index
     */
    calculateGunningFog: function(avgSentenceLength, complexWordsPercentage) {
        const fogIndex = 0.4 * (avgSentenceLength + complexWordsPercentage);
        return Math.max(0, fogIndex);
    },
    
    /**
     * Get interpretation for Flesch Reading Ease score
     * @param {number} score - Flesch Reading Ease score
     * @returns {object} Interpretation object
     */
    getFleschInterpretation: function(score) {
        const interpretations = config.fleschInterpretations;
        
        // Use for...in loop to check interpretation properties
        for (const key in interpretations) {
            const interpretation = interpretations[key];
            if (score >= interpretation.min && score <= interpretation.max) {
                return {
                    label: interpretation.label,
                    description: interpretation.description
                };
            }
        }
        
        return { label: 'Unknown', description: 'Unable to determine readability' };
    },
    
    /**
     * Get interpretation for Gunning Fog Index
     * @param {number} score - Gunning Fog Index score
     * @returns {object} Interpretation object
     */
    getGunningFogInterpretation: function(score) {
        const interpretations = config.gunningFogInterpretations;
        
        // Use for...in loop to check interpretation properties
        for (const key in interpretations) {
            const interpretation = interpretations[key];
            if (score >= interpretation.min && score <= interpretation.max) {
                return {
                    label: interpretation.label,
                    description: interpretation.description
                };
            }
        }
        
        return { label: 'Unknown', description: 'Unable to determine readability' };
    },
    
    /**
     * Get grade level interpretation
     * @param {number} gradeLevel - Grade level number
     * @returns {object} Grade level interpretation
     */
    getGradeLevelInterpretation: function(gradeLevel) {
        const thresholds = config.gradeLevelThresholds;
        
        // Use for...in loop to check grade level thresholds
        for (const key in thresholds) {
            const threshold = thresholds[key];
            if (gradeLevel >= threshold.min && gradeLevel <= threshold.max) {
                return {
                    label: threshold.label,
                    range: `${threshold.min}-${threshold.max === Infinity ? '∞' : threshold.max}`
                };
            }
        }
        
        return { label: 'Unknown', range: 'N/A' };
    },
    
    /**
     * Sanitize text input by removing potentially harmful content
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitizeText: function(text) {
        if (typeof text !== 'string') return '';
        
        return text
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocols
            .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    },
    
    /**
     * Create a deep copy of an object
     * @param {object} obj - Object to copy
     * @returns {object} Deep copy of the object
     */
    deepCopy: function(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => utils.deepCopy(item));
        
        const copy = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = utils.deepCopy(obj[key]);
            }
        }
        return copy;
    },
    
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce: function(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    /**
     * Show message to user
     * @param {string} message - Message to display
     * @param {string} type - Message type (success, error, warning)
     * @param {number} duration - Display duration in milliseconds
     */
    showMessage: function(message, type = 'info', duration = 3000) {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        messageContainer.appendChild(messageEl);
        
        // Trigger show animation
        setTimeout(() => messageEl.classList.add('show'), 100);
        
        // Auto-remove after duration
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    },
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    copyToClipboard: async function(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const result = document.execCommand('copy');
                document.body.removeChild(textArea);
                return result;
            }
        } catch (error) {
            console.error('Failed to copy text:', error);
            return false;
        }
    },
    
    /**
     * Validate text input
     * @param {string} text - Text to validate
     * @returns {object} Validation result with isValid and errors
     */
    validateText: function(text) {
        const errors = [];
        const processing = config.processing;
        
        // Use for loop with break statement for validation checks
        for (let i = 0; i < 5; i++) {
            switch (i) {
                case 0:
                    if (!text || typeof text !== 'string') {
                        errors.push('Text input is required');
                        break;
                    }
                    continue;
                    
                case 1:
                    if (text.length < processing.minTextLength) {
                        errors.push(`Text must be at least ${processing.minTextLength} character long`);
                        break;
                    }
                    continue;
                    
                case 2:
                    if (text.length > processing.maxTextLength) {
                        errors.push(`Text must be no more than ${processing.maxTextLength} characters long`);
                        break;
                    }
                    continue;
                    
                case 3:
                    // Check for extremely long words (excluding URLs, file paths, and markdown links)
                    const words = text.split(/\s+/);
                    for (const word of words) {
                        // Skip URLs, file paths, and markdown links
                        if (word.match(/^https?:\/\//i) || 
                            word.match(/^file:\/\//i) || 
                            word.match(/^\[.*\]\(.*\)$/) ||
                            word.match(/^[a-z]:\\/i)) {
                            continue;
                        }
                        
                        // Remove common punctuation and check actual word length
                        const cleanWord = word.replace(/[^\w'-]/g, '');
                        
                        if (cleanWord.length > processing.maxWordLength) {
                            errors.push(`Word "${cleanWord}" is too long (${processing.maxWordLength} character limit)`);
                            break;
                        }
                    }
                    continue;
                    
                case 4:
                    // Sanitize text and check if it's still valid
                    const sanitized = utils.sanitizeText(text);
                    if (sanitized.length !== text.length) {
                        errors.push('Text contains potentially harmful content');
                        break;
                    }
                    continue;
            }
            break; // Break the main loop if any validation fails
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

// Create Utils object with math utilities for module compatibility
const Utils = {
    math: {
        round: (num, decimals = 2) => {
            return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
        },
        average: (arr) => {
            return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        },
        sum: (arr) => {
            return arr.reduce((a, b) => a + b, 0);
        },
        min: (arr) => {
            return arr.length > 0 ? Math.min(...arr) : 0;
        },
        max: (arr) => {
            return arr.length > 0 ? Math.max(...arr) : 0;
        },
        median: (arr) => {
            if (arr.length === 0) return 0;
            const sorted = [...arr].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 === 0 
                ? (sorted[mid - 1] + sorted[mid]) / 2 
                : sorted[mid];
        },
        standardDeviation: (arr) => {
            if (arr.length === 0) return 0;
            const avg = Utils.math.average(arr);
            const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
            const avgSquareDiff = Utils.math.average(squareDiffs);
            return Math.sqrt(avgSquareDiff);
        }
    },
    text: {
        capitalizeFirst: (str) => {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },
        truncate: (str, maxLength) => {
            return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
        }
    },
    dom: {
        getElementById: (id) => document.getElementById(id),
        querySelector: (selector) => document.querySelector(selector),
        querySelectorAll: (selector) => document.querySelectorAll(selector)
    }
};

// Export utils for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
} else if (typeof window !== 'undefined') {
    window.utils = utils;
    window.Utils = Utils; // Export capitalized version for module compatibility
}
