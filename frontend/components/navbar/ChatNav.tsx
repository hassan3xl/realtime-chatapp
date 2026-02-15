import { OptionIcon, PhoneCall } from "lucide-react";
import React from "react";

const ChatNav = () => {
  return (
    <div className="flex border rounded-md px-4 w-full top-0 mx-auto justify-between py-4">
      <div className="flex">
        <span>user</span>
        <p>username</p>
      </div>
      <div className="flex">
        <PhoneCall />
      </div>
    </div>
  );
};

export default ChatNav;
