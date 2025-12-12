import Serialized from "./Serialized";

export default interface Serializeable {
  serialize(): Serialized;
}
