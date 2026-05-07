// src/index.js

import "./src/config/env.js";
import { config } from "dotenv";
config();

import "./src/workers/email.worker.js";

console.log("Email Service Started");
