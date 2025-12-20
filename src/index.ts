import Game from "./Game";
import { Libraries } from "./Libraries";
import Logger from "./modules/log/Logger";

window.addEventListener("DOMContentLoaded", init);

async function init(): Promise<void> {
  const logger = Logger.createLogger("init");

  logger.groupCollapsed("Loading Libraries", "Loading necessary libraries");
  await Libraries.importZOD();
  await Libraries.importPIXI();
  await Libraries.importPIXI_SETTINGS();
  logger.groupEnd();
  logger.groupCollapsed("Loading Assets", "Loading necessary assets");
  logger.info("Loading spritesheet");
  await Libraries.getPIXI().Assets.load("/spritesheet/data.json");
  logger.groupEnd();

  const game = new Game();
  const gameContainer = document.getElementById("game-container");

  if (!gameContainer) {
    logger.error("Game container doesn't exist");

    return;
  }

  gameContainer.appendChild(game.getTetrisContainer().getElement());
  await game.initialize();

  game.start();
}
