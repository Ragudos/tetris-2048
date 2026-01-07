export interface Dirtyable {
  markDirty(): void;
  clearDirty(): void;
  get dirty(): boolean;
}
