
const FrequencyAnalyzer = (function() {
    'use strict';
    
    const config = {
        stopWords: new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
            'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further',
            'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
            'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only',
            'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should'
        ]),
        minWordLength: 2,
        maxResults: 50
    };
    
    /**
     * Analyze word frequency using Set and Map data structures
     * 
     * @param {string} text - Text to analyze
     * @param {object} [options] - Analysis options
     * @returns {object} Frequency analysis results
     */
    const analyzeWordFrequency = function(text, options = {}) {
        const {
            excludeStopWords = true,
            caseSensitive = false,
            minLength = config.minWordLength,
            maxResults = config.maxResults
        } = options;
        
        if (!text || typeof text !== 'string') {
            return {
                frequencyMap: new Map(),
                uniqueWords: new Set(),
                totalWords: 0,
                uniqueCount: 0,
                topWords: []
            };
        }
        
        const words = text.match(/\b\w+\b/g) || [];
        
        const uniqueWords = new Set();
        
        const frequencyMap = new Map();
        
        let totalProcessedWords = 0;
        
        words.forEach(word => {
            let processedWord = caseSensitive ? word : word.toLowerCase();
            
            if (processedWord.length < minLength) return;
            if (excludeStopWords && config.stopWords.has(processedWord)) return;
            
            uniqueWords.add(processedWord);
            
            const currentCount = frequencyMap.get(processedWord) || 0;
            frequencyMap.set(processedWord, currentCount + 1);
            
            totalProcessedWords++;
        });
        
        const topWords = sortByFrequency(frequencyMap, maxResults);
        
        const statistics = calculateFrequencyStatistics(frequencyMap, totalProcessedWords);
        
        return {
            frequencyMap,
            uniqueWords,
            totalWords: totalProcessedWords,
            uniqueCount: uniqueWords.size,
            topWords,
            statistics,
            diversity: calculateLexicalDiversity(uniqueWords.size, totalProcessedWords)
        };
    };
    
    /**
     * Sort frequency map by count using array methods and forEach
     * 
     * @param {Map} frequencyMap - Map of word frequencies
     * @param {number} limit - Maximum number of results
     * @returns {array} Sorted array of word-frequency pairs
     */
    const sortByFrequency = function(frequencyMap, limit) {
        const frequencyArray = [...frequencyMap.entries()];
        
        frequencyArray.sort((a, b) => b[1] - a[1]);
        
        const topWords = [];
        const maxLimit = Math.min(limit, frequencyArray.length);
        
        frequencyArray.slice(0, maxLimit).forEach(([word, count], index) => {
            topWords.push({
                rank: index + 1,
                word: word,
                count: count,
                percentage: 0 
            });
        });
        
        return topWords;
    };
    
    /**
     * Calculate frequency statistics
     * 
     * @param {Map} frequencyMap - Map of word frequencies
     * @param {number} totalWords - Total word count
     * @returns {object} Statistical analysis
     */
    const calculateFrequencyStatistics = function(frequencyMap, totalWords) {
        const frequencies = [...frequencyMap.values()];
        
        if (frequencies.length === 0) {
            return {
                mean: 0,
                median: 0,
                mode: 0,
                range: { min: 0, max: 0 },
                totalOccurrences: 0
            };
        }
        
        const sum = frequencies.reduce((acc, freq) => acc + freq, 0);
        const mean = sum / frequencies.length;
        
        const sortedFreqs = [...frequencies].sort((a, b) => a - b);
        const middle = Math.floor(sortedFreqs.length / 2);
        const median = sortedFreqs.length % 2 === 0
            ? (sortedFreqs[middle - 1] + sortedFreqs[middle]) / 2
            : sortedFreqs[middle];
        
        const mode = Math.max(...frequencies);
        
        const range = {
            min: Math.min(...frequencies),
            max: Math.max(...frequencies)
        };
        
        return {
            mean: Utils.math.round(mean, 2),
            median: Utils.math.round(median, 2),
            mode,
            range,
            totalOccurrences: sum,
            averageOccurrences: Utils.math.round(sum / frequencies.length, 2)
        };
    };
    
    /**
     * Calculate lexical diversity (Type-Token Ratio)
     * 
     * @param {number} uniqueCount - Number of unique words
     * @param {number} totalCount - Total word count
     * @returns {object} Diversity metrics
     */
    const calculateLexicalDiversity = function(uniqueCount, totalCount) {
        if (totalCount === 0) {
            return {
                ttr: 0,
                interpretation: 'No words to analyze'
            };
        }
        
        const ttr = uniqueCount / totalCount;
        
        let interpretation;
        if (ttr > 0.7) interpretation = 'Very High - Highly diverse vocabulary';
        else if (ttr > 0.5) interpretation = 'High - Diverse vocabulary';
        else if (ttr > 0.3) interpretation = 'Medium - Moderate vocabulary diversity';
        else if (ttr > 0.1) interpretation = 'Low - Limited vocabulary diversity';
        else interpretation = 'Very Low - Highly repetitive';
        
        return {
            ttr: Utils.math.round(ttr, 4),
            percentage: Utils.math.round(ttr * 100, 2),
            interpretation,
            uniqueWords: uniqueCount,
            totalWords: totalCount
        };
    };
    
    /**
     * Analyze n-grams (word pairs, triplets, etc.)
     * 
     * @param {string} text - Text to analyze
     * @param {number} n - Size of n-gram (2 for bigrams, 3 for trigrams)
     * @param {number} [topCount=20] - Number of top n-grams to return
     * @returns {object} N-gram analysis
     */
    const analyzeNGrams = function(text, n = 2, topCount = 20) {
        if (!text || typeof text !== 'string' || n < 1) {
            return {
                ngramMap: new Map(),
                topNGrams: [],
                totalNGrams: 0
            };
        }
        
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        
        const ngramMap = new Map();
        
        for (let i = 0; i <= words.length - n; i++) {
            const ngram = words.slice(i, i + n).join(' ');
            const count = ngramMap.get(ngram) || 0;
            ngramMap.set(ngram, count + 1);
        }
        
        const topNGrams = [...ngramMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, topCount)
            .map(([ngram, count], index) => ({
                rank: index + 1,
                ngram,
                count,
                words: ngram.split(' ')
            }));
        
        return {
            ngramMap,
            topNGrams,
            totalNGrams: ngramMap.size,
            ngramSize: n
        };
    };
    
    /**
     * Merge multiple frequency analyses using spread operator
     * 
     * @param {...object} analyses - Variable number of analysis objects
     * @returns {object} Merged analysis
     */
    const mergeAnalyses = function(...analyses) {
        const mergedFrequencyMap = new Map();
        const mergedUniqueWords = new Set();
        let totalWords = 0;
        
        analyses.forEach(analysis => {
            if (!analysis || !analysis.frequencyMap) return;
            
            [...analysis.frequencyMap.entries()].forEach(([word, count]) => {
                const currentCount = mergedFrequencyMap.get(word) || 0;
                mergedFrequencyMap.set(word, currentCount + count);
            });
            
            [...analysis.uniqueWords].forEach(word => {
                mergedUniqueWords.add(word);
            });
            
            totalWords += analysis.totalWords;
        });
        
        const topWords = sortByFrequency(mergedFrequencyMap, config.maxResults);
        
        return {
            frequencyMap: mergedFrequencyMap,
            uniqueWords: mergedUniqueWords,
            totalWords,
            uniqueCount: mergedUniqueWords.size,
            topWords,
            sourceCount: analyses.length,
            diversity: calculateLexicalDiversity(mergedUniqueWords.size, totalWords)
        };
    };
    
    /**
     * Compare frequency analyses between two texts
     * 
     * @param {object} analysis1 - First analysis
     * @param {object} analysis2 - Second analysis
     * @returns {object} Comparison results
     */
    const compareAnalyses = function(analysis1, analysis2) {
        if (!analysis1 || !analysis2) {
            return {
                commonWords: new Set(),
                uniqueToFirst: new Set(),
                uniqueToSecond: new Set(),
                frequencyDifferences: new Map()
            };
        }
        
        const words1 = analysis1.uniqueWords;
        const words2 = analysis2.uniqueWords;
        
        const commonWords = new Set([...words1].filter(word => words2.has(word)));
        const uniqueToFirst = new Set([...words1].filter(word => !words2.has(word)));
        const uniqueToSecond = new Set([...words2].filter(word => !words1.has(word)));
        
        const frequencyDifferences = new Map();
        
        commonWords.forEach(word => {
            const freq1 = analysis1.frequencyMap.get(word) || 0;
            const freq2 = analysis2.frequencyMap.get(word) || 0;
            const difference = freq1 - freq2;
            
            frequencyDifferences.set(word, {
                frequency1: freq1,
                frequency2: freq2,
                difference,
                percentageDiff: freq1 > 0 ? Utils.math.round(((freq1 - freq2) / freq1) * 100, 2) : 0
            });
        });
        
        const jaccardSimilarity = calculateJaccardSimilarity(words1, words2);
        const overlapCoefficient = calculateOverlapCoefficient(words1, words2);
        
        return {
            commonWords,
            uniqueToFirst,
            uniqueToSecond,
            frequencyDifferences,
            statistics: {
                commonWordCount: commonWords.size,
                uniqueToFirstCount: uniqueToFirst.size,
                uniqueToSecondCount: uniqueToSecond.size,
                jaccardSimilarity,
                overlapCoefficient
            }
        };
    };
    
    /**
     * Calculate Jaccard similarity coefficient
     * 
     * @param {Set} set1 - First set
     * @param {Set} set2 - Second set
     * @returns {number} Similarity coefficient (0-1)
     */
    const calculateJaccardSimilarity = function(set1, set2) {
        const intersection = new Set([...set1].filter(item => set2.has(item)));
        const union = new Set([...set1, ...set2]);
        
        return union.size > 0 ? Utils.math.round(intersection.size / union.size, 4) : 0;
    };
    
    /**
     * Calculate overlap coefficient
     * 
     * @param {Set} set1 - First set
     * @param {Set} set2 - Second set
     * @returns {number} Overlap coefficient (0-1)
     */
    const calculateOverlapCoefficient = function(set1, set2) {
        const intersection = new Set([...set1].filter(item => set2.has(item)));
        const minSize = Math.min(set1.size, set2.size);
        
        return minSize > 0 ? Utils.math.round(intersection.size / minSize, 4) : 0;
    };
    
    /**
     * Analyze character frequency
     * 
     * @param {string} text - Text to analyze
     * @param {boolean} [caseSensitive=false] - Whether to be case-sensitive
     * @returns {object} Character frequency analysis
     */
    const analyzeCharacterFrequency = function(text, caseSensitive = false) {
        if (!text || typeof text !== 'string') {
            return {
                frequencyMap: new Map(),
                totalCharacters: 0,
                uniqueCharacters: new Set()
            };
        }
        
        const processedText = caseSensitive ? text : text.toLowerCase();
        const charMap = new Map();
        const uniqueChars = new Set();
        
        for (const char of processedText) {
            if (/\s/.test(char)) continue;
            
            uniqueChars.add(char);
            const count = charMap.get(char) || 0;
            charMap.set(char, count + 1);
        }
        
        const sortedChars = [...charMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([char, count], index) => ({
                rank: index + 1,
                character: char,
                count,
                isLetter: /[a-z]/i.test(char),
                isNumber: /\d/.test(char),
                isPunctuation: /[^\w\s]/.test(char)
            }));
        
        return {
            frequencyMap: charMap,
            totalCharacters: processedText.replace(/\s/g, '').length,
            uniqueCharacters: uniqueChars,
            sortedCharacters: sortedChars,
            uniqueCount: uniqueChars.size
        };
    };
    
    /**
     * Process frequency data using for...in loops for object property iteration
     * 
     * @param {object} frequencyData - Frequency analysis data
     * @returns {object} Processed frequency data with additional metrics
     */
    const processFrequencyData = function(frequencyData) {
        const processed = {
            ...frequencyData,
            categories: {},
            distributions: {},
            insights: []
        };
        
        for (const property in frequencyData) {
            if (!frequencyData.hasOwnProperty(property)) continue;
            
            const value = frequencyData[property];
            
            if (typeof value === 'number') {
                processed.categories[property] = 'numeric';
                processed.distributions[property] = {
                    value,
                    formatted: value.toLocaleString()
                };
            } else if (value instanceof Map) {
                processed.categories[property] = 'map';
                processed.distributions[property] = {
                    size: value.size,
                    isEmpty: value.size === 0
                };
            } else if (value instanceof Set) {
                processed.categories[property] = 'set';
                processed.distributions[property] = {
                    size: value.size,
                    isEmpty: value.size === 0
                };
            } else if (Array.isArray(value)) {
                processed.categories[property] = 'array';
                processed.distributions[property] = {
                    length: value.length,
                    isEmpty: value.length === 0
                };
            } else if (typeof value === 'object' && value !== null) {
                processed.categories[property] = 'object';
                
                let propCount = 0;
                for (const prop in value) {
                    if (value.hasOwnProperty(prop)) propCount++;
                }
                
                processed.distributions[property] = {
                    propertyCount: propCount
                };
            }
        }
        
        if (frequencyData.diversity && frequencyData.diversity.ttr < 0.3) {
            processed.insights.push('Low vocabulary diversity - text may be repetitive');
        }
        
        if (frequencyData.topWords && frequencyData.topWords.length > 0) {
            const topWord = frequencyData.topWords[0];
            if (topWord.count > frequencyData.totalWords * 0.1) {
                processed.insights.push(`Word "${topWord.word}" appears very frequently (${topWord.count} times)`);
            }
        }
        
        return processed;
    };
    
    /**
     * Sort frequency results with custom sorting algorithms
     * 
     * @param {Map} frequencyMap - Map to sort
     * @param {string} sortBy - Sort criteria ('frequency', 'alphabetical', 'length')
     * @param {string} order - Sort order ('asc', 'desc')
     * @returns {array} Sorted results
     */
    const customSort = function(frequencyMap, sortBy = 'frequency', order = 'desc') {
        const entries = [...frequencyMap.entries()];
        
        const sortingAlgorithms = {
            frequency: (a, b) => order === 'desc' ? b[1] - a[1] : a[1] - b[1],
            alphabetical: (a, b) => order === 'desc' 
                ? b[0].localeCompare(a[0]) 
                : a[0].localeCompare(b[0]),
            length: (a, b) => order === 'desc'
                ? b[0].length - a[0].length
                : a[0].length - b[0].length
        };
        
        const sortFn = sortingAlgorithms[sortBy] || sortingAlgorithms.frequency;
        entries.sort(sortFn);
        
        const results = [];
        entries.forEach(([word, count], index) => {
            results.push({
                rank: index + 1,
                word,
                count,
                length: word.length
            });
        });
        
        return results;
    };
    
    /**
     * Filter frequency results by criteria
     * 
     * @param {Map} frequencyMap - Map to filter
     * @param {object} criteria - Filter criteria
     * @returns {Map} Filtered map
     */
    const filterResults = function(frequencyMap, criteria = {}) {
        const {
            minFrequency = 1,
            maxFrequency = Infinity,
            minLength = 0,
            maxLength = Infinity,
            pattern = null
        } = criteria;
        
        const filtered = new Map();
        
        frequencyMap.forEach((count, word) => {
            if (count < minFrequency || count > maxFrequency) return;
            
            if (word.length < minLength || word.length > maxLength) return;
            
            if (pattern && !pattern.test(word)) return;
            
            filtered.set(word, count);
        });
        
        return filtered;
    };
    
    return {
        analyzeWordFrequency,
        analyzeNGrams,
        analyzeCharacterFrequency,
        
        mergeAnalyses,
        compareAnalyses,
        
        processFrequencyData,
        customSort,
        filterResults,
        sortByFrequency,
        
        calculateLexicalDiversity,
        calculateJaccardSimilarity,
        calculateOverlapCoefficient,
        
        getConfig: () => ({ ...config }),
        setStopWords: (words) => {
            config.stopWords = new Set(words);
        },
        addStopWords: (...words) => {
            words.forEach(word => config.stopWords.add(word));
        },
        removeStopWords: (...words) => {
            words.forEach(word => config.stopWords.delete(word));
        }
    };
    
})();

window.FrequencyAnalyzer = FrequencyAnalyzer;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrequencyAnalyzer;
}

console.log('📊 Frequency Analyzer module loaded successfully');
