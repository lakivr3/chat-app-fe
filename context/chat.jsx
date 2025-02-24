"use client";
import React, { createContext, useCallback, useContext, useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";
import { GlobalContext } from "./global";

export const ChatContext = createContext();
const ChatContextProvider = ({ children }) => {
  const { socket } = useContext(GlobalContext);
  const [chat, setChat] = useState();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  console.log(socket);

  const getUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const res = await axiosInstance.get("/messages/users");
      setUsers(res.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      setIsUsersLoading(false);
    }
  }, []);
  const getMessages = useCallback(async (userId) => {
    setIsMessagesLoading(true);
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      setMessages(res.data);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (data) => {
      console.log(selectedUser);
      try {
        const res = await axiosInstance.post(
          `/messages/send/${selectedUser._id}`,
          data
        );
        setMessages((prev) => [...prev, res.data]);
      } catch (error) {
        toast.error("Failed to send message");
      }
    },
    [selectedUser]
  );
  const subscribeToMessages = useCallback(() => {
    if (!socket || !selectedUser) {
      console.error("no socket found");
      return;
    }

    socket?.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id)
        console.log("received msg:", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });
  }, [socket, selectedUser]);
  const unsubscribeToMessages = useCallback(() => {
    socket?.off("newMessage");
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        setChat,
        messages,
        setMessages,
        users,
        setUsers,
        selectedUser,
        setSelectedUser,
        isUsersLoading,
        setIsUsersLoading,
        isMessagesLoading,
        setIsMessagesLoading,
        getMessages,
        getUsers,
        sendMessage,
        subscribeToMessages,
        unsubscribeToMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContextProvider;
