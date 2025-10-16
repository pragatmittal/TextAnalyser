/**
 * Advanced Text Parser Module
 * Day 5: Advanced Text Parsing - Sentence & Paragraph Analysis
 * 
 * Technical Focus:
 * - Generator functions for efficient sentence parsing
 * - forEach loops for paragraph detection
 * - map method for text tokenization
 * - Object.entries() for processing text statistics
 * - for loops with pattern matching for syllable counting
 */

const AdvancedTextParser = (function() {
    'use strict';
    
    // Private configuration using object literal
    const parserConfig = {
        sentenceEndings: ['.', '!', '?', '...'],
        abbreviations: ['Mr.', 'Mrs.', 'Dr.', 'Prof.', 'Sr.', 'Jr.', 'vs.', 'etc.', 'e.g.', 'i.e.'],
        paragraphSeparator: /\n\s*\n/,
        wordSeparator: /\s+/,
        tokenPatterns: {
            word: /\b\w+\b/g,
            punctuation: /[^\w\s]/g,
            whitespace: /\s+/g,
            number: /\d+/g
        },
        syllablePatterns: {
            vowels: /[aeiouy]/gi,
            silentE: /[^aeiou]e$/i,
            doubleVowel: /[aeiouy]{2}/gi,
            yAsVowel: /y[^aeiouy]/gi
        }
    };
    
    /**
     * Sentence parsing with generator functions for efficient processing
     * Generator function yields sentences one at a time for memory efficiency
     * 
     * @generator
     * @param {string} text - Text to parse into sentences
     * @yields {object} Sentence object with text, index, and metadata
     */
    function* sentenceParser(text) {
        if (!text || typeof text !== 'string') {
            return;
        }
        
        // Replace abbreviations temporarily to avoid false sentence breaks
        let processedText = text;
        const abbreviationMap = new Map();
        
        parserConfig.abbreviations.forEach((abbr, index) => {
            const placeholder = `__ABBR${index}__`;
            abbreviationMap.set(placeholder, abbr);
            processedText = processedText.replace(new RegExp(abbr.replace('.', '\\.'), 'g'), placeholder);
        });
        
        // Split by sentence endings
        const sentenceRegex = /([^.!?]+[.!?]+)/g;
        const matches = processedText.match(sentenceRegex) || [];
        
        let sentenceIndex = 0;
        let charOffset = 0;
        
        // Use generator to yield sentences one at a time
        for (const match of matches) {
            let sentence = match.trim();
            
            // Restore abbreviations
            for (const [placeholder, abbr] of abbreviationMap) {
                sentence = sentence.replace(new RegExp(placeholder, 'g'), abbr);
            }
            
            // Skip empty sentences
            if (!sentence) continue;
            
            // Extract sentence metadata
            const words = sentence.match(parserConfig.tokenPatterns.word) || [];
            const punctuation = sentence.match(parserConfig.tokenPatterns.punctuation) || [];
            
            // Yield sentence object with metadata
            yield {
                text: sentence,
                index: sentenceIndex++,
                charOffset: charOffset,
                charLength: sentence.length,
                wordCount: words.length,
                punctuationCount: punctuation.length,
                type: determineSentenceType(sentence),
                complexity: calculateSentenceComplexity(sentence, words.length)
            };
            
            charOffset += match.length;
        }
    }
    
    /**
     * Determine sentence type based on ending punctuation
     * 
     * @param {string} sentence - Sentence to analyze
     * @returns {string} Sentence type (declarative, interrogative, exclamatory, imperative)
     */
    const determineSentenceType = (sentence) => {
        const trimmed = sentence.trim();
        const lastChar = trimmed[trimmed.length - 1];
        
        switch (lastChar) {
            case '?':
                return 'interrogative';
            case '!':
                return 'exclamatory';
            case '.':
                // Check if it starts with imperative verb
                return /^(please|do|don't|let|make|help|stop|start)/i.test(trimmed) 
                    ? 'imperative' 
                    : 'declarative';
            default:
                return 'declarative';
        }
    };
    
    /**
     * Calculate sentence complexity score
     * 
     * @param {string} sentence - Sentence text
     * @param {number} wordCount - Number of words in sentence
     * @returns {number} Complexity score (0-1)
     */
    const calculateSentenceComplexity = (sentence, wordCount) => {
        let complexity = 0;
        
        // Length-based complexity
        if (wordCount > 25) complexity += 0.3;
        else if (wordCount > 15) complexity += 0.2;
        else if (wordCount > 10) complexity += 0.1;
        
        // Punctuation-based complexity
        const commas = (sentence.match(/,/g) || []).length;
        const semicolons = (sentence.match(/;/g) || []).length;
        const colons = (sentence.match(/:/g) || []).length;
        
        complexity += (commas * 0.05) + (semicolons * 0.1) + (colons * 0.1);
        
        // Subordinate clause indicators
        const subordinators = ['because', 'although', 'while', 'since', 'unless', 'if'];
        const hasSubordinator = subordinators.some(word => 
            new RegExp(`\\b${word}\\b`, 'i').test(sentence)
        );
        if (hasSubordinator) complexity += 0.15;
        
        // Normalize to 0-1 scale
        return Math.min(complexity, 1);
    };
    
    /**
     * Paragraph detection using forEach loops
     * Processes paragraphs and applies callback for each paragraph
     * 
     * @param {string} text - Text to parse into paragraphs
     * @param {function} [callback] - Optional callback to process each paragraph
     * @returns {array} Array of paragraph objects
     */
    const detectParagraphs = function(text, callback = null) {
        if (!text || typeof text !== 'string') {
            return [];
        }
        
        const paragraphs = [];
        const rawParagraphs = text.split(parserConfig.paragraphSeparator);
        
        // Use forEach loop to process each paragraph
        rawParagraphs.forEach((paragraphText, index) => {
            const trimmed = paragraphText.trim();
            
            // Skip empty paragraphs
            if (!trimmed) return;
            
            // Parse sentences in this paragraph
            const paragraphSentences = [];
            const sentenceGen = sentenceParser(trimmed);
            
            for (const sentence of sentenceGen) {
                paragraphSentences.push(sentence);
            }
            
            // Calculate paragraph statistics
            const wordCount = paragraphSentences.reduce((sum, sent) => sum + sent.wordCount, 0);
            const avgWordsPerSentence = paragraphSentences.length > 0 
                ? wordCount / paragraphSentences.length 
                : 0;
            
            // Create paragraph object
            const paragraphObj = {
                text: trimmed,
                index: index,
                sentenceCount: paragraphSentences.length,
                wordCount: wordCount,
                characterCount: trimmed.length,
                averageWordsPerSentence: Utils.math.round(avgWordsPerSentence, 2),
                sentences: paragraphSentences,
                complexity: calculateParagraphComplexity(paragraphSentences)
            };
            
            paragraphs.push(paragraphObj);
            
            // Execute callback if provided
            if (callback && typeof callback === 'function') {
                callback(paragraphObj, index);
            }
        });
        
        return paragraphs;
    };
    
    /**
     * Calculate paragraph complexity
     * 
     * @param {array} sentences - Array of sentence objects
     * @returns {number} Complexity score (0-1)
     */
    const calculateParagraphComplexity = (sentences) => {
        if (sentences.length === 0) return 0;
        
        const avgComplexity = sentences.reduce((sum, sent) => sum + sent.complexity, 0) / sentences.length;
        const lengthFactor = Math.min(sentences.length / 10, 0.3);
        
        return Math.min(avgComplexity + lengthFactor, 1);
    };
    
    /**
     * Text tokenization with map method for transformations
     * Tokenizes text into various token types with transformations
     * 
     * @param {string} text - Text to tokenize
     * @param {object} [options] - Tokenization options
     * @returns {object} Tokenized text with different token types
     */
    const tokenizeText = function(text, options = {}) {
        const {
            lowercase = true,
            removePunctuation = false,
            removeNumbers = false,
            stemming = false
        } = options;
        
        if (!text || typeof text !== 'string') {
            return {
                words: [],
                punctuation: [],
                numbers: [],
                whitespace: [],
                all: []
            };
        }
        
        // Extract different token types
        const words = (text.match(parserConfig.tokenPatterns.word) || [])
            .map(word => {
                // Apply transformations using map method
                let transformed = word;
                
                if (lowercase) {
                    transformed = transformed.toLowerCase();
                }
                
                if (removePunctuation) {
                    transformed = transformed.replace(/[^\w]/g, '');
                }
                
                if (stemming) {
                    transformed = applyStemming(transformed);
                }
                
                return transformed;
            })
            .filter(word => word.length > 0);
        
        const punctuation = (text.match(parserConfig.tokenPatterns.punctuation) || [])
            .map(punct => ({
                char: punct,
                type: getPunctuationType(punct)
            }));
        
        const numbers = (text.match(parserConfig.tokenPatterns.number) || [])
            .map(num => ({
                value: num,
                numericValue: parseInt(num, 10)
            }));
        
        const whitespace = (text.match(parserConfig.tokenPatterns.whitespace) || [])
            .map((space, index) => ({
                type: space.includes('\n') ? 'newline' : 'space',
                length: space.length,
                position: index
            }));
        
        // Create comprehensive token array
        const allTokens = [
            ...words.map(w => ({ type: 'word', value: w })),
            ...punctuation.map(p => ({ type: 'punctuation', value: p.char })),
            ...numbers.map(n => ({ type: 'number', value: n.value }))
        ];
        
        return {
            words,
            punctuation,
            numbers,
            whitespace,
            all: allTokens,
            statistics: {
                totalWords: words.length,
                totalPunctuation: punctuation.length,
                totalNumbers: numbers.length,
                totalWhitespace: whitespace.length,
                totalTokens: allTokens.length
            }
        };
    };
    
    /**
     * Get punctuation type
     * 
     * @param {string} punct - Punctuation character
     * @returns {string} Punctuation type
     */
    const getPunctuationType = (punct) => {
        const types = {
            '.': 'period',
            ',': 'comma',
            ';': 'semicolon',
            ':': 'colon',
            '!': 'exclamation',
            '?': 'question',
            '-': 'hyphen',
            '—': 'dash',
            '(': 'opening-parenthesis',
            ')': 'closing-parenthesis',
            '"': 'quote',
            "'": 'apostrophe'
        };
        
        return types[punct] || 'other';
    };
    
    /**
     * Simple stemming algorithm
     * 
     * @param {string} word - Word to stem
     * @returns {string} Stemmed word
     */
    const applyStemming = (word) => {
        // Simple suffix removal (basic Porter stemmer logic)
        const suffixes = ['ing', 'ed', 'ly', 'es', 's', 'er', 'est'];
        
        for (const suffix of suffixes) {
            if (word.endsWith(suffix) && word.length > suffix.length + 2) {
                return word.slice(0, -suffix.length);
            }
        }
        
        return word;
    };
    
    /**
     * Process text statistics using Object.entries()
     * Analyzes various text statistics and processes them
     * 
     * @param {string} text - Text to analyze
     * @returns {object} Comprehensive text statistics
     */
    const processTextStatistics = function(text) {
        if (!text || typeof text !== 'string') {
            return {};
        }
        
        // Gather raw statistics
        const rawStats = {
            characterCount: text.length,
            characterCountNoSpaces: text.replace(/\s/g, '').length,
            wordCount: (text.match(parserConfig.tokenPatterns.word) || []).length,
            sentenceCount: Array.from(sentenceParser(text)).length,
            paragraphCount: detectParagraphs(text).length,
            lineCount: text.split('\n').length,
            punctuationCount: (text.match(parserConfig.tokenPatterns.punctuation) || []).length,
            numberCount: (text.match(parserConfig.tokenPatterns.number) || []).length
        };
        
        // Process statistics using Object.entries()
        const processedStats = {};
        
        // Use Object.entries() to iterate and calculate derived statistics
        Object.entries(rawStats).forEach(([key, value]) => {
            processedStats[key] = value;
            
            // Add formatted version
            processedStats[`${key}Formatted`] = value.toLocaleString();
            
            // Calculate percentages for certain metrics
            if (key === 'characterCountNoSpaces' && rawStats.characterCount > 0) {
                processedStats.textDensity = Utils.math.round(
                    (value / rawStats.characterCount) * 100,
                    2
                );
            }
            
            if (key === 'punctuationCount' && rawStats.characterCount > 0) {
                processedStats.punctuationDensity = Utils.math.round(
                    (value / rawStats.characterCount) * 100,
                    2
                );
            }
        });
        
        // Calculate averages using Object.entries()
        const averages = {};
        
        const averageCalculations = {
            charactersPerWord: () => 
                rawStats.wordCount > 0 
                    ? rawStats.characterCountNoSpaces / rawStats.wordCount 
                    : 0,
            wordsPerSentence: () => 
                rawStats.sentenceCount > 0 
                    ? rawStats.wordCount / rawStats.sentenceCount 
                    : 0,
            sentencesPerParagraph: () => 
                rawStats.paragraphCount > 0 
                    ? rawStats.sentenceCount / rawStats.paragraphCount 
                    : 0,
            wordsPerParagraph: () => 
                rawStats.paragraphCount > 0 
                    ? rawStats.wordCount / rawStats.paragraphCount 
                    : 0,
            charactersPerLine: () => 
                rawStats.lineCount > 0 
                    ? rawStats.characterCount / rawStats.lineCount 
                    : 0
        };
        
        Object.entries(averageCalculations).forEach(([key, calculation]) => {
            averages[key] = Utils.math.round(calculation(), 2);
        });
        
        // Combine all statistics
        return {
            raw: rawStats,
            processed: processedStats,
            averages: averages,
            metadata: {
                analyzedAt: new Date().toISOString(),
                textLength: text.length,
                isEmpty: text.trim().length === 0
            }
        };
    };
    
    /**
     * Syllable counting algorithm with for loops and pattern matching
     * Counts syllables in a word using phonetic rules
     * 
     * @param {string} word - Word to count syllables
     * @returns {number} Number of syllables
     */
    const countSyllables = function(word) {
        if (!word || typeof word !== 'string') {
            return 0;
        }
        
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        
        if (cleanWord.length === 0) return 0;
        if (cleanWord.length <= 2) return 1;
        
        let syllableCount = 0;
        let previousWasVowel = false;
        const vowels = 'aeiouy';
        
        // Use for loop to iterate through characters for syllable counting
        for (let i = 0; i < cleanWord.length; i++) {
            const char = cleanWord[i];
            const isVowel = vowels.includes(char);
            
            // Count syllable when transitioning from consonant to vowel
            if (isVowel && !previousWasVowel) {
                syllableCount++;
            }
            
            previousWasVowel = isVowel;
        }
        
        // Apply phonetic rules using pattern matching
        
        // Rule 1: Silent 'e' at the end
        if (parserConfig.syllablePatterns.silentE.test(cleanWord)) {
            syllableCount--;
        }
        
        // Rule 2: Words ending in 'le' after consonant
        if (/[^aeiouy]le$/.test(cleanWord)) {
            syllableCount++;
        }
        
        // Rule 3: Handle special cases with for loop
        const specialCases = {
            'simile': 3,
            'recipe': 3,
            'people': 2,
            'chocolate': 3
        };
        
        for (const specialWord in specialCases) {
            if (cleanWord === specialWord) {
                return specialCases[specialWord];
            }
        }
        
        // Ensure at least one syllable
        return Math.max(syllableCount, 1);
    };
    
    /**
     * Count syllables in entire text
     * 
     * @param {string} text - Text to analyze
     * @returns {object} Syllable statistics
     */
    const countTextSyllables = function(text) {
        if (!text || typeof text !== 'string') {
            return {
                totalSyllables: 0,
                averageSyllablesPerWord: 0,
                wordSyllables: []
            };
        }
        
        const words = text.match(parserConfig.tokenPatterns.word) || [];
        const wordSyllables = [];
        let totalSyllables = 0;
        
        // Use for loop to count syllables for each word
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const syllables = countSyllables(word);
            
            totalSyllables += syllables;
            wordSyllables.push({
                word: word,
                syllables: syllables
            });
        }
        
        return {
            totalSyllables,
            averageSyllablesPerWord: words.length > 0 
                ? Utils.math.round(totalSyllables / words.length, 2) 
                : 0,
            wordSyllables,
            distribution: calculateSyllableDistribution(wordSyllables)
        };
    };
    
    /**
     * Calculate syllable distribution
     * 
     * @param {array} wordSyllables - Array of word-syllable objects
     * @returns {object} Distribution statistics
     */
    const calculateSyllableDistribution = (wordSyllables) => {
        const distribution = {};
        
        wordSyllables.forEach(({ syllables }) => {
            distribution[syllables] = (distribution[syllables] || 0) + 1;
        });
        
        return distribution;
    };
    
    /**
     * Parse complete text with all features
     * 
     * @param {string} text - Text to parse
     * @param {object} [options] - Parsing options
     * @returns {object} Complete parsing results
     */
    const parseText = function(text, options = {}) {
        const {
            includeSentences = true,
            includeParagraphs = true,
            includeTokens = true,
            includeStatistics = true,
            includeSyllables = true
        } = options;
        
        const results = {
            originalText: text,
            analyzedAt: new Date().toISOString()
        };
        
        if (includeSentences) {
            results.sentences = Array.from(sentenceParser(text));
        }
        
        if (includeParagraphs) {
            results.paragraphs = detectParagraphs(text);
        }
        
        if (includeTokens) {
            results.tokens = tokenizeText(text, options);
        }
        
        if (includeStatistics) {
            results.statistics = processTextStatistics(text);
        }
        
        if (includeSyllables) {
            results.syllables = countTextSyllables(text);
        }
        
        return results;
    };
    
    // Public API
    return {
        // Generator function for sentence parsing
        sentenceParser: sentenceParser,
        parseSentences: (text) => Array.from(sentenceParser(text)),
        
        // Paragraph detection with forEach
        detectParagraphs: detectParagraphs,
        
        // Text tokenization with map
        tokenizeText: tokenizeText,
        
        // Statistics processing with Object.entries()
        processTextStatistics: processTextStatistics,
        
        // Syllable counting with for loops
        countSyllables: countSyllables,
        countTextSyllables: countTextSyllables,
        
        // Comprehensive parsing
        parseText: parseText,
        
        // Utility methods
        getConfig: () => ({ ...parserConfig }),
        
        // Helper methods
        determineSentenceType: determineSentenceType,
        calculateSentenceComplexity: calculateSentenceComplexity,
        calculateParagraphComplexity: calculateParagraphComplexity
    };
    
})();

// Make available globally
window.AdvancedTextParser = AdvancedTextParser;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedTextParser;
}

console.log('📊 Advanced Text Parser module loaded successfully');
