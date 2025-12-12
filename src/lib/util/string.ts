import { range } from "./general";

function uppercaseByHalfChance(char: string): string {
  return Math.random() > 0.5 ? char.toUpperCase() : char;
}

/**
 * @returns A random id with a length of 8.
 */
export function generateRandomId(): string {
  let id = "";
  const idLength = 8;
  const lowercaseStartCharCode = 97;
  const lowercaseEndCharCode = 122;
  const numberStartCharCode = 48;
  const numberEndCharCode = 57;

  for (let count = 0; count < idLength; ++count) {
    if (Math.random() < 0.5) {
      const randomChar = range(lowercaseStartCharCode, lowercaseEndCharCode);

      id += uppercaseByHalfChance(String.fromCharCode(randomChar));
    } else {
      const randomChar = range(numberStartCharCode, numberEndCharCode);

      id += String.fromCharCode(randomChar);
    }
  }

  return id;
}
