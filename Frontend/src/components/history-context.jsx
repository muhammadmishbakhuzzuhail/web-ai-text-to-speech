import { createContext, useContext, useRef, useState } from "react";

// Buat context
const HistoryContext = createContext();

// Buat provider
export const HistoryProvider = ({ children }) => {
  const audioRefFromHistory = useRef(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [clickHistory, setClickHistory] = useState(false);
  const [isLoadingFromHistory, setIsLoadingFromHistory] = useState(false);

  return (
    <HistoryContext.Provider
      value={{
        audioRefFromHistory,
        title,
        setTitle,
        content,
        setContent,
        clickHistory,
        setClickHistory,
        isLoadingFromHistory,
        setIsLoadingFromHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

// Hook untuk pakai context
export const useHistory = () => useContext(HistoryContext);
