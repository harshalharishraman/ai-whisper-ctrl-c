
import React, { useState, useRef, useEffect } from 'react';
import { sendSupportMessage, ChatMessage, ChatResponse } from '../services/chatService';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "Hello! I'm your Travel Support Assistant. How can I help you today?" }] }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setIsTyping(true);

    try {
      const response: ChatResponse = await sendSupportMessage(messages, userMsg);
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
      
      if (response.intent === 'Talk_To_Human') {
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'model', parts: [{ text: "I'm connecting you to a live support agent now. Please stay on the line... 🎧" }] }]);
        }, 1500);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "I'm sorry, I encountered an error. Would you like to try again or talk to a human?" }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold">Support Center</h3>
              <p className="text-xs text-blue-100 opacity-80">AI Assistant Online</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md ${
                msg.role === 'user' 
                ? 'bg-slate-800 text-slate-400 rounded-tr-none border border-slate-700' 
                : 'bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-none'
              }`}>
                {msg.parts[0].text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {['Refund Status', 'Cancel Booking', 'Reschedule', 'Flight Delayed'].map(q => (
              <button 
                key={q}
                onClick={() => { setInput(q); }}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full text-xs font-medium border border-slate-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-600"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-slate-800 disabled:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
