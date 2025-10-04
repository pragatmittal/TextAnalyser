/**
 * UI Management Module
 * Handles user interface updates and interactions
 * Uses function expressions and arrow functions for event handling
 */

const ui = (function() {
    'use strict';
    
    // Cache DOM elements for performance
    const elements = {
        textInput: null,
        wordCount: null,
        charCount: null,
        charNoSpacesCount: null,
        sentenceCount: null,
        paragraphCount: null,
        readingTime: null,
        avgWordsPerSentence: null,
        avgSyllablesPerWord: null,
        fleschScore: null,
        fleschInterpretation: null,
        gradeLevel: null,
        gradeInterpretation: null,
        gunningFog: null,
        gunningFogInterpretation: null,
        longWordsCount: null,
        longWordsPercentage: null,
        complexWordsCount: null,
        complexWordsPercentage: null,
        avgSentenceLength: null,
        textDensity: null,
        frequencyList: null,
        copyResultsBtn: null
    };
    
    /**
     * Initialize DOM element cache using function expression
     */
    const initializeElements = function() {
        elements.textInput = document.getElementById('text-input');
        elements.wordCount = document.getElementById('word-count');
        elements.charCount = document.getElementById('char-count');
        elements.charNoSpacesCount = document.getElementById('char-no-spaces-count');
        elements.sentenceCount = document.getElementById('sentence-count');
        elements.paragraphCount = document.getElementById('paragraph-count');
        elements.readingTime = document.getElementById('reading-time');
        elements.avgWordsPerSentence = document.getElementById('avg-words-per-sentence');
        elements.avgSyllablesPerWord = document.getElementById('avg-syllables-per-word');
        elements.fleschScore = document.getElementById('flesch-score');
        elements.fleschInterpretation = document.getElementById('flesch-interpretation');
        elements.gradeLevel = document.getElementById('grade-level');
        elements.gradeInterpretation = document.getElementById('grade-interpretation');
        elements.gunningFog = document.getElementById('gunning-fog');
        elements.gunningFogInterpretation = document.getElementById('gunning-fog-interpretation');
        elements.longWordsCount = document.getElementById('long-words-count');
        elements.longWordsPercentage = document.getElementById('long-words-percentage');
        elements.complexWordsCount = document.getElementById('complex-words-count');
        elements.complexWordsPercentage = document.getElementById('complex-words-percentage');
        elements.avgSentenceLength = document.getElementById('avg-sentence-length');
        elements.textDensity = document.getElementById('text-density');
        elements.frequencyList = document.getElementById('frequency-list');
        elements.copyResultsBtn = document.getElementById('copy-results-btn');
    };
    
    /**
     * Update basic statistics display using arrow function
     * @param {object} stats - Basic statistics object
     */
    const updateBasicStats = (stats) => {
        if (!stats) return;
        
        const updateElement = (element, value) => {
            if (element) element.textContent = value;
        };
        
        updateElement(elements.wordCount, stats.wordCount || '0');
        updateElement(elements.charCount, stats.charCount || '0');
        updateElement(elements.charNoSpacesCount, stats.charCountNoSpaces || '0');
        updateElement(elements.sentenceCount, stats.sentenceCount || '0');
        updateElement(elements.paragraphCount, stats.paragraphCount || '0');
        updateElement(elements.readingTime, utils.formatReadingTime(stats.readingTime || 0));
    };
    
    /**
     * Update readability analysis display using arrow function
     * @param {object} readability - Readability analysis object
     */
    const updateReadability = (readability) => {
        if (!readability) return;
        
        const updateElement = (element, value) => {
            if (element) element.textContent = value;
        };
        
        updateElement(elements.avgWordsPerSentence, readability.avgWordsPerSentence || '0');
        updateElement(elements.avgSyllablesPerWord, readability.avgSyllablesPerWord || '0');
        updateElement(elements.fleschScore, readability.fleschScore || '0');
        updateElement(elements.fleschInterpretation, readability.fleschInterpretation || '');
        updateElement(elements.gradeLevel, readability.gradeLevel || '0');
        updateElement(elements.gradeInterpretation, readability.gradeInterpretation || '');
        updateElement(elements.gunningFog, readability.gunningFog || '0');
        updateElement(elements.gunningFogInterpretation, readability.gunningFogInterpretation || '');
    };
    
    /**
     * Update complexity analysis display using arrow function
     * @param {object} complexity - Complexity analysis object
     */
    const updateComplexity = (complexity) => {
        if (!complexity) return;
        
        const updateElement = (element, value) => {
            if (element) element.textContent = value;
        };
        
        updateElement(elements.longWordsCount, complexity.longWordsCount || '0');
        updateElement(elements.longWordsPercentage, complexity.longWordsPercentage || '0%');
        updateElement(elements.complexWordsCount, complexity.complexWordsCount || '0');
        updateElement(elements.complexWordsPercentage, complexity.complexWordsPercentage || '0%');
        updateElement(elements.avgSentenceLength, complexity.avgSentenceLength || '0');
        updateElement(elements.textDensity, complexity.textDensity || '0');
    };
    
    /**
     * Update word frequency display using arrow function
     * @param {Array} frequency - Word frequency array
     */
    const updateFrequency = (frequency) => {
        if (!elements.frequencyList) return;
        
        if (!frequency || frequency.length === 0) {
            elements.frequencyList.innerHTML = '<p class="no-data">No frequency data available</p>';
            return;
        }
        
        const frequencyHTML = frequency.map(item => 
            `<div class="frequency-item">
                <span class="frequency-word">${item.word}</span>
                <span class="frequency-count">${item.count}</span>
            </div>`
        ).join('');
        
        elements.frequencyList.innerHTML = frequencyHTML;
    };
    
    /**
     * Update all results display using function expression
     * @param {object} results - Complete analysis results
     */
    const updateResults = function(results) {
        if (!results) {
            clearResults();
            return;
        }
        
        // Update each section
        updateBasicStats(results.basicStats);
        updateReadability(results.readability);
        updateComplexity(results.complexity);
        updateFrequency(results.frequency);
        
        // Show success message
        utils.showMessage('Results updated successfully', 'success', 2000);
    };
    
    /**
     * Clear all results display using function expression
     */
    const clearResults = function() {
        // Clear basic stats
        updateBasicStats({
            wordCount: '-',
            charCount: '-',
            charCountNoSpaces: '-',
            sentenceCount: '-',
            paragraphCount: '-',
            readingTime: '-'
        });
        
        // Clear readability
        updateReadability({
            avgWordsPerSentence: '-',
            avgSyllablesPerWord: '-',
            fleschScore: '-',
            fleschInterpretation: '-',
            gradeLevel: '-',
            gradeInterpretation: '-',
            gunningFog: '-',
            gunningFogInterpretation: '-'
        });
        
        // Clear complexity
        updateComplexity({
            longWordsCount: '-',
            longWordsPercentage: '-',
            complexWordsCount: '-',
            complexWordsPercentage: '-',
            avgSentenceLength: '-',
            textDensity: '-'
        });
        
        // Clear frequency
        if (elements.frequencyList) {
            elements.frequencyList.innerHTML = '<p class="no-data">Enter text to see word frequency analysis</p>';
        }
    };
    
    /**
     * Copy results to clipboard using arrow function
     */
    const copyResults = async () => {
        if (!elements.copyResultsBtn) return;
        
        try {
            // Get current results
            const results = gatherCurrentResults();
            
            if (!results || Object.keys(results).length === 0) {
                utils.showMessage('No results to copy', 'warning', 2000);
                return;
            }
            
            // Format results for copying
            const formattedResults = formatResultsForCopy(results);
            
            // Copy to clipboard
            const success = await utils.copyToClipboard(formattedResults);
            
            if (success) {
                utils.showMessage('Results copied to clipboard', 'success', 2000);
            } else {
                utils.showMessage('Failed to copy results', 'error', 3000);
            }
        } catch (error) {
            console.error('Copy error:', error);
            utils.showMessage('Error copying results', 'error', 3000);
        }
    };
    
    /**
     * Gather current results from DOM using function expression
     * @returns {object} Current results object
     */
    const gatherCurrentResults = function() {
        const results = {};
        
        // Basic stats
        results.basicStats = {
            wordCount: elements.wordCount?.textContent || '-',
            charCount: elements.charCount?.textContent || '-',
            charCountNoSpaces: elements.charNoSpacesCount?.textContent || '-',
            sentenceCount: elements.sentenceCount?.textContent || '-',
            paragraphCount: elements.paragraphCount?.textContent || '-',
            readingTime: elements.readingTime?.textContent || '-'
        };
        
        // Readability
        results.readability = {
            avgWordsPerSentence: elements.avgWordsPerSentence?.textContent || '-',
            avgSyllablesPerWord: elements.avgSyllablesPerWord?.textContent || '-',
            fleschScore: elements.fleschScore?.textContent || '-',
            fleschInterpretation: elements.fleschInterpretation?.textContent || '-',
            gradeLevel: elements.gradeLevel?.textContent || '-',
            gradeInterpretation: elements.gradeInterpretation?.textContent || '-',
            gunningFog: elements.gunningFog?.textContent || '-',
            gunningFogInterpretation: elements.gunningFogInterpretation?.textContent || '-'
        };
        
        // Complexity
        results.complexity = {
            longWordsCount: elements.longWordsCount?.textContent || '-',
            longWordsPercentage: elements.longWordsPercentage?.textContent || '-',
            complexWordsCount: elements.complexWordsCount?.textContent || '-',
            complexWordsPercentage: elements.complexWordsPercentage?.textContent || '-',
            avgSentenceLength: elements.avgSentenceLength?.textContent || '-',
            textDensity: elements.textDensity?.textContent || '-'
        };
        
        // Frequency data
        const frequencyItems = elements.frequencyList?.querySelectorAll('.frequency-item');
        if (frequencyItems && frequencyItems.length > 0) {
            results.frequency = Array.from(frequencyItems).map(item => ({
                word: item.querySelector('.frequency-word')?.textContent || '',
                count: item.querySelector('.frequency-count')?.textContent || '0'
            }));
        }
        
        return results;
    };
    
    /**
     * Format results for clipboard copying using function expression
     * @param {object} results - Results object to format
     * @returns {string} Formatted results string
     */
    const formatResultsForCopy = function(results) {
        const timestamp = new Date().toLocaleString();
        let formatted = `Text Analysis Results - ${timestamp}\n`;
        formatted += '='.repeat(50) + '\n\n';
        
        // Basic Statistics
        formatted += 'BASIC STATISTICS\n';
        formatted += '-'.repeat(20) + '\n';
        formatted += `Words: ${results.basicStats.wordCount}\n`;
        formatted += `Characters: ${results.basicStats.charCount}\n`;
        formatted += `Characters (no spaces): ${results.basicStats.charCountNoSpaces}\n`;
        formatted += `Sentences: ${results.basicStats.sentenceCount}\n`;
        formatted += `Paragraphs: ${results.basicStats.paragraphCount}\n`;
        formatted += `Reading Time: ${results.basicStats.readingTime}\n\n`;
        
        // Readability Analysis
        formatted += 'READABILITY ANALYSIS\n';
        formatted += '-'.repeat(25) + '\n';
        formatted += `Average Words per Sentence: ${results.readability.avgWordsPerSentence}\n`;
        formatted += `Average Syllables per Word: ${results.readability.avgSyllablesPerWord}\n`;
        formatted += `Flesch Reading Ease: ${results.readability.fleschScore} (${results.readability.fleschInterpretation})\n`;
        formatted += `Grade Level: ${results.readability.gradeLevel} (${results.readability.gradeInterpretation})\n`;
        formatted += `Gunning Fog Index: ${results.readability.gunningFog} (${results.readability.gunningFogInterpretation})\n\n`;
        
        // Text Complexity
        formatted += 'TEXT COMPLEXITY\n';
        formatted += '-'.repeat(20) + '\n';
        formatted += `Long Words (>6 letters): ${results.complexity.longWordsCount} (${results.complexity.longWordsPercentage})\n`;
        formatted += `Complex Words (>3 syllables): ${results.complexity.complexWordsCount} (${results.complexity.complexWordsPercentage})\n`;
        formatted += `Average Sentence Length: ${results.complexity.avgSentenceLength} characters\n`;
        formatted += `Text Density: ${results.complexity.textDensity} words/paragraph\n\n`;
        
        // Word Frequency
        if (results.frequency && results.frequency.length > 0) {
            formatted += 'MOST FREQUENT WORDS\n';
            formatted += '-'.repeat(25) + '\n';
            results.frequency.forEach(item => {
                formatted += `${item.word}: ${item.count}\n`;
            });
        }
        
        return formatted;
    };
    
    /**
     * Handle copy results button click using function expression
     */
    const handleCopyResultsClick = function() {
        copyResults();
    };
    
    /**
     * Initialize UI components using function expression
     */
    const initialize = function() {
        // Initialize DOM element cache
        initializeElements();
        
        // Add event listeners
        if (elements.copyResultsBtn) {
            elements.copyResultsBtn.addEventListener('click', handleCopyResultsClick);
        }
        
        // Initialize with empty state
        clearResults();
        
        console.log('UI module initialized successfully');
    };
    
    // Public API using object literal
    return {
        updateResults,
        clearResults,
        copyResults,
        initialize,
        updateBasicStats,
        updateReadability,
        updateComplexity,
        updateFrequency
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui;
} else if (typeof window !== 'undefined') {
    window.ui = ui;
}
