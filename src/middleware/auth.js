/**
 * Authentication middleware functions
 */

/**
 * Middleware to check if user is authenticated
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log('User is authenticated');
    return next();
  } else {
    console.log('User is not authenticated, redirecting to login');
    return res.redirect('/login');
  }
};

/**
 * Middleware to check if user has required role
 */
const hasRole = (roles) => {
  return (req, res, next) => {
    if (req.session.role && roles.includes(req.session.role)) {
      return next();
    }
    res.status(403).send("Forbidden: You do not have access to this page");
  };
};

module.exports = {
  isAuthenticated,
  hasRole
};