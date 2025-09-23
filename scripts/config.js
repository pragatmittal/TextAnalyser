/**
 * Advanced Text Analyzer - Configuration Module
 * Contains all configuration objects, constants, and templates
 */

// Main configuration object using object literals
const CONFIG = {
    // Reading speed settings (words per minute)
    readingSpeeds: {
        slow: 150,
        average: 250,
        fast: 400
    },

    // Grade level thresholds and interpretations
    gradeLevels: {
        flesch: {
            excellent: { min: 90, max: 100, label: "Very Easy", description: "Easily understood by an average 11-year-old student" },
            good: { min: 80, max: 89, label: "Easy", description: "Easily understood by 13 to 15-year-old students" },
            moderate: { min: 70, max: 79, label: "Fairly Easy", description: "Easily understood by 16 to 17-year-old students" },
            difficult: { min: 60, max: 69, label: "Standard", description: "Easily understood by 18 to 19-year-old students" },
            hard: { min: 50, max: 59, label: "Fairly Difficult", description: "Understood by 13 to 16-year-old students" },
            veryHard: { min: 30, max: 49, label: "Difficult", description: "Best understood by college students" },
            poor: { min: 0, max: 29, label: "Very Difficult", description: "Best understood by university graduates" }
        },
        
        fleschKincaid: {
            elementary: { min: 0, max: 5, level: "elementary", description: "Elementary School Level" },
            middle: { min: 6, max: 8, level: "middle", description: "Middle School Level" },
            high: { min: 9, max: 13, level: "high", description: "High School Level" },
            college: { min: 14, max: 16, level: "college", description: "College Level" },
            graduate: { min: 17, max: 100, level: "graduate", description: "Graduate Level" }
        }
    },

    // Analysis templates and default settings
    analysisTemplates: {
        default: {
            includeStatistics: true,
            includeReadability: true,
            includeGradeLevel: true,
            includeInsights: true,
            includeReadingTime: true
        },
        basic: {
            includeStatistics: true,
            includeReadability: false,
            includeGradeLevel: false,
            includeInsights: false,
            includeReadingTime: true
        },
        detailed: {
            includeStatistics: true,
            includeReadability: true,
            includeGradeLevel: true,
            includeInsights: true,
            includeReadingTime: true,
            includeSentimentAnalysis: true,
            includeKeywordDensity: true
        }
    },

    // UI text constants and messages
    messages: {
        errors: {
            emptyText: "Please enter some text to analyze.",
            textTooShort: "Text must contain at least 10 words for accurate analysis.",
            textTooLong: "Text exceeds maximum length of 10,000 characters.",
            analysisError: "An error occurred during text analysis. Please try again.",
            exportError: "Failed to export analysis results.",
            copyError: "Failed to copy results to clipboard."
        },
        success: {
            analysisDone: "Text analysis completed successfully!",
            textCleared: "Text and results have been cleared.",
            resultsCopied: "Analysis results copied to clipboard!",
            resultsExported: "Analysis results exported successfully!"
        },
        info: {
            analyzing: "Analyzing your text...",
            preparingResults: "Preparing analysis results...",
            calculatingScores: "Calculating readability scores...",
            generatingInsights: "Generating insights and recommendations..."
        }
    },

    // Animation and timing settings
    animations: {
        progressSteps: [
            { progress: 20, text: "Processing text structure..." },
            { progress: 40, text: "Calculating word and sentence counts..." },
            { progress: 60, text: "Computing readability scores..." },
            { progress: 80, text: "Analyzing grade levels..." },
            { progress: 100, text: "Generating insights..." }
        ],
        delays: {
            progressStep: 300,
            toastDuration: 3000,
            fadeIn: 150,
            fadeOut: 250
        }
    },

    // Validation rules
    validation: {
        minWords: 10,
        maxCharacters: 10000,
        minSentences: 1,
        patterns: {
            sentence: /[.!?]+/g,
            word: /\b\w+\b/g,
            paragraph: /\n\s*\n/g,
            syllable: /[aeiouy]+/gi
        }
    },

    // Export formats and options
    exportFormats: {
        json: {
            mimeType: 'application/json',
            extension: '.json',
            formatter: 'formatAsJSON'
        },
        csv: {
            mimeType: 'text/csv',
            extension: '.csv',
            formatter: 'formatAsCSV'
        },
        txt: {
            mimeType: 'text/plain',
            extension: '.txt',
            formatter: 'formatAsText'
        }
    }
};

// Analysis result JSON structure template
const ANALYSIS_RESULT_TEMPLATE = {
    metadata: {
        timestamp: null,
        version: "1.0.0",
        analysisType: "complete",
        textLength: 0
    },
    
    statistics: {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        averageWordsPerSentence: 0,
        averageSentencesPerParagraph: 0,
        averageSyllablesPerWord: 0,
        longestWord: "",
        shortestWord: "",
        mostCommonWords: []
    },
    
    readability: {
        fleschReadingEase: {
            score: 0,
            level: "unknown",
            interpretation: "No analysis performed",
            percentage: 0
        },
        fleschKincaidGrade: {
            score: 0,
            level: "unknown",
            interpretation: "No analysis performed",
            percentage: 0
        }
    },
    
    gradeLevel: {
        overall: {
            grade: 0,
            level: "none",
            description: "No analysis performed"
        },
        readingTime: {
            slow: { minutes: 0, seconds: 0, total: "0 min" },
            average: { minutes: 0, seconds: 0, total: "0 min" },
            fast: { minutes: 0, seconds: 0, total: "0 min" }
        }
    },
    
    insights: {
        strengths: [],
        improvements: [],
        recommendations: [],
        overallAssessment: "No analysis performed"
    }
};

// Export template for different formats
const EXPORT_TEMPLATES = {
    json: {
        structure: ANALYSIS_RESULT_TEMPLATE,
        options: {
            indent: 2,
            includeMetadata: true
        }
    },
    
    csv: {
        headers: [
            "Metric",
            "Value",
            "Category",
            "Description"
        ],
        mapping: {
            'words': 'statistics.words',
            'characters': 'statistics.characters',
            'sentences': 'statistics.sentences',
            'paragraphs': 'statistics.paragraphs',
            'flesch_score': 'readability.fleschReadingEase.score',
            'fk_grade': 'readability.fleschKincaidGrade.score',
            'grade_level': 'gradeLevel.overall.grade',
            'reading_time_avg': 'gradeLevel.readingTime.average.total'
        }
    },
    
    text: {
        template: `
Advanced Text Analyzer - Results Report
Generated: {{timestamp}}

=== TEXT STATISTICS ===
Words: {{statistics.words}}
Characters: {{statistics.characters}}
Sentences: {{statistics.sentences}}
Paragraphs: {{statistics.paragraphs}}
Average Words per Sentence: {{statistics.averageWordsPerSentence}}
Average Syllables per Word: {{statistics.averageSyllablesPerWord}}

=== READABILITY SCORES ===
Flesch Reading Ease: {{readability.fleschReadingEase.score}} ({{readability.fleschReadingEase.level}})
Flesch-Kincaid Grade: {{readability.fleschKincaidGrade.score}}

=== GRADE LEVEL ===
Overall Grade Level: {{gradeLevel.overall.grade}}
Level Description: {{gradeLevel.overall.description}}

=== READING TIME ESTIMATES ===
Slow Reader (150 WPM): {{gradeLevel.readingTime.slow.total}}
Average Reader (250 WPM): {{gradeLevel.readingTime.average.total}}
Fast Reader (400 WPM): {{gradeLevel.readingTime.fast.total}}

=== KEY INSIGHTS ===
{{insights.overallAssessment}}

Strengths: {{insights.strengths}}
Areas for Improvement: {{insights.improvements}}
Recommendations: {{insights.recommendations}}
        `.trim()
    }
};

// DOM element selectors for easy reference
const SELECTORS = {
    // Input elements
    textInput: '#text-input',
    charCount: '#char-count',
    
    // Control buttons
    analyzeBtn: '#analyze-btn',
    clearBtn: '#clear-btn',
    exportBtn: '#export-btn',
    copyBtn: '#copy-btn',
    
    // Progress elements
    progressContainer: '#progress-container',
    progressFill: '#progress-fill',
    progressText: '#progress-text',
    
    // Statistics panel
    wordCount: '#word-count',
    charCountResult: '#char-count-result',
    sentenceCount: '#sentence-count',
    paragraphCount: '#paragraph-count',
    avgWordsPerSentence: '#avg-words-sentence',
    avgSyllablesPerWord: '#avg-syllables-word',
    
    // Readability panel
    fleschScore: '#flesch-score',
    fleschBar: '#flesch-bar',
    fleschInterpretation: '#flesch-interpretation',
    fkGrade: '#fk-grade',
    fkBar: '#fk-bar',
    fkInterpretation: '#fk-interpretation',
    
    // Grade panel
    gradeLevel: '#grade-level',
    gradeExplanation: '#grade-explanation',
    readingTimeSlow: '#reading-time-slow',
    readingTimeAvg: '#reading-time-avg',
    readingTimeFast: '#reading-time-fast',
    
    // Insights panel
    insightsContent: '#insights-content',
    
    // Toast container
    toastContainer: '#toast-container'
};

// Utility constants for calculations
const CALCULATION_CONSTANTS = {
    // Syllable counting patterns
    syllablePatterns: {
        vowels: /[aeiouy]+/gi,
        silentE: /e$/i,
        doubleVowels: /(aa|ee|ii|oo|uu|yy)/gi,
        triplePlus: /(aaa+|eee+|iii+|ooo+|uuu+|yyy+)/gi
    },
    
    // Common word lists for analysis
    commonWords: [
        'the', 'and', 'a', 'to', 'of', 'in', 'i', 'you', 'it', 'have',
        'to', 'that', 'for', 'do', 'he', 'with', 'on', 'this', 'we', 'that'
    ],
    
    // Punctuation patterns
    punctuation: {
        sentenceEnders: /[.!?]+/g,
        allPunctuation: /[^\w\s]/g,
        paragraphBreaks: /\n\s*\n/g
    }
};

// Feature flags for enabling/disabling functionality
const FEATURE_FLAGS = {
    enableAdvancedInsights: true,
    enableSentimentAnalysis: false,
    enableKeywordDensity: false,
    enableRealTimeAnalysis: true,
    enableDataExport: true,
    enableProgressAnimation: true,
    enableToastNotifications: true,
    enableAccessibilityFeatures: true
};

// Theme configuration for UI customization
const THEME_CONFIG = {
    colorSchemes: {
        default: {
            primary: '#2563eb',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6'
        },
        dark: {
            primary: '#3b82f6',
            success: '#34d399',
            warning: '#fbbf24',
            danger: '#f87171',
            info: '#60a5fa'
        }
    },
    animations: {
        enabled: true,
        duration: {
            fast: '150ms',
            normal: '250ms',
            slow: '350ms'
        }
    }
};

// Make configuration objects available globally
window.CONFIG = CONFIG;
window.ANALYSIS_RESULT_TEMPLATE = ANALYSIS_RESULT_TEMPLATE;
window.EXPORT_TEMPLATES = EXPORT_TEMPLATES;
window.SELECTORS = SELECTORS;
window.CALCULATION_CONSTANTS = CALCULATION_CONSTANTS;
window.FEATURE_FLAGS = FEATURE_FLAGS;
window.THEME_CONFIG = THEME_CONFIG;