export interface DocumentStore {
  read(key: string): Promise<string | null>;
  update<T>(
    key: string,
    change: (raw: string | null) => { raw: string; result: T },
  ): Promise<T>;
}
