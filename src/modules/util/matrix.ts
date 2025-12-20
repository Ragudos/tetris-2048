import { ROTATION, type Rotation } from "@/constants";
import Logger from "@/modules/log/Logger";

const logger = Logger.createLogger("MatrixUtils");

/**
 * @param matrix
 * @returns True if the matrix has equal columns and rows, false otherwise.
 */
export function isSquareMatrix<T>(matrix: T[][]): boolean {
  return matrix.every((row) => row.length === matrix.length);
}

/**
 * Rotates a matrix in-place and returns it.
 *
 * @param rotation The direction which to rotate. -1 for left, 1 for right.
 * @param matrix The matrix to rotate.
 * @returns The rotated matrix.
 * @throws {Error} If the matrix is not square.
 */
export function rotateMatrix<T>(rotation: Rotation, matrix: T[][]): T[][] {
  if (!isSquareMatrix(matrix)) {
    throw new Error("matrix must be square");
  }

  for (let y = 0; y < matrix.length / 2; ++y) {
    const lastIdx = matrix.length - y - 1;

    for (let x = y; x < lastIdx; ++x) {
      const offset = x - y;
      const lastIdxOffset = lastIdx - offset;

      if (!matrix[y]) {
        logger.warn(`Column index of ${y} does not exist`);

        continue;
      }

      switch (rotation) {
        case ROTATION.CLOCKWISE:
          {
            const tmp = matrix[lastIdxOffset][y];
            matrix[lastIdxOffset][y] = matrix[lastIdx][lastIdxOffset];
            matrix[lastIdx][lastIdxOffset] = matrix[x][lastIdx];
            matrix[x][lastIdx] = matrix[y][x];
            matrix[y][x] = tmp;
          }
          break;
        case ROTATION.COUNTER_CLOCKWISE:
          {
            const tmp = matrix[y][x];
            matrix[y][x] = matrix[x][lastIdx];
            matrix[x][lastIdx] = matrix[lastIdx][lastIdxOffset];
            matrix[lastIdx][lastIdxOffset] = matrix[lastIdxOffset][y];
            matrix[lastIdxOffset][y] = tmp;
          }
          break;
      }
    }
  }

  return matrix;
}
