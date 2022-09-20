import mongoose from "mongoose";
import dotenv from "dotenv-flow";

dotenv.config({
  silent: true,
});

type Config = {
  method?: string;
  username: string;
  password: string;
  serverUri: string;
  databaseName: string;
  params?: string[];
};

export class MongoDBConfig {
  private readonly dsn: string = "";

  constructor(config: Config) {
    const {
      method = "mongodb+srv",
      username,
      password,
      serverUri,
      databaseName,
      params = [],
    } = config;

    this.dsn = this.buildDsn(
      method,
      username,
      password,
      serverUri,
      databaseName,
      params
    );
  }

  private buildDsn(
    method: string,
    username: string,
    password: string,
    serverUri: string,
    databaseName: string,
    params: string[]
  ): string {
    return `${method}://${username}:${password}@${serverUri}/${databaseName}${
      params && params.length > 0 && `?${params.join("&")}`
    }`;
  }

  async connect() {
    if (!this.dsn) return;

    return await mongoose.connect(this.dsn);
  }
}

export const dbConfig = new MongoDBConfig({
  method: process.env.MONGODB_METHOD || "mongodb+srv",
  username: process.env.MONGODB_USERNAME || "",
  password: process.env.MONGODB_PASSWORD || "",
  serverUri: process.env.MONGODB_SERVER_URI || "",
  databaseName: process.env.MONGODB_DATABASE || "",
  params: process.env.MONGODB_PARAMS?.split(",") || [],
});
