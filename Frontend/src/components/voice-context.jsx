import { createContext, useContext, useState } from "react";

// Buat context
const VoiceContext = createContext();

// Buat provider
export const VoiceProvider = ({ children }) => {
   const [voiceCharacter, setVoiceCharacter] = useState(() => {
      return localStorage.getItem("voiceCharacter") || "Zephyr";
   });

   const [voiceSpeed, setVoiceSpeed] = useState(() => {
      const stored = localStorage.getItem("voiceSpeed");
      return stored ? parseFloat(stored) : 1.0;
   });

   const [targetVoiceLanguage, setTargetVoiceLanguage] = useState(() => {
      return localStorage.getItem("targetVoiceLanguage") || "Indonesian";
   });

   const [sourceVoiceLanguage, setSourceVoiceLanguage] = useState(() => {
      return localStorage.getItem("sourceVoiceLanguage") || "Indonesian";
   });

   return (
      <VoiceContext.Provider
         value={{
            voiceCharacter,
            setVoiceCharacter,
            voiceSpeed,
            setVoiceSpeed,
            targetVoiceLanguage,
            setTargetVoiceLanguage,
            sourceVoiceLanguage,
            setSourceVoiceLanguage,
         }}
      >
         {children}
      </VoiceContext.Provider>
   );
};

// Hook untuk pakai context
export const useVoice = () => useContext(VoiceContext);
