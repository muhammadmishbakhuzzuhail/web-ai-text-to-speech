import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect } from "react";
import { Pause, Play } from "lucide-react";
import { useVoice } from "./voice-context";

function DashboardOutput({
   title,
   text,
   audioRef,
   isPlay,
   setIsPlay,
   setupAudioEventListener,
}) {
   const { voiceSpeed } = useVoice();

   // SOLUSI: Setup event listener saat komponen mount atau audioRef berubah
   useEffect(() => {
      if (audioRef?.current && setupAudioEventListener) {
         setupAudioEventListener(audioRef.current);
      }
   }, [audioRef?.current, setupAudioEventListener]);

   const handlePlay = () => {
      if (!audioRef.current) return;

      // SOLUSI: Setup event listener setiap kali handlePlay dipanggil (untuk memastikan)
      if (setupAudioEventListener) {
         setupAudioEventListener(audioRef.current);
      }

      audioRef.current.playbackRate = voiceSpeed;

      if (audioRef.current.paused) {
         audioRef.current.play();
         setIsPlay(false);
      } else {
         audioRef.current.pause();
         setIsPlay(true);
      }
   };

   return (
      <div className="flex flex-col gap-4 pt-4">
         <div>
            <div className="font-semibold text-lg">Judul :</div>
            <Textarea
               className="min-h-10 max-h-24 shadow-[0px 0px] w-full outline rounded-xs focus-visible:ring-0"
               readOnly
               value={title}
            />
         </div>
         <div>
            <div className="font-semibold text-lg">Jawaban :</div>
            <Textarea
               value={text}
               readOnly
               className="min-h-40 max-h-64 shadow-[0px 0px] outline rounded-xs  focus-visible:ring-0"
               placeholder="Hasil generate"
            />
         </div>
         <Button
            type="button"
            className="self-end hover:cursor-pointer text-md font-normal bg-slate-800 hover:bg-slate-700"
            onClick={handlePlay}
         >
            {isPlay ? (
               <div className="flex items-center gap-[4px]">
                  <Play className="w-4 h-4">Play</Play>
                  <span>Play</span>
               </div>
            ) : (
               <div className="flex items-center gap-[4px]">
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
               </div>
            )}
         </Button>
      </div>
   );
}

export default DashboardOutput;
