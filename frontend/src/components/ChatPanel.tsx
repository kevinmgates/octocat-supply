import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { api } from '../api/config';
import { useTheme } from '../context/ThemeContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPanel() {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message whenever the list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    const updatedHistory = [...messages, userMessage];

    setMessages(updatedHistory);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${api.baseURL}${api.endpoints.agentChat}`,
        {
          message: trimmed,
          history: messages,
        }
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.reply,
      };
      setMessages([...updatedHistory, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(
        'The AI assistant is temporarily unavailable. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-accent focus:outline-none transition-colors duration-300"
      >
        {open ? (
          /* X icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          /* Chat bubble icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className={`fixed bottom-24 right-6 z-50 flex flex-col w-80 sm:w-96 rounded-2xl shadow-2xl border ${
            darkMode
              ? 'bg-gray-900 border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          } transition-colors duration-300`}
          style={{ maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="flex items-center px-4 py-3 bg-primary rounded-t-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3a.75.75 0 000 1.5h.75v1.5H6A2.25 2.25 0 003.75 8.25v9A2.25 2.25 0 006 19.5h12a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0018 6h-4.5V4.5h.75a.75.75 0 000-1.5h-4.5z" />
            </svg>
            <span className="text-white font-semibold text-sm">OctoCAT Assistant</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" style={{ maxHeight: 'calc(70vh - 130px)' }}>
            {messages.length === 0 && (
              <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Ask me anything about our products or your orders!
              </p>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : darkMode
                      ? 'bg-gray-700 text-gray-100 rounded-bl-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className={`px-3 py-2 rounded-2xl rounded-bl-none text-sm ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  <span className="animate-pulse">Thinking…</span>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl rounded-bl-none text-sm bg-red-100 text-red-700">
                  {error}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`flex items-center gap-2 px-3 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              className={`flex-1 text-sm px-3 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300 ${
                darkMode
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              aria-label="Chat message input"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white hover:bg-accent disabled:opacity-40 transition-colors duration-300 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
