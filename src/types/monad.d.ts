declare type Result<T, E> =
  | {
      err: null;
      ok: T;
    }
  | {
      err: E;
      ok: null;
    };
