import Cloneable from "@/common/Cloneable";
import { Libraries } from "@/Libraries";
import type { ZodNumber, ZodObject, ZodOptional } from "zod";
import type { $strip } from "zod/v4/core";
import Logger from "@log/Logger";
import Initializeable from "@/common/Initializeable";

export default class Scorer implements Initializeable {
  static readonly SAVED_SCORE_KEY = "__TETRIS__Score";
  private static instance: Scorer;
  private logger: Logger;
  private savedScore: ScoreData | undefined;
  private score: ScoreData;

  private constructor() {
    this.logger = Logger.createLogger("Scorer");
    this.score = new ScoreData(1, 0);
  }

  static getInstance(): Scorer {
    if (Scorer.instance === undefined) {
      Scorer.instance = new Scorer();
    }

    return Scorer.instance;
  }

  async initialize(): Promise<void> {
    this.logger.groupCollapsed("Scorer Initializer", "Initializing Scorer");
    this.logger.info("Initialize ScoreData static instance");
    ScoreData.init();
    this.logger.info("Getting saved score");

    const rawSavedScore = localStorage.getItem(Scorer.SAVED_SCORE_KEY);

    this.logger.info("Validating saved score");

    const parseResult = await ScoreData.getSCHEMA().safeParseAsync(
      rawSavedScore || undefined
    );

    if (parseResult.error) {
      this.logger.error("Invalid saved score... Deleting");
      localStorage.removeItem(Scorer.SAVED_SCORE_KEY);
    } else {
      this.logger.info("Saved score is valid.");

      this.savedScore = parseResult.data
        ? ScoreData.fromJSON(parseResult.data)
        : undefined;
    }

    this.logger.groupEnd();
  }

  getSavedScore(): ScoreData | undefined {
    return this.savedScore;
  }

  getScoreData(): ScoreData {
    return this.score;
  }
}

export class ScoreData implements Cloneable<ScoreData> {
  private static SCHEMA: ZodOptional<
    ZodObject<
      {
        level: ZodNumber;
        score: ZodNumber;
      },
      $strip
    >
  >;
  private level: number;
  private score: number;

  constructor(level: number, score: number) {
    this.level = level;
    this.score = score;
  }

  static fromJSON(obj: { level: number; score: number }): ScoreData {
    return new ScoreData(obj.level, obj.score);
  }

  static init(): void {
    ScoreData.SCHEMA = Libraries.getZOD()
      .object({
        level: Libraries.getZOD().number(),
        score: Libraries.getZOD().number(),
      })
      .optional();
  }

  static getSCHEMA(): typeof ScoreData.SCHEMA {
    return ScoreData.SCHEMA;
  }

  clone(): ScoreData {
    return new ScoreData(this.level, this.score);
  }

  getLevel(): number {
    return this.level;
  }

  getScore(): number {
    return this.score;
  }
}
