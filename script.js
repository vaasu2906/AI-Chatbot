const promptForm = document.querySelector(".prompt-form");
const container = document.querySelector(".container");
const promptInput = document.querySelector(".prompt-input");
const chatsContainer = document.querySelector(".chats-container");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const themeToggle = document.querySelector("#theme-toggle-btn");

// API Setup
const API_KEY = "AIzaSyDpES7zo7wfkiUdLLj4RtZ2IBsK3QEX7KM";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

let typingInterval,controller;

const userData = { message: "", file: {} };
const chatHistory = [];

// Create message element
function createMsgElement(content, ...classes) {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
}


// Auto scroll

const scrollToBottom = () => {
 container.scrollTo({top: container.scrollHeight, behavior:"smooth"});
};

const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  const words=text.split(" ");
  let wordIndex = 0;

  typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent += (wordIndex === 0 ? "" : " ")+words[wordIndex++]
      scrollToBottom();
    } else {
      clearInterval(typingInterval);
      botMsgDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");
    }
  }, 40); // adjust typing speed
};


//API Call
const genrateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  controller = new AbortController();

  // Add user message to chat history
chatHistory.push({ 
   role: "user",
   parts: [{text: userData.message }, ...(userData.file.data ?[{ inline_data: (({ fileName,isImage,...
  rest})=>rest)(userData.file)}]:[])]
   })  
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
      signal: controller.signal,
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error?.message || "API Error");

    const responseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();

    typingEffect(responseText, textElement, botMsgDiv);

    // Add model response to chat history
    chatHistory.push({
      role: "model",
      parts: [{ text: responseText }],
    });
    console.log(chatHistory);
  } catch (error) {
    textElement.style.color = "#d62939";
    textElement.textContent =
      error.name === "AbortError"
        ? "Response generation stopped."
        : error.message;
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
  } finally {
    userData.file = {};
  }
};

// Handle form submission
const handleFormSubmit = (e) => {
  e.preventDefault();
  const userMessage = promptInput.value.trim();
if ((!userMessage && !userData.file.data) || document.body.classList.contains("bot-responding")) return;
  promptInput.value = "";
  userData.message = userMessage;
  document.body.classList.add("bot-responding","chats-active");
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");
const userMsgHTML = `
    <p class="message-text"></p>`
  //   ${
  //     userData.file.data
  //       ? userData.file.isImage
  //         ? `<img src="data:${userData.file.mimeType};base64,${userData.file.data}" class="img-attachment"/>` // <-- Use mimeType
  //         : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`
  //       : ""
  //   }
  // `;
  const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
  userMsgDiv.querySelector(".message-text").textContent = userMessage;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  setTimeout(() => {
    const botMsgHTML = `<img src="./images/gemini.png" class="avatar"><p class="message-text">Wait a sec...</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    genrateResponse(botMsgDiv);
  }, 600);
};

// File upload
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;


    console.log(file);

  const isImage = file.type.startsWith("image/");
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = (e) => {
    fileInput.value = "";
    const base64String = e.target.result.split(",")[1];
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
    fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");


    // store file data in userData obj
// NEW
userData.file = { fileName: file.name,data: base64String, mimeType: file.type, isImage };  };
});

// Cancel file
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");
});


// Stop response
document.querySelector("#stop-response-btn").addEventListener("click", () => {
  userData.file = {};
  controller?.abort();
  clearInterval(typingInterval); // <-- This will now work
  chatsContainer.querySelector(".bot-message.loading")?.classList.remove("loading");
  document.body.classList.remove("bot-responding","chats-active");
});

// Delete chats
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
  chatHistory.length = 0;
  chatsContainer.innerHTML = "";
  document.body.classList.remove("bot-responding", "chats-active");
});

// Suggestions click
document.querySelectorAll(".suggestions-items").forEach((item) => {
  item.addEventListener("click", () => {
    promptInput.value = item.querySelector(".text").textContent;
    promptForm.dispatchEvent(new Event("submit"));
  });
});

document.addEventListener("click",({target})=>{
  const wrapper=document.querySelector(".prompt-wrapper");
  const shouldHide=target.classList.contains("prompt-input")||(wrapper.classList.contains("hide-controls")&& (target.id==="add-file-btn" || target.id==="stop-response-btn"));
  wrapper.classList.toggle("hide-controls",shouldHide)
})

// Theme toggle
themeToggle.addEventListener("click", () => {
  const isLightTheme = document.body.classList.toggle("light-theme");
  localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
  themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";
});

const isLightTheme=localStorage.getItem("themeColor")==="light_mode";
document.body.classList.toggle("light-theme",isLightTheme);
  themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";

// Apply saved theme on load
// const savedTheme = localStorage.getItem("themeColor");
// if (savedTheme === "light_mode") {
//   document.body.classList.add("light-theme");
//   themeToggle.textContent = "dark_mode";
// } else {
//   document.body.classList.remove("light-theme");
//   themeToggle.textContent = "light_mode";
// }

// Event listeners
promptForm.addEventListener("submit", handleFormSubmit);
promptForm.querySelector("#add-file-btn").addEventListener("click", () => fileInput.click());