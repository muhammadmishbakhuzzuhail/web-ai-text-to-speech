require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { Pool } = require("pg");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const { GoogleGenAI } = require("@google/genai");
const { main } = require("./text-to-speech");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;

const data = require("./mockup");

// Middleware
app.use(morgan("dev"));
app.use(
   cors({
      origin: "http://localhost:5173",
      credentials: true,
   })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
   session({
      name: "connect.session.id",
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 },
   })
);

// Connect Database
const pool = new Pool({
   user: process.env.DB_USER,
   host: process.env.DB_HOST,
   database: process.env.DB_DATABASE,
   password: process.env.DB_PASSWORD,
   port: process.env.DB_PORT,
});

// Login
app.post("/login", async (req, res) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
   }

   try {
      // Cari user berdasarkan email
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
         email,
      ]);

      if (user.rows.length === 0) {
         return res.status(404).json({ error: "Cannot find email" });
      }

      if (user.rows[0].password !== password) {
         return res.status(401).json({ error: "Incorrect password" });
      }

      // Set session jadi id users
      req.session.userId = user.rows[0].id;

      return res
         .status(200)
         .json({ message: "Login is success", id: user.rows[0].id });
   } catch (error) {
      return res.status(500).json({ error: `Login : ${error}` });
   }
});

// Register
app.post("/register", async (req, res) => {
   const { username, email, password } = req.body;

   // Semua data di form harus di isi
   if (!username || !email || !password) {
      return res.status(400).json({ error: "All field are required" });
   }

   try {
      // Cek apakah email sudah ada
      const checkEmail = await pool.query(
         "SELECT * FROM users WHERE email = $1",
         [email]
      );

      if (checkEmail.rows.length > 0) {
         return res.status(409).json({ error: "Email already exists" });
      }

      // Tambahkan user ke database
      await pool.query(
         "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
         [username, email, password]
      );

      return res.status(201).json({ message: "User registered" });
   } catch (error) {
      return res.status(500).json({ error: `Register : ${error}}` });
   }
});

// Cek Bearer
const bearerAuth = (headers) => {
   const authHeader = headers.authorization;

   // Cek header Bearer token
   if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
         .status(401)
         .json({ error: "Unauthorized. Bearer Token is empty" });
   }

   return authHeader.split(" ")[1];
};

// Authentikasi
const isAuthenticated = async (req, res, next) => {
   const token = bearerAuth(req.headers);

   try {
      // Cek bearer token UUID di database
      const checkToken = await pool.query("SELECT * FROM users WHERE id = $1", [
         token,
      ]);

      if (checkToken.rows.length === 0) {
         return res
            .status(401)
            .json({ error: "Unauthorized. Bearer Token doesnt valid" });
      }

      // Cek session token UUID
      if (!req.session) {
         return res
            .status(401)
            .json({ error: "Unauthorized. Session tidak ditemukan." });
      }

      const user = checkToken.rows[0];

      // Cek apakah session userId sama dengan user dari token
      if (req.session.userId !== user.id) {
         return res
            .status(401)
            .json({ error: "Unauthorized. Session dan token tidak cocok." });
      }
      return next();
   } catch (error) {
      return res.status(500).json({ error: `Authenticate : ${error}` });
   }
};

// Private Route
app.get("/private-route", isAuthenticated, (_req, res) => {
   return res.status(200).json({
      isAuthServer: true,
   });
});

// Logout
app.get("/logout", (req, res) => {
   req.session.destroy((err) => {
      if (err) {
         return res.status(500).json({ error: "Logout failed" });
      }

      // Hapus cookie connect.sid di browser
      res.clearCookie("connect.session.id");
      res.json({ message: "Logout berhasil" });
   });
});

// dashboard
app.get("/dashboard", (_req, res) => {
   return res.status(200).json({
      message: "Welcome to dashboard",
   });
});

app.get("/profile", async (req, res) => {
   try {
      const userId = req.session.userId;

      if (!userId) {
         return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await pool.query(
         "SELECT username FROM users WHERE id = $1",
         [userId]
      );

      if (result.rows.length === 0) {
         return res.status(404).json({ error: "User not found" });
      }

      return res.json({ username: result.rows[0].username });
   } catch (error) {
      return res.status(500).json({ error: `Profile : ${error}}` });
   }
});

// Scraping Website
app.post("/scrape", async (req, res) => {
   // Get data in the tag HTML "P"
   const { url, tagname = "p" } = req.body;

   if (!url || !tagname) {
      return res.status(400).json({ error: "url dan tagname harus diisi" });
   }

   try {
      const { data } = await axios.get(url, {
         headers: {
            "User-Agent":
               "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
         },
      });

      const $ = cheerio.load(data);
      const elements = $(tagname);
      const texts = [];

      elements.each((i, el) => {
         let text = $(el).text().replace(/\s+/g, " ").trim();

         // Hilangkan karakter escape \" jadi "
         text = text.replace(/\\"/g, '"');

         // Hanya masukkan jika teks tidak kosong
         if (text !== "") {
            texts.push(text);
         }
      });

      res.json({ result: texts });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// Generate AI
app.post("/generate", async (req, res) => {
   const { perintah, scrapeResult } = req.body;

   if (!perintah || !scrapeResult) {
      return res.status(400).json({ error: "Bad request when scrape web" });
   }

   try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const defaultInstruction = `
Kamu adalah asisten yang membantu memproses hasil scraping dari web.
Tugasmu adalah:
- Membersihkan teks dari karakter tidak penting (seperti tanda kutip, spasi ganda, karakter aneh, atau string kosong)
- Memformat ulang hasil menjadi teks biasa yang rapi dan mudah dibaca
- Output akhir wajib dalam format teks biasa (tanpa huruf tebal, miring, atau simbol tambahan lainnya)
- Bagian jawaban jika memiliki banyak paragraf bisa dipisahkan dengan 1 baris spasi
Format output yang harus diikuti:
judul : [judul artikel yang ditemukan dari konten]
[spasi 2 baris kosong]
jawaban : [isi teks utama yang sudah dibersihkan dan dirapikan, bisa terdiri dari satu atau lebih paragraf]

Jangan menambahkan kata pengantar, label tambahan, atau elemen lain di luar format di atas.

Berikut contoh output yang sesuai:
judul : Cerita Si Kancil
//spasi
//spasi
jawaban : Cerita si kancil merupakan cerita anak yang sangat populer di Indonesia. Kisah ini menceritakan tentang seekor kancil yang cerdik dan sering menggunakan kecerdikannya untuk mengelabui hewan lain yang lebih besar atau kuat.
//spasi
Melalui cerita ini, anak-anak diajarkan pentingnya berpikir cerdas, tidak mudah menyerah, serta menjunjung nilai-nilai kejujuran dan kebaikan. Cerita ini biasanya disampaikan dalam bentuk dongeng sebelum tidur atau materi pelajaran moral di sekolah dasar.

Gunakan petunjuk tambahan dari user di bawah ini untuk menyesuaikan isi atau gaya penulisan.
`;

      const fullPrompt = `
      ${defaultInstruction}

      === PERINTAH USER===
      ${perintah} 

      === HASIL SCRAPING ===
      ${scrapeResult}`;

      const response = await ai.models.generateContent({
         model: "gemini-2.0-flash",
         contents: [
            {
               role: "user",
               parts: [{ text: fullPrompt }],
            },
         ],
      });

      // Split title and text
      const parts = response.text.split("\n\n");

      const judulPart = parts[0];
      const jawabanPart = parts[1];

      const judul = judulPart.replace("judul : ", "").trim();
      const jawaban = jawabanPart.replace("jawaban : ", "").trim();

      return res.status(200).json({
         title: judul,
         text: jawaban,
      });
   } catch (error) {
      return res.status(400).json({ error: error.message });
   }
});

const MODEL_NAME = "Xenova/m2m100_418M";

let translator;
let isModelReady = false;

// Fungsi Inisialisasi Model Transformers
async function initializeModel() {
   try {
      const { pipeline } = await import("@xenova/transformers");

      translator = await pipeline("translation", MODEL_NAME);
      isModelReady = true;

      console.info(`Model M2M100 is ready.`);
   } catch (error) {
      throw new Error("Initialize : ", error);
   }
}

// Translate to another language
app.post("/translate", async (req, res) => {
   if (!isModelReady) {
      return res.status(503).json({
         message:
            "Server sedang inisialisasi model, silakan coba lagi sesaat lagi.",
      });
   }

   const { sourceVoiceLanguage, targetVoiceLanguage, text, title } = req.body;

   // Convert label language to code language
   const sourceLanguage = data.languages.find(
      (language) => language.label === sourceVoiceLanguage
   );
   const sourceLanguageCode = sourceLanguage ? sourceLanguage.code : null;

   const targetLanguage = data.languages.find(
      (language) => language.label === targetVoiceLanguage
   );
   const targetLanguageCode = targetLanguage ? targetLanguage.code : null;

   if (!targetLanguageCode || !text) {
      return res.status(400).json({
         message: "Parameter 'targetLanguageCode' dan 'text' dibutuhkan.",
      });
   }

   try {
      const result = await translator(text, {
         src_lang: sourceLanguageCode,
         tgt_lang: targetLanguageCode,
      });

      const translatedText = result[0].translation_text;

      // save ke database
      await pool.query(
         "INSERT INTO message(user_id, title, content) VALUES($1, $2, $3)",
         [req.session.userId, title, translatedText]
      );

      return res.status(200).json({ text: translatedText });
   } catch (error) {
      if (error.message.includes("is not a valid language id")) {
         return res.status(400).json({
            message: `Kode bahasa '${targetLanguageCode}' tidak valid atau tidak didukung oleh model ini.`,
         });
      }
      return res.status(500).json({
         message: "Terjadi kegagalan pada proses translasi di server.",
      });
   }
});

// Text to Speech
app.post("/speech", async (req, res) => {
   try {
      const { voiceName, text } = req.body;

      if (!text) {
         return res.status(400).json({
            success: false,
            message: "text speech cannot empty",
         });
      }

      const result = await main(voiceName, text);

      return res.status(200).json(result);
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Failed to generate speech",
         error: error.message,
      });
   }
});

// Get History Message from Database
app.get("/history-message", async (req, res) => {
   const { id } = req.query;

   if (!id) {
      return res.status(400).json({ message: "Bad Request" });
   }

   try {
      const result = await pool.query(
         "SELECT id, title, content FROM message WHERE user_id = $1 ORDER BY id ASC",
         [id]
      );
      return res.status(200).json({
         message: "success",
         historyMessage: result.rows,
      });
   } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({
         message: "error",
         error: error.message,
      });
   }
});

app.listen(PORT, () => {
   console.log(`Server berjalan di http://localhost:${PORT}`);
   initializeModel();
});
