import React, { useState, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { BsRobot, BsPerson } from "react-icons/bs";
import { motion } from "framer-motion";
import Navigation from "../Components/dashboard/navigation";
import API_BASE_URL from "../lib/utils.url.js";

const ChatGPTClone = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm RouteGenie. How can I help you today?",
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/processPrompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input.trim() }),
      });
      console.log(response);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `${data.response}\n\n`,
          metadata: {
            query: data.query,
            relevantTable: data.relevantTable,
            rawResults: data.rawResults,
          },
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants :cite[3]:cite[7]
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black  border border-gray-700">
      <Navigation />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-700/30 scrollbar-track-blue-900/20">
        <h1 className="text-3xl font-bold text-center text-indigo-300 mb-6">
          RouteGenie
        </h1>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial="hidden"
            animate="visible"
            variants={messageVariants}
            className={`flex gap-4 ${
              message.role === "user" ? "justify-start" : "justify-start"
            }`}
          >
            <div className="mt-2">
              <div
                className={`p-2 rounded-lg ${
                  message.role === "user" ? "bg-black" : "bg-blue-600/20"
                }`}
              >
                {message.role === "user" ? (
                  <BsPerson className="text-lg text-blue-400" />
                ) : (
                  <BsRobot className="text-lg text-indigo-400" />
                )}
              </div>
            </div>
            <div
              className={`max-w-3xl p-4 rounded-xl backdrop-blur-sm ${
                message.role === "user"
                  ? "bg-blue-700/30 text-blue-100"
                  : "bg-indigo-700/30 text-indigo-100"
              }`}
            >
              <div className="space-y-2">
                {message.content.split("\n").map((line, i) => (
                  <p key={i} className="break-words">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 justify-start"
          >
            <div className="mt-2">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <BsRobot className="text-lg text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="bg-indigo-700/30 text-indigo-100 p-4 rounded-xl max-w-3xl backdrop-blur-sm">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area with Gemini-style gradient animation */}
      <div className="p-4 bg-gray-900/30 border-t border-blue-700/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto relative">
          <motion.div whileHover={{ scale: 1.005 }} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              placeholder="Send a message..."
              className="w-full p-4 pr-12 bg-blue-800/30 rounded-xl text-blue-100 
                       focus:outline-none focus:ring-2 focus:ring-indigo-300
                       resize-none scrollbar-thin scrollbar-thumb-blue-600/30 scrollbar-track-blue-800/20
                       placeholder-blue-300 transition-all duration-200"
              rows={1}
              disabled={isLoading}
              aria-label="Type your message to RouteGenie"
              aria-describedby="chat-instructions"
              aria-required="false"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`absolute right-2 bottom-4 p-2 rounded-lg transition-all duration-200
                ${
                  isLoading || !input.trim()
                    ? "bg-blue-600/30 text-blue-400 cursor-not-allowed"
                    : "bg-indigo-500/80 hover:bg-indigo-400/80 text-white"
                }
                ${input.trim() ? "opacity-100" : "opacity-50"}`}
              aria-label="Send message"
              aria-describedby="send-button-status"
            >
              <FiSend className="text-xl" />
            </motion.button>
          </motion.div>
          <div id="chat-instructions" className="sr-only">
            Press Enter to send your message, or click the send button. Use
            Shift+Enter for a new line.
          </div>
          <div id="send-button-status" className="sr-only">
            {isLoading
              ? "Sending message..."
              : input.trim()
              ? "Send message"
              : "Type a message to enable send"}
          </div>
          <p className="text-center text-xs text-blue-300 mt-3">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatGPTClone;
