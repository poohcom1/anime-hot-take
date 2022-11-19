export function Ok<T, E>(ok: T): Result<T, E> {
  return {
    ok,
    err: null,
  };
}

export function Err<T, E>(err: E): Result<T, E> {
  return {
    ok: null,
    err,
  };
}
