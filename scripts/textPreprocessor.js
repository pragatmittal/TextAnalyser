/**
 * Advanced Text Analyzer - Text Preprocessing Pipeline Module
 * Comprehensive text preprocessing with arrow functions and edge case handling
 * Uses advanced pipeline patterns and destructuring for clean processing
 */

// Self-invoking function for text preprocessing module (IIFE)
const TextPreprocessor = (function() {
    'use strict';
    
    // Pipeline configuration using destructuring-ready structure
    const {
        validation: { patterns },
        messages: { errors, warnings }
    } = CONFIG;
    
    // Advanced preprocessing stages using arrow functions
    const preprocessingStages = {
        
        // Stage 1: Basic text normalization
        normalize: (text) => {
            if (!text || typeof text !== 'string') return '';
            
            // Handle different types of whitespace and normalize
            return text
                .replace(/\u00A0/g, ' ')           // Non-breaking space
                .replace(/\u2000-\u200F/g, ' ')   // Various Unicode spaces
                .replace(/\u2028-\u2029/g, '\n')  // Line/paragraph separators
                .replace(/\r\n/g, '\n')           // Windows line endings
                .replace(/\r/g, '\n')             // Mac line endings
                .trim();
        },
        
        // Stage 2: Smart quote and character replacement
        smartCharacters: (text) => {
            const replacements = [
                [/[\u2018\u2019]/g, "'"],         // Smart single quotes
                [/[\u201C\u201D]/g, '"'],         // Smart double quotes
                [/\u2013/g, '-'],                 // En dash
                [/\u2014/g, '--'],                // Em dash
                [/\u2026/g, '...'],               // Ellipsis
                [/\u00B7/g, '·'],                 // Middle dot
                [/\u2022/g, '•'],                 // Bullet point
            ];
            
            return replacements.reduce((text, [pattern, replacement]) => 
                text.replace(pattern, replacement), text);
        },
        
        // Stage 3: Whitespace optimization
        optimizeWhitespace: (text) => {
            return text
                .replace(/[ \t]+/g, ' ')          // Multiple spaces/tabs to single space
                .replace(/\n[ \t]+/g, '\n')       // Remove spaces/tabs at line start
                .replace(/[ \t]+\n/g, '\n')       // Remove spaces/tabs at line end
                .replace(/\n{3,}/g, '\n\n')       // Multiple newlines to double
                .replace(/^\s+|\s+$/g, '');       // Trim overall
        },
        
        // Stage 4: Punctuation normalization
        normalizePunctuation: (text) => {
            return text
                .replace(/([.!?]){2,}/g, '$1')    // Remove excessive punctuation
                .replace(/([.!?])\s*([.!?])/g, '$1 $2') // Space between different punctuation
                .replace(/,{2,}/g, ',')           // Remove excessive commas
                .replace(/;{2,}/g, ';')           // Remove excessive semicolons
                .replace(/:{2,}/g, ':')           // Remove excessive colons
                .replace(/\s+([.!?,:;])/g, '$1')  // Remove space before punctuation
                .replace(/([.!?,:;])\s+/g, '$1 '); // Ensure space after punctuation
        },
        
        // Stage 5: Handle special formatting cases
        handleSpecialCases: (text) => {
            return text
                .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr)\.(?!\s*$)/g, '$1') // Remove dots from titles
                .replace(/\b(vs|etc|e\.g|i\.e)\.?\b/gi, (match) => 
                    match.toLowerCase().replace('.', '')) // Handle abbreviations
                .replace(/(\d+)\.(\d+)/g, '$1DECIMAL$2')  // Protect decimal numbers
                .replace(/(\d+)\s*-\s*(\d+)/g, '$1-$2')   // Join number ranges
                .replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1$2'); // Handle ordinals
        },
        
        // Stage 6: Advanced cleaning
        advancedCleaning: (text) => {
            return text
                .replace(/DECIMAL/g, '.')         // Restore decimal points
                .replace(/\s*\n\s*/g, '\n')       // Clean paragraph breaks
                .replace(/([.!?])\s*\n/g, '$1\n') // Ensure proper sentence endings
                .replace(/\n([a-z])/g, (match, letter) => 
                    '\n' + letter.toUpperCase())  // Capitalize after paragraph breaks
                .replace(/^\s*(.)/g, (match, first) => 
                    first.toUpperCase());         // Capitalize first character
        }
    };
    
    // Edge case handlers using arrow functions
    const edgeCaseHandlers = {
        
        // Handle extremely long texts
        handleLongText: (text, maxLength = 50000) => {
            if (text.length <= maxLength) return text;
            
            console.warn(`⚠️ Text truncated from ${text.length} to ${maxLength} characters`);
            
            // Smart truncation at sentence boundary
            const truncated = text.substring(0, maxLength);
            const lastSentenceEnd = Math.max(
                truncated.lastIndexOf('.'),
                truncated.lastIndexOf('!'),
                truncated.lastIndexOf('?')
            );
            
            return lastSentenceEnd > maxLength * 0.8 
                ? truncated.substring(0, lastSentenceEnd + 1)
                : truncated + '...';
        },
        
        // Handle texts with mixed languages or scripts
        handleMixedScripts: (text) => {
            const scriptPatterns = {
                latin: /[a-zA-Z]/g,
                cyrillic: /[\u0400-\u04FF]/g,
                arabic: /[\u0600-\u06FF]/g,
                chinese: /[\u4E00-\u9FFF]/g,
                japanese: /[\u3040-\u309F\u30A0-\u30FF]/g,
                korean: /[\uAC00-\uD7AF]/g
            };
            
            const detectedScripts = Object.entries(scriptPatterns)
                .filter(([script, pattern]) => pattern.test(text))
                .map(([script]) => script);
            
            if (detectedScripts.length > 1) {
                console.log('🌐 Mixed script text detected:', detectedScripts);
                
                // Add appropriate spacing between script changes
                return text.replace(
                    /([a-zA-Z])(\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul})/gu,
                    '$1 $2'
                ).replace(
                    /(\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul})([a-zA-Z])/gu,
                    '$1 $2'
                );
            }
            
            return text;
        },
        
        // Handle code-like content
        handleCodeContent: (text) => {
            const codePatterns = [
                /```[\s\S]*?```/g,           // Markdown code blocks
                /`[^`]+`/g,                  // Inline code
                /<code[\s\S]*?<\/code>/gi,   // HTML code tags
                /(?:function|class|const|let|var)\s+\w+/g, // JavaScript keywords
                /#include\s*<[\w\.]+>/g,     // C/C++ includes
                /import\s+[\w\{\}]+\s+from/g // ES6 imports
            ];
            
            const hasCode = codePatterns.some(pattern => pattern.test(text));
            
            if (hasCode) {
                console.log('💻 Code content detected, applying special handling');
                
                // Preserve code formatting
                return text
                    .replace(/```([\s\S]*?)```/g, (match, code) => 
                        '```' + code.replace(/\s+/g, ' ').trim() + '```')
                    .replace(/`([^`]+)`/g, (match, code) => 
                        '`' + code.trim() + '`');
            }
            
            return text;
        },
        
        // Handle text with excessive repetition
        handleRepetition: (text) => {
            // Detect word repetition
            const words = text.toLowerCase().split(/\s+/);
            const wordCounts = {};
            let totalWords = words.length;
            
            words.forEach(word => {
                if (word.length > 2) { // Only count meaningful words
                    wordCounts[word] = (wordCounts[word] || 0) + 1;
                }
            });
            
            // Find highly repeated words (more than 10% of total)
            const highlyRepeated = Object.entries(wordCounts)
                .filter(([word, count]) => count > totalWords * 0.1)
                .map(([word]) => word);
            
            if (highlyRepeated.length > 0) {
                console.warn('🔄 Highly repetitive text detected:', highlyRepeated);
                
                // Reduce excessive repetition
                let processed = text;
                highlyRepeated.forEach(word => {
                    const pattern = new RegExp(`\\b${word}\\b`, 'gi');
                    const matches = text.match(pattern);
                    if (matches && matches.length > 5) {
                        // Keep only every 3rd occurrence after the first 3
                        let count = 0;
                        processed = processed.replace(pattern, (match) => {
                            count++;
                            return count <= 3 || count % 3 === 0 ? match : '';
                        });
                    }
                });
                
                return processed.replace(/\s+/g, ' ').trim();
            }
            
            return text;
        },
        
        // Handle text with formatting artifacts
        handleFormattingArtifacts: (text) => {
            const artifacts = [
                /\[Page \d+\]/gi,            // Page numbers
                /\[Figure \d+\]/gi,          // Figure references
                /\[Table \d+\]/gi,           // Table references
                /\[Ref\. \d+\]/gi,           // Reference numbers
                /\[\d+\]/g,                  // Numbered references
                /^\d+\.\s*/gm,               // Numbered list items
                /^\-\s*/gm,                  // Bullet points
                /^\*\s*/gm,                  // Asterisk bullets
                /_{3,}/g,                    // Underline artifacts
                /-{3,}/g,                    // Dash artifacts
                /={3,}/g,                    // Equals artifacts
            ];
            
            let cleaned = text;
            artifacts.forEach(pattern => {
                cleaned = cleaned.replace(pattern, ' ');
            });
            
            return cleaned.replace(/\s+/g, ' ').trim();
        }
    };
    
    // Main preprocessing pipeline using arrow function composition
    const createPreprocessingPipeline = (...customStages) => {
        // Default pipeline stages in order
        const defaultPipeline = [
            preprocessingStages.normalize,
            edgeCaseHandlers.handleLongText,
            edgeCaseHandlers.handleFormattingArtifacts,
            preprocessingStages.smartCharacters,
            edgeCaseHandlers.handleMixedScripts,
            edgeCaseHandlers.handleCodeContent,
            preprocessingStages.optimizeWhitespace,
            preprocessingStages.normalizePunctuation,
            preprocessingStages.handleSpecialCases,
            edgeCaseHandlers.handleRepetition,
            preprocessingStages.advancedCleaning
        ];
        
        // Combine default and custom stages
        const pipeline = [...defaultPipeline, ...customStages];
        
        // Return pipeline function using arrow function composition
        return (text) => {
            const startTime = performance.now();
            
            try {
                // Process through pipeline stages with error handling
                const result = pipeline.reduce((processedText, stage, index) => {
                    try {
                        const stageResult = stage(processedText);
                        
                        // Validate stage result
                        if (typeof stageResult !== 'string') {
                            console.warn(`Stage ${index} returned non-string result, using previous text`);
                            return processedText;
                        }
                        
                        return stageResult;
                    } catch (stageError) {
                        console.error(`Pipeline stage ${index} failed:`, stageError);
                        return processedText; // Continue with previous text
                    }
                }, text);
                
                const processingTime = performance.now() - startTime;
                
                // Log performance metrics in development
                if (window.location.hostname === 'localhost' && processingTime > 10) {
                    console.log(`🔄 Text preprocessing completed in ${processingTime.toFixed(2)}ms`);
                }
                
                return {
                    processedText: result,
                    originalLength: text.length,
                    processedLength: result.length,
                    processingTime: processingTime,
                    reductionRatio: text.length > 0 ? (text.length - result.length) / text.length : 0
                };
                
            } catch (error) {
                console.error('❌ Preprocessing pipeline failed:', error);
                return {
                    processedText: text, // Return original text on complete failure
                    originalLength: text.length,
                    processedLength: text.length,
                    processingTime: performance.now() - startTime,
                    reductionRatio: 0,
                    error: error.message
                };
            }
        };
    };
    
    // Quality assessment using arrow functions
    const assessTextQuality = (text) => {
        const quality = {
            score: 0,
            issues: [],
            suggestions: [],
            metrics: {}
        };
        
        // Assessment criteria using arrow functions
        const assessmentCriteria = [
            
            // Check sentence structure
            (text) => {
                const sentences = text.split(/[.!?]+/).filter(s => s.trim());
                const avgWordsPerSentence = sentences.reduce((total, sentence) => 
                    total + sentence.trim().split(/\s+/).length, 0) / sentences.length;
                
                if (avgWordsPerSentence > 30) {
                    quality.issues.push('Very long sentences detected');
                    quality.suggestions.push('Consider breaking up long sentences for better readability');
                } else if (avgWordsPerSentence < 5) {
                    quality.issues.push('Very short sentences detected');
                    quality.suggestions.push('Consider combining related short sentences');
                } else {
                    quality.score += 25;
                }
                
                quality.metrics.averageWordsPerSentence = avgWordsPerSentence;
            },
            
            // Check vocabulary diversity
            (text) => {
                const words = text.toLowerCase().match(/\b\w+\b/g) || [];
                const uniqueWords = new Set(words);
                const diversityRatio = uniqueWords.size / words.length;
                
                if (diversityRatio > 0.7) {
                    quality.score += 25;
                } else if (diversityRatio < 0.3) {
                    quality.issues.push('Low vocabulary diversity');
                    quality.suggestions.push('Consider using more varied vocabulary');
                }
                
                quality.metrics.vocabularyDiversity = diversityRatio;
            },
            
            // Check paragraph structure
            (text) => {
                const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
                const avgSentencesPerParagraph = paragraphs.reduce((total, paragraph) => {
                    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim());
                    return total + sentences.length;
                }, 0) / paragraphs.length;
                
                if (avgSentencesPerParagraph >= 3 && avgSentencesPerParagraph <= 7) {
                    quality.score += 25;
                } else if (avgSentencesPerParagraph > 10) {
                    quality.issues.push('Very long paragraphs detected');
                    quality.suggestions.push('Consider breaking up long paragraphs');
                }
                
                quality.metrics.averageSentencesPerParagraph = avgSentencesPerParagraph;
            },
            
            // Check readability indicators
            (text) => {
                const syllableCount = text.match(/[aeiouy]+/gi)?.length || 0;
                const wordCount = (text.match(/\b\w+\b/g) || []).length;
                const avgSyllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0;
                
                if (avgSyllablesPerWord >= 1.3 && avgSyllablesPerWord <= 2.0) {
                    quality.score += 25;
                } else if (avgSyllablesPerWord > 2.5) {
                    quality.issues.push('Complex vocabulary detected');
                    quality.suggestions.push('Consider using simpler words where appropriate');
                }
                
                quality.metrics.averageSyllablesPerWord = avgSyllablesPerWord;
            }
        ];
        
        // Run all assessments
        assessmentCriteria.forEach(criterion => criterion(text));
        
        // Determine overall quality level
        if (quality.score >= 80) {
            quality.level = 'Excellent';
        } else if (quality.score >= 60) {
            quality.level = 'Good';
        } else if (quality.score >= 40) {
            quality.level = 'Fair';
        } else {
            quality.level = 'Needs Improvement';
        }
        
        return quality;
    };
    
    // Specialized preprocessing for different text types
    const specializedPreprocessors = {
        
        // Academic text preprocessing
        academic: (text) => {
            const academicPipeline = createPreprocessingPipeline(
                // Additional academic-specific processing
                (text) => text
                    .replace(/\bet\s+al\./gi, 'et al')  // Fix citation format
                    .replace(/\bp\.\s*(\d+)/gi, 'p. $1') // Fix page references
                    .replace(/\bpp\.\s*(\d+-\d+)/gi, 'pp. $1') // Fix page ranges
                    .replace(/\bvol\.\s*(\d+)/gi, 'vol. $1') // Fix volume references
                    .replace(/\bno\.\s*(\d+)/gi, 'no. $1')   // Fix number references
            );
            
            return academicPipeline(text);
        },
        
        // Creative writing preprocessing
        creative: (text) => {
            const creativePipeline = createPreprocessingPipeline(
                // Preserve creative elements
                (text) => text
                    .replace(/\s*\.\.\.\s*/g, '... ')  // Normalize ellipses spacing
                    .replace(/\s*--\s*/g, ' -- ')      // Normalize em-dashes
                    .replace(/([!?])\1+/g, '$1')       // Reduce excessive punctuation but keep emphasis
            );
            
            return creativePipeline(text);
        },
        
        // Technical documentation preprocessing
        technical: (text) => {
            const technicalPipeline = createPreprocessingPipeline(
                // Preserve technical formatting
                (text) => text
                    .replace(/\b(API|HTTP|URL|JSON|XML|HTML|CSS|SQL)\b/g, 
                        (match) => match.toUpperCase()) // Normalize tech acronyms
                    .replace(/version\s*(\d+\.?\d*\.?\d*)/gi, 'version $1') // Normalize versions
                    .replace(/\b(\d+)x(\d+)\b/g, '$1×$2') // Use proper multiplication symbol
            );
            
            return technicalPipeline(text);
        },
        
        // Business document preprocessing
        business: (text) => {
            const businessPipeline = createPreprocessingPipeline(
                // Business document specific processing
                (text) => text
                    .replace(/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$$$1') // Fix currency format
                    .replace(/(\d+)%/g, '$1%') // Ensure no space before percentage
                    .replace(/\bQ(\d)\b/g, 'Q$1') // Normalize quarters
                    .replace(/\bFY\s*(\d{4})\b/gi, 'FY $1') // Normalize fiscal years
            );
            
            return businessPipeline(text);
        }
    };
    
    // Text type detection using arrow functions
    const detectTextType = (text) => {
        const detectionRules = [
            {
                type: 'academic',
                patterns: [/\bet\s+al\./gi, /\bcitation\b/gi, /\breference\b/gi, /\babstract\b/gi],
                threshold: 2
            },
            {
                type: 'creative',
                patterns: [/[""]/g, /\.\.\./g, /[!?]{2,}/g, /dialogue/gi],
                threshold: 2
            },
            {
                type: 'technical',
                patterns: [/\bAPI\b/gi, /\bHTTP\b/gi, /\bJSON\b/gi, /function\s*\(/gi, /\bcode\b/gi],
                threshold: 2
            },
            {
                type: 'business',
                patterns: [/\$\d+/g, /revenue/gi, /profit/gi, /quarter/gi, /fiscal/gi],
                threshold: 2
            }
        ];
        
        const scores = detectionRules.map(rule => {
            const matches = rule.patterns.reduce((count, pattern) => 
                count + (text.match(pattern) || []).length, 0);
            
            return {
                type: rule.type,
                score: matches >= rule.threshold ? matches : 0
            };
        });
        
        const topType = scores.reduce((best, current) => 
            current.score > best.score ? current : best, scores[0]);
        
        return topType.score > 0 ? topType.type : 'general';
    };
    
    // Public API using object literal
    return {
        // Main preprocessing methods
        preprocess: createPreprocessingPipeline(),
        createPipeline: createPreprocessingPipeline,
        
        // Specialized preprocessors
        preprocessAcademic: specializedPreprocessors.academic,
        preprocessCreative: specializedPreprocessors.creative,
        preprocessTechnical: specializedPreprocessors.technical,
        preprocessBusiness: specializedPreprocessors.business,
        
        // Utility methods
        assessQuality: assessTextQuality,
        detectType: detectTextType,
        
        // Individual stage access
        stages: preprocessingStages,
        edgeCases: edgeCaseHandlers,
        
        // Smart preprocessing that auto-detects type
        smartPreprocess: (text) => {
            const textType = detectTextType(text);
            console.log(`📝 Detected text type: ${textType}`);
            
            switch (textType) {
                case 'academic':
                    return specializedPreprocessors.academic(text);
                case 'creative':
                    return specializedPreprocessors.creative(text);
                case 'technical':
                    return specializedPreprocessors.technical(text);
                case 'business':
                    return specializedPreprocessors.business(text);
                default:
                    return createPreprocessingPipeline()(text);
            }
        }
    };
    
})(); // IIFE - Self-invoking function immediately executes

// Make TextPreprocessor available globally
window.TextPreprocessor = TextPreprocessor;

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextPreprocessor;
}