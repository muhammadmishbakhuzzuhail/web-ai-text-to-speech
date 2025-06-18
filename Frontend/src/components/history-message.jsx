import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import axios from "axios";
import { useHistory } from "./history-context";
import { useAudio } from "./audio-context";

function HistoryMessage() {
   const [isExpand, setIsExpand] = useState(false);
   const [listHistoryMessage, setListHistoryMessage] = useState([]);
   const [showContent, setShowContent] = useState(false);

   const {
      setTitle,
      setContent,
      setClickHistory,
      setIsLoadingFromHistory,
      audioRefFromHistory,
   } = useHistory();

   const { dataAudioRef, dataMimeTypeRef, setIsAudioDownloadReady } =
      useAudio();

   useEffect(() => {
      let timeout;

      const fetchHistoryMessage = async () => {
         console.log("fetch message ");
         try {
            const result = await axios.get(
               "http://localhost:3000/history-message",
               {
                  params: { id: localStorage.getItem("token") },
                  withCredentials: true,
               }
            );

            setListHistoryMessage(result.data.historyMessage);
         } catch (error) {
            throw new Error("Error fetch history:", error);
         }
      };

      if (isExpand) {
         fetchHistoryMessage(); // fetch data saat expand
         setShowContent(true); // tampilkan saat expand
      } else {
         timeout = setTimeout(() => setShowContent(false), 250); // delay sebelum sembunyi
      }

      return () => clearTimeout(timeout);
   }, [isExpand === true]);

   const handleSubmit = async ({ title, content }) => {
      try {
         setIsLoadingFromHistory(true);
         const response = await axios.post(
            "http://localhost:3000/speech",
            {
               text: content,
               voiceName: localStorage.getItem("voiceCharacter") || "Zephyr",
            },
            { withCredentials: true }
         );

         if (response?.data?.success) {
            // Method 1: Using base64 data
            const audioSrc = `data:${response.data.mimeType};base64,${response.data.audioData}`;
            const audio = new Audio(audioSrc);

            audioRefFromHistory.current = audio;

            setTitle(title);
            setContent(content);
            setClickHistory(true);

            dataMimeTypeRef.current = response.data.mimeType;
            dataAudioRef.current = response.data.audioData;
            setIsAudioDownloadReady(true);
         }
      } catch (error) {
         throw new Error(`Error fetch history click : ${error}`);
      } finally {
         setIsLoadingFromHistory(false);
      }
   };

   return (
      <div className="fixed z-50 bg-blue-100 h-[52.5rem] my-[62px] rounded-lg p-4 border-[1px] border-blue-400 pb-20 top-4 bottom-4 left-4 hover:shadow-[-4px_4px_5px_rgba(0,0,0,0.5)]">
         <div className="relative">
            <div className="flex">
               {showContent && (
                  <div className="text-center mx-auto transition-opacity duration-500 ease-in-out opacity-100">
                     <span className="bg-blue-500 text-white px-2 rounded-xs">
                        HISTORY
                     </span>
                  </div>
               )}
               <button
                  onClick={() => setIsExpand(!isExpand)}
                  className="hover:cursor-pointer hover:rounded-md hover:bg-slate-400"
               >
                  <ArrowRight
                     className={`transition-transform duration-500 ease-in-out transform text-slate-800 ${
                        isExpand ? "rotate-180" : ""
                     }`}
                  />
               </button>
            </div>
         </div>

         <div
            className={`h-full mt-4 transition-all duration-500 ease-in-out overflow-hidden ${
               isExpand ? "w-72" : "w-4"
            }`}
         >
            <ul className="flex flex-col gap-2 overflow-y-auto max-h-[80vh] p-2 pb-8 ">
               {showContent &&
                  listHistoryMessage.map(({ id, title, content }) => (
                     <li key={id}>
                        <button
                           onClick={() => handleSubmit({ title, content })}
                           className="text-sm font-semibold w-full border-[2px] rounded-sm border-slate-300 hover:border-slate-400 truncate px-2 py-[4px] hover:cursor-pointer bg-white text-left opacity-70 hover:opacity-100"
                        >
                           {title}
                        </button>
                     </li>
                  ))}
            </ul>
         </div>
      </div>
   );
}

export default HistoryMessage;
