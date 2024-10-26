const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
})

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
})

// Login and Register form handling remain the same
document.querySelector('.form-box.login form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.querySelector('input[type="text"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await axios.post('http://localhost:8000/api/login', {
            username,
            password
        });
        alert(response.data.message);
        if (response.data.success) {
            window.location.href = '/dashboard';
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed, please try again.');
    }
});

document.querySelector('.form-box.register form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const phone = e.target.querySelector('input[type="tel"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await axios.post('http://localhost:8000/api/signup', {
            username,
            email,
            phone,
            password
        });
        alert(response.data.message);
        if (response.data.success) {
            container.classList.remove('active');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Registration failed, please try again.');
    }
});
