"use client";
import React, { createContext, useContext, useState } from "react";

type HistoryContextType = {
  history: string[];
  addToHistory: (item: string) => void;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState<string[]>([]);

  const addToHistory = (item: string) => {
    setHistory((prev) => [item, ...prev]);
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
};