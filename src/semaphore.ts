// Adapted from https://gist.github.com/gregkorossy/e33be1f201cf242197d9c4d0a1fa7335

export class Semaphore {
  #max: number;
  #counter = 0;
  #waiting: Array<{ resolve: () => void; err: (reason?: unknown) => void }> = [];

  constructor(max: number) {
    this.#max = max;
  }

  #take(): void {
    if (this.#waiting.length > 0 && this.#counter < this.#max) {
      this.#counter++;
      const promise = this.#waiting.shift();
      if (promise) {
        promise.resolve();
      }
    }
  }

  async acquire(): Promise<void> {
    if (this.#counter < this.#max) {
      this.#counter++;
      return new Promise((resolve) => {
        resolve();
      });
    } else {
      return new Promise((resolve, err) => {
        this.#waiting.push({ resolve, err });
      });
    }
  }

  release(): void {
    this.#counter--;
    this.#take();
  }

  purge(): number {
    const unresolved = this.#waiting.length;

    for (let i = 0; i < unresolved; i++) {
      this.#waiting[i].err("Task has been purged.");
    }

    this.#counter = 0;
    this.#waiting = [];

    return unresolved;
  }
}
