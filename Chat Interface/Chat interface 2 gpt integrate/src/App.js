import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios'; // Keep axios in case you want to re-enable it later

// Define the base URL for the API
const API_URL = 'http://localhost:5001/api/chats';

function App() {
  const [chats, setChats] = useState([]); // Array of chat sessions
  const [currentChatIndex, setCurrentChatIndex] = useState(0); // Track current chat
  const [userInput, setUserInput] = useState(''); // Track the user input message

  // Load chats from the server when the component mounts
  useEffect(() => {
    // Commented out to focus on local state functionality
    /*
    const fetchChats = async () => {
      try {
        const response = await axios.get(API_URL);
        setChats(response.data); // Set chats from the response data
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
    */
    // For debugging, initialize some dummy chat data
    setChats([{ name: 'Chat 1', messages: [] }]);
  }, []);

  // Handle sending message and AI response
  const sendMessage = async () => {
    if (userInput.trim() === '') return; // Avoid sending empty messages

    const newMessage = { sender: 'user', text: userInput }; // User message object
    const updatedChats = [...chats]; // Clone the chats array
    updatedChats[currentChatIndex].messages.push(newMessage); // Add the user's message

    // Simulate AI response (without backend)
    const aiResponse = "This is a sample AI response.";
    setTimeout(() => {
      updatedChats[currentChatIndex].messages.push({ sender: 'ai', text: aiResponse });
      setChats(updatedChats); // Update the chats state with the new AI message
    }, 1000);

    setChats(updatedChats); // Update the state with the new user message
    setUserInput(''); // Clear the input field
  };

  // Handle new chat (create a new chat session)
  const newChat = async () => {
    const newChatData = { name: `Chat ${chats.length + 1}`, messages: [] }; // Create a new chat
    setChats([...chats, newChatData]); // Add the new chat locally
    setCurrentChatIndex(chats.length); // Switch to the new chat
  };

  // Switch to a specific chat
  const switchChat = (index) => {
    setCurrentChatIndex(index); // Update the current chat index to switch chats
  };

  // Delete a chat session and renumber the remaining chats
  const deleteChat = async (index) => {
    // Remove the selected chat from the array
    const updatedChats = chats.filter((_, chatIndex) => chatIndex !== index);

    // Renumber the remaining chats
    const renumberedChats = updatedChats.map((chat, i) => {
      return { ...chat, name: `Chat ${i + 1}` }; // Rename chats based on their new position
    });

    setChats(renumberedChats);

    // Adjust the current chat index if necessary
    if (currentChatIndex >= renumberedChats.length) {
      setCurrentChatIndex(renumberedChats.length - 1);
    } else if (currentChatIndex > index) {
      setCurrentChatIndex(currentChatIndex - 1);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <button className="new-chat-button" onClick={newChat}>+ New Chat</button>
        <div className="chat-list">
          {chats.map((chat, index) => (
            <div key={index} className="chat-item">
              <button
                className="chat-button"
                onClick={() => switchChat(index)}
              >
                {chat.name}
              </button>
              <button
                className="delete-button"
                onClick={() => deleteChat(index)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-container">
        <div className="chat-header">Disease Prediction Chat</div>
        <div id="chat-box" className="chat-box">
          {chats[currentChatIndex]?.messages.map((msg, index) => (
            <p key={index} className={msg.sender === 'user' ? 'user-message' : 'ai-message'}>
              {msg.text}
            </p>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            id="user-input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your symptoms..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
