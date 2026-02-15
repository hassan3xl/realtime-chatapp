"use client";

import { Plus, Send, Loader2 } from "lucide-react";
import React, { useState } from "react";

interface SendMessageProps {
  onSend: (message: string) => Promise<void>;
}

const SendMessage = ({ onSend }: SendMessageProps) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border py-3 flex gap-2"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring transition"
        disabled={sending}
      />
      <button
        type="submit"
        disabled={sending || !text.trim()}
        className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition flex items-center gap-2"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send size={16} />
        )}
      </button>
    </form>
  );
};

export default SendMessage;
