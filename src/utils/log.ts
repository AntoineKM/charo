import chalk from "chalk";

export const prefixes = {
  wait: chalk.cyan("wait") + "  -",
  error: chalk.red("error") + " -",
  warn: chalk.yellow("warn") + "  -",
  ready: chalk.green("ready") + " -",
  info: chalk.cyan("info") + "  -",
  event: chalk.magenta("event") + " -",
};

const Log = {
  info: (...message: any[]) => console.log(prefixes.info, ...message),
  warn: (...message: any[]) => console.warn(prefixes.warn, ...message),
  error: (...message: any[]) => console.error(prefixes.error, ...message),
  ready: (...message: any[]) => console.log(prefixes.ready, ...message),
  wait: (...message: any[]) => console.log(prefixes.wait, ...message),
  event: (...message: any[]) => console.log(prefixes.event, ...message),
};

export default Log;
