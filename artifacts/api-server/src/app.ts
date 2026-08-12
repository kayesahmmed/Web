import express, { type Express } from "express";
import cors from "cors";
import pinoHttpModule, { pinoHttp as pinoHttpFn } from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const pinoHttp = typeof pinoHttpFn === "function" ? pinoHttpFn : (pinoHttpModule as any);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
