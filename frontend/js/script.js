const token = localStorage.getItem('token');
const authHeader = `Bearer ${token}`;

const messages = document.querySelector('.messages');
let rendered = false;
const groups = document.querySelector('.show-groups');
window.addEventListener('load', renderElemets);
var curr_group = null;
const users = document.querySelector('.show-users');
const displayUsers = document.querySelector('.display-users');
var otherUsers = null;

const socket = io('http://localhost:8000');

async function renderElemets() {

    console.log('Rendering elements...');

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      const group = await axios.get(`http://localhost:8000/group/join-group/${id}`, { headers: { Authorization: authHeader } });
      showGroups(group.data.group);
    }

    const res = await axios.get('http://localhost:8000/group/get-groups', { headers: { Authorization: authHeader } });

    res.data.forEach(group => {
      if (group.id !== id) showGroups(group);
    });
  
}

function scrollToBottom() {
  const element = document.querySelector('.messages');
  element.scrollTop = element.scrollHeight;
}

function showGroups(group) {
  const div = document.createElement('div');
  div.textContent = group.name;
  div.className = 'group-items';
  div.id = group.id;

  const span = document.createElement('span');
  span.textContent = '+';
  div.appendChild(span);
  span.onclick = (e) => {
    e.stopPropagation();
    const link = `http://localhost:8000/?id=${group.id}`;
    navigator.clipboard.writeText(link);
  };

  div.onclick = async () => {
    curr_group = group;
    if (curr_group.member.admin) {
      document.getElementById('add-user-toggle-btn').classList.remove('hide');
    } else {
      document.getElementById('add-user-toggle-btn').classList.add('hide');
    }

    document.querySelector('.header').classList.remove('hide');
    document.querySelector('.messages').classList.remove('hide');
    document.querySelector('.send-messages').classList.remove('hide');
    document.querySelector('.show-users').classList.add('hide');
    await showGroupMessages();
  };

  groups.appendChild(div);
}





function showMessage(data, users) {
  console.log('message showed up');
  if (data.groupId !== curr_group.id) return;

  const id = curr_group.member.id;
  const div = document.createElement('div');

  if (id === data.memberId) {
    div.className = 'u-message';
    div.textContent = "You: " + data.message;
  } else {
    const user = users.find(user => data.memberId === user.member.id);
    if (user) {
      div.className = 'o-message';
      div.textContent = user.username + ": " + data.message;
    } else {
      return;
    }
  }

  messages.appendChild(div);
}

document.querySelector('#messsage').addEventListener('submit', sendMessage);

async function sendMessage(e) {
  try {
    e.preventDefault();
    const groupId = curr_group.id;
    const message = e.target.message.value;
    const data = {
      message,
      groupId,
      memberId: curr_group.member.id
    };
    console.log('message sent')

    // Emit the message event to the server
    socket.emit('sendMessage', data);

   // Wait for the server response to confirm the message was received/stored
  const res = await axios.post('http://localhost:8000/message/add-message', data,{ headers: { Authorization: authHeader } })
  console.log(res)

  // Update the UI after a successful server response
  const div = document.createElement('div')
  div.className = 'u-message'
  div.textContent = "You: " + data.message
  messages.appendChild(div)
  showMessage(data, [{ member: { id: curr_group.member.id, username: 'You' }}]);
  e.target.message.value = ''
  scrollToBottom()


  console.log(curr_group.id);   
      
  } catch (e) {
    console.log('Error sending message:', e);
  }
}  

document.getElementById('create-new-group').addEventListener('submit', createNewGroup);

async function createNewGroup(e) {
  try {
    e.preventDefault();
    const selectedUsers = [];
    otherUsers.forEach(user => {
      if (document.getElementById(user.id).checked) {
        selectedUsers.push(user.id);
      }
    });
    const group = await axios.post('http://localhost:8000/group/create', { "name": e.target.name.value, selectedUsers }, { headers: { Authorization: authHeader } });

    e.target.name.value = '';
    showGroups(group.data.group);

    document.querySelector('.new-group').classList.add('hide');

    document.querySelector('#create-grp').textContent = 'Create Group';
    const addUsers = document.querySelector('.show-add-users');
    document.querySelector('.show-groups').classList.remove('hide');
    addUsers.classList.add('hide');
  } catch (e) {
    console.log('Error creating group:', e);
  }
}

document.getElementById('create-grp').addEventListener('click', async () => {
  if (document.querySelector('.new-group').classList.contains('hide')) {
    document.querySelector('.new-group').classList.remove('hide');
    const res = await axios.get('http://localhost:8000/group/other-users', { headers: { Authorization: authHeader } });
    const addUsers = document.querySelector('.show-add-users');
    document.querySelector('.show-groups').classList.add('hide');
    addUsers.classList.remove('hide');
    addUsers.innerHTML = ``;
    otherUsers = res.data;
    res.data.forEach(user => {
      const div = document.createElement('div');

      const label = document.createElement('label');
      label.for = user.id;
      label.textContent = user.username;
      console.log(user.username);
      console.log(user.id);
      const input = document.createElement('input');
      input.id = user.id;
      input.name = user.id;
      input.type = 'checkbox';

      div.appendChild(input);
      div.appendChild(label);

      addUsers.appendChild(div);
    });
    document.querySelector('#create-grp').textContent = 'Back';
  } else {
    document.querySelector('#create-grp').textContent = 'Create Group';
    document.querySelector('.new-group').classList.add('hide');
    const addUsers = document.querySelector('.show-add-users');
    document.querySelector('.show-groups').classList.remove('hide');
    addUsers.classList.add('hide');
  }
});


async function showGroupMessages() {
  try {
    const group = curr_group;
    socket.emit('joinGroup', group.id);

     // Prevent multiple event listeners
     socket.off('receiveMessage');

     console.log('Showing group messages...');

    let final_messages = JSON.parse(localStorage.getItem(`message-${group.id}`)) || [];
    let final_users = JSON.parse(localStorage.getItem(`user-${group.id}`)) || [];
    let mId = 0;
    let uId = 0;

    // Set the last message and user IDs if available
    if (final_messages.length > 0) mId = final_messages[final_messages.length - 1].id;
    if (final_users.length > 0) uId = final_users[final_users.length - 1].id;

    const res = await axios.get(`http://localhost:8000/message/get-messages/${group.id}/?messageId=${mId}`, { headers: { Authorization: authHeader } });
    const res2 = await axios.get(`http://localhost:8000/group/all-users/${group.id}/?id=${uId}`, { headers: { Authorization: authHeader } });

    messages.innerHTML = ``;
    final_messages = [...final_messages, ...res.data.messages];
    document.querySelector('.group-message h2').textContent = group.name;
    final_users = [...final_users, ...res2.data];

    final_messages.forEach(message => {
      if (message.groupId === group.id) {
        showMessage(message, final_users);
      }
    });
    users.innerHTML = ``


    final_users.forEach(user => {
        showUser(user)
    });
    localStorage.setItem(`message-${curr_group.id}`, JSON.stringify(final_messages));
    localStorage.setItem(`user-${curr_group.id}`, JSON.stringify(final_users));

    const res3 = await axios.post(`http://localhost:8000/group/get-group-users/${group.id}`, null, { headers: { Authorization: authHeader } });
    
    console.log(res3)
        displayUsers.innerHTML = ``
        res3.data.forEach(user => {
            addUser(user)
        })
      // Listen for new messages
      socket.on('receiveMessage', (data) => {
        if (data.groupId === group.id) {
          showMessage(data, final_users);
          scrollToBottom();
        }
      });
    scrollToBottom();
  } catch (e) {
    console.log('Error showing group messages:', e);
  }
}


function showFiles(data, users) {
    const id = curr_group.member.id
    const div = document.createElement('div')
    if (id == data.memberId) {
        div.className = 'u-message u-multi'
        div.textContent = "You"
    } else {
        const user = users.find(user => data.memberId == user.member.id)
        if (user) {
            div.className = 'o-message o-multi'
            div.textContent = user.username

        } else {
            return;
        }
    }
    if (data.type.startsWith('image')) {
        const img = document.createElement('img')
        img.src = data.message
        div.appendChild(img)
    } else if (data.type.startsWith('video')) {
        const video = document.createElement('video')
        const source = document.createElement('source')
        source.src = data.message
        video.appendChild(source)
        video.controls = true
        div.appendChild(video)
    }

    messages.appendChild(div)
}


function showUser(user) {
    const member = curr_group.member;
    console.log(member)
    console.log(user)
    const div = document.createElement('div');
    div.textContent = user.username;
    console.log('Show User..')
    console.log(user.username);

    div.className = 'curr_user';

    if (user.member.admin) {
        const span = document.createElement('span');
        div.className = 'curr_user admin';
        span.textContent = 'admin';
        div.appendChild(span);
    }

    if (user.member.id !== member.id && member.admin) {
        const btns = document.createElement('div');
        const makeAdmin = document.createElement('button');
        makeAdmin.textContent = 'Make Admin';

        const removeAdmin = document.createElement('button');
        removeAdmin.textContent = 'Remove Admin';

        if (user.member.admin)
           makeAdmin.classList.add('hide')
        else 
           removeAdmin.classList.add('hide');

        // Ensure final_users is fetched here
        let final_users = JSON.parse(localStorage.getItem(`user-${curr_group.id}`)) || [];

        makeAdmin.onclick = async () => {
            try {
                const res = await axios.post(`http://localhost:8000/admin/make-admin/${curr_group.id}`, { "userId": user.id }, { headers: { Authorization: authHeader } });
                final_users = final_users.map(elem => {
                  console.log(elem)
                    if (elem.member.userId === user.id) {
                        elem.member.admin = true;
                    }
                    return elem;
                });
                localStorage.setItem(`user-${curr_group.id}`, JSON.stringify(final_users));
                console.log(res);
            } catch (e) {
                console.log(e);
            }
        };

        removeAdmin.onclick = async () => {
            try {
                const res = await axios.post(`http://localhost:8000/admin/remove-admin/${curr_group.id}`, { "userId": user.id }, { headers: { Authorization: authHeader } });
                console.log(res);
                final_users = final_users.map(elem => {
                    if (elem.member.userId === user.id) {
                        elem.member.admin = false;
                    }
                    return elem;
                });
                localStorage.setItem(`user-${curr_group.id}`, JSON.stringify(final_users));
            } catch (e) {
                console.log(e);
            }
        };

        const removeUser = document.createElement('button');
        removeUser.textContent = 'Remove User';

      removeUser.onclick = async () => {
    if (confirm("Are you sure you want to remove this user?")) {
        try {
            const res = await axios.post(
                `http://localhost:8000/admin/remove-member/${curr_group.id}`,
                { "userId": user.id },
                { headers: { Authorization: authHeader } }
            );

            // Update localStorage immediately
            let final_users = JSON.parse(localStorage.getItem(`user-${curr_group.id}`)) || [];
            final_users = final_users.filter(elem => elem.id !== user.id);
            localStorage.setItem(`user-${curr_group.id}`, JSON.stringify(final_users));

            // Update the UI
            users.removeChild(div);
            console.log("User removed successfully.");
        } catch (e) {
            console.error("Error removing user:", e);
        }
    }
};

        

        btns.appendChild(makeAdmin);
        btns.appendChild(removeAdmin);
        btns.appendChild(removeUser);
        div.classList.add('user');
        div.classList.add('curr_user');
        div.appendChild(btns);
    }

    users.appendChild(div);
}


document.querySelector('.header').addEventListener('click', () => {
  console.log('Group header clicked');
    const message = document.querySelector('.messages')
    const sendMessages = document.querySelector('.send-messages')
    const users = document.querySelector('.show-users')
    const divUsers = document.querySelector('.users')
    const addUser = document.querySelector('.add-users')
    
    addUser.classList.add('hide')
    if (users.classList.contains('hide')) {
        message.classList.add('hide')
        sendMessages.classList.add('hide')
        users.classList.remove('hide')
        divUsers.classList.remove('hide')
    } else {
        divUsers.classList.add('hide')
        users.classList.add('hide')
        message.classList.remove('hide')
        sendMessages.classList.remove('hide')
    }

})

document.getElementById('add-user-toggle-btn').addEventListener('click', () => {
    const users = document.querySelector('.show-users')
    const addUsers = document.querySelector('.add-users')
    const displayUsers = document.querySelector('.display-users')

    if (users.classList.contains('hide')) {
        users.classList.remove('hide')
        addUsers.classList.add('hide')
        document.getElementById('add-user-toggle-btn').textContent = 'Add Users'
    } else {
        users.classList.add('hide')
        addUsers.classList.remove('hide')
        document.getElementById('add-user-toggle-btn').textContent = 'Show Users'
    }
})


function addUser(user) {
  console.log(user);

  const div = document.createElement('div');
  div.className = 'add-user group-items';
  div.textContent = `Name : ${user.username} Email : ${user.email}`;

  const btn = document.createElement('button');
  btn.textContent = 'Add User';

  btn.onclick = async () => {
      try {
          console.log(curr_group);

          // Make the API request to add the user to the group
          const res = await axios.post(
              `http://localhost:8000/admin/add-user/${curr_group.id}`,
              { id: user.id },
              { headers: { Authorization: authHeader } }
          );

          console.log('Response:', res);

          // Check if the API response contains the expected data
          if (!res.data || !res.data.user) {
              console.error('Unexpected response format:', res.data);
              return;
          }

          // Remove the user from the "add-user" list
          displayUsers.removeChild(div);

          // Get the user details from the response
          const show_user = res.data.user;

          // Add any additional properties to the user object if needed
          show_user.member = res.data.member || {}; // Provide default if `member` is missing

          // Display the user in the UI
          showUser(show_user);
      } catch (e) {
          console.error('Error adding user:', e);
      }
  };

  div.appendChild(btn);

  // Add the user element to the display
  displayUsers.appendChild(div);
}


document.getElementById('search').addEventListener('keyup', (e) => {
    const text = e.target.value
    Array.from(displayUsers.children).forEach(user => {
        if (user.textContent.indexOf(text) == -1)
            user.classList.add('hide')
        else
            user.classList.remove('hide')
    })
})

document.getElementById('toggleInput').addEventListener('click', (e) => {
    // console.log(e.target.checked)
    if (e.target.checked) {
        document.getElementById('messsage').classList.add('hide')
        document.getElementById('files').classList.remove('hide')
    } else {
        document.getElementById('files').classList.add('hide')
        document.getElementById('messsage').classList.remove('hide')

    }
})

document.getElementById('files').addEventListener('submit', async (e) => {
    try {
        const group = curr_group
        e.preventDefault()
        const formData = new FormData(document.getElementById('files'))

        const res = await axios.post(`http://localhost:8000/message/upload-file/${group.id}`, formData,  { headers: { Authorization: authHeader } })
        const div = document.createElement('div')
        div.className = 'u-message u-multi'
        div.textContent = "You"
        const data = res.data
        if (data.type.startsWith('image')) {
            const img = document.createElement('img')
            img.src = data.message
            div.appendChild(img)
        } else if (data.type.startsWith('video')) {
            const video = document.createElement('video')
            const source = document.createElement('source')
            source.src = data.message
            video.appendChild(source)
            video.controls = true
            div.appendChild(video)
        }

        messages.appendChild(div)
        document.getElementById('file').value =''
    } catch (e) {
        console.log(e)
    }


})

