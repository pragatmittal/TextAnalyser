    /**
 * Text Preprocessing Module
 * Handles text cleaning, normalization, and preparation for analysis
 * Uses arrow functions and destructuring assignment as specified
 */

// Self-invoking function (IIFE) to initialize the text preprocessor module and protect scope
const textPreprocessor = (function() {
    'use strict';
    
    /**
     * Main preprocessing pipeline using arrow functions
     * Each step is an arrow function for text transformation
     */
    const preprocessingSteps = {
        // Trim whitespace using arrow function
        trimWhitespace: (text) => text.trim(),
        
        // Normalize line breaks using arrow function
        normalizeLineBreaks: (text) => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'),
        
        // Handle special characters using arrow function
        handleSpecialCharacters: (text) => text.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'"),
        
        // Remove extra spaces using arrow function
        removeExtraSpaces: (text) => text.replace(/\s+/g, ' '),
        
        // Remove excessive punctuation using arrow function
        normalizePunctuation: (text) => text.replace(/[.]{2,}/g, '.').replace(/[!]{2,}/g, '!').replace(/[?]{2,}/g, '?'),
        
        // Preserve sentence structure using arrow function
        preserveSentences: (text) => text.replace(/([.!?])\s+/g, '$1 ').trim()
    };
    
    /**
     * Extract multiple text properties using destructuring assignment
     * @param {string} text - Input text
     * @returns {object} Object with destructured text properties
     */
    const extractTextProperties = (text) => {
        // Use destructuring assignment to extract multiple properties simultaneously
        const [length, trimmedVersion, normalizedVersion] = [
            text.length,
            text.trim(),
            text.trim().replace(/\s+/g, ' ')
        ];
        
        return {
            originalLength: length,
            trimmedLength: trimmedVersion.length,
            normalizedLength: normalizedVersion.length,
            hasLeadingWhitespace: text.length !== trimmedVersion.length,
            hasMultipleSpaces: text !== normalizedVersion,
            // Additional destructured properties
            wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
            lineCount: text.split('\n').length,
            paragraphCount: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
        };
    };
    
    /**
     * Clean text using the preprocessing pipeline
     * @param {string} text - Raw input text
     * @returns {object} Cleaned text and metadata
     */
    const cleanText = (text) => {
        if (!text || typeof text !== 'string') {
            return {
                cleanedText: '',
                metadata: {
                    originalLength: 0,
                    cleanedLength: 0,
                    transformationsApplied: []
                }
            };
        }
        
        let cleanedText = text;
        const transformationsApplied = [];
        
        // Apply preprocessing steps using arrow functions
        Object.entries(preprocessingSteps).forEach(([stepName, stepFunction]) => {
            const beforeLength = cleanedText.length;
            cleanedText = stepFunction(cleanedText);
            const afterLength = cleanedText.length;
            
            if (beforeLength !== afterLength) {
                transformationsApplied.push({
                    step: stepName,
                    beforeLength,
                    afterLength,
                    change: afterLength - beforeLength
                });
            }
        });
        
        // Extract properties using destructuring
        const properties = extractTextProperties(text);
        const cleanedProperties = extractTextProperties(cleanedText);
        
        return {
            cleanedText,
            metadata: {
                originalLength: properties.originalLength,
                cleanedLength: cleanedProperties.normalizedLength,
                transformationsApplied,
                originalProperties: properties,
                cleanedProperties
            }
        };
    };
    
    /**
     * Split text into words using arrow function
     * @param {string} text - Text to split
     * @returns {Array} Array of words
     */
    const splitIntoWords = (text) => {
        return text
            .split(/\s+/)
            .filter(word => word.length > 0)
            .map(word => word.toLowerCase().replace(/[^\w]/g, ''));
    };
    
    /**
     * Split text into sentences using arrow function
     * @param {string} text - Text to split
     * @returns {Array} Array of sentences
     */
    const splitIntoSentences = (text) => {
        // Handle abbreviations and decimal numbers
        let processedText = text;
        
        // Use arrow function to handle abbreviation patterns
        config.validation.abbreviationPatterns.forEach(pattern => {
            processedText = processedText.replace(pattern, match => match.replace('.', '|ABBREV|'));
        });
        
        // Split on sentence endings
        return processedText
            .split(/[.!?]+/)
            .map(sentence => sentence.replace(/\|ABBREV\|/g, '.').trim())
            .filter(sentence => sentence.length > 0);
    };
    
    /**
     * Split text into paragraphs using arrow function
     * @param {string} text - Text to split
     * @returns {Array} Array of paragraphs
     */
    const splitIntoParagraphs = (text) => {
        return text
            .split(/\n\s*\n/)
            .map(paragraph => paragraph.trim())
            .filter(paragraph => paragraph.length > 0);
    };
    
    /**
     * Normalize word for analysis using arrow function
     * @param {string} word - Word to normalize
     * @returns {string} Normalized word
     */
    const normalizeWord = (word) => {
        return word
            .toLowerCase()
            .replace(/[^\w]/g, '')
            .trim();
    };
    
    /**
     * Check if word is complex (>3 syllables) using arrow function
     * @param {string} word - Word to check
     * @returns {boolean} True if word is complex
     */
    const isComplexWord = (word) => {
        const normalizedWord = normalizeWord(word);
        return utils.countSyllables(normalizedWord) > 3;
    };
    
    /**
     * Check if word is long (>6 letters) using arrow function
     * @param {string} word - Word to check
     * @returns {boolean} True if word is long
     */
    const isLongWord = (word) => {
        const normalizedWord = normalizeWord(word);
        return normalizedWord.length > 6;
    };
    
    /**
     * Process text for analysis
     * @param {string} text - Raw input text
     * @returns {object} Processed text data
     */
    const processText = (text) => {
        // Clean the text first
        const { cleanedText, metadata } = cleanText(text);
        
        // Split into components using arrow functions
        const words = splitIntoWords(cleanedText);
        const sentences = splitIntoSentences(cleanedText);
        const paragraphs = splitIntoParagraphs(cleanedText);
        
        // Analyze word complexity using arrow functions
        const complexWords = words.filter(isComplexWord);
        const longWords = words.filter(isLongWord);
        
        // Calculate additional metrics
        const totalSyllables = words.reduce((total, word) => total + utils.countSyllables(word), 0);
        const avgSyllablesPerWord = words.length > 0 ? totalSyllables / words.length : 0;
        
        // Use destructuring to organize the results
        const [wordCount, sentenceCount, paragraphCount] = [words.length, sentences.length, paragraphs.length];
        const [complexWordCount, longWordCount] = [complexWords.length, longWords.length];
        
        return {
            originalText: text,
            cleanedText,
            words,
            sentences,
            paragraphs,
            metrics: {
                wordCount,
                sentenceCount,
                paragraphCount,
                complexWordCount,
                longWordCount,
                totalSyllables,
                avgSyllablesPerWord,
                avgWordsPerSentence: sentenceCount > 0 ? wordCount / sentenceCount : 0,
                avgWordsPerParagraph: paragraphCount > 0 ? wordCount / paragraphCount : 0
            },
            metadata
        };
    };
    
    // Public API using object literal
    return {
        cleanText,
        processText,
        splitIntoWords,
        splitIntoSentences,
        splitIntoParagraphs,
        normalizeWord,
        isComplexWord,
        isLongWord,
        extractTextProperties
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = textPreprocessor;
} else if (typeof window !== 'undefined') {
    window.textPreprocessor = textPreprocessor;
}
