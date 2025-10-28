
const analyzer = (function() {
    'use strict';
    
    let currentAnalysisData = null;
    let analysisHistory = [];
    let maxHistorySize = 10;
    
    /**
     * Main analysis function using function expression
     * Coordinates all analysis components
     * @param {string} text - Text to analyze
     * @returns {Promise<object>} Complete analysis results
     */
    const analyzeText = function(text) {
        return new Promise((resolve, reject) => {
            // Validate input
            const validation = utils.validateText(text);
            if (!validation.isValid) {
                reject(new Error(`Validation failed: ${validation.errors.join(', ')}`));
                return;
            }
            
            try {
                const results = statisticsEngine.getComprehensiveStatistics(text);
                
                currentAnalysisData = {
                    text: text,
                    results: results,
                    timestamp: new Date(),
                    analysisId: generateAnalysisId()
                };
                
                addToHistory(currentAnalysisData);
                
                if (window.ui) {
                    window.ui.updateResults(results);
                }
                
                resolve(results);
                
            } catch (error) {
                console.error('Analysis error:', error);
                reject(error);
            }
        });
    };
    
    /**
     * Generate unique analysis ID using arrow function
     * @returns {string} Unique analysis identifier
     */
    const generateAnalysisId = () => {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    
    /**
     * Add analysis to history using function expression
     * @param {object} analysisData - Analysis data to store
     */
    const addToHistory = function(analysisData) {
        analysisHistory.unshift(analysisData);
        
        if (analysisHistory.length > maxHistorySize) {
            analysisHistory = analysisHistory.slice(0, maxHistorySize);
        }
    };
    
    /**
     * Get current analysis data using arrow function
     * @returns {object|null} Current analysis data
     */
    const getCurrentAnalysis = () => {
        return currentAnalysisData;
    };
    
    /**
     * Get analysis history using arrow function
     * @returns {Array} Analysis history array
     */
    const getAnalysisHistory = () => {
        return [...analysisHistory]; // Return copy of history
    };
    
    /**
     * Clear analysis history using function expression
     */
    const clearHistory = function() {
        analysisHistory = [];
        currentAnalysisData = null;
    };
    
    /**
     * Export analysis results to JSON using function expression
     * @param {object} analysisData - Analysis data to export
     * @returns {string} JSON string of analysis data
     */
    const exportToJSON = function(analysisData = currentAnalysisData) {
        if (!analysisData) {
            throw new Error('No analysis data to export');
        }
        
        return JSON.stringify({
            metadata: {
                timestamp: analysisData.timestamp,
                analysisId: analysisData.analysisId,
                textLength: analysisData.text.length,
                version: '1.0'
            },
            text: analysisData.text,
            results: analysisData.results
        }, null, 2);
    };
    
    /**
     * Import analysis results from JSON using function expression
     * @param {string} jsonData - JSON string to import
     * @returns {object} Imported analysis data
     */
    const importFromJSON = function(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.results || !data.text) {
                throw new Error('Invalid analysis data format');
            }
            
            const analysisData = {
                text: data.text,
                results: data.results,
                timestamp: data.metadata?.timestamp || new Date(),
                analysisId: data.metadata?.analysisId || generateAnalysisId()
            };
            
            currentAnalysisData = analysisData;
            addToHistory(analysisData);
            
            if (window.ui) {
                window.ui.updateResults(data.results);
            }
            
            return analysisData;
            
        } catch (error) {
            console.error('Import error:', error);
            throw new Error('Failed to import analysis data: ' + error.message);
        }
    };
    
    /**
     * Compare two analysis results using arrow function
     * @param {object} analysis1 - First analysis results
     * @param {object} analysis2 - Second analysis results
     * @returns {object} Comparison results
     */
    const compareAnalyses = (analysis1, analysis2) => {
        if (!analysis1 || !analysis2) {
            throw new Error('Both analyses must be provided for comparison');
        }
        
        const comparison = {
            basicStats: {},
            readability: {},
            complexity: {},
            summary: {}
        };
        
        // Compare basic statistics
        const stats1 = analysis1.basicStats;
        const stats2 = analysis2.basicStats;
        
        comparison.basicStats = {
            wordCount: {
                text1: stats1.wordCount,
                text2: stats2.wordCount,
                difference: stats2.wordCount - stats1.wordCount,
                percentChange: stats1.wordCount > 0 ? 
                    ((stats2.wordCount - stats1.wordCount) / stats1.wordCount * 100) : 0
            },
            charCount: {
                text1: stats1.charCount,
                text2: stats2.charCount,
                difference: stats2.charCount - stats1.charCount,
                percentChange: stats1.charCount > 0 ? 
                    ((stats2.charCount - stats1.charCount) / stats1.charCount * 100) : 0
            },
            readingTime: {
                text1: stats1.readingTime,
                text2: stats2.readingTime,
                difference: stats2.readingTime - stats1.readingTime,
                percentChange: stats1.readingTime > 0 ? 
                    ((stats2.readingTime - stats1.readingTime) / stats1.readingTime * 100) : 0
            }
        };
        
        const read1 = analysis1.readability;
        const read2 = analysis2.readability;
        
        comparison.readability = {
            fleschScore: {
                text1: parseFloat(read1.fleschScore),
                text2: parseFloat(read2.fleschScore),
                difference: parseFloat(read2.fleschScore) - parseFloat(read1.fleschScore)
            },
            gradeLevel: {
                text1: parseFloat(read1.gradeLevel),
                text2: parseFloat(read2.gradeLevel),
                difference: parseFloat(read2.gradeLevel) - parseFloat(read1.gradeLevel)
            }
        };
        
        comparison.summary = {
            moreReadable: comparison.readability.fleschScore.text2 > comparison.readability.fleschScore.text1,
            longerText: comparison.basicStats.wordCount.text2 > comparison.basicStats.wordCount.text1,
            higherGradeLevel: comparison.readability.gradeLevel.text2 > comparison.readability.gradeLevel.text1
        };
        
        return comparison;
    };
    
    /**
     * Get analysis statistics using arrow function
     * @returns {object} Analysis statistics
     */
    const getAnalysisStats = () => {
        return {
            totalAnalyses: analysisHistory.length,
            currentAnalysis: currentAnalysisData ? currentAnalysisData.analysisId : null,
            historySize: analysisHistory.length,
            maxHistorySize: maxHistorySize
        };
    };
    
    /**
     * Set maximum history size using function expression
     * @param {number} size - Maximum number of analyses to keep in history
     */
    const setMaxHistorySize = function(size) {
        if (typeof size === 'number' && size > 0 && size <= 100) {
            maxHistorySize = size;
            
            // Trim history if needed
            if (analysisHistory.length > maxHistorySize) {
                analysisHistory = analysisHistory.slice(0, maxHistorySize);
            }
        }
    };
    
    /**
     * Initialize the analyzer using function expression
     */
    const initialize = function() {
        console.log('Analyzer module initialized');
        
        clearHistory();
        
        setMaxHistorySize(10);
    };
    
    // Public API using object literal
    return {
        analyzeText,
        getCurrentAnalysis,
        getAnalysisHistory,
        clearHistory,
        exportToJSON,
        importFromJSON,
        compareAnalyses,
        getAnalysisStats,
        setMaxHistorySize,
        initialize
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = analyzer;
} else if (typeof window !== 'undefined') {
    window.analyzer = analyzer;
}
