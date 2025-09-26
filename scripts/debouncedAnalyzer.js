/**
 * Advanced Text Analyzer - Debounced Analysis System
 * Prevents system overload with intelligent analysis throttling and queuing
 * Uses function expressions and advanced debouncing techniques
 */

// Self-invoking function for debounced analysis module (IIFE)
const DebouncedAnalyzer = (function() {
    'use strict';
    
    // Analysis system state using object literal with destructuring support
    const analysisState = {
        pendingAnalyses: new Map(),
        activeAnalyses: new Map(),
        analysisQueue: [],
        performanceMetrics: {
            totalAnalyses: 0,
            averageAnalysisTime: 0,
            queueProcessingTime: 0,
            throttledRequests: 0,
            lastAnalysisTimestamp: 0
        },
        systemLoad: {
            cpuUsage: 0,
            memoryUsage: 0,
            activeRequests: 0,
            maxConcurrentAnalyses: 3
        }
    };
    
    // Configuration destructuring from CONFIG object
    const {
        animations: { delays },
        validation: { minWords, maxCharacters },
        messages: { errors, info }
    } = CONFIG;
    
    // Advanced debouncing with adaptive delays using function expression
    const createAdaptiveDebounce = function(func, baseDelay, options = {}) {
        const {
            maxDelay = baseDelay * 5,
            minDelay = baseDelay / 2,
            loadFactor = true,
            exponentialBackoff = false
        } = options;
        
        let timeoutId;
        let lastCallTime = 0;
        let consecutiveCalls = 0;
        
        return function adaptiveDebouncedFunction(...args) {
            const now = performance.now();
            const timeSinceLastCall = now - lastCallTime;
            
            // Adaptive delay calculation
            let currentDelay = baseDelay;
            
            if (exponentialBackoff && consecutiveCalls > 0) {
                currentDelay = Math.min(baseDelay * Math.pow(1.5, consecutiveCalls), maxDelay);
            }
            
            if (loadFactor) {
                // Adjust delay based on system load
                const loadMultiplier = 1 + (analysisState.systemLoad.activeRequests * 0.2);
                currentDelay = Math.min(currentDelay * loadMultiplier, maxDelay);
            }
            
            // Fast track for very delayed calls
            if (timeSinceLastCall > maxDelay) {
                consecutiveCalls = 0;
                currentDelay = minDelay;
            } else {
                consecutiveCalls++;
            }
            
            lastCallTime = now;
            
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                consecutiveCalls = 0;
                func.apply(this, args);
            }, currentDelay);
            
            return timeoutId;
        };
    };
    
    // Smart throttling with system load awareness using arrow functions
    const createSmartThrottle = (func, interval, options = {}) => {
        const {
            maxExecutionsPerSecond = 5,
            backPressureThreshold = 10,
            adaptToLoad = true
        } = options;
        
        let lastExecution = 0;
        let executionCount = 0;
        let intervalStart = performance.now();
        
        return (...args) => {
            const now = performance.now();
            
            // Reset counter every second
            if (now - intervalStart > 1000) {
                executionCount = 0;
                intervalStart = now;
            }
            
            // Check rate limiting
            if (executionCount >= maxExecutionsPerSecond) {
                analysisState.performanceMetrics.throttledRequests++;
                console.warn('⚠️ Analysis throttled due to rate limit');
                return Promise.reject(new Error('Analysis rate limit exceeded'));
            }
            
            // Check system load
            if (adaptToLoad && analysisState.systemLoad.activeRequests > backPressureThreshold) {
                analysisState.performanceMetrics.throttledRequests++;
                console.warn('⚠️ Analysis throttled due to system load');
                return Promise.reject(new Error('System overload - analysis deferred'));
            }
            
            // Apply throttling interval
            const timeSinceLastExecution = now - lastExecution;
            if (timeSinceLastExecution < interval) {
                return Promise.reject(new Error('Analysis throttled - too frequent'));
            }
            
            lastExecution = now;
            executionCount++;
            
            return func.apply(this, args);
        };
    };
    
    // Priority queue implementation using function expression
    const createPriorityQueue = function() {
        const queue = [];
        
        return {
            enqueue: (item, priority = 0) => {
                const queueItem = { item, priority, timestamp: performance.now() };
                
                // Insert based on priority (higher number = higher priority)
                let insertIndex = 0;
                for (let i = 0; i < queue.length; i++) {
                    if (queue[i].priority < priority) {
                        insertIndex = i;
                        break;
                    }
                    insertIndex = i + 1;
                }
                
                queue.splice(insertIndex, 0, queueItem);
                return queueItem;
            },
            
            dequeue: () => {
                return queue.shift()?.item;
            },
            
            peek: () => {
                return queue[0]?.item;
            },
            
            size: () => queue.length,
            
            clear: () => {
                queue.length = 0;
            },
            
            // Remove stale items (older than 30 seconds)
            cleanup: () => {
                const cutoff = performance.now() - 30000;
                const originalLength = queue.length;
                
                for (let i = queue.length - 1; i >= 0; i--) {
                    if (queue[i].timestamp < cutoff) {
                        queue.splice(i, 1);
                    }
                }
                
                if (queue.length !== originalLength) {
                    console.log(`🧹 Cleaned ${originalLength - queue.length} stale analysis requests`);
                }
            }
        };
    };
    
    // Analysis request queue with priority support
    const analysisQueue = createPriorityQueue();
    
    // Request priority calculation using arrow functions
    const calculateRequestPriority = (text, options = {}) => {
        let priority = 0;
        
        // Base priority on text length (longer = higher priority within reason)
        const textLength = text.length;
        if (textLength > 1000 && textLength < 5000) {
            priority += 3;
        } else if (textLength >= 500 && textLength <= 1000) {
            priority += 2;
        } else if (textLength >= 100) {
            priority += 1;
        }
        
        // User interaction priority
        if (options.userInitiated) {
            priority += 5;
        }
        
        // Real-time typing priority (lower)
        if (options.realTime) {
            priority -= 1;
        }
        
        // High importance requests
        if (options.highPriority) {
            priority += 10;
        }
        
        return Math.max(0, priority);
    };
    
    // System load monitoring using function expressions
    const monitorSystemLoad = function() {
        const updateSystemLoad = function() {
            // Monitor active requests
            analysisState.systemLoad.activeRequests = analysisState.activeAnalyses.size;
            
            // Monitor memory usage if available
            if ('memory' in performance) {
                const memory = performance.memory;
                analysisState.systemLoad.memoryUsage = 
                    memory.usedJSHeapSize / memory.jsHeapSizeLimit;
            }
            
            // Simple CPU usage estimation based on analysis timing
            const recentAnalysisTime = analysisState.performanceMetrics.averageAnalysisTime;
            if (recentAnalysisTime > 100) {
                analysisState.systemLoad.cpuUsage = Math.min(recentAnalysisTime / 500, 1);
            } else {
                analysisState.systemLoad.cpuUsage = 0.1;
            }
            
            // Adjust max concurrent analyses based on system performance
            if (analysisState.systemLoad.memoryUsage > 0.8 || analysisState.systemLoad.cpuUsage > 0.7) {
                analysisState.systemLoad.maxConcurrentAnalyses = 1;
            } else if (analysisState.systemLoad.memoryUsage > 0.6 || analysisState.systemLoad.cpuUsage > 0.5) {
                analysisState.systemLoad.maxConcurrentAnalyses = 2;
            } else {
                analysisState.systemLoad.maxConcurrentAnalyses = 3;
            }
        };
        
        // Update system load every 2 seconds
        setInterval(updateSystemLoad, 2000);
        
        return updateSystemLoad;
    };
    
    // Queue processor using arrow functions with async/await
    const processAnalysisQueue = async () => {
        // Skip if at capacity
        if (analysisState.activeAnalyses.size >= analysisState.systemLoad.maxConcurrentAnalyses) {
            return;
        }
        
        // Clean up stale requests
        analysisQueue.cleanup();
        
        // Process next item in queue
        const nextRequest = analysisQueue.dequeue();
        if (!nextRequest) return;
        
        const { analysisId, text, options, resolve, reject } = nextRequest;
        
        try {
            // Mark as active
            analysisState.activeAnalyses.set(analysisId, {
                startTime: performance.now(),
                text: text.substring(0, 100) + '...', // Store snippet for debugging
                options
            });
            
            // Perform the actual analysis
            const result = await performAnalysis(text, options);
            
            // Update performance metrics
            updatePerformanceMetrics(analysisId, result);
            
            // Resolve the promise
            resolve(result);
            
        } catch (error) {
            console.error(`❌ Analysis ${analysisId} failed:`, error);
            reject(error);
        } finally {
            // Clean up active analysis
            analysisState.activeAnalyses.delete(analysisId);
            
            // Process next item in queue
            setTimeout(processAnalysisQueue, 10);
        }
    };
    
    // Core analysis function using destructuring
    const performAnalysis = async (text, options = {}) => {
        const startTime = performance.now();
        
        // Destructure options with defaults
        const {
            includePreprocessing = true,
            includeAdvancedMetrics = true,
            includeQualityAssessment = true,
            preprocessingType = 'smart'
        } = options;
        
        try {
            let processedText = text;
            let preprocessingResult = null;
            
            // Text preprocessing if requested
            if (includePreprocessing && window.TextPreprocessor) {
                if (preprocessingType === 'smart') {
                    preprocessingResult = TextPreprocessor.smartPreprocess(text);
                } else {
                    preprocessingResult = TextPreprocessor.preprocess(text);
                }
                
                processedText = preprocessingResult.processedText || text;
            }
            
            // Basic text analysis using existing analyzer
            const basicAnalysis = window.analyzeText ? 
                analyzeText(processedText) : 
                performBasicAnalysis(processedText);
            
            // Extract analysis components using destructuring
            const {
                statistics,
                readability,
                gradeLevel,
                insights
            } = basicAnalysis;
            
            // Advanced metrics if requested
            let advancedMetrics = null;
            if (includeAdvancedMetrics && window.InputProcessor) {
                const properties = InputProcessor.extractProperties(processedText);
                advancedMetrics = {
                    wordAnalysis: properties.words,
                    sentenceAnalysis: properties.sentences,
                    characterAnalysis: properties.characters
                };
            }
            
            // Quality assessment if requested
            let qualityAssessment = null;
            if (includeQualityAssessment && window.TextPreprocessor) {
                qualityAssessment = TextPreprocessor.assessQuality(processedText);
            }
            
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            
            // Return comprehensive analysis result
            return {
                analysisId: options.analysisId || `analysis_${Date.now()}`,
                timestamp: endTime,
                processingTime,
                text: {
                    original: text,
                    processed: processedText,
                    preprocessing: preprocessingResult
                },
                analysis: {
                    statistics,
                    readability,
                    gradeLevel,
                    insights
                },
                advanced: advancedMetrics,
                quality: qualityAssessment,
                metadata: {
                    textType: window.TextPreprocessor?.detectType(text) || 'general',
                    processingOptions: options
                }
            };
            
        } catch (error) {
            console.error('Analysis failed:', error);
            throw new Error(`Analysis failed: ${error.message}`);
        }
    };
    
    // Fallback basic analysis function
    const performBasicAnalysis = (text) => {
        const wordCount = Utils.text.countWords(text);
        const sentenceCount = Utils.text.countSentences(text);
        const paragraphCount = Utils.text.countParagraphs(text);
        
        return {
            statistics: {
                words: wordCount,
                characters: text.length,
                sentences: sentenceCount,
                paragraphs: paragraphCount,
                averageWordsPerSentence: sentenceCount > 0 ? Utils.math.round(wordCount / sentenceCount) : 0,
                averageSyllablesPerWord: 1.5 // Default estimate
            },
            readability: {
                fleschReadingEase: {
                    score: 50,
                    level: 'moderate',
                    interpretation: 'Standard readability'
                },
                fleschKincaidGrade: {
                    score: 8,
                    level: 'middle',
                    interpretation: 'Middle school level'
                }
            },
            gradeLevel: {
                overall: {
                    grade: 8,
                    level: 'middle',
                    description: 'Middle school reading level'
                }
            },
            insights: {
                strengths: ['Analysis completed'],
                improvements: [],
                recommendations: [],
                overallAssessment: 'Basic analysis performed'
            }
        };
    };
    
    // Performance metrics update using arrow functions
    const updatePerformanceMetrics = (analysisId, result) => {
        const activeAnalysis = analysisState.activeAnalyses.get(analysisId);
        if (!activeAnalysis) return;
        
        const processingTime = performance.now() - activeAnalysis.startTime;
        
        // Update metrics using destructuring
        const { performanceMetrics } = analysisState;
        performanceMetrics.totalAnalyses++;
        performanceMetrics.lastAnalysisTimestamp = performance.now();
        
        // Calculate running average
        const { totalAnalyses, averageAnalysisTime } = performanceMetrics;
        performanceMetrics.averageAnalysisTime = 
            (averageAnalysisTime * (totalAnalyses - 1) + processingTime) / totalAnalyses;
    };
    
    // Main debounced analysis function using function expression
    const debouncedAnalyze = createAdaptiveDebounce(function(text, options = {}) {
        return new Promise((resolve, reject) => {
            // Validate input
            if (!text || text.trim().length === 0) {
                reject(new Error(errors.emptyText));
                return;
            }
            
            if (text.length > maxCharacters) {
                reject(new Error(errors.textTooLong));
                return;
            }
            
            const wordCount = Utils.text.countWords(text);
            if (wordCount < minWords) {
                reject(new Error(errors.textTooShort));
                return;
            }
            
            // Generate analysis ID
            const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Calculate priority
            const priority = calculateRequestPriority(text, options);
            
            // Add to queue
            analysisQueue.enqueue({
                analysisId,
                text,
                options: { ...options, analysisId },
                resolve,
                reject
            }, priority);
            
            // Process queue
            processAnalysisQueue();
        });
    }, delays.progressStep, {
        maxDelay: delays.progressStep * 3,
        minDelay: delays.progressStep / 2,
        loadFactor: true,
        exponentialBackoff: true
    });
    
    // Real-time analysis with smart throttling
    const realtimeAnalyze = createSmartThrottle(
        (text, options = {}) => debouncedAnalyze(text, { ...options, realTime: true }),
        500,
        {
            maxExecutionsPerSecond: 3,
            backPressureThreshold: 5,
            adaptToLoad: true
        }
    );
    
    // User-initiated analysis (high priority)
    const userAnalyze = (text, options = {}) => {
        return debouncedAnalyze(text, { ...options, userInitiated: true, highPriority: true });
    };
    
    // Batch analysis for multiple texts
    const batchAnalyze = async (texts, options = {}) => {
        const results = [];
        const errors = [];
        
        // Process in small batches to avoid overwhelming the system
        const batchSize = 2;
        
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async (text, index) => {
                try {
                    const result = await debouncedAnalyze(text, {
                        ...options,
                        batchIndex: i + index,
                        totalBatches: texts.length
                    });
                    results[i + index] = result;
                } catch (error) {
                    errors[i + index] = error;
                }
            });
            
            await Promise.allSettled(batchPromises);
            
            // Small delay between batches
            if (i + batchSize < texts.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        return { results, errors };
    };
    
    // Analysis cancellation
    const cancelAnalysis = (analysisId) => {
        // Remove from pending analyses
        analysisState.pendingAnalyses.delete(analysisId);
        
        // Mark active analysis for cancellation (if possible)
        const activeAnalysis = analysisState.activeAnalyses.get(analysisId);
        if (activeAnalysis) {
            activeAnalysis.cancelled = true;
        }
    };
    
    // System status and diagnostics
    const getSystemStatus = () => {
        return {
            queue: {
                pending: analysisQueue.size(),
                active: analysisState.activeAnalyses.size,
                capacity: analysisState.systemLoad.maxConcurrentAnalyses
            },
            performance: { ...analysisState.performanceMetrics },
            systemLoad: { ...analysisState.systemLoad },
            isHealthy: analysisState.systemLoad.activeRequests < analysisState.systemLoad.maxConcurrentAnalyses
        };
    };
    
    // Initialize monitoring
    monitorSystemLoad();
    
    // Queue cleanup interval
    setInterval(() => {
        analysisQueue.cleanup();
    }, 10000);
    
    // Public API using object literal
    return {
        // Main analysis methods
        analyze: userAnalyze,              // High priority user-initiated analysis
        analyzeRealtime: realtimeAnalyze,  // Throttled real-time analysis
        analyzeBatch: batchAnalyze,        // Batch processing
        
        // Queue management
        getQueueStatus: () => ({
            pending: analysisQueue.size(),
            active: analysisState.activeAnalyses.size
        }),
        
        // System monitoring
        getSystemStatus,
        
        // Analysis management
        cancelAnalysis,
        
        // Utility methods
        createDebounce: createAdaptiveDebounce,
        createThrottle: createSmartThrottle,
        
        // Performance metrics
        getMetrics: () => ({ ...analysisState.performanceMetrics }),
        resetMetrics: () => {
            Object.assign(analysisState.performanceMetrics, {
                totalAnalyses: 0,
                averageAnalysisTime: 0,
                queueProcessingTime: 0,
                throttledRequests: 0,
                lastAnalysisTimestamp: 0
            });
        }
    };
    
})(); // IIFE - Self-invoking function immediately executes

// Make DebouncedAnalyzer available globally
window.DebouncedAnalyzer = DebouncedAnalyzer;

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebouncedAnalyzer;
}