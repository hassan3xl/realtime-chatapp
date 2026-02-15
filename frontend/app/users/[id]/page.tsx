"use client";
import React from "react";
import { useParams } from "next/navigation";
import ChatNav from "@/components/navbar/ChatNav";

const UserPage = () => {
  const { id } = useParams();

  return (
    <>
      <div>user page</div>
    </>
  );
};

export default UserPage;
