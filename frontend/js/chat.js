// public/js/chat.js
document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:8000/api';
    const userList = document.getElementById('userList');
    const messageBox = document.getElementById('messageBox');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const logoutBtn = document.getElementById("logoutBtn");

    const token = localStorage.getItem('token');
    const authHeader = `Bearer ${token}`;

    // Check if token exists
    if (!token) {
        console.error('No token found. Please log in first.');
        return; // Exit if no token is available
    }

    // Fetch online users
    async function loadOnlineUsers() {
        try {
            const response = await axios.get(`${apiUrl}/online-users`, { headers: { Authorization: authHeader } });
            const users = response.data;
            userList.innerHTML = users.map(user => `<li><span class="online-dot"></span>${user.user.username}</li>`).join('');
        } catch (error) {
            console.error('Error loading online users:', error);
        }
    }

    // Fetch chat messages
    async function loadMessages() {
        let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        displayMessages(messages);

        try {
            // Get timestamp of last message in local storage
            const lastMessageTimestamp = messages.length ? messages[messages.length - 1].createdAt : null;
            
            // Fetch only new messages from the server
            const response = await axios.get(`${apiUrl}/messages?since=${lastMessageTimestamp}`, {
                headers: { Authorization: authHeader }
            });

            const newMessages = response.data;

            if (newMessages.length) {
                // Append new messages to the current list and limit to 10 messages
                messages = [...messages, ...newMessages].slice(-10);
                
                // Save updated messages to local storage
                localStorage.setItem('chatMessages', JSON.stringify(messages));

                // Display all messages again
                displayMessages(messages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    // Display messages in the message box
    function displayMessages(messages) {
        messageBox.innerHTML = messages
            .map(msg => {
                const username = msg.user ? msg.user.username : "Unknown User";
                return `<p><strong>${username}:</strong> ${msg.content}</p>`;
            })
            .join('');
    }


    // Send a message
    sendMessageBtn.addEventListener('click', async () => {
        const message = messageInput.value;
        if (message.trim()) {
            try {
                await axios.post(`${apiUrl}/send-message`, { content: message },{ headers: { Authorization: authHeader } });
                messageInput.value = '';
                loadMessages();
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    });

    // Logout function
logoutBtn.addEventListener("click", async () => {
    try {
        // Make a request to the logout endpoint
        const response = await axios.post(`${apiUrl}/logout`, {}, { headers: { Authorization: authHeader } });

        if (response.status === 200) {
            // Clear any stored token and redirect to the login page
            localStorage.removeItem("userToken");
            window.location.href = "/";
        } else {
            console.error('Logout failed:', response.data.error || 'Unknown error');
            alert('Failed to log out. Please try again.');
        }
    } catch (error) {
        console.error('Error logging out:', error);
        alert('An error occurred. Please try again.');
    }
});

    // Initial load
    loadOnlineUsers();
    loadMessages();

    // Auto-refresh chat every 5 seconds
    setInterval(() => {
        loadOnlineUsers();
        loadMessages();
    }, 5000);
});




