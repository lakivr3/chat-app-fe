"use client"; // This ensures `useContext` works!

import { useContext } from "react";
import { ThemeContext } from "@/context/theme";

export default function ThemeWrapper({ children }) {
  const { theme } = useContext(ThemeContext);

  return (
    <div data-theme={theme} className="w-full h-full">
      {children}
    </div>
  );
}
