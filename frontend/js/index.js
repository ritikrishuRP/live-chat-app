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
        const response = await axios.post('http://localhost:8000/user/login', {
            username,
            password
        });
        alert(response.data.message);
        if (response.data.success) {
            console.log('Token received:', response.data.token);
            localStorage.setItem('token', response.data.token);
            console.log('Token saved to localStorage:', localStorage.getItem('token'));

            window.location.href = '/chat.html';
        } else {
            console.error('Token not received in the response');
        } 
    } catch (error) {
        console.error('Login error:', error.response ? error.response.data : error);
        alert(error.response && error.response.data ? error.response.data.message : 'Login failed, please try again.');
    }
});

document.querySelector('.form-box.register form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const phone = e.target.querySelector('input[type="tel"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await axios.post('http://localhost:8000/user/signup', {
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
