/**
 * Basic Statistics Engine
 * Technical Focus: Word & Character Counting with Modern JavaScript Patterns
 * Uses for...of, for loops, for...in loops, spread/rest operators
 */

const BasicStatisticsEngine = (function() {
    'use strict';
    
    // Private configuration using object literal
    const statisticsConfig = {
        patterns: {
            words: /\b\w+\b/g,
            sentences: /[.!?]+/g,
            paragraphs: /\n\s*\n/g,
            whitespace: /\s+/g,
            punctuation: /[^\w\s]/g
        },
        characterTypes: {
            letters: /[a-zA-Z]/,
            numbers: /[0-9]/,
            spaces: /\s/,
            punctuation: /[^\w\s]/,
            special: /[^\w\s\d]/
        },
        commonWords: [
            'the', 'and', 'a', 'to', 'of', 'in', 'i', 'you', 'it', 'have',
            'to', 'that', 'for', 'do', 'he', 'with', 'on', 'this', 'we', 'be'
        ]
    };
    
    // Word counting function using for...of loops for arrays
    const countWordsAdvanced = function(text) {
        if (!text || typeof text !== 'string') {
            return {
                totalWords: 0,
                uniqueWords: 0,
                wordFrequency: {},
                averageWordLength: 0,
                longestWord: '',
                shortestWord: ''
            };
        }
        
        // Extract words into array
        const wordsArray = text.toLowerCase().match(statisticsConfig.patterns.words) || [];
        
        if (wordsArray.length === 0) {
            return {
                totalWords: 0,
                uniqueWords: 0,
                wordFrequency: {},
                averageWordLength: 0,
                longestWord: '',
                shortestWord: ''
            };
        }
        
        let totalLength = 0;
        let longestWord = '';
        let shortestWord = wordsArray[0];
        const wordFrequency = {};
        const uniqueWordsSet = new Set();
        
        // Use for...of loop to iterate through words array
        for (const word of wordsArray) {
            // Skip empty words or continue to next iteration
            if (!word) continue;
            
            // Track word frequency
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            
            // Add to unique words set
            uniqueWordsSet.add(word);
            
            // Calculate total length for average
            totalLength += word.length;
            
            // Find longest word
            if (word.length > longestWord.length) {
                longestWord = word;
            }
            
            // Find shortest word
            if (word.length < shortestWord.length) {
                shortestWord = word;
            }
        }
        
        return {
            totalWords: wordsArray.length,
            uniqueWords: uniqueWordsSet.size,
            wordFrequency: wordFrequency,
            averageWordLength: Utils.math.round(totalLength / wordsArray.length, 2),
            longestWord: longestWord,
            shortestWord: shortestWord,
            wordsArray: wordsArray // Include array for further processing
        };
    };
    
    // Character counting with for loops and continue statements
    const countCharactersAdvanced = function(text) {
        if (!text || typeof text !== 'string') {
            return {
                totalCharacters: 0,
                charactersNoSpaces: 0,
                letters: 0,
                numbers: 0,
                spaces: 0,
                punctuation: 0,
                specialCharacters: 0,
                characterFrequency: {},
                characterTypes: {}
            };
        }
        
        let totalCharacters = text.length;
        let charactersNoSpaces = 0;
        let letters = 0;
        let numbers = 0;
        let spaces = 0;
        let punctuation = 0;
        let specialCharacters = 0;
        const characterFrequency = {};
        const characterTypes = {
            letters: [],
            numbers: [],
            spaces: [],
            punctuation: [],
            special: []
        };
        
        // Use traditional for loop with continue statements for character analysis
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Skip null or undefined characters
            if (char === null || char === undefined) {
                continue;
            }
            
            // Count character frequency
            characterFrequency[char] = (characterFrequency[char] || 0) + 1;
            
            // Count characters excluding spaces
            if (char !== ' ' && char !== '\n' && char !== '\t' && char !== '\r') {
                charactersNoSpaces++;
            }
            
            // Categorize character types using continue for specific cases
            if (statisticsConfig.characterTypes.letters.test(char)) {
                letters++;
                characterTypes.letters.push(char);
                continue; // Skip to next character after categorizing
            }
            
            if (statisticsConfig.characterTypes.numbers.test(char)) {
                numbers++;
                characterTypes.numbers.push(char);
                continue;
            }
            
            if (statisticsConfig.characterTypes.spaces.test(char)) {
                spaces++;
                characterTypes.spaces.push(char);
                continue;
            }
            
            if (statisticsConfig.characterTypes.punctuation.test(char)) {
                punctuation++;
                characterTypes.punctuation.push(char);
                continue;
            }
            
            // If none of the above, it's a special character
            specialCharacters++;
            characterTypes.special.push(char);
        }
        
        return {
            totalCharacters,
            charactersNoSpaces,
            letters,
            numbers,
            spaces,
            punctuation,
            specialCharacters,
            characterFrequency,
            characterTypes,
            averageCharactersPerWord: totalCharacters > 0 ? Utils.math.round(totalCharacters / (text.match(/\b\w+\b/g) || []).length, 2) : 0
        };
    };
    
    // Sentence detection using for...in loops for pattern matching
    const detectSentencesAdvanced = function(text) {
        if (!text || typeof text !== 'string') {
            return {
                totalSentences: 0,
                sentences: [],
                averageWordsPerSentence: 0,
                averageCharactersPerSentence: 0,
                sentenceTypes: {},
                complexityScore: 0
            };
        }
        
        // Define sentence ending patterns with their types
        const sentencePatterns = {
            declarative: /[^.!?]*\.(?!\d)/g,  // Ends with period (not decimal)
            exclamatory: /[^.!?]*!/g,         // Ends with exclamation
            interrogative: /[^.!?]*\?/g,      // Ends with question mark
            compound: /[^.!?]*[.!?][.!?]+/g   // Multiple punctuation
        };
        
        let totalSentences = 0;
        const sentences = [];
        const sentenceTypes = {
            declarative: 0,
            exclamatory: 0,
            interrogative: 0,
            compound: 0
        };
        let totalWords = 0;
        let totalCharacters = 0;
        let complexityScore = 0;
        
        // Use for...in loop to iterate through pattern properties
        for (const patternType in sentencePatterns) {
            // Skip inherited properties
            if (!sentencePatterns.hasOwnProperty(patternType)) {
                continue;
            }
            
            const pattern = sentencePatterns[patternType];
            const matches = text.match(pattern) || [];
            
            // Process each match using for...of
            for (const match of matches) {
                const cleanSentence = match.trim();
                
                // Skip empty sentences
                if (!cleanSentence) continue;
                
                sentences.push({
                    text: cleanSentence,
                    type: patternType,
                    wordCount: (cleanSentence.match(/\b\w+\b/g) || []).length,
                    characterCount: cleanSentence.length
                });
                
                sentenceTypes[patternType]++;
                totalSentences++;
                
                // Calculate metrics for this sentence
                const wordsInSentence = (cleanSentence.match(/\b\w+\b/g) || []).length;
                totalWords += wordsInSentence;
                totalCharacters += cleanSentence.length;
                
                // Calculate complexity based on length and punctuation
                if (wordsInSentence > 20) complexityScore += 2;
                if (wordsInSentence > 15) complexityScore += 1;
                if (/[,;:]/.test(cleanSentence)) complexityScore += 1;
            }
        }
        
        // Remove duplicates and sort sentences by appearance
        const uniqueSentences = [...new Set(sentences.map(s => s.text))]
            .map(text => sentences.find(s => s.text === text));
        
        return {
            totalSentences: uniqueSentences.length,
            sentences: uniqueSentences,
            averageWordsPerSentence: totalSentences > 0 ? Utils.math.round(totalWords / totalSentences, 2) : 0,
            averageCharactersPerSentence: totalSentences > 0 ? Utils.math.round(totalCharacters / totalSentences, 2) : 0,
            sentenceTypes,
            complexityScore: Utils.math.round(complexityScore / Math.max(totalSentences, 1), 2)
        };
    };
    
    // Array manipulation using spread operator
    const processTextSegments = function(...textSegments) {
        // Use rest operator to handle multiple text segments
        if (textSegments.length === 0) {
            return {
                combinedText: '',
                segmentAnalysis: [],
                totalStats: {},
                comparison: {}
            };
        }
        
        // Use spread operator to create a new array and process segments
        const processedSegments = [...textSegments].map((segment, index) => {
            if (typeof segment !== 'string') {
                console.warn(`Segment ${index} is not a string, converting...`);
                segment = String(segment || '');
            }
            
            return {
                index,
                originalText: segment,
                wordStats: countWordsAdvanced(segment),
                characterStats: countCharactersAdvanced(segment),
                sentenceStats: detectSentencesAdvanced(segment)
            };
        });
        
        // Combine all segments using spread operator
        const combinedText = [...textSegments].join(' ');
        
        // Calculate total statistics using spread operator for array operations
        const allWords = processedSegments.reduce((acc, segment) => {
            return [...acc, ...segment.wordStats.wordsArray];
        }, []);
        
        const totalStats = {
            segments: textSegments.length,
            totalWords: allWords.length,
            totalCharacters: combinedText.length,
            totalSentences: processedSegments.reduce((sum, seg) => sum + seg.sentenceStats.totalSentences, 0),
            averageWordsPerSegment: Utils.math.round(allWords.length / textSegments.length, 2),
            combinedWordStats: countWordsAdvanced(combinedText),
            combinedCharacterStats: countCharactersAdvanced(combinedText),
            combinedSentenceStats: detectSentencesAdvanced(combinedText)
        };
        
        // Create comparison between segments
        const comparison = compareSegments(...processedSegments);
        
        return {
            combinedText,
            segmentAnalysis: processedSegments,
            totalStats,
            comparison
        };
    };
    
    // Segment comparison using spread and rest operators
    const compareSegments = function(...segments) {
        if (segments.length < 2) {
            return {
                mostWordy: null,
                mostComplex: null,
                mostDiverse: null,
                similarities: []
            };
        }
        
        // Use spread operator to create comparison arrays
        const wordCounts = [...segments].map(seg => seg.wordStats.totalWords);
        const complexityScores = [...segments].map(seg => seg.sentenceStats.complexityScore);
        const diversityScores = [...segments].map(seg => seg.wordStats.uniqueWords / Math.max(seg.wordStats.totalWords, 1));
        
        // Find segments with extreme values
        const mostWordyIndex = wordCounts.indexOf(Math.max(...wordCounts));
        const mostComplexIndex = complexityScores.indexOf(Math.max(...complexityScores));
        const mostDiverseIndex = diversityScores.indexOf(Math.max(...diversityScores));
        
        // Calculate similarities between segments
        const similarities = [];
        for (let i = 0; i < segments.length; i++) {
            for (let j = i + 1; j < segments.length; j++) {
                const similarity = calculateSimilarity(segments[i], segments[j]);
                similarities.push({
                    segment1: i,
                    segment2: j,
                    similarity: similarity
                });
            }
        }
        
        return {
            mostWordy: segments[mostWordyIndex],
            mostComplex: segments[mostComplexIndex],
            mostDiverse: segments[mostDiverseIndex],
            similarities: similarities.sort((a, b) => b.similarity - a.similarity)
        };
    };
    
    // Calculate similarity between two segments
    const calculateSimilarity = (segment1, segment2) => {
        const words1 = new Set(segment1.wordStats.wordsArray);
        const words2 = new Set(segment2.wordStats.wordsArray);
        
        // Calculate Jaccard similarity
        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);
        
        return union.size > 0 ? Utils.math.round(intersection.size / union.size, 3) : 0;
    };
    
    // Comprehensive text analysis combining all methods
    const analyzeTextComprehensively = function(text, options = {}) {
        const {
            includeWordAnalysis = true,
            includeCharacterAnalysis = true,
            includeSentenceAnalysis = true,
            includeAdvancedMetrics = true
        } = options;
        
        const analysisResult = {
            timestamp: new Date().toISOString(),
            textLength: text ? text.length : 0,
            analysisOptions: options
        };
        
        if (includeWordAnalysis) {
            analysisResult.words = countWordsAdvanced(text);
        }
        
        if (includeCharacterAnalysis) {
            analysisResult.characters = countCharactersAdvanced(text);
        }
        
        if (includeSentenceAnalysis) {
            analysisResult.sentences = detectSentencesAdvanced(text);
        }
        
        if (includeAdvancedMetrics) {
            analysisResult.advanced = calculateAdvancedMetrics(text, analysisResult);
        }
        
        return analysisResult;
    };
    
    // Calculate advanced metrics using all previous analyses
    const calculateAdvancedMetrics = (text, basicAnalysis) => {
        const { words = {}, characters = {}, sentences = {} } = basicAnalysis;
        
        return {
            readabilityIndicators: {
                averageWordsPerSentence: sentences.averageWordsPerSentence || 0,
                averageCharactersPerWord: words.averageWordLength || 0,
                vocabularyDiversity: words.totalWords > 0 ? Utils.math.round(words.uniqueWords / words.totalWords, 3) : 0,
                punctuationDensity: characters.totalCharacters > 0 ? Utils.math.round(characters.punctuation / characters.totalCharacters, 3) : 0
            },
            textComplexity: {
                sentenceComplexity: sentences.complexityScore || 0,
                wordComplexity: words.averageWordLength > 6 ? 'high' : words.averageWordLength > 4 ? 'medium' : 'low',
                overallComplexity: calculateOverallComplexity(words, characters, sentences)
            },
            textBalance: {
                letterToNumberRatio: characters.numbers > 0 ? Utils.math.round(characters.letters / characters.numbers, 2) : characters.letters,
                wordToSentenceRatio: sentences.totalSentences > 0 ? Utils.math.round(words.totalWords / sentences.totalSentences, 2) : 0,
                punctuationBalance: Utils.math.round(characters.punctuation / Math.max(sentences.totalSentences, 1), 2)
            }
        };
    };
    
    // Calculate overall complexity score
    const calculateOverallComplexity = (words, characters, sentences) => {
        let score = 0;
        
        // Word complexity factors
        if (words.averageWordLength > 6) score += 2;
        if (words.uniqueWords / Math.max(words.totalWords, 1) > 0.7) score += 1;
        
        // Sentence complexity factors
        if (sentences.averageWordsPerSentence > 20) score += 2;
        if (sentences.complexityScore > 1.5) score += 1;
        
        // Character complexity factors
        if (characters.specialCharacters / Math.max(characters.totalCharacters, 1) > 0.1) score += 1;
        
        return Utils.math.round(score / 6, 2); // Normalize to 0-1 scale
    };
    
    // Public API
    return {
        // Core counting functions
        countWords: countWordsAdvanced,
        countCharacters: countCharactersAdvanced,
        detectSentences: detectSentencesAdvanced,
        
        // Multi-segment processing
        processSegments: processTextSegments,
        compareSegments: compareSegments,
        
        // Comprehensive analysis
        analyze: analyzeTextComprehensively,
        
        // Utility methods
        calculateSimilarity: calculateSimilarity,
        getConfig: () => ({ ...statisticsConfig }),
        
        // Batch processing for multiple texts
        analyzeBatch: function(...texts) {
            return texts.map(text => analyzeTextComprehensively(text));
        }
    };
    
})();

// Make available globally
window.BasicStatisticsEngine = BasicStatisticsEngine;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BasicStatisticsEngine;
}