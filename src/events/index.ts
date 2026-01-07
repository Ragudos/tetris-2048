import type { Rotation, TetrominoNames } from "../modules/tetris/constants";
import type Vec2D from "../phys/Vec2D";

export const TETRIS_EVENT_NAMES = Object.freeze({
  LOCK: {
    ANIMATION: {
      REQUEST_BEGIN: "lock:animation:request_begin",
    },
    PLACE: "lock:place",
  },
  ACTIVE_PIECE: {
    MOVE: "active_piece:move",
    COLLIDE: "active_piece:collide",
    ROTATE: "active_piece:rotate",
    SPAWN: "active_piece:spawn",
  },
  BAG: {
    HOLD: "bag:hold",
    NEXT_PIECE: "bag:next_piece",
  },
  GAME: {
    START: "game:start",
    OVER: "game:over",
    PAUSE: "game:pause",
    RESUME: "game:resume",
  },
  SCORE: {
    UPDATE: "score:update",
    LEVEL_UP: "score:level_up",
  },
} as const);

interface TetrisEventsMap {
  [TETRIS_EVENT_NAMES.LOCK.ANIMATION.REQUEST_BEGIN]: {
    points: Vec2D[];
  };
  [TETRIS_EVENT_NAMES.LOCK.PLACE]: {
    point: Vec2D;
  };
  [TETRIS_EVENT_NAMES.ACTIVE_PIECE.MOVE]: {
    d: Vec2D;
  };
  [TETRIS_EVENT_NAMES.ACTIVE_PIECE.ROTATE]: {
    rotationDirection: Rotation;
    newRotation: number;
  };
  [TETRIS_EVENT_NAMES.ACTIVE_PIECE.COLLIDE]: {
    contactVec2Ds: Vec2D[];
  };
  [TETRIS_EVENT_NAMES.BAG.HOLD]: {
    heldPiece: TetrominoNames;
    releasedPiece?: TetrominoNames;
  };
  [TETRIS_EVENT_NAMES.BAG.NEXT_PIECE]: {
    nextPiece: TetrominoNames;
  };
  // Game - data to be decided
  [TETRIS_EVENT_NAMES.GAME.START]: unknown;
  [TETRIS_EVENT_NAMES.GAME.OVER]: unknown;
  [TETRIS_EVENT_NAMES.GAME.PAUSE]: unknown;
  [TETRIS_EVENT_NAMES.GAME.RESUME]: unknown;

  // Score / level
  [TETRIS_EVENT_NAMES.SCORE.UPDATE]: {
    newScore: number;
  };
  [TETRIS_EVENT_NAMES.SCORE.LEVEL_UP]: {
    newLevel: number;
  };
}

class TetrisEvent<K extends keyof TetrisEventsMap> extends CustomEvent<
  TetrisEventsMap[K]
> {
  constructor(type: K, detail: TetrisEventsMap[K], options?: EventInit) {
    super(type, { detail, ...options });
  }
}

interface TetrisEventEmitter {
  // Typed emit
  $emit<K extends keyof TetrisEventsMap>(
    type: K,
    detail: TetrisEventsMap[K],
    options?: EventInit
  ): boolean;
}

interface TetrisEventTarget {
  $on<K extends keyof TetrisEventsMap>(
    type: K,
    listener: (ev: TetrisEvent<K>) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  $off<K extends keyof TetrisEventsMap>(
    type: K,
    listener: (ev: TetrisEvent<K>) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  $once<K extends keyof TetrisEventsMap>(
    type: K,
    listener: (ev: TetrisEvent<K>) => void
  ): void;
}

class TetrisEventBus implements TetrisEventEmitter, TetrisEventTarget {
  private target = new EventTarget();

  $emit<K extends keyof TetrisEventsMap>(
    type: K,
    detail: TetrisEventsMap[K],
    options?: EventInit
  ): boolean {
    return this.target.dispatchEvent(new TetrisEvent(type, detail, options));
  }

  // Typed add listener
  $on<K extends keyof TetrisEventsMap>(
    type: K,
    listener: (ev: TetrisEvent<K>) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.target.addEventListener(
      type as string,
      listener as EventListener,
      options
    );
  }

  // Typed remove listener
  $off<K extends keyof TetrisEventsMap>(
    type: K,
    listener: (ev: TetrisEvent<K>) => unknown,
    options?: boolean | EventListenerOptions
  ): void {
    this.target.removeEventListener(
      type as string,
      listener as EventListener,
      options
    );
  }

  $once<K extends keyof TetrisEventsMap>(
    type: K,
    listener: (ev: TetrisEvent<K>) => void
  ): void {
    this.$on(type, listener, { once: true });
  }
}

const bus = new TetrisEventBus();

export const emitter = bus as TetrisEventEmitter;
export const listener = bus as TetrisEventTarget;
