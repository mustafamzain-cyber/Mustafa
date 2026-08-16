const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const message = document.getElementById('message');

loginForm.addEventListener('submit', async function (event) {

    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    message.textContent = '';
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    try {

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || 'Login failed'
            );
        }

        localStorage.setItem('token', data.token);

        message.textContent = 'Login successful!';

        window.location.href = '/dashboard.html';

    } catch (error) {

        message.textContent =
            error.message || 'Unable to connect to server';

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
});