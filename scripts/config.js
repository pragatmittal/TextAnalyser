/**
 * Configuration object for Text Analyzer
 * Contains all settings, thresholds, and default values
 */

// Main configuration object using object literal syntax
const config = {
    // Reading speeds for different reading levels (words per minute)
    readingSpeeds: {
        slow: 200,
        average: 250,
        fast: 300,
        expert: 400
    },
    
    // Grade level thresholds and their corresponding difficulty labels
    gradeLevelThresholds: {
        elementary: { min: 0, max: 6, label: 'Elementary School' },
        middle: { min: 7, max: 9, label: 'Middle School' },
        high: { min: 10, max: 12, label: 'High School' },
        college: { min: 13, max: 16, label: 'College' },
        graduate: { min: 17, max: Infinity, label: 'Graduate Level' }
    },
    
    // Flesch Reading Ease score interpretations
    fleschInterpretations: {
        veryEasy: { min: 90, max: 100, label: 'Very Easy', description: '5th grade level' },
        easy: { min: 80, max: 89, label: 'Easy', description: '6th grade level' },
        fairlyEasy: { min: 70, max: 79, label: 'Fairly Easy', description: '7th grade level' },
        standard: { min: 60, max: 69, label: 'Standard', description: '8th-9th grade level' },
        fairlyDifficult: { min: 50, max: 59, label: 'Fairly Difficult', description: '10th-12th grade level' },
        difficult: { min: 30, max: 49, label: 'Difficult', description: 'College level' },
        veryDifficult: { min: 0, max: 29, label: 'Very Difficult', description: 'Graduate level' }
    },
    
    // Gunning Fog Index interpretations
    gunningFogInterpretations: {
        veryEasy: { min: 0, max: 8, label: 'Very Easy', description: 'Elementary school level' },
        easy: { min: 9, max: 12, label: 'Easy', description: 'High school level' },
        moderate: { min: 13, max: 16, label: 'Moderate', description: 'College level' },
        difficult: { min: 17, max: 20, label: 'Difficult', description: 'College graduate level' },
        veryDifficult: { min: 21, max: Infinity, label: 'Very Difficult', description: 'Graduate level' }
    },
    
    // Display format preferences
    displayFormats: {
        decimalPlaces: 2,
        percentageDecimalPlaces: 1,
        showPercentages: true,
        showInterpretations: true,
        maxFrequencyWords: 10
    },
    
    // Text processing settings
    processing: {
        debounceDelay: 500, // milliseconds
        minTextLength: 1,
        maxTextLength: 100000,
        maxWordLength: 50,
        minWordLength: 1
    },
    
    // Input validation settings
    validation: {
        allowedSpecialChars: /[.,!?;:()\[\]{}'"`~@#$%^&*+=|\\\/<>]/g,
        sentenceEndings: /[.!?]+$/,
        abbreviationPatterns: [
            /Mr\./gi, /Mrs\./gi, /Ms\./gi, /Dr\./gi, /Prof\./gi,
            /Inc\./gi, /Ltd\./gi, /Co\./gi, /Corp\./gi, /St\./gi,
            /Ave\./gi, /Blvd\./gi, /Rd\./gi, /etc\./gi, /vs\./gi
        ]
    },
    
    // Analysis result templates
    resultTemplates: {
        basicStats: {
            wordCount: 0,
            charCount: 0,
            charCountNoSpaces: 0,
            sentenceCount: 0,
            paragraphCount: 0,
            readingTime: 0
        },
        readability: {
            avgWordsPerSentence: 0,
            avgSyllablesPerWord: 0,
            fleschScore: 0,
            fleschInterpretation: '',
            gradeLevel: 0,
            gradeInterpretation: '',
            gunningFog: 0,
            gunningFogInterpretation: ''
        },
        complexity: {
            longWordsCount: 0,
            longWordsPercentage: 0,
            complexWordsCount: 0,
            complexWordsPercentage: 0,
            avgSentenceLength: 0,
            textDensity: 0
        },
        frequency: []
    },
    
    // Default configuration values
    defaults: {
        readingSpeed: 'average',
        showAdvancedMetrics: true,
        autoAnalyze: true,
        theme: 'light'
    }
};

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else if (typeof window !== 'undefined') {
    window.config = config;
}
