import React, { useContext } from "react";
import { axiosInstance } from "../lib/axios";
import { ChatContext } from "@/context/chat";
import NoChatSelected from "./NoChatSelected";
import ChatContainer from "./ChatContainer";
import Sidebar from "./Sidebar";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-enter justify-center pt-20 px-4">
        <div className="bg-base-200 rounder-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounder-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
