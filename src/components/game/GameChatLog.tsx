'use client';

import React, { useState, useRef, useEffect } from 'react';
import { QuestionLogItem } from '@/types/game';
import { MessageSquare, Send } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface GameChatLogProps {
  chatMessages: QuestionLogItem[];
  presenceKey: string;
  onSendChatMessage: (messageText: string) => void;
  disabled?: boolean;
}

export const GameChatLog: React.FC<GameChatLogProps> = ({
  chatMessages,
  presenceKey,
  onSendChatMessage,
  disabled = false,
}) => {
  const [chatInput, setChatInput] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || disabled) return;
    soundFx.playSelect();
    onSendChatMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="w-full glass-panel p-4 rounded-2xl flex flex-col h-[380px] border border-slate-700/50 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-700/50 shrink-0">
        <MessageSquare className="w-4 h-4 text-cyan-400" />
        <h3 className="font-bold text-slate-200 text-sm">Match Chat & Question Log</h3>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar text-xs">
        {chatMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 font-medium italic text-center px-4">
            Ask questions or chat with your opponent here...
          </div>
        ) : (
          chatMessages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="py-1 px-2.5 bg-slate-800/80 rounded-lg text-slate-400 text-[11px] text-center font-medium border border-slate-700/40">
                  {msg.question}
                </div>
              );
            }

            const isMe = msg.senderId === presenceKey || msg.sender === 'player';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400 font-semibold px-1">
                  <span>{msg.senderName || (isMe ? 'You' : 'Opponent')}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500">{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md shadow-cyan-950/40'
                      : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/60'
                  }`}
                >
                  {msg.question}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="pt-3 mt-2 border-t border-slate-700/50 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={disabled ? 'Game finished' : 'Ask a question or type a message...'}
          disabled={disabled}
          className="flex-1 bg-slate-950/80 border border-slate-700/70 rounded-xl px-3.5 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!chatInput.trim() || disabled}
          className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-40 disabled:hover:bg-cyan-500 flex items-center gap-1 shadow-md shadow-cyan-500/20"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
