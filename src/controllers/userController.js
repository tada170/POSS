/**
 * User controller - handles business logic for user operations
 */
const User = require("../models/User");
const { validateRequired, validateNumeric, isValidEmail, validatePassword } = require("../utils/validationUtils");
const { error, info } = require("../utils/logUtils");
const { validateAndExecute } = require("../utils/controllerUtils");

/**
 * Create a new user
 */
async function createUser(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const { Jmeno, Prijmeni, Email, Heslo, RoleID } = req.body;

            // Validate required fields
            const fieldsValidation = validateRequired(
                { Jmeno, Prijmeni, Email, Heslo, RoleID },
                ['Jmeno', 'Prijmeni', 'Email', 'Heslo', 'RoleID']
            );

            if (!fieldsValidation.isValid) {
                return fieldsValidation;
            }

            // Validate email format
            if (!isValidEmail(Email)) {
                return {
                    isValid: false,
                    error: "Invalid email format"
                };
            }

            // Validate password strength
            const passwordValidation = validatePassword(Heslo);
            if (!passwordValidation.isValid) {
                return passwordValidation;
            }

            // Validate role ID
            const roleValidation = validateNumeric(RoleID, { isInteger: true, min: 1 });
            if (!roleValidation.isValid) {
                return roleValidation;
            }

            return { isValid: true };
        },
        executionFn: async (req) => {
            const { Jmeno, Prijmeni, Email, Heslo, RoleID } = req.body;

            info("Creating new user", { Jmeno, Prijmeni, Email, RoleID });

            const userId = await User.create({
                Jmeno,
                Prijmeni,
                Email,
                Heslo,
                RoleID
            });

            info("User created successfully", { userId });
            return userId;
        },
        errorMessage: "Error creating user",
        successStatus: 201,
        successResponse: "User added successfully"
    });
}

/**
 * Get all users
 */
async function getAllUsers(req, res) {
    await validateAndExecute(req, res, {
        executionFn: async () => {
            info("Getting all users");
            return await User.getAll();
        },
        errorMessage: "Error retrieving users"
    });
}

/**
 * Get user by ID
 */
async function getUserById(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const userId = req.params.id;
            return validateNumeric(userId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const userId = req.params.id;
            info("Getting user by ID", { userId });
            return await User.getById(userId);
        },
        errorMessage: "Error retrieving user"
    });
}

/**
 * Update a user
 */
async function updateUser(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const userId = req.params.id;
            const { Jmeno, Prijmeni, Email, Heslo, RoleID } = req.body;

            // Validate user ID
            const idValidation = validateNumeric(userId, { isInteger: true, min: 1 });
            if (!idValidation.isValid) {
                return idValidation;
            }

            // Validate required fields
            const fieldsValidation = validateRequired(
                { Jmeno, Prijmeni, Email, RoleID },
                ['Jmeno', 'Prijmeni', 'Email', 'RoleID']
            );

            if (!fieldsValidation.isValid) {
                return fieldsValidation;
            }

            // Validate email format
            if (!isValidEmail(Email)) {
                return {
                    isValid: false,
                    error: "Invalid email format"
                };
            }

            // Validate password strength if provided
            if (Heslo) {
                const passwordValidation = validatePassword(Heslo);
                if (!passwordValidation.isValid) {
                    return passwordValidation;
                }
            }

            // Validate role ID
            const roleValidation = validateNumeric(RoleID, { isInteger: true, min: 1 });
            if (!roleValidation.isValid) {
                return roleValidation;
            }

            return { isValid: true };
        },
        executionFn: async (req) => {
            const userId = req.params.id;
            const { Jmeno, Prijmeni, Email, Heslo, RoleID } = req.body;

            info("Updating user", { userId, Jmeno, Prijmeni, Email, RoleID });

            await User.update(userId, {
                Jmeno,
                Prijmeni,
                Email,
                Heslo,
                RoleID
            });

            info("User updated successfully", { userId });
            return null;
        },
        errorMessage: "Error updating user",
        successStatus: 200,
        successResponse: "User updated successfully"
    });
}

/**
 * Delete a user
 */
async function deleteUser(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const userId = req.params.id;
            return validateNumeric(userId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const userId = req.params.id;
            info("Deleting user", { userId });
            await User.remove(userId);
            info("User deleted successfully", { userId });
            return null; // No content to return
        },
        errorMessage: "Error deleting user",
        successStatus: 204 // No content
    });
}

/**
 * Authenticate a user
 */
async function authenticateUser(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const { Email, Heslo } = req.body;
            console.log("Validating authentication request for email:", Email);

            // Validate required fields
            const fieldsValidation = validateRequired(
                { Email, Heslo },
                ['Email', 'Heslo']
            );

            if (!fieldsValidation.isValid) {
                console.log("Validation failed:", fieldsValidation.error);
                return fieldsValidation;
            }

            console.log("Validation successful");
            return { isValid: true };
        },
        executionFn: async (req) => {
            const { Email, Heslo } = req.body;

            console.log("Executing authentication for email:", Email);
            info("Authenticating user", { Email });

            try {
                const user = await User.authenticate(Email, Heslo);
                console.log("Authentication successful, setting session data");

                // Set session data
                req.session.userId = user.UzivatelID;
                req.session.role = user.Role;
                req.session.roleId = user.RoleID;

                info("User authenticated successfully", { userId: user.UzivatelID });
                return user;
            } catch (authError) {
                console.error("Authentication error in controller:", authError);
                throw authError; // Re-throw to be caught by validateAndExecute
            }
        },
        errorMessage: "Authentication failed",
        successStatus: 200,
        successResponse: "Authentication successful"
    });
}

/**
 * Logout a user
 */
async function logoutUser(req, res) {
    await validateAndExecute(req, res, {
        executionFn: async (req) => {
            info("Logging out user", { userId: req.session.userId });

            // Destroy session
            req.session.destroy((err) => {
                if (err) {
                    throw new Error("Error destroying session");
                }
            });

            return null;
        },
        errorMessage: "Error logging out",
        successStatus: 200,
        successResponse: "Logout successful"
    });
}

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    authenticateUser,
    logoutUser
};
