export default interface Cloneable<T extends Cloneable<T>> {
  clone(): T;
}
