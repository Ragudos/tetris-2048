import Logger from "./lib/log/Logger";

/**
 *
 * Stores big libraries to accommodate
 * the loading screen with meaningful messages
 *
 */
export class Libraries {
  private static LOGGER: Logger;
  private static PIXI: Awaited<typeof import("pixi.js")>;
  private static PIXI_SETTINGS: Awaited<typeof import("@pixi/settings")>;
  private static ZOD: Awaited<typeof import("zod")>;

  static {
    Libraries.LOGGER = Logger.createLogger("Libraries");
  }

  static async importPIXI(): Promise<void> {
    Libraries.LOGGER.info("Importing pixi.js");
    Libraries.PIXI = await import("pixi.js");
    Libraries.LOGGER.info("Imported pixi.js");
  }

  static async importPIXI_SETTINGS(): Promise<void> {
    Libraries.LOGGER.info("Importing @pixi/settings");
    Libraries.PIXI_SETTINGS = await import("@pixi/settings");
    Libraries.LOGGER.info("Imported @pixi/settings");
  }

  static async importZOD(): Promise<void> {
    Libraries.LOGGER.info("Importing zod");
    Libraries.ZOD = await import("zod");
    Libraries.LOGGER.info("Imported zod");
  }

  static getPIXI(): typeof Libraries.PIXI {
    if (Libraries.PIXI === undefined) {
      throw new Error("PIXI is not yet imported.");
    }

    return Libraries.PIXI;
  }

  static getPIXI_SETTINGS(): typeof Libraries.PIXI_SETTINGS {
    if (Libraries.PIXI_SETTINGS === undefined) {
      throw new Error("PIXI_SETTINGS is not yet imported.");
    }

    return Libraries.PIXI_SETTINGS;
  }

  static getZOD(): typeof Libraries.ZOD {
    if (Libraries.ZOD === undefined) {
      throw new Error("ZOD is not yet imported.");
    }

    return Libraries.ZOD;
  }
}
