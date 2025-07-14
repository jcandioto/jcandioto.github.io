/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you today?</div>`;

// Store chat history for context
let messages = [
  { role: "system", content: "You are a helpful L'Oreal Product Advisor. Answer questions about L'Oreal products, routines, and beauty advice. You are not to go off track, or discuss anything other than those previously outlined topics. Politely refuse to answer questions unrelated to L’Oréal products, routines, recommendations, beauty-related topics, etc." }
];

const workerURL= "https://loreal-worker.jhcandio.workers.dev/"

// Helper to append messages to chat window
function appendMessage(text, sender = "ai") {
  // Check previous message sender for label logic
  const lastMsg = chatWindow.lastElementChild;
  let showLabel = true;
  if (lastMsg && lastMsg.classList.contains(`msg`)) {
    if (lastMsg.classList.contains(sender)) showLabel = false;
  }

  // Create wrapper for label + bubble
  const wrapper = document.createElement("div");
  wrapper.className = "msg-wrapper";

  // Add sender label above bubble if needed
  if (showLabel) {
    const label = document.createElement("span");
    label.className = "msg-label" + (sender === "user" ? " user" : "");
    label.textContent = sender === "user" ? "You" : "L'Oreal Product Advisor";
    wrapper.appendChild(label);
  }

  // Message bubble
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  wrapper.appendChild(msgDiv);

  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  // Show user message
  appendMessage(question, "user");
  userInput.value = "";

  // Add user message to history
  messages.push({ role: "user", content: question });

  // Show loading indicator
  appendMessage("Thinking…", "ai");

  try {
    const response = await fetch(workerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages, // Send full conversation history
      })
    });

    const data = await response.json();
    console.log("OpenAI response:", data);

    // Remove loading indicator from DOM and history
    const wrappers = chatWindow.querySelectorAll(".msg-wrapper");
    if (wrappers.length > 0) {
      const lastMsgBubble = wrappers[wrappers.length - 1].querySelector(".msg.ai");
      if (lastMsgBubble && lastMsgBubble.textContent === "Thinking…") {
        wrappers[wrappers.length - 1].remove();
      }
    }

    // Display AI response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const answer = data.choices[0].message.content.trim();
      appendMessage(answer, "ai");
      messages.push({ role: "assistant", content: answer }); // Add AI response to history
    } else {
      appendMessage("Sorry, I couldn't get a response. Please try again.", "ai");
    }
  } catch (err) {
    // Remove loading indicator from DOM and history
    const wrappers = chatWindow.querySelectorAll(".msg-wrapper");
    if (wrappers.length > 0) {
      const lastMsgBubble = wrappers[wrappers.length - 1].querySelector(".msg.ai");
      if (lastMsgBubble && lastMsgBubble.textContent === "Thinking…") {
        wrappers[wrappers.length - 1].remove();
      }
    }
    appendMessage("Error connecting to OpenAI. Please check your connection and try again.", "ai");
  }
});
