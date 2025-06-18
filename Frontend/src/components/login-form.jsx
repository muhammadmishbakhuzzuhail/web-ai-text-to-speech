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
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginForm({ className, ...props }) {
   const navigate = useNavigate();

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [errorMsg, setErrorMsg] = useState("");

   const handleSubmit = async (e) => {
      e.preventDefault();
      setErrorMsg("");

      try {
         const response = await axios.post(
            "http://localhost:3000/login",
            {
               email,
               password,
            },
            {
               withCredentials: true,
            }
         );

         localStorage.setItem("token", response.data.id);

         navigate("/dashboard");
      } catch (error) {
         if (
            error.response &&
            error.response.data &&
            error.response.data.error
         ) {
            setErrorMsg(error.response.data.error);
         } else {
            setErrorMsg("Terjadi kesalahan saat login.");
         }
      }
   };
   return (
      <div className="relative">
         <span
            className="absolute inset-[-1px] rounded-sm
    bg-[conic-gradient(at_50%_50%,_#bfdbfe)] blur-sm opacity-75"
         ></span>

         <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="rounded-sm gap-4 z-10 border-blue-300">
               <CardHeader>
                  <CardTitle className="flex justify-center">
                     <div className="">
                        <span className="text-3xl font-extrabold font-mono bg-gradient-to-t from-blue-800 to-blue-400 bg-clip-text text-transparent">
                           Login
                        </span>
                     </div>
                  </CardTitle>
                  <CardDescription>
                     Enter your email below to login to your account
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit} autoComplete="off">
                     <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                           <Label htmlFor="email">Email</Label>
                           <div className="relative">
                              <Input
                                 id="email"
                                 type="email"
                                 placeholder="username@example.com"
                                 required
                                 value={email}
                                 onChange={(e) => setEmail(e.target.value)}
                                 className={cn(
                                    "peer bg-white border-none outline-none focus-visible:border-0 focus-visible:ring-0 selection:bg-none aria-invalid:ring-0 aria-invalid:border-0 ",
                                    className
                                 )}
                              />
                              <span className="absolute rounded-md inset-0 -z-10 translate-y-[1px] bg-blue-400 peer-focus:shadow-sm peer-focus:shadow-blue-300"></span>
                           </div>
                        </div>
                        <div className="grid gap-2">
                           <div className="flex items-center">
                              <Label htmlFor="password">Password</Label>
                           </div>
                           <div className="relative">
                              <Input
                                 id="password"
                                 type="password"
                                 placeholder="******"
                                 required
                                 value={password}
                                 onChange={(e) => setPassword(e.target.value)}
                                 className={cn(
                                    "peer bg-white border-none outline-none focus-visible:border-0 focus-visible:ring-0 selection:bg-none aria-invalid:ring-0 aria-invalid:border-0",
                                    className
                                 )}
                              />
                              <span className="absolute rounded-md inset-0 -z-10 translate-y-[1px] bg-blue-400 peer-focus:shadow-sm peer-focus:shadow-blue-300"></span>
                           </div>
                        </div>
                        {errorMsg && (
                           <div className="text-sm text-red-500 text-center">
                              {errorMsg}
                           </div>
                        )}
                        <Button
                           type="submit"
                           className="w-full bg-slate-800 border-sm hover:bg-slate-700"
                        >
                           Submit
                        </Button>
                     </div>
                     <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <a
                           href="/register"
                           className="underline underline-offset-4 text-blue-900 hover:text-blue-700"
                        >
                           <span className="text-blue-900 hover:text-blue-700">
                              Register
                           </span>
                        </a>
                     </div>
                  </form>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
