import { chat } from "@/lib/utils";
import React from "react";

const UserConversations = () => {
  return (
    <div className="h-full border border-border rounded-md px-2 w-full top-0 py-2 bg-muted">
      <div className="flex justify-center mb-2">
        <span className="text-xs text-muted-foreground text-center bg-accent px-2 py-1 rounded">
          today
        </span>
      </div>
      <div>
        {chat.map((msg) => (
          <div
            key={msg.id}
            className={`flex my-3 ${
              msg.sentBy === "sender" ? "justify-start" : "justify-end"
            }`}
          >
            {msg.sentBy === "sender" && (
              <>
                <img
                  src={msg.sender.image}
                  alt=""
                  className="rounded-full h-10 w-10 object-cover"
                />
                <div className="ml-2 bg-card px-3 py-2 rounded-lg shadow max-w-xs">
                  <p className="text-sm text-foreground">{msg.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {msg.sender.date}
                  </p>
                </div>
              </>
            )}
            {msg.sentBy === "receiver" && (
              <>
                <div className="mr-2 bg-primary/20 px-3 py-2 rounded-lg shadow max-w-xs text-right">
                  <p className="text-sm text-foreground">{msg.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {msg.sender.date}
                  </p>
                </div>
                <img
                  src={msg.sender.image}
                  alt="image"
                  className="rounded-full h-10 w-10 object-cover"
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserConversations;
