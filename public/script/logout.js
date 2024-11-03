let logoutTimeout;
const inactivityLimit = 15 * 60 * 1000; 

function logoutUser() {
    console.log('User logged out due to inactivity.');
    navigator.sendBeacon('/logout');
    window.location.href = '/login'
}

function resetLogoutTimer() {
    clearTimeout(logoutTimeout);
    logoutTimeout = setTimeout(logoutUser, inactivityLimit);
}

resetLogoutTimer();

['mousemove', 'keydown', 'scroll', 'click'].forEach(event => {
    window.addEventListener(event, resetLogoutTimer);
});
