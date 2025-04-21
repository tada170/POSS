/**
 * Logging utility functions
 */

/**
 * Log levels
 */
const LogLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
};

// Current log level (can be changed at runtime)
let currentLogLevel = LogLevel.INFO;

/**
 * Set the current log level
 * @param {string} level - Log level to set
 */
function setLogLevel(level) {
    if (Object.values(LogLevel).includes(level)) {
        currentLogLevel = level;
    } else {
        console.error(`Invalid log level: ${level}`);
    }
}

/**
 * Check if a log level should be logged
 * @param {string} level - Log level to check
 * @returns {boolean} - True if the level should be logged
 */
function shouldLog(level) {
    const levels = Object.values(LogLevel);
    const currentIndex = levels.indexOf(currentLogLevel);
    const levelIndex = levels.indexOf(level);
    
    return levelIndex >= currentIndex;
}

/**
 * Format a log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 * @returns {string} - Formatted log message
 */
function formatLogMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
        try {
            const dataString = JSON.stringify(data);
            logMessage += ` - ${dataString}`;
        } catch (err) {
            logMessage += ` - [Error serializing data: ${err.message}]`;
        }
    }
    
    return logMessage;
}

/**
 * Log a debug message
 * @param {string} message - Message to log
 * @param {Object} data - Additional data to log
 */
function debug(message, data = null) {
    if (shouldLog(LogLevel.DEBUG)) {
        console.log(formatLogMessage(LogLevel.DEBUG, message, data));
    }
}

/**
 * Log an info message
 * @param {string} message - Message to log
 * @param {Object} data - Additional data to log
 */
function info(message, data = null) {
    if (shouldLog(LogLevel.INFO)) {
        console.log(formatLogMessage(LogLevel.INFO, message, data));
    }
}

/**
 * Log a warning message
 * @param {string} message - Message to log
 * @param {Object} data - Additional data to log
 */
function warn(message, data = null) {
    if (shouldLog(LogLevel.WARN)) {
        console.warn(formatLogMessage(LogLevel.WARN, message, data));
    }
}

/**
 * Log an error message
 * @param {string} message - Message to log
 * @param {Error} error - Error object
 * @param {Object} data - Additional data to log
 */
function error(message, error = null, data = null) {
    if (shouldLog(LogLevel.ERROR)) {
        let errorData = data || {};
        
        if (error) {
            errorData = {
                ...errorData,
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                }
            };
        }
        
        console.error(formatLogMessage(LogLevel.ERROR, message, errorData));
    }
}

/**
 * Log a database operation
 * @param {string} operation - Database operation
 * @param {string} entity - Entity being operated on
 * @param {Object} params - Operation parameters
 */
function logDbOperation(operation, entity, params = null) {
    debug(`DB ${operation} - ${entity}`, params);
}

/**
 * Log an API request
 * @param {Object} req - Express request object
 */
function logApiRequest(req) {
    const { method, originalUrl, ip, body, query, params } = req;
    
    info(`API Request: ${method} ${originalUrl}`, {
        ip,
        body: method !== 'GET' ? body : undefined,
        query: Object.keys(query).length > 0 ? query : undefined,
        params: Object.keys(params).length > 0 ? params : undefined
    });
}

/**
 * Log an API response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in milliseconds
 */
function logApiResponse(req, res, responseTime) {
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    info(`API Response: ${method} ${originalUrl} - ${statusCode} (${responseTime}ms)`);
}

/**
 * Create middleware for logging API requests and responses
 * @returns {Function} - Express middleware function
 */
function createApiLogger() {
    return (req, res, next) => {
        const startTime = Date.now();
        
        logApiRequest(req);
        
        // Log response when finished
        res.on('finish', () => {
            const responseTime = Date.now() - startTime;
            logApiResponse(req, res, responseTime);
        });
        
        next();
    };
}

module.exports = {
    LogLevel,
    setLogLevel,
    debug,
    info,
    warn,
    error,
    logDbOperation,
    createApiLogger
};