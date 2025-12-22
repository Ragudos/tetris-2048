export default class Logger {
  private name: string;
  private groupStack: { name: string }[] = [];
  private styles;

  constructor(name: string) {
    this.name = name;
    this.groupStack = [];
    this.styles = {
      INFO: "color:#0ea5e9;font-weight:600",
      WARN: "color:#f59e0b;font-weight:600",
      ERROR: "color:#ef4444;font-weight:600",
      HEADER: "color:#6b7280",
      GROUP: "color:#6b7280;font-weight:600",
      RESET: "",
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
    const header = `[${this.dateNow()}][${this.name}]`;
    return {
      format: `%c${level}%c ${header}`,
      styles: [this.styles[level], this.styles.HEADER],
    };
  }

  private supportGroup(): boolean {
    return typeof console.groupCollapsed === "function";
  }

  private write(
    level: "INFO" | "WARN" | "ERROR",
    messages: string[],
    ignoreDepth = 3
  ) {
    if (__TEST__) return;

    const logFn = console[level.toLowerCase() as "info" | "warn" | "error"];
    const useGroup = this.supportGroup();

    messages.forEach((message) => {
      let stack = new Error().stack;
      const head = this.header(level);

      if (!stack) {
        logFn(`${head.format} ${message}`, ...head.styles);
        return;
      }

      stack = stack.split("\n").splice(ignoreDepth).join("\n");

      if (useGroup) {
        console.groupCollapsed(head.format, ...head.styles);
        logFn(message);
        logFn(stack);
        console.groupEnd();
      } else {
        logFn(`${head.format} ${message}`, ...head.styles);
        logFn(stack);
      }
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
    const header = `[${this.dateNow()}][${this.name}]`;
    return {
      format: `%cGROUP ${name}%c ${header} — ${message}`,
      styles: [this.styles.GROUP, this.styles.HEADER],
    };
  }

  group(name: string, message: string) {
    if (__TEST__) return;

    const h = this.groupHeader(name, message);

    if (!this.supportGroup()) {
      console.log(h.format, ...h.styles, "\nGROUP {\n");
    } else {
      console.group(h.format, ...h.styles);
    }

    this.groupStack.push({ name });
    console.time(name);
  }

  groupCollapsed(name: string, message: string) {
    if (__TEST__) return;

    const h = this.groupHeader(name, message);
    if (!this.supportGroup()) {
      console.log(h.format, ...h.styles, "\nGROUP: {");
    } else {
      console.group(h.format, ...h.styles);
    }

    this.groupStack.push({ name });
    console.time(name);
  }

  groupEnd() {
    if (__TEST__) return;

    if (this.groupStack.length > 0) {
      const group = this.groupStack.pop();

      console.timeEnd(group?.name);
    }

    if (!this.supportGroup()) {
      console.log("} END GROUP\n");
    } else {
      console.groupEnd();
    }
  }
}
