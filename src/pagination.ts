export type PageFetcher<T> = (offset: number, limit: number) => Promise<T[]>;

export interface PaginateOptions {
  limit?: number; // default 100
  offset?: number; // default 0
}

export interface PaginatedResult<T> extends AsyncIterable<T> {
  toArray(max?: number): Promise<T[]>;
}

export function paginate<T>(fetcher: PageFetcher<T>, options: PaginateOptions = {}): PaginatedResult<T> {
  const limit = options.limit ?? 100;
  const startOffset = options.offset ?? 0;

  const iterable: PaginatedResult<T> = {
    [Symbol.asyncIterator]() {
      let buffer: T[] = [];
      let bufferIndex = 0;
      let done = false;
      let currentOffset = startOffset;

      return {
        async next(): Promise<IteratorResult<T>> {
          if (bufferIndex < buffer.length) {
            return { value: buffer[bufferIndex++], done: false };
          }
          if (done) return { value: undefined, done: true };

          buffer = await fetcher(currentOffset, limit);
          bufferIndex = 0;
          currentOffset += buffer.length;

          if (buffer.length === 0 || buffer.length < limit) {
            done = true;
          }
          if (buffer.length === 0) {
            return { value: undefined, done: true };
          }
          return { value: buffer[bufferIndex++], done: false };
        },
      };
    },

    async toArray(max?: number): Promise<T[]> {
      const items: T[] = [];
      for await (const item of iterable) {
        items.push(item);
        if (max !== undefined && items.length >= max) break;
      }
      return items;
    },
  };

  return iterable;
}
