document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Attempting login with username:', username);
    document.getElementById('error-message').innerText = '';

    try {
        console.log('Sending login request to /api/users/login');
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Email: username, Heslo: password })
        });

        console.log('Login response status:', response.status);

        if (response.ok) {
            console.log('Login successful, redirecting to home page');
            window.location.href = '/'; 
        } else {
            const errorMessage = await response.text();
            console.error('Login failed with status:', response.status);
            console.error('Error message:', errorMessage);
            document.getElementById('error-message').innerText = errorMessage || 'Authentication failed';
        }
    } catch (error) {
        console.error('Login request error:', error);
        document.getElementById('error-message').innerText = 'Network error: ' + error.message;
    }
});
