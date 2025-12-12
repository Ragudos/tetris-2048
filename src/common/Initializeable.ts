export default interface Initializeable {
  initialize(): Promise<void>;
}
