"use client";

import React, { useState } from "react";

const GroupsPage = () => {
  const [joinCode, setJoinCode] = useState("");

  const handleCreateGroup = () => {
    alert("Create group flow triggered"); // Replace with real logic
  };

  const handleJoinGroup = () => {
    if (joinCode.trim() === "") {
      return alert("Please enter a group ID or invite code");
    }
    alert(`Joining group with code: ${joinCode}`); // Replace with real logic
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8 bg-gray-50">
      <h1 className="text-3xl font-semibold mb-8">Groups</h1>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        {/* Create group card */}
        <div className="bg-white rounded-lg shadow p-6 flex-1">
          <h2 className="text-xl font-semibold mb-4">Create a New Group</h2>
          <p className="mb-6 text-gray-600">
            Start your own group and invite others to join.
          </p>
          <button
            onClick={handleCreateGroup}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            Create Group
          </button>
        </div>

        {/* Join group card */}
        <div className="bg-white rounded-lg shadow p-6 flex-1">
          <h2 className="text-xl font-semibold mb-4">Join an Existing Group</h2>
          <p className="mb-4 text-gray-600">
            Enter the Group ID or invite code to join a group.
          </p>
          <input
            type="text"
            placeholder="Group ID or Invite Code"
            className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button
            onClick={handleJoinGroup}
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
          >
            Join Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
