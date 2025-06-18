import { createContext, useContext, useRef, useState } from "react";

// Buat context
const AudioContext = createContext();

// Buat provider
export const AudioProvider = ({ children }) => {
   const dataAudioRef = useRef(null);
   const dataMimeTypeRef = useRef(null);
   const [isAudioDownloadReady, setIsAudioDownloadReady] = useState(false);

   return (
      <AudioContext.Provider
         value={{
            dataAudioRef,
            dataMimeTypeRef,
            isAudioDownloadReady,
            setIsAudioDownloadReady,
         }}
      >
         {children}
      </AudioContext.Provider>
   );
};

// Hook untuk pakai context
export const useAudio = () => useContext(AudioContext);
