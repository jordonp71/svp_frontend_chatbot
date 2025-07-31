// Chat Widget Script
(function() {
    const config = window.ChatWidgetConfig || {};
    const chatContainer = document.createElement('div');
    chatContainer.className = 'n8n-chat-widget chat-container';

    const launcher = document.createElement('button');
    launcher.className = 'chat-widget-launcher';
    launcher.innerHTML = '💬';
    launcher.style.position = 'fixed';
    launcher.style.bottom = '20px';
    launcher.style.right = '20px';
    launcher.style.zIndex = '1001';

    const widgetHTML = `
      <div class="brand-header">
        <img src="${config.branding?.logo || ''}" alt="Logo">
        <span>${config.branding?.name || 'ChatBot'}</span>
        <button class="close-button">×</button>
      </div>
      <div class="new-conversation">
        <div class="welcome-text">${config.branding?.welcomeText || 'Hi there!'}</div>
        <button class="new-chat-btn">
          <img src="https://www.svgrepo.com/show/276264/message-chat.svg" class="message-icon" alt="💬">
          Send us a message
        </button>
        <p class="response-text">${config.branding?.responseTimeText || ''}</p>
      </div>
      <div class="chat-interface">
        <div class="chat-messages"></div>
        <div class="chat-input">
          <textarea placeholder="Type your message..."></textarea>
          <button class="send-button">➤</button>
        </div>
      </div>
      <div class="chat-widget-footer"><a></a></div>
    `;

    chatContainer.innerHTML = widgetHTML;
    document.body.appendChild(chatContainer);
    document.body.appendChild(launcher);

    const toggleButton = launcher;
    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('.send-button');

    let currentSessionId = Date.now().toString();

    function startNewConversation() {
        chatContainer.querySelector('.brand-header').style.display = 'none';
        chatContainer.querySelector('.new-conversation').style.display = 'none';
        chatInterface.classList.add('active');
    }

    async function sendMessage(message) {
        const messageData = {
            action: "sendMessage",
            sessionId: currentSessionId,
            route: config.webhook.route,
            chatInput: message,
            metadata: {
                userId: ""
            }
        };

        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Show typing animation
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'chat-message bot typing';
        messagesContainer.appendChild(botMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });

            const data = await response.json();

            // Remove typing animation and add bot reply
            const lastTyping = messagesContainer.querySelector('.chat-message.bot.typing');
            if (lastTyping) {
                lastTyping.classList.remove('typing');
                lastTyping.textContent = Array.isArray(data) ? data[0].output : data.output;
            }
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    newChatBtn.addEventListener('click', startNewConversation);

    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
            sendMessage(message);
            textarea.value = '';
        }
    });

    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
                textarea.value = '';
            }
        }
    });

    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
    });

    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatContainer.classList.remove('open');
        });
    });
})();
