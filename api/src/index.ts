import dotenv from "dotenv-flow";
import Log from "./utils/log";
import { dbConfig } from "./services/mongodb/config";
import fastify from "fastify";
import routes from "./routes";
import cors from "@fastify/cors";

const main = async () => {
  // load dotenv files
  dotenv.config({
    default_node_env: "development",
    silent: true,
  });
  Log.info(`current env ${process.env.NODE_ENV}`);

  // log dotenv files in console
  dotenv
    .listDotenvFiles(".", process.env.NODE_ENV)
    .forEach((file) => Log.info(`loaded env from ${file}`));

  await dbConfig.connect();
  Log.event("connected to mongodb");

  // // launch tasks from tasks folder with fs
  // const tasks = fs.readdirSync(path.join(__dirname, "tasks"));
  // tasks.forEach((task) => {
  //   // eslint-disable-next-line @typescript-eslint/no-var-requires
  //   const taskModule = require(`./tasks/${task}`);
  //   Log.info(`launching task ${task}`);
  //   taskModule.default();
  // });

  const app = fastify({
    trustProxy: true,
  });

  app.register(routes);
  app.register(cors);

  const address = await app.listen(
    process.env.PORT || 8000,
    process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost"
  );
  Log.ready(`started server on ${address}`);
};

main();
