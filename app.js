//USE ANGEL AI TO FIX API FORMAT

//FIX connection to chatGPT

//finalize resume output

//indicator that work in progress

//build chatGPT connection

//fix cancel of resume download

import express from "express";
import session from "express-session";
import routes from "./routes/router.js";
import { uploadErrorHandler } from "./middleware/upload-error.js";

import CONFIG from "./config/config.js";

const { port } = CONFIG;

const app = express();

app.use(session(CONFIG.buildSessionConfig()));

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//routes
app.use(routes);

//needed for file upload
app.use(uploadErrorHandler);

app.listen(port);
