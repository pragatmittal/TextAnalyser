
const statisticsEngine = {
    
    /**
     * Count words in text using for...of loop
     * @param {Array} words - Array of words to count
     * @returns {number} Word count
     */
    countWords: function(words) {
        if (!Array.isArray(words)) return 0;
        
        let count = 0;
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
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
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
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
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
        
        let processedText = text;
        const abbreviationPatterns = config.validation.abbreviationPatterns;
        
        for (const patternIndex in abbreviationPatterns) {
            const pattern = abbreviationPatterns[patternIndex];
            processedText = processedText.replace(pattern, match => match.replace('.', '|ABBREV|'));
        }
        
        for (let i = 0; i < processedText.length; i++) {
            const char = processedText[i];
            
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
        
        for (const word of words) {
            const normalizedWord = word.toLowerCase().trim();
            if (normalizedWord.length === 0) continue;
            
            frequencyMap.set(normalizedWord, (frequencyMap.get(normalizedWord) || 0) + 1);
        }
        
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
        
        const processedData = textPreprocessor.processText(text);
        
        const wordCount = this.countWords(processedData.words);
        const charCount = this.countCharacters(text, true);
        const charCountNoSpaces = this.countCharacters(text, false);
        const sentenceCount = this.countSentences(text);
        const paragraphCount = this.countParagraphs(text);
        
        const readingTime = this.calculateReadingTime(wordCount);
        const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
        const avgWordsPerParagraph = paragraphCount > 0 ? wordCount / paragraphCount : 0;
        
        const wordFrequency = this.analyzeWordFrequency(processedData.words);
        
        const characterTypes = this.countCharacterTypes(text);
        
        const sentences = processedData.sentences;
        const sentenceLengths = sentences.map(sentence => sentence.length);
        const avgSentenceLength = this.calculateAverage(sentenceLengths);
        
        const allWords = [...processedData.words];
        const complexWords = allWords.filter(word => utils.countSyllables(word) > 3);
        const longWords = allWords.filter(word => word.length > 6);
        
        const complexWordsPercentage = wordCount > 0 ? (complexWords.length / wordCount) * 100 : 0;
        const longWordsPercentage = wordCount > 0 ? (longWords.length / wordCount) * 100 : 0;
        
        const totalSyllables = allWords.reduce((total, word) => total + utils.countSyllables(word), 0);
        const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;
        
        const fleschScore = utils.calculateFleschScore(avgWordsPerSentence, avgSyllablesPerWord);
        const gradeLevel = utils.calculateGradeLevel(avgWordsPerSentence, avgSyllablesPerWord);
        const gunningFog = utils.calculateGunningFog(avgWordsPerSentence, complexWordsPercentage);
        
        const fleschInterpretation = utils.getFleschInterpretation(fleschScore);
        const gradeInterpretation = utils.getGradeLevelInterpretation(gradeLevel);
        const gunningFogInterpretation = utils.getGunningFogInterpretation(gunningFog);
        
        return {
            basicStats: {
                wordCount,
                charCount,
                charCountNoSpaces,
                sentenceCount,
                paragraphCount,
                readingTime
            },
            
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
            
            complexity: {
                longWordsCount: longWords.length,
                longWordsPercentage: utils.formatPercentage(longWords.length, wordCount),
                complexWordsCount: complexWords.length,
                complexWordsPercentage: utils.formatPercentage(complexWords.length, wordCount),
                avgSentenceLength: utils.formatNumber(avgSentenceLength),
                textDensity: utils.formatNumber(avgWordsPerParagraph)
            },
            
            frequency: wordFrequency,
            
            characterTypes,
            totalSyllables,
            avgWordsPerParagraph: utils.formatNumber(avgWordsPerParagraph),
            
            rawData: {
                words: allWords,
                sentences,
                paragraphs: processedData.paragraphs,
                processedData
            }
        };
    }
};

// Creating BasicStatisticsEngine object for cleaner API
const BasicStatisticsEngine = {
    analyze: function(text) {
        const comprehensive = statisticsEngine.getComprehensiveStatistics(text);
        
        return {
            words: comprehensive.basicStats ? {
                totalWords: comprehensive.basicStats.wordCount,
                uniqueWords: comprehensive.rawData?.words ? new Set(comprehensive.rawData.words).size : 0,
                averageWordLength: comprehensive.rawData?.words ? 
                    comprehensive.rawData.words.reduce((sum, w) => sum + w.length, 0) / comprehensive.rawData.words.length : 0
            } : { totalWords: 0, uniqueWords: 0, averageWordLength: 0 },
            
            characters: comprehensive.basicStats ? {
                total: comprehensive.basicStats.charCount,
                withoutSpaces: comprehensive.basicStats.charCountNoSpaces
            } : { total: 0, withoutSpaces: 0 },
            
            sentences: comprehensive.basicStats ? {
                count: comprehensive.basicStats.sentenceCount,
                averageWordsPerSentence: parseFloat(comprehensive.readability?.avgWordsPerSentence || 0)
            } : { count: 0, averageWordsPerSentence: 0 },
            
            paragraphs: comprehensive.basicStats ? {
                count: comprehensive.basicStats.paragraphCount
            } : { count: 0 },
            
            readingTime: comprehensive.basicStats?.readingTime || 0,
            
            comprehensive: comprehensive
        };
    },
    
    countWords: statisticsEngine.countWords,
    countCharacters: statisticsEngine.countCharacters,
    countSentences: statisticsEngine.countSentences,
    countParagraphs: statisticsEngine.countParagraphs,
    calculateAverage: statisticsEngine.calculateAverage,
    calculateReadingTime: statisticsEngine.calculateReadingTime,
    analyzeWordFrequency: statisticsEngine.analyzeWordFrequency,
    getComprehensiveStatistics: statisticsEngine.getComprehensiveStatistics,
    
    getStats: function(text) {
        return statisticsEngine.getComprehensiveStatistics(text);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = statisticsEngine;
} else if (typeof window !== 'undefined') {
    window.statisticsEngine = statisticsEngine;
    window.BasicStatisticsEngine = BasicStatisticsEngine; // Export with cleaner name
}


