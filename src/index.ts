import Game from "./Game";
import { Libraries } from "./Libraries";
import Logger from "./modules/log/Logger";

window.addEventListener("DOMContentLoaded", init);

async function init(): Promise<void> {
  const logger = Logger.createLogger("init");

  logger.groupCollapsed("Loading Libraries", "Loading necessary libraries");
  await Libraries.importZOD();
  await Libraries.importPIXI();
  logger.groupEnd();
  logger.groupCollapsed("Loading Assets", "Loading necessary assets");
  logger.info("Loading spritesheet");
  await Libraries.getPIXI().Assets.load("/spritesheet/data.json");
  logger.groupEnd();

  const game = new Game({
    container: document.getElementById("game-container"),
  });

  await game.initialize();
  game.start();
}
