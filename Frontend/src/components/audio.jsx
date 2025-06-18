import { useState } from "react";

export const base64ToBlob = (base64Data, mimeType) => {
   try {
      // Pastikan base64 data tidak mengandung prefix data URL
      const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");

      // Langkah 1: Dekode Base64 ke string biner mentah menggunakan atob()
      const byteCharacters = atob(cleanBase64);

      // Langkah 2: Buat ArrayBuffer dan Uint8Array (optimasi performa)
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
         byteArray[i] = byteCharacters.charCodeAt(i);
      }

      // Langkah 3: Buat Blob dari data biner
      return new Blob([byteArray], { type: mimeType });
   } catch (error) {
      throw new Error(`Failed to convert base64 to blob: ${error.message}`);
   }
};

export const useAudioDownloader = () => {
   const [isDownloading, setIsDownloading] = useState(false);
   const [error, setError] = useState(null);

   const downloadAudio = async (
      audioData,
      mimeType,
      filename = "audio.wav"
   ) => {
      setIsDownloading(true);
      setError(null);
      let objectUrl = null;

      try {
         // Validasi input
         if (!audioData || !mimeType) {
            throw new Error("Audio data and MIME type are required");
         }

         // Konversi Base64 ke Blob menggunakan helper
         const audioBlob = base64ToBlob(audioData, mimeType);

         // Buat Object URL dari blob
         objectUrl = URL.createObjectURL(audioBlob);

         // Buat elemen anchor dan picu download
         const anchor = document.createElement("a");
         anchor.href = objectUrl;
         anchor.download = filename;
         anchor.style.display = "none"; // Sembunyikan elemen
         document.body.appendChild(anchor);
         anchor.click();
         document.body.removeChild(anchor);

         return true; // Indikasi sukses
      } catch (err) {
         console.error("Failed to download audio:", err);
         setError(err.message || "Unknown error occurred");
         return false; // Indikasi gagal
      } finally {
         setIsDownloading(false);

         // Cleanup Object URL
         if (objectUrl) {
            // Delay cleanup untuk memastikan download selesai
            setTimeout(() => {
               URL.revokeObjectURL(objectUrl);
            }, 100);
         }
      }
   };

   return { isDownloading, error, downloadAudio };
};
