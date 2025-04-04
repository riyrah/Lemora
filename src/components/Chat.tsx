"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/button";
import { Loader2, Bot, Send } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardButton } from "@/components/dashboard-button";

type Message = {
  content: string;
  isUser: boolean;
  pending?: boolean;
};

export const Chat = ({ videoUrl }: { videoUrl: string }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { content: input, isUser: true };
    const pendingMessage: Message = { content: "", isUser: false, pending: true };
    setMessages(prev => [...prev, userMessage, pendingMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl, question: input })
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get answer, unknown error format' }));
        throw new Error(errorData.error || `Failed to get answer (status: ${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentContent = "";
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonString = line.substring(5).trim();
                if (jsonString) {
                  const data = JSON.parse(jsonString);
                  if (data.chunk) {
                    currentContent += data.chunk;
                    setMessages(prev => prev.map((msg, i) =>
                      i === prev.length - 1 ? { ...msg, content: currentContent, pending: true } : msg
                    ));
                  } else if (data.error) {
                    console.error('Stream error chunk:', data.error);
                    currentContent += `\n[Error: ${data.error}]`;
                    setMessages(prev => prev.map((msg, i) =>
                      i === prev.length - 1 ? { ...msg, content: currentContent, pending: false } : msg
                    ));
                    done = true;
                    break;
                  }
                }
              } catch (e) {
                console.error('Error parsing SSE chunk data:', e, 'Raw line:', line);
              }
            }
          }
        }
      }

      setMessages(prev => prev.map((msg, i) =>
        i === prev.length - 1 ? { ...msg, pending: false } : msg
      ));
    } catch (error) {
      console.error('Chat error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessages(prev => [...prev.slice(0, -1), { content: message, isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 p-8">
            <Bot className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-center">Ask questions about this video.</p>
            <p className="text-center text-sm mt-2">
              For example: "What are the key points in this lecture?" or "Explain the concept of P vs NP"
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mb-4"
            >
              <div className={`flex gap-4 ${message.isUser ? 'justify-end' : 'items-start'}`}>
                {!message.isUser && (
                  <div className="flex-shrink-0 w-8 h-8">
                    <Bot className="w-8 h-8 text-purple-600" />
                  </div>
                )}
                <div className={`group relative flex flex-col max-w-[90%] ${
                  message.isUser ? 'items-end' : 'items-start'
                }`}>
                  <div className={`px-4 py-2 rounded-2xl ${
                    message.isUser 
                      ? 'bg-purple-600/10 text-gray-900'
                      : 'text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                      {message.content}
                      {message.pending && (
                        <span className="inline-block w-1.5 h-4 ml-1 bg-purple-600/50 animate-pulse" />
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      <div className="border-t border-gray-200 bg-gray-50 p-4 rounded-b-xl">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the video..."
            className="w-full px-4 py-3 pr-14 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-gray-900 placeholder-gray-500 shadow-sm"
            disabled={isLoading}
          />
          <DashboardButton
            type="submit" 
            disabled={isLoading}
            className="absolute right-1.5 top-1.5 bottom-1.5 p-2 h-auto"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </DashboardButton>
        </form>
      </div>
    </div>
  );
}; 