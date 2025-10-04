/**
 * Advanced Text Analyzer - Analysis Module
 * Core text analysis functionality using function expressions
 */

// Main analysis function using function expression
const analyzeText = function(inputText, template = 'default') {
    try {
        if (!inputText || typeof inputText !== 'string') {
            throw ErrorUtils.createError('Invalid input text', 'ValidationError');
        }

        // Validate input text
        const validation = Utils.validation.validateText(inputText);
        if (!validation.isValid) {
            throw ErrorUtils.createError(
                validation.errors.join(' '), 
                'ValidationError', 
                { errors: validation.errors }
            );
        }

        // Clean text for analysis
        const cleanText = Utils.text.clean(inputText);
        
        // Create analysis result based on template
        const analysisTemplate = CONFIG.analysisTemplates[template] || CONFIG.analysisTemplates.default;
        const result = DataUtils.deepClone(ANALYSIS_RESULT_TEMPLATE);
        
        // Set metadata
        result.metadata.timestamp = new Date().toISOString();
        result.metadata.textLength = inputText.length;
        result.metadata.analysisType = template;

        // Perform analysis based on template settings
        if (analysisTemplate.includeStatistics) {
            result.statistics = calculateStatistics(cleanText);
        }

        if (analysisTemplate.includeReadability) {
            result.readability = calculateReadabilityScores(
                result.statistics.words,
                result.statistics.sentences, 
                result.statistics.totalSyllables
            );
        }

        if (analysisTemplate.includeGradeLevel) {
            result.gradeLevel = determineGradeLevel(result.readability);
        }

        if (analysisTemplate.includeReadingTime) {
            result.gradeLevel.readingTime = calculateReadingTime(result.statistics.words);
        }

        if (analysisTemplate.includeInsights) {
            result.insights = generateInsights(result);
        }

        return result;

    } catch (error) {
        ErrorUtils.logError(error, { inputText: inputText?.substring(0, 100) + '...' });
        throw error;
    }
};

// Enhanced statistics calculation using the new Basic Statistics Engine
const calculateStatistics = function(text) {
    try {
        // Use the new Basic Statistics Engine for comprehensive analysis
        const basicStats = BasicStatisticsEngine.analyze(text, {
            includeWordAnalysis: true,
            includeCharacterAnalysis: true,
            includeSentenceAnalysis: true,
            includeAdvancedMetrics: true
        });
        
        // Extract data using destructuring from the new engine
        const {
            words: {
                totalWords,
                uniqueWords,
                averageWordLength,
                longestWord,
                shortestWord,
                wordFrequency
            },
            characters: {
                totalCharacters,
                charactersNoSpaces,
                letters,
                numbers,
                spaces,
                punctuation
            },
            sentences: {
                totalSentences,
                averageWordsPerSentence,
                averageCharactersPerSentence,
                sentenceTypes,
                complexityScore
            },
            advanced: {
                readabilityIndicators,
                textComplexity,
                textBalance
            }
        } = basicStats;
        
        // Calculate additional metrics for compatibility
        const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
        const totalSyllables = calculateTotalSyllables(text);
        
        // Find most common words excluding common ones
        const filteredFrequency = Object.entries(wordFrequency)
            .filter(([word, count]) => 
                !CALCULATION_CONSTANTS.commonWords.includes(word.toLowerCase()) && 
                word.length > 2 && 
                count > 1
            )
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word, count]) => ({ word, count }));

        return {
            characters: totalCharacters,
            charactersNoSpaces: charactersNoSpaces,
            words: totalWords,
            sentences: totalSentences,
            paragraphs: Math.max(paragraphs.length, 1),
            totalSyllables: totalSyllables,
            averageWordsPerSentence: averageWordsPerSentence,
            averageSentencesPerParagraph: Math.max(paragraphs.length, 1) > 0 ? Utils.math.round(totalSentences / Math.max(paragraphs.length, 1), 1) : 0,
            averageSyllablesPerWord: totalWords > 0 ? Utils.math.round(totalSyllables / totalWords, 2) : 0,
            averageWordLength: averageWordLength,
            longestWord: longestWord,
            shortestWord: shortestWord,
            mostCommonWords: filteredFrequency,
            
            // Enhanced statistics from new engine
            uniqueWords: uniqueWords,
            vocabularyDiversity: readabilityIndicators.vocabularyDiversity,
            sentenceComplexity: complexityScore,
            characterTypes: {
                letters,
                numbers,
                spaces,
                punctuation
            },
            sentenceTypes: sentenceTypes,
            textBalance: textBalance,
            readabilityIndicators: readabilityIndicators
        };
        
    } catch (error) {
        console.error('Statistics calculation error:', error);
        // Fallback to basic calculation
        return calculateBasicStatistics(text);
    }
};

// Fallback basic statistics calculation
const calculateBasicStatistics = function(text) {
    const words = text.match(/\b\w+\b/g) || [];
    const sentences = Utils.text.extractSentences(text);
    const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
    
    return {
        characters: text.length,
        charactersNoSpaces: text.replace(/\s/g, '').length,
        words: words.length,
        sentences: sentences.length,
        paragraphs: Math.max(paragraphs.length, 1),
        totalSyllables: 0,
        averageWordsPerSentence: sentences.length > 0 ? Utils.math.round(words.length / sentences.length, 1) : 0,
        averageSentencesPerParagraph: 0,
        averageSyllablesPerWord: 0,
        averageWordLength: 0,
        longestWord: '',
        shortestWord: '',
        mostCommonWords: []
    };
};

// Helper function to calculate total syllables
const calculateTotalSyllables = function(text) {
    const words = text.match(/\b\w+\b/g) || [];
    let totalSyllables = 0;
    
    // Use for...of loop to count syllables
    for (const word of words) {
        totalSyllables += Utils.text.countSyllables(word);
    }
    
    return totalSyllables;
};

// Readability scores calculation using function expression
const calculateReadabilityScores = function(totalWords, totalSentences, totalSyllables) {
    const fleschScore = Utils.math.fleschReadingEase(totalWords, totalSentences, totalSyllables);
    const fkGrade = Utils.math.fleschKincaidGrade(totalWords, totalSentences, totalSyllables);

    return {
        fleschReadingEase: {
            score: fleschScore,
            level: determineFleschLevel(fleschScore),
            interpretation: getFleschInterpretation(fleschScore),
            percentage: Utils.math.clamp(fleschScore, 0, 100)
        },
        fleschKincaidGrade: {
            score: Math.max(fkGrade, 0),
            level: determineFKLevel(fkGrade),
            interpretation: getFKInterpretation(fkGrade),
            percentage: Utils.math.clamp((fkGrade / 20) * 100, 0, 100)
        }
    };
};

// Grade level determination using function expression
const determineGradeLevel = function(readabilityScores) {
    const fkGrade = readabilityScores.fleschKincaidGrade.score;
    const fleschScore = readabilityScores.fleschReadingEase.score;
    
    let level, description, grade;
    
    if (fkGrade <= 5) {
        level = 'elementary';
        grade = Math.round(fkGrade);
        description = 'Elementary School Level - Easy to read and understand';
    } else if (fkGrade <= 8) {
        level = 'middle';
        grade = Math.round(fkGrade);
        description = 'Middle School Level - Moderately easy to read';
    } else if (fkGrade <= 13) {
        level = 'high';
        grade = Math.round(fkGrade);
        description = 'High School Level - Standard difficulty';
    } else if (fkGrade <= 16) {
        level = 'college';
        grade = Math.round(fkGrade);
        description = 'College Level - More complex vocabulary and structure';
    } else {
        level = 'graduate';
        grade = Math.round(fkGrade);
        description = 'Graduate Level - Advanced vocabulary and complex ideas';
    }

    return {
        overall: {
            grade: Math.max(grade, 1),
            level: level,
            description: description
        }
    };
};

// Reading time calculation using function expression
const calculateReadingTime = function(wordCount) {
    const speeds = CONFIG.readingSpeeds;
    
    return {
        slow: formatReadingTime(wordCount / speeds.slow),
        average: formatReadingTime(wordCount / speeds.average), 
        fast: formatReadingTime(wordCount / speeds.fast)
    };
};

// Helper function for formatting reading time
const formatReadingTime = function(minutes) {
    const totalMinutes = Math.ceil(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    let timeString;
    if (hours > 0) {
        timeString = `${hours}h ${remainingMinutes}m`;
    } else if (totalMinutes > 0) {
        timeString = `${totalMinutes} min`;
    } else {
        timeString = '< 1 min';
    }
    
    return {
        minutes: totalMinutes,
        seconds: Math.round(minutes * 60),
        total: timeString
    };
};

// Insights generation using function expression
const generateInsights = function(analysisResult) {
    const { statistics, readability, gradeLevel } = analysisResult;
    const insights = {
        strengths: [],
        improvements: [],
        recommendations: [],
        overallAssessment: ''
    };

    // Analyze sentence length
    if (statistics.averageWordsPerSentence <= 15) {
        insights.strengths.push('Good sentence length - easy to follow');
    } else if (statistics.averageWordsPerSentence > 25) {
        insights.improvements.push('Sentences are quite long - consider breaking them up');
        insights.recommendations.push('Aim for 15-20 words per sentence for better readability');
    }

    // Analyze syllable complexity
    if (statistics.averageSyllablesPerWord <= 1.5) {
        insights.strengths.push('Simple vocabulary makes text accessible');
    } else if (statistics.averageSyllablesPerWord > 2.0) {
        insights.improvements.push('Complex vocabulary may challenge some readers');
        insights.recommendations.push('Consider using simpler alternatives for complex words where possible');
    }

    // Analyze readability scores
    const fleschScore = readability.fleschReadingEase.score;
    if (fleschScore >= 70) {
        insights.strengths.push('High readability score - text is easy to understand');
    } else if (fleschScore < 30) {
        insights.improvements.push('Low readability score indicates difficult text');
        insights.recommendations.push('Simplify vocabulary and shorten sentences to improve readability');
    }

    // Analyze paragraph structure
    const avgSentencesPerParagraph = statistics.averageSentencesPerParagraph;
    if (avgSentencesPerParagraph >= 3 && avgSentencesPerParagraph <= 6) {
        insights.strengths.push('Well-structured paragraphs with good length');
    } else if (avgSentencesPerParagraph > 8) {
        insights.improvements.push('Paragraphs are quite long');
        insights.recommendations.push('Break long paragraphs into smaller, focused sections');
    }

    // Generate overall assessment
    let assessmentLevel;
    if (fleschScore >= 70) {
        assessmentLevel = 'excellent';
    } else if (fleschScore >= 50) {
        assessmentLevel = 'good';
    } else if (fleschScore >= 30) {
        assessmentLevel = 'moderate';
    } else {
        assessmentLevel = 'challenging';
    }

    const assessmentMessages = {
        excellent: `Your text has excellent readability (Flesch score: ${fleschScore}). It's clear, concise, and accessible to a wide audience.`,
        good: `Your text has good readability (Flesch score: ${fleschScore}). Most readers will find it easy to understand with minor effort.`,
        moderate: `Your text has moderate readability (Flesch score: ${fleschScore}). Some readers may find it challenging, but it's still accessible.`,
        challenging: `Your text is challenging to read (Flesch score: ${fleschScore}). Consider simplifying language and sentence structure for broader accessibility.`
    };

    insights.overallAssessment = assessmentMessages[assessmentLevel];

    // Add reading time context
    const avgReadingTime = analysisResult.gradeLevel.readingTime.average.total;
    insights.overallAssessment += ` The estimated reading time is ${avgReadingTime} for an average reader.`;

    return insights;
};

// Flesch level determination helper functions
const determineFleschLevel = function(score) {
    const levels = CONFIG.gradeLevels.flesch;
    
    for (const [key, range] of Object.entries(levels)) {
        if (score >= range.min && score <= range.max) {
            return key;
        }
    }
    return 'poor';
};

const getFleschInterpretation = function(score) {
    const level = determineFleschLevel(score);
    const levelConfig = CONFIG.gradeLevels.flesch[level];
    return levelConfig ? `${levelConfig.label} - ${levelConfig.description}` : 'Unknown level';
};

const determineFKLevel = function(grade) {
    const levels = CONFIG.gradeLevels.fleschKincaid;
    
    for (const [key, range] of Object.entries(levels)) {
        if (grade >= range.min && grade <= range.max) {
            return range.level;
        }
    }
    return 'graduate';
};

const getFKInterpretation = function(grade) {
    const levelKey = determineFKLevel(grade);
    const levels = CONFIG.gradeLevels.fleschKincaid;
    
    for (const range of Object.values(levels)) {
        if (range.level === levelKey) {
            return range.description;
        }
    }
    return 'Graduate Level';
};

// Batch analysis function for multiple texts using function expression
const analyzeBatch = function(texts, template = 'default') {
    if (!Array.isArray(texts)) {
        throw ErrorUtils.createError('Input must be an array of texts', 'ValidationError');
    }

    const results = [];
    const errors = [];

    texts.forEach((text, index) => {
        try {
            const result = analyzeText(text, template);
            results.push({ index, result, success: true });
        } catch (error) {
            errors.push({ index, error: error.message, success: false });
            ErrorUtils.logError(error, { textIndex: index });
        }
    });

    return {
        results,
        errors,
        totalProcessed: texts.length,
        successfulAnalyses: results.length,
        failedAnalyses: errors.length
    };
};

// Compare multiple texts function using function expression
const compareTexts = function(texts, labels = []) {
    if (!Array.isArray(texts) || texts.length < 2) {
        throw ErrorUtils.createError('Need at least 2 texts for comparison', 'ValidationError');
    }

    const analyses = texts.map((text, index) => {
        const result = analyzeText(text);
        return {
            label: labels[index] || `Text ${index + 1}`,
            analysis: result
        };
    });

    // Create comparison metrics
    const comparison = {
        texts: analyses,
        comparison: {
            readability: {
                highest: null,
                lowest: null,
                average: 0
            },
            complexity: {
                mostComplex: null,
                simplest: null
            },
            length: {
                longest: null,
                shortest: null
            }
        }
    };

    // Calculate comparisons
    let totalFlesch = 0;
    let highestFlesch = -1;
    let lowestFlesch = 101;
    let longestWords = 0;
    let shortestWords = Infinity;
    
    analyses.forEach((item, index) => {
        const flesch = item.analysis.readability.fleschReadingEase.score;
        const wordCount = item.analysis.statistics.words;
        
        totalFlesch += flesch;
        
        if (flesch > highestFlesch) {
            highestFlesch = flesch;
            comparison.comparison.readability.highest = item.label;
        }
        
        if (flesch < lowestFlesch) {
            lowestFlesch = flesch;
            comparison.comparison.readability.lowest = item.label;
        }
        
        if (wordCount > longestWords) {
            longestWords = wordCount;
            comparison.comparison.length.longest = item.label;
        }
        
        if (wordCount < shortestWords) {
            shortestWords = wordCount;
            comparison.comparison.length.shortest = item.label;
        }
    });
    
    comparison.comparison.readability.average = Utils.math.round(totalFlesch / analyses.length, 1);
    
    return comparison;
};

// Export analysis results in different formats using function expression
const exportAnalysis = function(analysisResult, format = 'json') {
    const exportConfig = CONFIG.exportFormats[format];
    if (!exportConfig) {
        throw ErrorUtils.createError(`Unsupported export format: ${format}`, 'ValidationError');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `text-analysis-${timestamp}${exportConfig.extension}`;

    let exportData;
    
    switch (format) {
        case 'json':
            exportData = JSON.stringify(analysisResult, null, 2);
            break;
        case 'csv':
            exportData = formatAsCSV(analysisResult);
            break;
        case 'txt':
            exportData = formatAsText(analysisResult);
            break;
        default:
            throw ErrorUtils.createError(`Formatter not implemented for ${format}`, 'NotImplementedError');
    }

    return {
        data: exportData,
        filename: filename,
        mimeType: exportConfig.mimeType
    };
};

// CSV formatter helper function
const formatAsCSV = function(result) {
    const headers = EXPORT_TEMPLATES.csv.headers;
    const mapping = EXPORT_TEMPLATES.csv.mapping;
    
    let csv = headers.join(',') + '\n';
    
    Object.entries(mapping).forEach(([metric, path]) => {
        const value = getNestedValue(result, path);
        csv += `"${metric}","${value}","Analysis","${getMetricDescription(metric)}"\n`;
    });
    
    return csv;
};

// Text formatter helper function  
const formatAsText = function(result) {
    let template = EXPORT_TEMPLATES.text.template;
    
    // Replace template variables
    template = template.replace(/\{\{timestamp\}\}/g, Utils.format.date());
    template = template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        return getNestedValue(result, path) || 'N/A';
    });
    
    return template;
};

// Helper function to get nested object values
const getNestedValue = function(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : '';
    }, obj);
};

// Helper function to get metric descriptions
const getMetricDescription = function(metric) {
    const descriptions = {
        'words': 'Total number of words in the text',
        'characters': 'Total number of characters including spaces',
        'sentences': 'Total number of sentences',
        'paragraphs': 'Total number of paragraphs',
        'flesch_score': 'Flesch Reading Ease score (0-100)',
        'fk_grade': 'Flesch-Kincaid Grade Level',
        'grade_level': 'Overall grade level assessment',
        'reading_time_avg': 'Estimated reading time for average reader'
    };
    
    return descriptions[metric] || 'Analysis metric';
};

// Make analysis functions available globally
window.analyzeText = analyzeText;
window.calculateStatistics = calculateStatistics;
window.calculateReadabilityScores = calculateReadabilityScores;
window.determineGradeLevel = determineGradeLevel;
window.calculateReadingTime = calculateReadingTime;
window.generateInsights = generateInsights;
window.analyzeBatch = analyzeBatch;
window.compareTexts = compareTexts;
window.exportAnalysis = exportAnalysis;