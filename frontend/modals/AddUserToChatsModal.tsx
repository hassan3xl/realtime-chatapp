"use client";

import React, { useState } from "react";

type AddUserToChatsModalType = {
  onClose: () => void;
};

const mockUsers = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Smith" },
  { id: 3, name: "Charlie Davis" },
];

const AddUserToChatsModal = ({ onClose }: AddUserToChatsModalType) => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  // Toggle user selection
  const toggleUser = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // Filter users by search
  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    alert(`Adding users with ids: ${selectedUsers.join(", ")}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />

      {/* Modal */}
      <div
        className="
          fixed z-50 inset-0 flex items-center justify-center
          p-4 sm:p-6
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="
            w-full h-full sm:w-96 sm:h-auto bg-white rounded-none sm:rounded-xl
            shadow-lg p-6 flex flex-col
            overflow-auto
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              Add User to Chat
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            aria-label="Search users"
            placeholder="Search users..."
            className="w-full mb-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* User List */}
          <div className="flex-1 overflow-y-auto max-h-60 mb-4">
            {filteredUsers.length === 0 && (
              <p className="text-gray-500 text-sm">No users found.</p>
            )}
            <ul className="space-y-2">
              {filteredUsers.map((user) => (
                <li key={user.id}>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-900">{user.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={selectedUsers.length === 0}
              className={`px-4 py-2 rounded-md text-white transition ${
                selectedUsers.length === 0
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Add User{selectedUsers.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUserToChatsModal;
