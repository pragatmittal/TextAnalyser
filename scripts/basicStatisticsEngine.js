/**
 * Basic Statistics Engine
 * Core statistical analysis functions for text analysis
 * Uses for loops, for...of loops, for...in loops, spread operator, and rest operator
 */

const statisticsEngine = {
    
    /**
     * Count words in text using for...of loop
     * @param {Array} words - Array of words to count
     * @returns {number} Word count
     */
    countWords: function(words) {
        if (!Array.isArray(words)) return 0;
        
        let count = 0;
        // Use for...of loop to iterate through word arrays
        for (const word of words) {
            if (word && word.trim().length > 0) {
                count++;
            }
        }
        return count;
    },
    
    /**
     * Count characters in text using traditional for loop
     * @param {string} text - Text to analyze
     * @param {boolean} includeSpaces - Whether to include spaces in count
     * @returns {number} Character count
     */
    countCharacters: function(text, includeSpaces = true) {
        if (!text || typeof text !== 'string') return 0;
        
        let count = 0;
        // Use traditional for loop for character counting
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Use continue statement to skip whitespace when needed
            if (!includeSpaces && (char === ' ' || char === '\t' || char === '\n')) {
                continue;
            }
            
            count++;
        }
        return count;
    },
    
    /**
     * Count different types of characters using for loop with continue
     * @param {string} text - Text to analyze
     * @returns {object} Character type counts
     */
    countCharacterTypes: function(text) {
        if (!text || typeof text !== 'string') {
            return {
                letters: 0,
                digits: 0,
                spaces: 0,
                punctuation: 0,
                special: 0
            };
        }
        
        const counts = {
            letters: 0,
            digits: 0,
            spaces: 0,
            punctuation: 0,
            special: 0
        };
        
        // Use traditional for loop for character analysis
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Use continue statements to skip certain character types
            if (char.match(/[a-zA-Z]/)) {
                counts.letters++;
                continue;
            }
            
            if (char.match(/[0-9]/)) {
                counts.digits++;
                continue;
            }
            
            if (char.match(/\s/)) {
                counts.spaces++;
                continue;
            }
            
            if (char.match(/[.,!?;:()\[\]{}'"`~@#$%^&*+=|\\\/<>]/)) {
                counts.punctuation++;
                continue;
            }
            
            counts.special++;
        }
        
        return counts;
    },
    
    /**
     * Count sentences using for...in loop to check pattern properties
     * @param {string} text - Text to analyze
     * @returns {number} Sentence count
     */
    countSentences: function(text) {
        if (!text || typeof text !== 'string') return 0;
        
        let sentenceCount = 0;
        let inAbbreviation = false;
        
        // Handle abbreviations first
        let processedText = text;
        const abbreviationPatterns = config.validation.abbreviationPatterns;
        
        // Use for...in loop to check pattern properties
        for (const patternIndex in abbreviationPatterns) {
            const pattern = abbreviationPatterns[patternIndex];
            processedText = processedText.replace(pattern, match => match.replace('.', '|ABBREV|'));
        }
        
        // Count sentence endings
        for (let i = 0; i < processedText.length; i++) {
            const char = processedText[i];
            
            // Skip if we're in an abbreviation
            if (char === '|') {
                inAbbreviation = !inAbbreviation;
                continue;
            }
            
            if (!inAbbreviation && (char === '.' || char === '!' || char === '?')) {
                sentenceCount++;
            }
        }
        
        return Math.max(1, sentenceCount); // At least one sentence
    },
    
    /**
     * Count paragraphs using for loop
     * @param {string} text - Text to analyze
     * @returns {number} Paragraph count
     */
    countParagraphs: function(text) {
        if (!text || typeof text !== 'string') return 0;
        
        const paragraphs = text.split(/\n\s*\n/);
        let count = 0;
        
        // Use for loop to count non-empty paragraphs
        for (let i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].trim().length > 0) {
                count++;
            }
        }
        
        return Math.max(1, count); // At least one paragraph
    },
    
    /**
     * Calculate reading time using for loop
     * @param {number} wordCount - Number of words
     * @param {string} readingSpeed - Reading speed preference
     * @returns {number} Reading time in minutes
     */
    calculateReadingTime: function(wordCount, readingSpeed = 'average') {
        if (wordCount <= 0) return 0;
        
        const speeds = config.readingSpeeds;
        const wordsPerMinute = speeds[readingSpeed] || speeds.average;
        
        return wordCount / wordsPerMinute;
    },
    
    /**
     * Analyze word frequency using spread operator and for...of loop
     * @param {Array} words - Array of words to analyze
     * @param {number} maxWords - Maximum number of frequent words to return
     * @returns {Array} Array of word frequency objects
     */
    analyzeWordFrequency: function(words, maxWords = config.displayFormats.maxFrequencyWords) {
        if (!Array.isArray(words) || words.length === 0) return [];
        
        const frequencyMap = new Map();
        
        // Use for...of loop to count word frequencies
        for (const word of words) {
            const normalizedWord = word.toLowerCase().trim();
            if (normalizedWord.length === 0) continue;
            
            frequencyMap.set(normalizedWord, (frequencyMap.get(normalizedWord) || 0) + 1);
        }
        
        // Convert to array and sort using spread operator
        const sortedWords = [...frequencyMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxWords)
            .map(([word, count]) => ({ word, count }));
        
        return sortedWords;
    },
    
    /**
     * Calculate average metrics using for...of loop
     * @param {Array} values - Array of numeric values
     * @returns {number} Average value
     */
    calculateAverage: function(values) {
        if (!Array.isArray(values) || values.length === 0) return 0;
        
        let sum = 0;
        let count = 0;
        
        // Use for...of loop to sum values
        for (const value of values) {
            if (typeof value === 'number' && !isNaN(value)) {
                sum += value;
                count++;
            }
        }
        
        return count > 0 ? sum / count : 0;
    },
    
    /**
     * Calculate text density using rest operator
     * @param {number} wordCount - Total word count
     * @param {...number} paragraphCounts - Variable number of paragraph counts
     * @returns {number} Average words per paragraph
     */
    calculateTextDensity: function(wordCount, ...paragraphCounts) {
        // Use rest operator to collect multiple paragraph counts
        const totalParagraphs = paragraphCounts.reduce((sum, count) => sum + count, 0);
        
        if (totalParagraphs === 0) return 0;
        return wordCount / totalParagraphs;
    },
    
    /**
     * Get comprehensive text statistics using multiple analysis methods
     * @param {string} text - Text to analyze
     * @returns {object} Complete statistics object
     */
    getComprehensiveStatistics: function(text) {
        if (!text || typeof text !== 'string') {
            return utils.deepCopy(config.resultTemplates.basicStats);
        }
        
        // Process text using the preprocessor
        const processedData = textPreprocessor.processText(text);
        
        // Extract basic counts
        const wordCount = this.countWords(processedData.words);
        const charCount = this.countCharacters(text, true);
        const charCountNoSpaces = this.countCharacters(text, false);
        const sentenceCount = this.countSentences(text);
        const paragraphCount = this.countParagraphs(text);
        
        // Calculate derived metrics
        const readingTime = this.calculateReadingTime(wordCount);
        const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
        const avgWordsPerParagraph = paragraphCount > 0 ? wordCount / paragraphCount : 0;
        
        // Analyze word frequency using spread operator
        const wordFrequency = this.analyzeWordFrequency(processedData.words);
        
        // Calculate character type distribution
        const characterTypes = this.countCharacterTypes(text);
        
        // Calculate average sentence length in characters
        const sentences = processedData.sentences;
        const sentenceLengths = sentences.map(sentence => sentence.length);
        const avgSentenceLength = this.calculateAverage(sentenceLengths);
        
        // Use spread operator to combine arrays for additional analysis
        const allWords = [...processedData.words];
        const complexWords = allWords.filter(word => utils.countSyllables(word) > 3);
        const longWords = allWords.filter(word => word.length > 6);
        
        // Calculate percentages using rest operator
        const complexWordsPercentage = wordCount > 0 ? (complexWords.length / wordCount) * 100 : 0;
        const longWordsPercentage = wordCount > 0 ? (longWords.length / wordCount) * 100 : 0;
        
        // Calculate syllables and readability metrics
        const totalSyllables = allWords.reduce((total, word) => total + utils.countSyllables(word), 0);
        const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;
        
        // Calculate readability scores
        const fleschScore = utils.calculateFleschScore(avgWordsPerSentence, avgSyllablesPerWord);
        const gradeLevel = utils.calculateGradeLevel(avgWordsPerSentence, avgSyllablesPerWord);
        const gunningFog = utils.calculateGunningFog(avgWordsPerSentence, complexWordsPercentage);
        
        // Get interpretations
        const fleschInterpretation = utils.getFleschInterpretation(fleschScore);
        const gradeInterpretation = utils.getGradeLevelInterpretation(gradeLevel);
        const gunningFogInterpretation = utils.getGunningFogInterpretation(gunningFog);
        
        return {
            // Basic statistics
            basicStats: {
                wordCount,
                charCount,
                charCountNoSpaces,
                sentenceCount,
                paragraphCount,
                readingTime
            },
            
            // Readability analysis
            readability: {
                avgWordsPerSentence: utils.formatNumber(avgWordsPerSentence),
                avgSyllablesPerWord: utils.formatNumber(avgSyllablesPerWord),
                fleschScore: utils.formatNumber(fleschScore),
                fleschInterpretation: `${fleschInterpretation.label} (${fleschInterpretation.description})`,
                gradeLevel: utils.formatNumber(gradeLevel),
                gradeInterpretation: `${gradeInterpretation.label} (${gradeInterpretation.range})`,
                gunningFog: utils.formatNumber(gunningFog),
                gunningFogInterpretation: `${gunningFogInterpretation.label} (${gunningFogInterpretation.description})`
            },
            
            // Text complexity
            complexity: {
                longWordsCount: longWords.length,
                longWordsPercentage: utils.formatPercentage(longWords.length, wordCount),
                complexWordsCount: complexWords.length,
                complexWordsPercentage: utils.formatPercentage(complexWords.length, wordCount),
                avgSentenceLength: utils.formatNumber(avgSentenceLength),
                textDensity: utils.formatNumber(avgWordsPerParagraph)
            },
            
            // Word frequency
            frequency: wordFrequency,
            
            // Additional metrics
            characterTypes,
            totalSyllables,
            avgWordsPerParagraph: utils.formatNumber(avgWordsPerParagraph),
            
            // Raw data for further processing
            rawData: {
                words: allWords,
                sentences,
                paragraphs: processedData.paragraphs,
                processedData
            }
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = statisticsEngine;
} else if (typeof window !== 'undefined') {
    window.statisticsEngine = statisticsEngine;
}
