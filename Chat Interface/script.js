document.getElementById("new-chat-btn").addEventListener("click", startNewChat);
document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-avatar").addEventListener("click", () => {
  window.location.href = "profile.html";
});

let chatCount = 0;
let currentChatId = null;
const chatHistories = {};

function startNewChat() {
  chatCount++;
  currentChatId = `chat-${chatCount}`;

  const chatList = document.getElementById("chat-list");

  const newChatItem = document.createElement("li");
  newChatItem.textContent = `Chat ${chatCount}`;
  newChatItem.dataset.chatId = currentChatId;
  newChatItem.addEventListener("click", () =>
    loadChat(newChatItem.dataset.chatId)
  );

  chatList.appendChild(newChatItem);

  chatHistories[currentChatId] = [];
  clearChatBox();

  // Show greeting area again when starting a new chat
  showGreetingArea();
}

function loadChat(chatId) {
  currentChatId = chatId;
  clearChatBox();

  const chatBox = document.getElementById("chat-box");
  const messages = chatHistories[chatId];

  messages.forEach((msg) => {
    const messageElement = document.createElement("div");
    messageElement.textContent = msg;
    messageElement.classList.add("message");
    chatBox.appendChild(messageElement);
  });

  // Scroll to the bottom to show the latest message
  chatBox.scrollTop = chatBox.scrollHeight;
}

function clearChatBox() {
  document.getElementById("chat-box").innerHTML = "";
}

function sendMessage() {
  const userInput = document.getElementById("user-input");
  const messageText = userInput.value;

  if (messageText.trim() !== "" && currentChatId) {
    const chatBox = document.getElementById("chat-box");
    const message = document.createElement("div");
    message.textContent = messageText;
    message.classList.add("message");
    chatBox.appendChild(message);

    // Save the message to the current chat's history
    chatHistories[currentChatId].push(messageText);

    userInput.value = ""; // Clear the input field

    // Scroll to the bottom of the chat box to show the latest message
    chatBox.scrollTop = chatBox.scrollHeight;

    // Hide greeting area when a message is sent
    hideGreetingArea();
  }
}

function showGreetingArea() {
  document.getElementById("greeting-area").style.display = "block";
}

function hideGreetingArea() {
  document.getElementById("greeting-area").style.display = "none";
}
