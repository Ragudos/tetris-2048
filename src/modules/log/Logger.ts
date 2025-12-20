export default class Logger {
  private name: string;
  private groupStack: { name: string }[] = [];
  private colors;

  constructor(name: string) {
    this.name = name;
    this.groupStack = [];
    this.colors = {
      INFO: "\x1b[36m", // cyan
      WARN: "\x1b[33m", // yellow
      ERROR: "\x1b[31m", // red
      HEADER: "\x1b[90m", // gray
      GROUP: "\x1b[90m", // magenta
      RESET: "\x1b[0m",
    };
  }

  static createLogger(name: string) {
    return new Logger(name);
  }

  private dateNow(): string {
    const now = new Date();
    const date = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const ms = now.getMilliseconds().toString().padStart(3, "0");
    return `${date} at ${time}.${ms}`;
  }

  private header(level: "INFO" | "WARN" | "ERROR") {
    const levelStr = this.colors[level] + level + this.colors.RESET;
    const headerStr = `[${this.dateNow()}][${this.name}]`;
    const headerColored = this.colors.HEADER + headerStr + this.colors.RESET;
    return `${levelStr} ${headerColored}`;
  }

  private write(level: "INFO" | "WARN" | "ERROR", messages: string[]) {
    if (__TEST__) return;

    const head = this.header(level);

    messages.forEach((m) => {
      console.groupCollapsed(`${head} - ${m}`);
      console.trace();
      console.groupEnd();
    });
  }

  info(...messages: string[]) {
    this.write("INFO", messages);
  }

  warn(...messages: string[]) {
    this.write("WARN", messages);
  }

  error(...messages: string[]) {
    this.write("ERROR", messages);

    // biome-ignore lint/suspicious/noDebugger: every error will be debugged
    if (!__TEST__ && __DEV__) debugger;
  }

  private groupHeader(name: string, message: string) {
    const headerStr = `[${this.dateNow()}][${this.name}]`;
    const headerColored = this.colors.HEADER + headerStr + this.colors.RESET;
    return `${this.colors.GROUP}GROUP ${name}${this.colors.RESET} ${headerColored} - ${message}`;
  }

  group(name: string, message: string) {
    if (__TEST__) return;

    console.group(this.groupHeader(name, message));
    this.groupStack.push({ name });
    console.time(name);
  }

  groupCollapsed(name: string, message: string) {
    if (__TEST__) return;

    console.groupCollapsed(this.groupHeader(name, message));
    this.groupStack.push({ name });
    console.time(name);
  }

  groupEnd() {
    if (__TEST__) return;

    if (this.groupStack.length > 0) {
      const group = this.groupStack.pop();

      console.timeEnd(group?.name);
    }
    console.groupEnd();
  }
}
