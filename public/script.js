let logoutTimeout;
const inactivityLimit = 15 * 60 * 1000; // 15 minutes in milliseconds

function logoutUser() {
    console.log('User logged out due to inactivity.');
    navigator.sendBeacon('/logout');
}

// Reset the logout timer on user activity
function resetLogoutTimer() {
    clearTimeout(logoutTimeout);
    logoutTimeout = setTimeout(logoutUser, inactivityLimit);
}

// Initialize the logout timer on page load
resetLogoutTimer();

// Listen for user activity events
['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(event => {
    window.addEventListener(event, resetLogoutTimer);
});
