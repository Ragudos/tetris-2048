import Game from "./Game";
import Logger from "./lib/log/Logger";
import Scorer from "./lib/scorer/Scorer";
import { Libraries } from "./Libraries";

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
  await Scorer.getInstance().initialize();
  await game.initialize();

  game.start();
}
