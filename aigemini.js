// IMPORTANT: Replace these with your actual API keys
        const API_KEYS = [
            'AIzaSyCHzVct9IpP5zSJYOqn7k5BeJxDAy_nV9o',
            'AIzaSyDIHiB4VM2l6hk8VJbzrHeTc7CExLnlOrE',
            'AIzaSyDcdRpuI6SlwPS1Fyp7kdJpMgLm7Jzpp5I'
        ];
 
        let currentKeyIndex = 0;
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        const chatMessages = document.getElementById('chat-messages');
 
        // Chat history
        const chatHistory = [];
 
        // Function to switch to the next API key
        function switchToNextKey() {
            currentKeyIndex++;
            if (currentKeyIndex >= API_KEYS.length) {
                // All keys exhausted, reset to 0 or handle error
                currentKeyIndex = 0; 
                return false; // Indicates all keys have been tried
            }
            console.log(`Switched to API key at index: ${currentKeyIndex}`);
            return true;
        }
 
        // Function to send a message to the Gemini API and get a response
        async function sendMessageToGemini(message) {
            const currentKey = API_KEYS[currentKeyIndex];
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${currentKey}`;
            
            chatHistory.push({ role: "user", parts: [{ text: message }] });
            
            try {
                const payload = { contents: chatHistory };
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
 
                // Check if the response indicates a rate limit error (status 429)
                if (response.status === 429) {
                    console.error('Rate limit exceeded. Switching to next key...');
                    const switched = switchToNextKey();
                    if (switched) {
                        // Retry the request with the new key
                        return await sendMessageToGemini(message);
                    } else {
                        // No more keys left
                        return "Xin lỗi, đã hết giới hạn sử dụng. Vui lòng thử lại sau.";
                    }
                }
 
                if (!response.ok) {
                    throw new Error(`API response error: ${response.statusText}`);
                }
 
                const result = await response.json();
                
                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const aiResponseText = result.candidates[0].content.parts[0].text;
                    chatHistory.push({ role: "model", parts: [{ text: aiResponseText }] });
                    return aiResponseText;
                } else {
                    return "Xin lỗi, tôi không thể tạo phản hồi lúc này.";
                }
            } catch (error) {
                console.error('Lỗi khi gọi Gemini API:', error);
                return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
            }
        }
 
        // Function to display messages in the chat interface
        function displayMessage(message, sender) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message-bubble', 'mb-2');
            
            if (sender === 'user') {
                messageElement.classList.add('user-message', 'bg-emerald-100', 'text-gray-800', 'self-end');
            } else {
                messageElement.classList.add('ai-message', 'bg-gray-200', 'text-gray-800', 'self-start');
            }
 
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
            
            // Auto-scroll to the bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
 
        // Function to handle sending a message
        async function handleSendMessage() {
            const userMessage = userInput.value.trim();
            if (userMessage === '') return;
 
            displayMessage(userMessage, 'user');
            userInput.value = '';
            
            const aiResponse = await sendMessageToGemini(userMessage);
            displayMessage(aiResponse, 'ai');
        }
 
        // Event listeners for send button and Enter key
        sendButton.addEventListener('click', handleSendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });