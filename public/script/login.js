document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    document.getElementById('error-message').innerText = '';

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        window.location.href = '/'; 
    } else {
        const errorMessage = await response.text();
        console.error('Login failed:', errorMessage);
        document.getElementById('error-message').innerText = errorMessage;
    }
});
