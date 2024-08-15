import compression from "compression";
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import httpContext from "express-http-context";
import { connectDB } from "./config/db";
import notFound from "./errors/notFound";
import {
  generateRequestId,
  logRequest,
  logResponse,
} from "./middlewares/commonMiddleware";
import errorHandlerMiddleware from "./middlewares/errorHandler";
import router from "./routes";
import { ObjectId } from "mongoose";

const corsOptions: cors.CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // allowedHeaders: ["Content-Type", "Accept"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

dotenv.config({ path: `.env.${"dev"}` });

// Create Express server
const app = express();

connectDB();

app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// CORS configuration
app.use(cors(corsOptions));
app.options("*", cors);


declare global{
  namespace Express {
    interface Request {
      user: {
        _id: ObjectId;
      };
    }
  }
}

app.use(httpContext.middleware);
app.use(generateRequestId);


app.use(router);

app.use(notFound);
app.use(errorHandlerMiddleware);

export default app;
