import React, { useEffect, useState } from 'react';
import { fetchChats, addChat, deleteChat } from './chatServices'; // Adjust the path if needed

const ChatComponent = () => {
  const [chats, setChats] = useState([]);
  const [newChat, setNewChat] = useState('');

  // Fetch chats when the component mounts
  useEffect(() => {
    const loadChats = async () => {
      try {
        const chatsData = await fetchChats();
        setChats(chatsData);
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    };
    loadChats();
  }, []);

  const handleAddChat = async () => {
    try {
      const createdChat = await addChat({ content: newChat });
      setChats([...chats, createdChat]);
      setNewChat(''); // Clear input after adding
    } catch (error) {
      console.error('Error adding chat:', error);
    }
  };

  const handleDeleteChat = async (id) => {
    try {
      await deleteChat(id);
      setChats(chats.filter(chat => chat.id !== id)); // Update state
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return (
    <div>
      <h1>Chat List</h1>
      <ul>
        {chats.map(chat => (
          <li key={chat.id}>
            {chat.content} 
            <button onClick={() => handleDeleteChat(chat.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <input 
        value={newChat} 
        onChange={(e) => setNewChat(e.target.value)} 
        placeholder="Add a new chat" 
      />
      <button onClick={handleAddChat}>Add Chat</button>
    </div>
  );
};

export default ChatComponent;
