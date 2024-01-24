import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import OpenAI from "openai";
const API_KEY = "YOUR_API_KEY";

const openai = new OpenAI({ apiKey: API_KEY, dangerouslyAllowBrowser: true });

async function main(apiRequestBody) {
  const completion = await openai.chat.completions.create(apiRequestBody);
  console.log(completion.choices[0]);
  return completion;
}

async function createImg(promptt = "plane") {
  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: promptt,
    n: 1,
  });
  console.log("image", image);
  const image_url = image.data[0].url;

  return image_url;
}

// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = {
  //  Explain things like you're talking to a software professional with 5 years of experience.
  role: "system",
  content:
    "Explain things like you're talking to a software professional with 2 years of experience.",
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [prompt, setPrompt] = useState("");
  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];
    setPrompt(message);
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages, message);
  };

  async function processMessageToChatGPT(chatMessages, message) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act.
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage, // The system message DEFINES the logic of our chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    };

    // main(apiRequestBody).then((data) => {
    //   console.log(data);
    //   setMessages([
    //     ...chatMessages,
    //     {
    //       message: data.choices[0].message.content,
    //       sender: "ChatGPT",
    //     },
    //   ]);
    //   setIsTyping(false);
    // });

    createImg(message).then((data) => {
      console.log(data);
      setMessages([
        ...chatMessages,
        {
          message: data,
          sender: "ChatGPT",
        },
      ]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="ChatGPT is typing" />
                ) : null
              }
            >
              {messages.map((message, i) => {
                console.log(message);
                return (
                  <Message
                    key={i}
                    model={message}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
