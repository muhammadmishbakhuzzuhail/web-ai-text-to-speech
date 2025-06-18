import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from "@/components/ui/command";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
} from "@/components/ui/form";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { useVoice } from "./voice-context";
import { Slider } from "./ui/slider";
import { useEffect } from "react";

const languages = [
   { label: "Afrikaans", code: "af" },
   { label: "Amharic", code: "am" },
   { label: "Arabic", code: "ar" },
   { label: "Asturian", code: "ast" },
   { label: "Azerbaijani", code: "az" },
   { label: "Bashkir", code: "ba" },
   { label: "Belarusian", code: "be" },
   { label: "Bulgarian", code: "bg" },
   { label: "Bengali", code: "bn" },
   { label: "Breton", code: "br" },
   { label: "Bosnian", code: "bs" },
   { label: "Catalan; Valencian", code: "ca" },
   { label: "Cebuano", code: "ceb" },
   { label: "Czech", code: "cs" },
   { label: "Welsh", code: "cy" },
   { label: "Danish", code: "da" },
   { label: "German", code: "de" },
   { label: "Greeek", code: "el" },
   { label: "English", code: "en" },
   { label: "Spanish", code: "es" },
   { label: "Estonian", code: "et" },
   { label: "Persian", code: "fa" },
   { label: "Fulah", code: "ff" },
   { label: "Finnish", code: "fi" },
   { label: "French", code: "fr" },
   { label: "Western Frisian", code: "fy" },
   { label: "Irish", code: "ga" },
   { label: "Gaelic; Scottish Gaelic", code: "gd" },
   { label: "Galician", code: "gl" },
   { label: "Gujarati", code: "gu" },
   { label: "Hausa", code: "ha" },
   { label: "Hebrew", code: "he" },
   { label: "Hindi", code: "hi" },
   { label: "Croatian", code: "hr" },
   { label: "Haitian; Haitian Creole", code: "ht" },
   { label: "Hungarian", code: "hu" },
   { label: "Armenian", code: "hy" },
   { label: "Indonesian", code: "id" },
   { label: "Igbo", code: "ig" },
   { label: "Iloko", code: "ilo" },
   { label: "Icelandic", code: "is" },
   { label: "Italian", code: "it" },
   { label: "Japanese", code: "ja" },
   { label: "Javanese", code: "jv" },
   { label: "Georgian", code: "ka" },
   { label: "Kazakh", code: "kk" },
   { label: "Central Khmer", code: "km" },
   { label: "Kannada", code: "kn" },
   { label: "Korean", code: "ko" },
   { label: "Luxembourgish; Letzeburgesch", code: "lb" },
   { label: "Ganda", code: "lg" },
   { label: "Lingala", code: "ln" },
   { label: "Lao", code: "lo" },
   { label: "Lithuanian", code: "lt" },
   { label: "Latvian", code: "lv" },
   { label: "Malagasy", code: "mg" },
   { label: "Macedonian", code: "mk" },
   { label: "Malayalam", code: "ml" },
   { label: "Mongolian", code: "mn" },
   { label: "Marathi", code: "mr" },
   { label: "Malay", code: "ms" },
   { label: "Burmese", code: "my" },
   { label: "Nepali", code: "ne" },
   { label: "Dutch; Flemish", code: "nl" },
   { label: "Norwegian", code: "no" },
   { label: "Northern Sotho", code: "ns" },
   { label: "Occitan (post 1500)", code: "oc" },
   { label: "Oriya", code: "or" },
   { label: "Panjabi; Punjabi", code: "pa" },
   { label: "Polish", code: "pl" },
   { label: "Pushto; Pashto", code: "ps" },
   { label: "Portuguese", code: "pt" },
   { label: "Romanian; Moldavian; Moldovan", code: "ro" },
   { label: "Russian", code: "ru" },
   { label: "Sindhi", code: "sd" },
   { label: "Sinhala; Sinhalese", code: "si" },
   { label: "Slovak", code: "sk" },
   { label: "Slovenian", code: "sl" },
   { label: "Somali", code: "so" },
   { label: "Albanian", code: "sq" },
   { label: "Serbian", code: "sr" },
   { label: "Swati", code: "ss" },
   { label: "Sundanese", code: "su" },
   { label: "Swedish", code: "sv" },
   { label: "Swahili", code: "sw" },
   { label: "Tamil", code: "ta" },
   { label: "Thai", code: "th" },
   { label: "Tagalog", code: "tl" },
   { label: "Tswana", code: "tn" },
   { label: "Turkish", code: "tr" },
   { label: "Ukrainian", code: "uk" },
   { label: "Urdu", code: "ur" },
   { label: "Uzbek", code: "uz" },
   { label: "Vietnamese", code: "vi" },
   { label: "Wolof", code: "wo" },
   { label: "Xhosa", code: "xh" },
   { label: "Yiddish", code: "yi" },
   { label: "Yoruba", code: "yo" },
   { label: "Chinese", code: "zh" },
   { label: "Zulu", code: "zu" },
];

const characters = [
   { label: "Zephyr", value: "Zephyr" },
   { label: "Puck", value: "Puck" },
   { label: "Charon", value: "Charon" },
   { label: "Kore", value: "Kore" },
   { label: "Fenrir", value: "Fenrir" },
   { label: "Leda", value: "Leda" },
   { label: "Orus", value: "Orus" },
   { label: "Aoede", value: "Aoede" },
   { label: "Callirrhoe", value: "Callirrhoe" },
   { label: "Autonoe", value: "Autonoe" },
   { label: "Enceladus", value: "Enceladus" },
   { label: "Iapetus", value: "Iapetus" },
   { label: "Umbriel", value: "Umbriel" },
   { label: "Algieba", value: "Algieba" },
   { label: "Despina", value: "Despina" },
   { label: "Erinome", value: "Erinome" },
   { label: "Algenib", value: "Algenib" },
   { label: "Rasalgethi", value: "Rasalgethi" },
   { label: "Laomedeia", value: "Laomedeia" },
   { label: "Achernar", value: "Achernar" },
   { label: "Alnilam", value: "Alnilam" },
   { label: "Schedar", value: "Schedar" },
   { label: "Gacrux", value: "Gacrux" },
   { label: "Pulcherrima", value: "Pulcherrima" },
   { label: "Achird", value: "Achird" },
   { label: "Zubenelgenubi", value: "Zubenelgenubi" },
   { label: "Vindemiatrix", value: "Vindemiatrix" },
   { label: "Sadachbia", value: "Sadachbia" },
   { label: "Sadaltager", value: "Sadaltager" },
   { label: "Sulafat", value: "Sulafat" },
];

export default function Fitur() {
   const {
      voiceCharacter,
      setVoiceCharacter,
      voiceSpeed,
      setVoiceSpeed,
      targetVoiceLanguage,
      setTargetVoiceLanguage,
      sourceVoiceLanguage,
      setSourceVoiceLanguage,
   } = useVoice();

   const form = useForm();

   // set default
   useEffect(() => {
      localStorage.setItem("targetVoiceLanguage", "Indonesian");
      localStorage.setItem("sourceVoiceLanguage", "Indonesian");
      localStorage.setItem("voiceCharacter", "Zephyr");
      localStorage.setItem("voiceSpeed", "1.0");
   }, []);

   const onSubmit = () => {
      localStorage.setItem(
         "targetVoiceLanguage",
         targetVoiceLanguage.toString()
      );
      localStorage.setItem("voiceLanguage", sourceVoiceLanguage.toString());
      localStorage.setItem("voiceCharacter", voiceCharacter.toString());
      localStorage.setItem("voiceSpeed", voiceSpeed.toString());

      alert(
         `voiceCharacter: ${voiceCharacter}, voiceSpeed: ${voiceSpeed}, targetVoiceLanguage: ${targetVoiceLanguage}, sourceVoiceLanguage: ${sourceVoiceLanguage}`
      );
   };

   return (
      <div className="fixed right-4 top-4 w-64 bg-blue-100 my-[62px] rounded-lg p-4 border-[1px] border-blue-400 hover:shadow-[4px_4px_5px_rgba(0,0,0,0.5)]">
         <div className="text-center ">
            <span className=" bg-blue-500 text-white px-2 rounded-xs">
               FITUR
            </span>
         </div>
         <Form {...form}>
            <form
               onSubmit={form.handleSubmit(onSubmit)}
               className="space-y-2 pt-4"
            >
               {/* Speed Rate */}
               <FormField
                  control={form.control}
                  name="speed"
                  render={() => (
                     <FormItem className="flex flex-col items-center">
                        <FormLabel className="mr-auto px-[10px]">
                           Speed Rate
                        </FormLabel>
                        <FormControl>
                           <Slider
                              min={0.25}
                              max={2}
                              step={0.25}
                              defaultValue={[parseFloat(voiceSpeed) || 1.0]}
                              onValueChange={(value) => {
                                 const newValue = value[0];
                                 form.setValue(
                                    "voiceSpeed",
                                    newValue.toString()
                                 );
                                 setVoiceSpeed(newValue); // context
                              }}
                              className="w-full px-4 pt-[12px]"
                           />
                        </FormControl>
                        <div className="text-sm text-slate-700">
                           Speed: {voiceSpeed}x
                        </div>
                     </FormItem>
                  )}
               />
               {/* Voice Character */}
               <FormField
                  control={form.control}
                  name="character"
                  render={({ field }) => (
                     <FormItem className="flex flex-col items-center">
                        <FormLabel className="mr-auto px-[10px]">
                           Character
                        </FormLabel>
                        <Popover>
                           <PopoverTrigger asChild>
                              <FormControl>
                                 <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                       "w-[200px] justify-between my-2",
                                       !field.value && "text-muted-foreground"
                                    )}
                                 >
                                    {field.value
                                       ? characters.find(
                                            (character) =>
                                               character.value === field.value
                                         )?.label
                                       : voiceCharacter}
                                    <ChevronsUpDown className="opacity-50" />
                                 </Button>
                              </FormControl>
                           </PopoverTrigger>
                           <PopoverContent className="w-[200px] p-0">
                              <Command>
                                 <CommandInput
                                    placeholder="Search character..."
                                    className="h-9"
                                 />
                                 <CommandList>
                                    <CommandEmpty>
                                       No Voice Character Found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                       {characters.map((character) => (
                                          <CommandItem
                                             value={character.label}
                                             key={character.value}
                                             onSelect={() => {
                                                form.setValue(
                                                   "character",
                                                   character.value
                                                );
                                                setVoiceCharacter(
                                                   character.value
                                                ); // context
                                             }}
                                          >
                                             {character.label}
                                             <Check
                                                className={cn(
                                                   "ml-auto",
                                                   character.value ===
                                                      field.value
                                                      ? "opacity-100"
                                                      : "opacity-0"
                                                )}
                                             />
                                          </CommandItem>
                                       ))}
                                    </CommandGroup>
                                 </CommandList>
                              </Command>
                           </PopoverContent>
                        </Popover>
                     </FormItem>
                  )}
               />
               {/* Source Voice Language */}
               <FormField
                  control={form.control}
                  name="sourceVoiceLanguage"
                  render={({ field }) => (
                     <FormItem className="flex flex-col items-center">
                        <FormLabel className="mr-auto px-[10px]">
                           Source Language
                        </FormLabel>
                        <Popover>
                           <PopoverTrigger asChild>
                              <FormControl>
                                 <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                       "w-[200px] justify-between my-2",
                                       !field.value && "text-muted-foreground"
                                    )}
                                 >
                                    {field.value
                                       ? languages.find(
                                            (language) =>
                                               language.label === field.value
                                         )?.label
                                       : sourceVoiceLanguage}
                                    <ChevronsUpDown className="opacity-50" />
                                 </Button>
                              </FormControl>
                           </PopoverTrigger>
                           <PopoverContent className="w-[200px] p-0">
                              <Command>
                                 <CommandInput
                                    placeholder="Search source language..."
                                    className="h-9"
                                 />
                                 <CommandList>
                                    <CommandEmpty>
                                       No Source Voice Language found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                       {languages.map((language) => (
                                          <CommandItem
                                             value={language.label}
                                             key={language.label}
                                             onSelect={() => {
                                                form.setValue(
                                                   "sourceVoiceLanguage",
                                                   language.label
                                                );
                                                setSourceVoiceLanguage(
                                                   language.label
                                                ); // context
                                             }}
                                          >
                                             {language.label}
                                             <Check
                                                className={cn(
                                                   "ml-auto",
                                                   language.label ===
                                                      field.value
                                                      ? "opacity-100"
                                                      : "opacity-0"
                                                )}
                                             />
                                          </CommandItem>
                                       ))}
                                    </CommandGroup>
                                 </CommandList>
                              </Command>
                           </PopoverContent>
                        </Popover>
                     </FormItem>
                  )}
               />
               {/* Target Voice Language */}
               <FormField
                  control={form.control}
                  name="targetVoiceLanguage"
                  render={({ field }) => (
                     <FormItem className="flex flex-col items-center">
                        <FormLabel className="mr-auto px-[10px]">
                           Target Language
                        </FormLabel>
                        <Popover>
                           <PopoverTrigger asChild>
                              <FormControl>
                                 <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                       "w-[200px] justify-between my-2",
                                       !field.value && "text-muted-foreground"
                                    )}
                                 >
                                    {field.value
                                       ? languages.find(
                                            (language) =>
                                               language.label === field.value
                                         )?.label
                                       : targetVoiceLanguage}
                                    <ChevronsUpDown className="opacity-50" />
                                 </Button>
                              </FormControl>
                           </PopoverTrigger>
                           <PopoverContent className="w-[200px] p-0">
                              <Command>
                                 <CommandInput
                                    placeholder="Search target language..."
                                    className="h-9"
                                 />
                                 <CommandList>
                                    <CommandEmpty>
                                       No Target Voice Language found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                       {languages.map((language) => (
                                          <CommandItem
                                             value={language.label}
                                             key={language.code}
                                             onSelect={() => {
                                                form.setValue(
                                                   "targetVoiceLanguage",
                                                   language.label
                                                );
                                                setTargetVoiceLanguage(
                                                   language.label
                                                ); // context
                                             }}
                                          >
                                             {language.label}
                                             <Check
                                                className={cn(
                                                   "ml-auto",
                                                   language.label ===
                                                      field.value
                                                      ? "opacity-100"
                                                      : "opacity-0"
                                                )}
                                             />
                                          </CommandItem>
                                       ))}
                                    </CommandGroup>
                                 </CommandList>
                              </Command>
                           </PopoverContent>
                        </Popover>
                     </FormItem>
                  )}
               />
               <div className="flex scale-90">
                  <Button type="submit" className="ml-auto font-normal">
                     Save
                  </Button>
               </div>
            </form>
         </Form>
      </div>
   );
}
