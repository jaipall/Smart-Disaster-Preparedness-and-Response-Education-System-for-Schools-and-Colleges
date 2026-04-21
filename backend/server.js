// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import { connectDB } from "./lib/db.js";
// import drillRoutes from "./routes/drill.routes.js";
// import authRoutes from "./routes/auth.routes.js";
// import { config } from "./config/env.js";
// import alertRoutes from "./routes/alerts.routes.js";
// import { fetchNASAAlerts } from "./cron/fetchNASAAlerts.js";
// dotenv.config();
// import fetchIMDAlerts from "./cron/fetchIMDAlerts.js";
// import fetchNDMAAlerts from "./cron/fetchNDMAAlerts.js";
// const PORT = process.env.PORT || 5001;
// import gamificationRoutes from "./routes/gamification.routes.js";
// import reportRoutes from "./routes/report.routes.js";

// const app = express();
// const allowedOrigins = [
//   process.env.CLIENT_URL || "http://localhost:5173",
//   "http://localhost:5174",
//   "https://sih2025-1-pjfk.onrender.com",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   }),
// );
// app.use(cookieParser());
// app.use(express.json());
// app.use("/api/drills", drillRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/alerts", alertRoutes);
// app.use("/api/gamification", gamificationRoutes);
// app.use("/api/v1/reports", reportRoutes);
// app.get("/", (req, res) => {
//   res.send("Server Already Running.");
// });

// console.log("⏳ Fetching NASA alerts...");

// connectDB()
//   .then(() => {
//     setInterval(fetchNASAAlerts, 30 * 60 * 1000);
//     setInterval(fetchIMDAlerts, 30 * 60 * 1000);
//     setInterval(fetchNDMAAlerts, 30 * 60 * 1000);
//     app.listen(PORT, () => {
//       console.log(`Server is live at http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log("Error connecting the DB..", err.message);
//     process.exit(1);
//   });

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";
import drillRoutes from "./routes/drill.routes.js";
import authRoutes from "./routes/auth.routes.js";
import alertRoutes from "./routes/alerts.routes.js";
import gamificationRoutes from "./routes/gamification.routes.js";
import reportRoutes from "./routes/report.routes.js";

import { fetchNASAAlerts } from "./cron/fetchNASAAlerts.js";
import fetchIMDAlerts from "./cron/fetchIMDAlerts.js";
import fetchNDMAAlerts from "./cron/fetchNDMAAlerts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// -----------------------------
// ✅ CORS CONFIG 
// -----------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://sih2025-1-pjfk.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(null, false);
  },
  credentials: true,
};

// ✅ Apply CORS
app.use(cors(corsOptions));

// ✅ SAFE Preflight handler (NO CRASH)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200);
  }
  next();
});

// -----------------------------
// ✅ MIDDLEWARE
// -----------------------------
app.use(express.json());

app.use(cookieParser());

// -----------------------------
// ✅ ROUTES
// -----------------------------
app.use("/api/drills", drillRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/v1/reports", reportRoutes);

// -----------------------------
// ✅ TEST ROUTE
// -----------------------------
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

console.log("⏳ Fetching NASA alerts...");

// -----------------------------
// ✅ START SERVER
// -----------------------------
connectDB()
  .then(() => {
    console.log("✅ DB Connected");

    setInterval(fetchNASAAlerts, 30 * 60 * 1000);
    setInterval(fetchIMDAlerts, 30 * 60 * 1000);
    setInterval(fetchNDMAAlerts, 30 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  });
