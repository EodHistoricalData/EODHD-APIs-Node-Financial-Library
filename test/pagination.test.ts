import { describe, expect, it, vi } from "vitest";
import { paginate } from "../src/pagination.js";

describe("paginate", () => {
  it("iterates pages until empty result", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
      .mockResolvedValueOnce([{ id: 3 }, { id: 4 }])
      .mockResolvedValueOnce([]);
    const items: unknown[] = [];
    for await (const item of paginate(fetcher, { limit: 2 })) {
      items.push(item);
    }
    expect(items).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("stops when page smaller than limit", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
      .mockResolvedValueOnce([{ id: 3 }]);
    const items: unknown[] = [];
    for await (const item of paginate(fetcher, { limit: 2 })) {
      items.push(item);
    }
    expect(items).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(fetcher).toHaveBeenCalledTimes(2); // 2nd page < limit, stops
  });

  it("toArray() collects all items", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([]);
    const result = paginate(fetcher, { limit: 10 });
    expect(await result.toArray()).toEqual([{ id: 1 }]);
  });

  it("toArray(max) limits total items", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(await paginate(fetcher, { limit: 10 }).toArray(2)).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("passes correct offset and limit to fetcher", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([1, 2]).mockResolvedValueOnce([3, 4]).mockResolvedValueOnce([]);
    await paginate(fetcher, { limit: 2, offset: 10 }).toArray();
    expect(fetcher).toHaveBeenNthCalledWith(1, 10, 2);
    expect(fetcher).toHaveBeenNthCalledWith(2, 12, 2);
    expect(fetcher).toHaveBeenNthCalledWith(3, 14, 2);
  });

  it("handles empty first page", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([]);
    expect(await paginate(fetcher).toArray()).toEqual([]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
