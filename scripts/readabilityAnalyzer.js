
/**
 * ReadabilityAnalyzer Constructor Function
 * Creates a new readability analyzer instance
 * 
 * @constructor
 * @param {string} text - Text to analyze
 * @param {object} [options] - Configuration options
 */
function ReadabilityAnalyzer(text, options = {}) {
    // Validation
    if (typeof text !== 'string') {
        throw new TypeError('Text must be a string');
    }
    
    let _text = text;
    let _scores = null;
    let _metrics = null;
    let _options = {
        calculateFlesch: true,
        calculateFleschKincaid: true,
        calculateGunningFog: true,
        calculateSMOG: true,
        calculateColemanLiau: true,
        calculateARI: true,
        ...options
    };
    
    this.analyzedAt = new Date().toISOString();
    this.version = '1.0.0';
    
    
    /**
     * Calculate word count (private method)
     * @private
     * @returns {number} Word count
     */
    const _calculateWordCount = () => {
        return (_text.match(/\b\w+\b/g) || []).length;
    };
    
    /**
     * Calculate sentence count (private method)
     * @private
     * @returns {number} Sentence count
     */
    const _calculateSentenceCount = () => {
        const sentences = Array.from(AdvancedTextParser.sentenceParser(_text));
        return Math.max(sentences.length, 1);
    };
    
    /**
     * Calculate syllable count (private method)
     * @private
     * @returns {number} Total syllables
     */
    const _calculateSyllableCount = () => {
        const syllableData = AdvancedTextParser.countTextSyllables(_text);
        return syllableData.totalSyllables;
    };
    
    /**
     * Calculate character count (private method)
     * @private
     * @returns {number} Character count
     */
    const _calculateCharacterCount = () => {
        return _text.replace(/\s/g, '').length;
    };
    
    /**
     * Get complex words (3+ syllables) (private method)
     * @private
     * @returns {array} Array of complex words
     */
    const _getComplexWords = () => {
        const syllableData = AdvancedTextParser.countTextSyllables(_text);
        return syllableData.wordSyllables.filter(ws => ws.syllables >= 3);
    };
    
    /**
     * Calculate base metrics (private method)
     * @private
     * @returns {object} Base metrics for calculations
     */
    const _calculateBaseMetrics = () => {
        if (_metrics) return _metrics;
        
        const wordCount = _calculateWordCount();
        const sentenceCount = _calculateSentenceCount();
        const syllableCount = _calculateSyllableCount();
        const characterCount = _calculateCharacterCount();
        const complexWords = _getComplexWords();
        
        _metrics = {
            wordCount,
            sentenceCount,
            syllableCount,
            characterCount,
            complexWordCount: complexWords.length,
            averageWordsPerSentence: wordCount / sentenceCount,
            averageSyllablesPerWord: syllableCount / wordCount,
            averageCharactersPerWord: characterCount / wordCount,
            percentageComplexWords: (complexWords.length / wordCount) * 100
        };
        
        return _metrics;
    };
    
    /**
     * Calculate Flesch Reading Ease Score (private method)
     * Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
     * @private
     * @returns {object} Flesch score with interpretation
     */
    const _calculateFleschScore = () => {
        const metrics = _calculateBaseMetrics();
        
        const score = 206.835 
            - (1.015 * metrics.averageWordsPerSentence) 
            - (84.6 * metrics.averageSyllablesPerWord);
        
        const roundedScore = Math.max(0, Math.min(100, Utils.math.round(score, 2)));
        
        return {
            score: roundedScore,
            interpretation: _interpretFleschScore(roundedScore),
            formula: {
                name: 'Flesch Reading Ease',
                calculation: `206.835 - 1.015 * (${metrics.averageWordsPerSentence.toFixed(2)}) - 84.6 * (${metrics.averageSyllablesPerWord.toFixed(2)})`,
                result: roundedScore
            }
        };
    };
    
    /**
     * Interpret Flesch Reading Ease Score (private method)
     * @private
     * @param {number} score - Flesch score
     * @returns {object} Interpretation details
     */
    const _interpretFleschScore = (score) => {
        if (score >= 90) return { level: 'Very Easy', grade: '5th grade', description: 'Very easy to read' };
        if (score >= 80) return { level: 'Easy', grade: '6th grade', description: 'Easy to read' };
        if (score >= 70) return { level: 'Fairly Easy', grade: '7th grade', description: 'Fairly easy to read' };
        if (score >= 60) return { level: 'Standard', grade: '8th-9th grade', description: 'Plain English' };
        if (score >= 50) return { level: 'Fairly Difficult', grade: '10th-12th grade', description: 'Fairly difficult to read' };
        if (score >= 30) return { level: 'Difficult', grade: 'College', description: 'Difficult to read' };
        return { level: 'Very Difficult', grade: 'College graduate', description: 'Very difficult to read' };
    };
    
    /**
     * Calculate Flesch-Kincaid Grade Level (private method)
     * Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
     * @private
     * @returns {object} Grade level score
     */
    const _calculateFleschKincaidGrade = () => {
        const metrics = _calculateBaseMetrics();
        
        const grade = (0.39 * metrics.averageWordsPerSentence) 
            + (11.8 * metrics.averageSyllablesPerWord) 
            - 15.59;
        
        const roundedGrade = Math.max(0, Utils.math.round(grade, 2));
        
        return {
            grade: roundedGrade,
            interpretation: _interpretGradeLevel(roundedGrade),
            formula: {
                name: 'Flesch-Kincaid Grade Level',
                calculation: `0.39 * (${metrics.averageWordsPerSentence.toFixed(2)}) + 11.8 * (${metrics.averageSyllablesPerWord.toFixed(2)}) - 15.59`,
                result: roundedGrade
            }
        };
    };
    
    /**
     * Calculate Gunning Fog Index (private method)
     * Formula: 0.4 * ((words/sentences) + 100 * (complexWords/words))
     * @private
     * @returns {object} Gunning Fog score
     */
    const _calculateGunningFog = () => {
        const metrics = _calculateBaseMetrics();
        
        const index = 0.4 * (
            metrics.averageWordsPerSentence + 
            (100 * (metrics.complexWordCount / metrics.wordCount))
        );
        
        const roundedIndex = Utils.math.round(index, 2);
        
        return {
            index: roundedIndex,
            interpretation: _interpretGradeLevel(roundedIndex),
            formula: {
                name: 'Gunning Fog Index',
                calculation: `0.4 * ((${metrics.averageWordsPerSentence.toFixed(2)}) + 100 * (${metrics.complexWordCount}/${metrics.wordCount}))`,
                result: roundedIndex
            }
        };
    };
    
    /**
     * Calculate SMOG Index (private method)
     * Formula: 1.0430 * sqrt(complexWords * (30/sentences)) + 3.1291
     * @private
     * @returns {object} SMOG score
     */
    const _calculateSMOG = () => {
        const metrics = _calculateBaseMetrics();
        
        const index = (1.0430 * Math.sqrt(metrics.complexWordCount * (30 / metrics.sentenceCount))) + 3.1291;
        
        const roundedIndex = Utils.math.round(index, 2);
        
        return {
            index: roundedIndex,
            interpretation: _interpretGradeLevel(roundedIndex),
            formula: {
                name: 'SMOG Index',
                calculation: `1.0430 * sqrt(${metrics.complexWordCount} * (30/${metrics.sentenceCount})) + 3.1291`,
                result: roundedIndex
            }
        };
    };
    
    /**
     * Calculate Coleman-Liau Index (private method)
     * Formula: 0.0588 * L - 0.296 * S - 15.8
     * Where L = average number of letters per 100 words, S = average number of sentences per 100 words
     * @private
     * @returns {object} Coleman-Liau score
     */
    const _calculateColemanLiau = () => {
        const metrics = _calculateBaseMetrics();
        
        const L = (metrics.characterCount / metrics.wordCount) * 100;
        const S = (metrics.sentenceCount / metrics.wordCount) * 100;
        
        const index = (0.0588 * L) - (0.296 * S) - 15.8;
        
        const roundedIndex = Math.max(0, Utils.math.round(index, 2));
        
        return {
            index: roundedIndex,
            interpretation: _interpretGradeLevel(roundedIndex),
            formula: {
                name: 'Coleman-Liau Index',
                calculation: `0.0588 * (${L.toFixed(2)}) - 0.296 * (${S.toFixed(2)}) - 15.8`,
                result: roundedIndex
            }
        };
    };
    
    /**
     * Calculate Automated Readability Index (private method)
     * Formula: 4.71 * (characters/words) + 0.5 * (words/sentences) - 21.43
     * @private
     * @returns {object} ARI score
     */
    const _calculateARI = () => {
        const metrics = _calculateBaseMetrics();
        
        const index = (4.71 * metrics.averageCharactersPerWord) 
            + (0.5 * metrics.averageWordsPerSentence) 
            - 21.43;
        
        const roundedIndex = Math.max(0, Utils.math.round(index, 2));
        
        return {
            index: roundedIndex,
            interpretation: _interpretGradeLevel(roundedIndex),
            formula: {
                name: 'Automated Readability Index',
                calculation: `4.71 * (${metrics.averageCharactersPerWord.toFixed(2)}) + 0.5 * (${metrics.averageWordsPerSentence.toFixed(2)}) - 21.43`,
                result: roundedIndex
            }
        };
    };
    
    /**
     * Interpret grade level (private method)
     * @private
     * @param {number} grade - Grade level
     * @returns {object} Interpretation
     */
    const _interpretGradeLevel = (grade) => {
        if (grade <= 6) return { level: 'Elementary', audience: 'Easy for general audience', description: 'Elementary school level' };
        if (grade <= 8) return { level: 'Middle School', audience: 'Average reader', description: 'Middle school level' };
        if (grade <= 12) return { level: 'High School', audience: 'High school student', description: 'High school level' };
        if (grade <= 16) return { level: 'College', audience: 'College student', description: 'College level' };
        return { level: 'Professional', audience: 'Expert/Professional', description: 'Post-graduate level' };
    };
    
    /**
     * Calculate all readability scores (private method)
     * @private
     * @returns {object} All readability scores
     */
    const _calculateAllScores = () => {
        if (_scores) return _scores;
        
        _scores = {
            metrics: _calculateBaseMetrics()
        };
        
        if (_options.calculateFlesch) {
            _scores.flesch = _calculateFleschScore();
        }
        
        if (_options.calculateFleschKincaid) {
            _scores.fleschKincaid = _calculateFleschKincaidGrade();
        }
        
        if (_options.calculateGunningFog) {
            _scores.gunningFog = _calculateGunningFog();
        }
        
        if (_options.calculateSMOG) {
            _scores.smog = _calculateSMOG();
        }
        
        if (_options.calculateColemanLiau) {
            _scores.colemanLiau = _calculateColemanLiau();
        }
        
        if (_options.calculateARI) {
            _scores.ari = _calculateARI();
        }
        
        // Calculate consensus grade level
        _scores.consensus = _calculateConsensusGrade();
        
        return _scores;
    };
    
    /**
     * Calculate consensus grade level (private method)
     * @private
     * @returns {object} Consensus information
     */
    const _calculateConsensusGrade = () => {
        const grades = [];
        
        if (_scores.fleschKincaid) grades.push(_scores.fleschKincaid.grade);
        if (_scores.gunningFog) grades.push(_scores.gunningFog.index);
        if (_scores.smog) grades.push(_scores.smog.index);
        if (_scores.colemanLiau) grades.push(_scores.colemanLiau.index);
        if (_scores.ari) grades.push(_scores.ari.index);
        
        if (grades.length === 0) return null;
        
        const average = grades.reduce((sum, g) => sum + g, 0) / grades.length;
        const roundedAverage = Utils.math.round(average, 2);
        
        return {
            averageGrade: roundedAverage,
            interpretation: _interpretGradeLevel(roundedAverage),
            gradesUsed: grades.length,
            range: {
                min: Math.min(...grades),
                max: Math.max(...grades)
            }
        };
    };
    
    // Public getter methods with method chaining support
    
    /**
     * Get text being analyzed
     * @returns {string} Text
     */
    this.getText = function() {
        return _text;
    };
    
    /**
     * Set new text to analyze
     * @param {string} newText - New text
     * @returns {ReadabilityAnalyzer} this instance for chaining
     */
    this.setText = function(newText) {
        if (typeof newText !== 'string') {
            throw new TypeError('Text must be a string');
        }
        _text = newText;
        _scores = null; // Reset scores
        _metrics = null; // Reset metrics
        return this; // Enable method chaining
    };
    
    /**
     * Get analysis options
     * @returns {object} Current options
     */
    this.getOptions = function() {
        return { ..._options };
    };
    
    /**
     * Set analysis options
     * @param {object} newOptions - New options
     * @returns {ReadabilityAnalyzer} this instance for chaining
     */
    this.setOptions = function(newOptions) {
        _options = { ..._options, ...newOptions };
        _scores = null; // Reset scores when options change
        return this; // Enable method chaining
    };
    
    /**
     * Get all scores
     * @returns {object} All readability scores
     */
    this.getScores = function() {
        return _calculateAllScores();
    };
    
    /**
     * Get specific score
     * @param {string} scoreName - Name of score (flesch, fleschKincaid, etc.)
     * @returns {object|null} Specific score or null
     */
    this.getScore = function(scoreName) {
        const scores = _calculateAllScores();
        return scores[scoreName] || null;
    };
    
    /**
     * Get base metrics
     * @returns {object} Base metrics
     */
    this.getMetrics = function() {
        return _calculateBaseMetrics();
    };
    
    // Method chaining support for fluent API
    
    /**
     * Analyze text with method chaining
     * @returns {ReadabilityAnalyzer} this instance for chaining
     */
    this.analyze = function() {
        _calculateAllScores();
        return this; // Enable method chaining
    };
    
    /**
     * Reset analyzer
     * @returns {ReadabilityAnalyzer} this instance for chaining
     */
    this.reset = function() {
        _scores = null;
        _metrics = null;
        return this; // Enable method chaining
    };
    
    /**
     * Export results as JSON
     * @returns {object} Results object
     */
    this.toJSON = function() {
        return {
            text: _text.substring(0, 100) + '...',
            textLength: _text.length,
            analyzedAt: this.analyzedAt,
            version: this.version,
            scores: this.getScores(),
            options: this.getOptions()
        };
    };
    
    /**
     * Get summary report
     * @returns {string} Formatted summary
     */
    this.getSummary = function() {
        const scores = this.getScores();
        
        let summary = '=== Readability Analysis Summary ===\n\n';
        
        if (scores.flesch) {
            summary += `Flesch Reading Ease: ${scores.flesch.score}\n`;
            summary += `  Level: ${scores.flesch.interpretation.level}\n`;
            summary += `  Grade: ${scores.flesch.interpretation.grade}\n\n`;
        }
        
        if (scores.consensus) {
            summary += `Consensus Grade Level: ${scores.consensus.averageGrade}\n`;
            summary += `  Level: ${scores.consensus.interpretation.level}\n`;
            summary += `  Audience: ${scores.consensus.interpretation.audience}\n\n`;
        }
        
        summary += `Base Metrics:\n`;
        summary += `  Words: ${scores.metrics.wordCount}\n`;
        summary += `  Sentences: ${scores.metrics.sentenceCount}\n`;
        summary += `  Avg Words/Sentence: ${scores.metrics.averageWordsPerSentence.toFixed(2)}\n`;
        
        return summary;
    };
}

// Prototype methods for shared functionality

/**
 * Compare readability with another text
 * @param {string} otherText - Text to compare with
 * @returns {object} Comparison results
 */
ReadabilityAnalyzer.prototype.compareWith = function(otherText) {
    const otherAnalyzer = new ReadabilityAnalyzer(otherText, this.getOptions());
    const thisScores = this.getScores();
    const otherScores = otherAnalyzer.getScores();
    
    return {
        thisText: {
            length: this.getText().length,
            scores: thisScores
        },
        otherText: {
            length: otherText.length,
            scores: otherScores
        },
        comparison: {
            fleschDifference: thisScores.flesch ? 
                thisScores.flesch.score - otherScores.flesch.score : null,
            gradeDifference: thisScores.consensus && otherScores.consensus ?
                thisScores.consensus.averageGrade - otherScores.consensus.averageGrade : null,
            moreReadable: thisScores.flesch && otherScores.flesch ?
                (thisScores.flesch.score > otherScores.flesch.score ? 'this' : 'other') : null
        }
    };
};

/**
 * Get recommendations for improvement
 * @returns {array} Array of recommendations
 */
ReadabilityAnalyzer.prototype.getRecommendations = function() {
    const scores = this.getScores();
    const metrics = scores.metrics;
    const recommendations = [];
    
    if (metrics.averageWordsPerSentence > 20) {
        recommendations.push({
            type: 'sentence-length',
            severity: 'high',
            message: 'Consider breaking down long sentences. Average words per sentence is high.',
            suggestion: 'Aim for 15-20 words per sentence for better readability.'
        });
    }
    
    if (metrics.percentageComplexWords > 15) {
        recommendations.push({
            type: 'vocabulary',
            severity: 'medium',
            message: 'High percentage of complex words detected.',
            suggestion: 'Consider using simpler alternatives where possible.'
        });
    }
    
    if (scores.flesch && scores.flesch.score < 50) {
        recommendations.push({
            type: 'overall-difficulty',
            severity: 'high',
            message: 'Text is difficult to read for general audience.',
            suggestion: 'Simplify vocabulary and sentence structure.'
        });
    }
    
    if (metrics.averageSyllablesPerWord > 1.7) {
        recommendations.push({
            type: 'word-complexity',
            severity: 'medium',
            message: 'Words are relatively complex.',
            suggestion: 'Use shorter, more common words where appropriate.'
        });
    }
    
    return recommendations;
};

// Static methods for utility functions

/**
 * Create analyzer from text with default options
 * @static
 * @param {string} text - Text to analyze
 * @returns {ReadabilityAnalyzer} New analyzer instance
 */
ReadabilityAnalyzer.createAnalyzer = function(text) {
    return new ReadabilityAnalyzer(text);
};

/**
 * Quick analysis without creating instance
 * @static
 * @param {string} text - Text to analyze
 * @returns {object} Analysis results
 */
ReadabilityAnalyzer.quickAnalyze = function(text) {
    const analyzer = new ReadabilityAnalyzer(text);
    return analyzer.analyze().getScores();
};

/**
 * Batch analyze multiple texts
 * @static
 * @param {array} texts - Array of texts to analyze
 * @returns {array} Array of analysis results
 */
ReadabilityAnalyzer.batchAnalyze = function(texts) {
    return texts.map(text => ReadabilityAnalyzer.quickAnalyze(text));
};

// Make available globally
window.ReadabilityAnalyzer = ReadabilityAnalyzer;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReadabilityAnalyzer;
}

console.log('📈 Readability Analyzer module loaded successfully');
