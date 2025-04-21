/**
 * Controller utility functions
 */
const { error } = require("./logUtils");

/**
 * Wrap a controller function with error handling
 * @param {Function} controllerFn - Controller function to wrap
 * @param {string} errorMessage - Error message to log and send on failure
 * @returns {Function} - Wrapped controller function
 */
function withErrorHandling(controllerFn, errorMessage) {
    return async (req, res) => {
        try {
            await controllerFn(req, res);
        } catch (err) {
            error(errorMessage, err);
            res.status(500).json({ error: errorMessage });
        }
    };
}

/**
 * Handle common validation and execution pattern
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} options - Options for the handler
 * @param {Function} options.validationFn - Validation function
 * @param {Function} options.executionFn - Function to execute if validation passes
 * @param {string} options.errorMessage - Error message to log and send on failure
 * @param {number} options.successStatus - HTTP status code on success (default: 200)
 * @param {any} options.successResponse - Response to send on success
 */
async function validateAndExecute(req, res, options) {
    console.log("validateAndExecute called for", req.method, req.originalUrl);

    const {
        validationFn,
        executionFn,
        errorMessage,
        successStatus = 200,
        successResponse
    } = options;

    // Validate input if validation function is provided
    if (validationFn) {
        console.log("Running validation function");
        try {
            const validationResult = validationFn(req);
            if (!validationResult.isValid) {
                console.log("Validation failed:", validationResult.error);
                return res.status(400).json({ error: validationResult.error });
            }
            console.log("Validation passed");
        } catch (validationError) {
            console.error("Error in validation function:", validationError);
            return res.status(400).json({ error: "Validation error: " + validationError.message });
        }
    }

    try {
        console.log("Running execution function");
        // Execute the main function
        const result = await executionFn(req);
        console.log("Execution successful");

        // Send response
        if (successResponse) {
            console.log("Sending success response:", successResponse);
            // If successResponse is a string, wrap it in an object to ensure JSON response
            if (typeof successResponse === 'string') {
                res.status(successStatus).json({ message: successResponse });
            } else {
                res.status(successStatus).json(successResponse);
            }
        } else if (result) {
            console.log("Sending result as JSON");
            res.status(successStatus).json(result);
        } else {
            console.log("Sending status only:", successStatus);
            res.sendStatus(successStatus);
        }
    } catch (err) {
        console.error("Error in execution function:", err);

        // Handle specific error types
        if (err.message === "Not found") {
            console.log("Resource not found error");
            return res.status(404).json({ error: "Resource not found" });
        }

        // Log and send general error
        console.error("Sending 500 error response:", errorMessage);
        error(errorMessage, err);
        res.status(500).json({ error: errorMessage + (err.message ? ": " + err.message : "") });
    }
}

module.exports = {
    withErrorHandling,
    validateAndExecute
};
