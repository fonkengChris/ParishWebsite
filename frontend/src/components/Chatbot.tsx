import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI } from '../services/api';
import type { ChatMessage } from '../types';

const QUICK_PROMPTS = [
  'When is Mass on Sunday?',
  'What are today\'s Mass times?',
  'When is confession?',
];

const WELCOME_MESSAGE =
  'Hello! I can help you find Mass times and weekly service schedules. Ask me about Mass, confession, or adoration.';

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return { role, content };
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage('assistant', WELCOME_MESSAGE),
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    setError('');
    setInput('');

    const nextUserMessage = createMessage('user', trimmed);
    const priorMessages = messages.filter(
      (_, index) => !(index === 0 && messages[0]?.role === 'assistant')
    );
    const history = [...priorMessages, nextUserMessage];

    setMessages((current) => [...current, nextUserMessage]);
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        message: trimmed,
        conversationId,
        history: history.slice(-10),
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      setMessages((current) => [
        ...current,
        createMessage('assistant', response.reply),
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Sorry, I could not respond right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[min(100vw-2rem,24rem)] rounded-2xl shadow-2xl border border-primary-100 bg-white flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Parish assistant chat"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">Parish Assistant</h2>
              <p className="text-primary-100 text-sm">Mass times & schedules</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="h-80 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-md'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-100 px-4 py-3 bg-white">
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={loading}
                  className="text-xs rounded-full border border-primary-200 bg-primary-50 text-primary-700 px-3 py-1 hover:bg-primary-100 transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about Mass times..."
                disabled={loading}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Chat message"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 text-sm font-medium hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
              >
                Send
              </button>
            </form>

            <p className="mt-2 text-xs text-gray-500 text-center">
              See full schedule on{' '}
              <Link to="/mass-schedule" className="text-primary-600 hover:underline">
                Mass Times
              </Link>
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-4 right-4 sm:right-6 z-[60] rounded-full bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 transition-all w-14 h-14 flex items-center justify-center text-2xl"
        aria-label={isOpen ? 'Close parish assistant' : 'Open parish assistant'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </>
  );
}
