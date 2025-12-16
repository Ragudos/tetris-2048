type Serializable =
  | string
  | number
  | boolean
  | null
  | Serializable[]
  | { [key: string]: Serializable }
  | Map<any, any>
  | Set<any>
  | object;
export class Serializer {
  private static objectToId = new WeakMap<object, number>();
  private static idToObject = new Map<number, any>();
  private static currentId = 1;

  /**
   * Serialize an object, including Maps, Sets, and circular references
   */
  static serialize(obj: any): string {
    this.objectToId = new WeakMap();
    this.currentId = 1;

    const replacer = (key: string, value: any) => {
      if (value instanceof Map) {
        return {
          $id: this.getId(value),
          $type: "Map",
          value: Array.from(value.entries()),
        };
      }

      if (value instanceof Set) {
        return {
          $id: this.getId(value),
          $type: "Set",
          value: Array.from(value),
        };
      }

      if (typeof value === "object" && value !== null) {
        const id = this.getId(value);
        if (this.objectToId.has(value) && key !== "") {
          return { $ref: id };
        }
        return { $id: id, ...value };
      }

      return value;
    };

    return JSON.stringify(obj, replacer);
  }

  private static getId(obj: object): number {
    if (!this.objectToId.has(obj)) {
      this.objectToId.set(obj, this.currentId++);
    }
    return this.objectToId.get(obj)!;
  }

  /**
   * Deserialize a JSON string back into objects, Maps, Sets, and circular refs
   */
  static deserialize<T>(json: string, classMap: Record<string, any> = {}): T {
    this.idToObject = new Map();

    const reviver = (key: string, value: any) => {
      if (value && typeof value === "object") {
        if ("$ref" in value) {
          return this.idToObject.get(value.$ref);
        }

        if ("$type" in value) {
          let obj: any;
          if (value.$type === "Map") obj = new Map(value.value);
          else if (value.$type === "Set") obj = new Set(value.value);
          else obj = {};

          if (value.$id) this.idToObject.set(value.$id, obj);
          return obj;
        }

        if ("$id" in value) {
          const { $id, ...rest } = value;
          let obj: any;

          // Check if class mapping exists
          const className = value.$type;
          if (className && classMap[className]) {
            obj = Object.create(classMap[className].prototype);
          } else {
            obj = {};
          }

          this.idToObject.set($id, obj);
          Object.assign(obj, rest);
          return obj;
        }
      }

      return value;
    };

    return JSON.parse(json, reviver);
  }
}

/** Example usage */

// Example class
class Person {
  name: string;
  friend?: Person;

  constructor(name: string) {
    this.name = name;
  }
}

const alice = new Person("Alice");
const bob = new Person("Bob");
alice.friend = bob;
bob.friend = alice; // circular reference

const map = new Map();
map.set("a", alice);
map.set("b", bob);

const set = new Set([alice, bob]);

const obj = { people: [alice, bob], map, set };

const json = Serializer.serialize(obj);
console.log(json);

const restored = Serializer.deserialize<typeof obj>(json, { Person });
console.log(restored);
console.log(restored.people[0] instanceof Person); // true
console.log(restored.people[0].friend === restored.people[1]); // true
