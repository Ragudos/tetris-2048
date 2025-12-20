// Node of the linked list
class LinkedListNode<T> {
  public value: T;
  public next: LinkedListNode<T> | null = null;
  public prev: LinkedListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

// Doubly linked list
export default class LinkedList<T> {
  private head: LinkedListNode<T> | null = null;
  private tail: LinkedListNode<T> | null = null;
  public length: number = 0;

  map<U>(fn: (value: T, index: number) => U): LinkedList<U> {
    const result = new LinkedList<U>();
    let current = this.head;
    let index = 0;

    while (current) {
      result.append(fn(current.value, index));
      current = current.next;
      index++;
    }

    return result;
  }

  // Add to the end
  append(value: T): LinkedListNode<T> {
    const node = new LinkedListNode(value);

    if (!this.tail) {
      // empty list
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }

    this.length++;
    return node;
  }

  // Add to the front
  prepend(value: T): LinkedListNode<T> {
    const node = new LinkedListNode(value);

    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }

    this.length++;
    return node;
  }

  // Remove a node
  remove(node: LinkedListNode<T>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;

    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    node.prev = null;
    node.next = null;

    this.length--;
  }

  // Iterate through the list
  *[Symbol.iterator](): IterableIterator<T> {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }

  // Optional: find a node by value
  find(predicate: (value: T) => boolean): LinkedListNode<T> | null {
    let current = this.head;
    while (current) {
      if (predicate(current.value)) return current;
      current = current.next;
    }
    return null;
  }

  getFirst(): T | null {
    return this.head ? this.head.value : null;
  }

  // Get last node value
  getLast(): T | null {
    return this.tail ? this.tail.value : null;
  }

  // Get value at specific index (0-based)
  getAt(index: number): T | null {
    if (index < 0 || index >= this.length) return null;

    let current: LinkedListNode<T> | null;
    let i: number;

    // Optimize: start from head or tail depending on index
    if (index < this.length / 2) {
      current = this.head;
      i = 0;
      while (current && i < index) {
        current = current.next;
        i++;
      }
    } else {
      current = this.tail;
      i = this.length - 1;
      while (current && i > index) {
        current = current.prev;
        i--;
      }
    }

    return current ? current.value : null;
  }

  shift(): T | null {
    if (!this.head) return null;

    const node = this.head;
    this.head = node.next;

    if (this.head) {
      this.head.prev = null;
    } else {
      // List became empty
      this.tail = null;
    }

    node.next = null;
    node.prev = null;

    this.length--;
    return node.value;
  }

  // Clear the list
  clear(): void {
    let current = this.head;
    while (current) {
      const next = current.next;
      current.prev = null;
      current.next = null;
      current = next;
    }

    this.head = null;
    this.tail = null;
    this.length = 0;
  }
}
