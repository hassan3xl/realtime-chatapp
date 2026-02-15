import { Plus, Send } from "lucide-react";
import React from "react";

const SendMessage = () => {
  return (
    <div className="border-t border-border py-4 flex gap-2">
      <div className="border border-input rounded-md flex items-center justify-center px-2 hover:bg-accent cursor-pointer transition">
        <Plus size={20} className="text-muted-foreground" />
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        className="flex-1 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition flex items-center gap-2">
        <Send size={16} />
        Send
      </button>
    </div>
  );
};

export default SendMessage;
