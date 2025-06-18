import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useRef, useState } from "react";
import axios from "axios";
import DashboardOutput from "@/components/dashboard-output";
import { Loader, X } from "lucide-react";
import { useVoice } from "./voice-context";
import { useHistory } from "./history-context";
import { Download } from "lucide-react";
import { useAudioDownloader } from "./audio";
import { useAudio } from "./audio-context";

export function DashboardForm({ className, ...props }) {
   const [url, setUrl] = useState("");
   const [perintah, setPerintah] = useState("");

   const [generateTitle, setGenerateTitle] = useState("");
   const [generateText, setGenerateText] = useState("");

   // Dari generate sampai selesai speech
   const [isLoading, setIsLoading] = useState(false);

   const audioRef = useRef(null);
   const [isPlay, setIsPlay] = useState(true);

   // Context
   const {
      voiceCharacter,
      sourceVoiceLanguage,
      voiceSpeed,
      targetVoiceLanguage,
   } = useVoice();
   const {
      title,
      content,
      clickHistory,
      setClickHistory,
      isLoadingFromHistory,
      audioRefFromHistory,
   } = useHistory();

   const {
      dataAudioRef,
      dataMimeTypeRef,
      isAudioDownloadReady,
      setIsAudioDownloadReady,
   } = useAudio();

   // SOLUSI: Pindahkan onAudioEnded ke fungsi terpisah yang bisa digunakan di mana saja
   const onAudioEnded = useCallback(() => {
      setIsPlay(true); // tombol jadi Play saat audio selesai
   }, []);

   // SOLUSI: Fungsi untuk setup event listener pada audio
   const setupAudioEventListener = useCallback(
      (audio) => {
         if (!audio) return;

         // Bersihkan event listener lama jika ada
         audio.removeEventListener("ended", onAudioEnded);

         // Tambahkan event listener baru
         audio.addEventListener("ended", onAudioEnded);
      },
      [onAudioEnded]
   );

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
         console.log("scrape mulai");

         const scrape = await axios.post(
            "http://localhost:3000/scrape",
            { url },
            {
               withCredentials: true,
            }
         );
         console.log("scrape ", scrape);
         // setelah scraping selesai -> langsung generate
         const generate = await generateAi({
            perintah: perintah,
            scrapeResult: scrape.data.result,
         });
         console.log("after, ", {
            generate,
         });
         const translate = await translateAi({
            text: generate.cleanText,
            title: generate.cleanTitle,
            sourceVoiceLanguage: sourceVoiceLanguage,
            targetVoiceLanguage: targetVoiceLanguage,
         });
         console.log("translate ", translate);
         // setelah generate selesai -> langsung proses suara
         const { audio, audioData, audioMimeType } = await speechAi({
            text: translate.data.text,
            voiceName: voiceCharacter,
         });
         console.log("audio ", { audio, audioData, audioMimeType });
         if (audio && audioData && audioMimeType) {
            audioRef.current = audio;

            // SOLUSI: Gunakan fungsi setupAudioEventListener
            setupAudioEventListener(audio);

            // Set speed
            audio.playbackRate = voiceSpeed;

            // Play langsung
            audio.play();
            setIsPlay(false); // tombol jadi Pause

            dataAudioRef.current = audioData;
            dataMimeTypeRef.current = audioMimeType;

            console.log("current ", { dataAudioRef, dataMimeTypeRef });
            setIsAudioDownloadReady(true);
            return true;
         }
         return null;
      } catch (error) {
         throw new Error(`Error handle submit: ${error}`);
      } finally {
         setIsLoading(false);
      }
   };

   const generateAi = async ({
      perintah,
      scrapeResult,
      targetVoiceLanguage,
      sourceVoiceLanguage,
   }) => {
      try {
         console.log("generate mulai");

         const generate = await axios.post(
            "http://localhost:3000/generate",
            {
               perintah: perintah,
               scrapeResult: scrapeResult,
               sourceVoiceLanguage: sourceVoiceLanguage,
               targetVoiceLanguage: targetVoiceLanguage,
            },
            { withCredentials: true }
         );
         console.log("generate ", generate);
         // Pembersihan
         const normalizeColons = (str) => str.replace(/：/g, ":");
         const cleanTitle = normalizeColons(generate.data.title)
            .replace(/^.*?:\s*/, "") // hapus semua sebelum `:`
            .trim();

         const cleanText = normalizeColons(generate.data.text)
            .replace(/^.*?:\s*/, "") // hapus semua sebelum `:`
            .trim();

         setGenerateTitle(cleanTitle);
         setGenerateText(cleanText);
         console.log({ cleanTitle, cleanText });

         return { cleanTitle, cleanText };
      } catch (error) {
         setGenerateTitle("");
         setGenerateText("");
         throw new Error(`Error generate : ${error}`);
      }
   };

   const speechAi = async ({ text, voiceName }) => {
      try {
         console.log("speech mulai");

         const response = await axios.post(
            "http://localhost:3000/speech",
            {
               text,
               voiceName,
            },
            { withCredentials: true }
         );

         if (response?.data?.success) {
            // Method 1: Using base64 data
            const audioSrc = `data:${response.data.mimeType};base64,${response.data.audioData}`;
            const audio = new Audio(audioSrc);

            const audioMimeType = response.data.mimeType;
            const audioData = response.data.audioData;
            return { audio, audioData, audioMimeType };
         }
         return null;
      } catch (error) {
         console.error("Error di speechAi:", error);
         throw new Error(`Error speech : ${error.message || error}`);
      }
   };

   const translateAi = async ({
      text,
      title,
      sourceVoiceLanguage,
      targetVoiceLanguage,
   }) => {
      try {
         console.log("translate mulai");

         const response = await axios.post(
            "http://localhost:3000/translate",
            {
               title,
               text,
               sourceVoiceLanguage,
               targetVoiceLanguage,
            },
            { withCredentials: true }
         );

         return response;
      } catch (error) {
         console.error("Error di speechAi:", error);
         throw new Error(`Error speech : ${error.message || error}`);
      }
   };

   const { isDownloading, error, downloadAudio } = useAudioDownloader();

   const handleAudioDownload = async () => {
      console.log("dataAudioRef.current:", dataAudioRef.current);
      console.log("dataMimeTypeRef.current:", dataMimeTypeRef.current);
      try {
         const success = await downloadAudio(
            dataAudioRef.current,
            dataMimeTypeRef.current
         );

         if (success) {
            // Optional: tampilkan notifikasi sukses
            console.log("Audio berhasil didownload!");
            // atau setState untuk menampilkan toast/notification
         }
      } catch (error) {
         // Handle error tambahan jika diperlukan
         console.error("Download failed:", error);
      }
   };

   return (
      <div className={cn("w-[800px]", className)} {...props}>
         <Card
            className={cn(
               "relative border-[1px] rounded-md border-blue-400 bg-blue-100 hover:shadow-[0px_4px_5px_1px_rgba(0,0,0,0.5)]"
            )}
         >
            {isAudioDownloadReady ? (
               <button
                  onClick={handleAudioDownload}
                  disabled={isDownloading}
                  type="button"
                  className="group hover:cursor-pointer z-10 bottom-6 left-6 absolute hover:bg-slate-400 hover:rounded-md p-1"
               >
                  <Download className="w-6 aspect-square text-10xl text-slate-600  group-active:text-slate-950 group-hover:text-slate-800" />
               </button>
            ) : null}
            {error ? alert("Eror download audio") : null}
            <CardHeader>
               <div className="flex mx-auto gap-2 flex-row items-center">
                  <CardTitle className="text-4xl text-center bg-gradient-to-tr from-blue-700 to-blue-400 bg-clip-text text-transparent">
                     AI Web :
                  </CardTitle>
                  <CardTitle className="rounded-sm px-2 py-1 text-white text-3xl text-center bg-gradient-to-r from-blue-700 to-blue-400">
                     Text to Speech
                  </CardTitle>
               </div>
               <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="">
               {!clickHistory ? (
                  <>
                     <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                           <div className="grid gap-2">
                              <Label
                                 htmlFor="url"
                                 className="text-lg font-semibold"
                              >
                                 Url
                              </Label>
                              <Input
                                 id="url"
                                 type="text"
                                 placeholder="https://example.com"
                                 required
                                 value={url}
                                 onChange={(e) => setUrl(e.target.value)}
                                 autoComplete="off"
                                 className="rounded-xs ring-0 focus:shadow-[0px_2px_3px_1px_rgba(0,0,0,0.5)] focus-visible:ring-0 focus-visible:border-transparent bg-white"
                              />
                           </div>
                           <div className="grid gap-1">
                              <Label
                                 htmlFor="perintah"
                                 className="flex-none text-lg font-semibold"
                              >
                                 Perintah
                              </Label>
                              <Textarea
                                 id="perintah"
                                 type="text"
                                 placeholder="Type your message here."
                                 rows={4}
                                 required
                                 value={perintah}
                                 onChange={(e) => setPerintah(e.target.value)}
                                 className="min-h-24 max-h-32 rounded-xs ring-0 focus:shadow-[0px_2px_3px_1px_rgba(0,0,0,0.5)] focus-visible:ring-0 focus-visible:border-transparent"
                              />
                           </div>
                           <Button
                              type="submit"
                              className={`w-full text-md font-normal  bg-slate-800  hover:bg-slate-700 ${
                                 url && perintah
                                    ? "hover:cursor-pointer"
                                    : "hover:cursor-not-allowed"
                              }`}
                              disabled={!url || !perintah ? true : false}
                           >
                              Generate
                           </Button>
                        </div>
                     </form>
                     {generateTitle && generateText && (
                        <DashboardOutput
                           title={generateTitle}
                           text={generateText}
                           audioRef={audioRef}
                           isPlay={isPlay}
                           setIsPlay={setIsPlay}
                           setupAudioEventListener={setupAudioEventListener}
                        />
                     )}
                  </>
               ) : (
                  <>
                     <button
                        className="p-[4px] hover:bg-slate-400 rounded absolute right-4 top-4 hover:cursor-pointer"
                        onClick={() => setClickHistory(!clickHistory)}
                     >
                        <X
                           size={20}
                           className="text-slate-800 text-4xl hover:text-slate-950"
                        />
                     </button>
                     <DashboardOutput
                        title={title}
                        text={content}
                        audioRef={audioRefFromHistory}
                        isPlay={isPlay}
                        setIsPlay={setIsPlay}
                        setupAudioEventListener={setupAudioEventListener}
                     />
                  </>
               )}
            </CardContent>
         </Card>
         {(isLoading || isLoadingFromHistory) && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/5 bg-opacity-80 z-50">
               <Loader className="w-12 h-12 animate-spin text-blue-500" />
            </div>
         )}
      </div>
   );
}
