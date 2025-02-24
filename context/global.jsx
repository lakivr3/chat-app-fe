"use client";
import { axiosInstance } from "@/lib/axios";
import { redirect } from "next/navigation";
import { Router } from "next/navigation";
import { useRouter } from "next/router";
import React, { createContext, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5001";

export const GlobalContext = createContext();

const GlobalContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const connectSocket = useCallback(async () => {
    if (!authUser?._id) {
      console.error("No authUser or userId found");
      return;
    }

    console.log("Connecting socket for user:", authUser._id);

    const socketIo = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    socketIo.on("connect", () => {
      console.log("Socket connected:", socketIo.id);
    });

    socketIo.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    socketIo.on("getOnlineUsers", (usersIds) => {
      console.log("Online users:", usersIds);
      setOnlineUsers(usersIds);
    });
    console.log(socketIo);
    setSocket(socketIo); // Ensure this is called

    return () => {
      socketIo.disconnect();
    };
  }, [authUser]);
  const dissconnectSocket = async () => {
    if (socket?.connected) socket.disconnect();
  };

  const checkAuth = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      setAuthUser(res.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);
  const signup = async (data) => {
    setIsSigningUp(true);

    try {
      const res = await axiosInstance.post("/auth/signup", data);
      setAuthUser(res.data);
      console.log(res.data);
      toast.success("Account created successfully!");
      connectSocket();

      // Move redirect inside the promise to ensure `authUser` is set
    } catch (error) {
      toast.error("Signup failed");
    } finally {
      setIsSigningUp(false);
      console.log(authUser);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      setAuthUser(null);
      toast.success("Logged out successfully");
      dissconnectSocket();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const login = async (data) => {
    setIsLoggingIn(true);
    try {
      const res = await axiosInstance.post("/auth/login", data);
      setAuthUser(res.data);
      toast.success("Logged in successfully");
      connectSocket();
    } catch (error) {
      toast.error("Failed to login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const updateProfile = async (data) => {
    setIsUpdatingProfile(true);
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      setAuthUser(res.data);
      toast.success("Profile updated succesfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  useEffect(() => {
    if (authUser?._id) {
      connectSocket();
    } else {
      dissconnectSocket();
    }
  }, [authUser, connectSocket]);

  return (
    <GlobalContext.Provider
      value={{
        authUser,
        setAuthUser,
        isSigningUp,
        setIsSigningUp,
        isLoggingIn,
        setIsLoggingIn,
        isUpdatingProfile,
        setIsUpdatingProfile,
        isCheckingAuth,
        setIsCheckingAuth,
        checkAuth,
        signup,
        logout,
        login,
        updateProfile,
        onlineUsers,
        setOnlineUsers,
        connectSocket,
        socket,
        setSocket,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
