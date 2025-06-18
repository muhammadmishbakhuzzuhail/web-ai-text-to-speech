import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { DashboardForm } from "@/components/dashboard-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HistoryMessage from "@/components/history-message";
import Fitur from "@/components/fitur";
import { VoiceProvider } from "@/components/voice-context";
import { Settings } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { HistoryProvider } from "@/components/history-context";
import { AudioProvider } from "@/components/audio-context";

const Profile = () => {
   const [username, setUsername] = useState("");

   useEffect(() => {
      async function fetchUsername() {
         try {
            const response = await axios.get("http://localhost:3000/profile", {
               withCredentials: true,
            });

            setUsername(response.data.username);
         } catch (error) {
            throw new Error(`Profile : ${error}`);
         }
      }

      fetchUsername();
   }, []);

   return (
      <div className="flex flex-row gap-[12px] items-center">
         <div className="font-semibold font-mono text-slate-900">
            {username}
         </div>
         <Avatar className="scale-110">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
         </Avatar>
      </div>
   );
};

export default function Dashboard() {
   const [settingIsOpen, setSettingIsOpen] = useState(false);

   const navigate = useNavigate();

   const handleLogout = async () => {
      try {
         localStorage.removeItem("token");

         await axios.get("http://localhost:3000/logout", {
            withCredentials: true,
         });

         // hapus storage
         localStorage.removeItem("token");
         localStorage.removeItem("voiceCharacter");
         localStorage.removeItem("voiceSpeed");
         localStorage.removeItem("sourceVoiceLanguage");
         localStorage.removeItem("targetVoiceLanguage");

         navigate("/login");
      } catch (error) {
         throw new Error(`Logout: ${error}`);
      }
   };

   return (
      <div className="">
         <VoiceProvider>
            <HistoryProvider>
               <AudioProvider>
                  {/* header */}
                  <div className="fixed left-0 top-0 right-0 w-full px-6 flex justify-between items-center border-b-[2px] border-b-blue-500">
                     <Logo />
                     <div className="flex gap-4 justify-center items-center">
                        <Profile />
                        <Button
                           variant="destructive"
                           className="bg-red-500 font-normal scale-90 text-md"
                           onClick={handleLogout}
                        >
                           Logout
                        </Button>
                     </div>
                  </div>
                  {/* history chat */}
                  <HistoryMessage />
                  {/* main */}
                  <div className="flex min-h-svh w-full justify-center p-6 md:p-10">
                     <div className="w-full flex flex-col mt-16 gap-8 items-center">
                        <DashboardForm />
                     </div>
                  </div>
                  <button
                     onClick={() => setSettingIsOpen(!settingIsOpen)}
                     type="button"
                     className="group hover:cursor-pointer z-10  top-[94px] right-8 absolute hover:bg-slate-400 hover:rounded-md p-2"
                  >
                     <Settings className="w-6 aspect-square text-10xl text-slate-600  group-active:text-slate-950 group-hover:text-slate-800" />
                  </button>
                  {/* fitur */}
                  <div
                     className={`transition-opacity duration-700 ${
                        settingIsOpen
                           ? "opacity-100"
                           : "opacity-0 pointer-events-none"
                     }`}
                  >
                     <Fitur />
                  </div>
               </AudioProvider>
            </HistoryProvider>
         </VoiceProvider>
      </div>
   );
}
