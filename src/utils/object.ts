export function takePingPong<T>(
  arr: T[],
  count = Infinity,
  startRight = false
): T[] {
  count = Math.min(arr.length, count);
  const newArr: T[] = [];

  let left = 0;
  let right = 0;
  let leftSide = !startRight;
  while (left + right < count) {
    let idx = leftSide ? left++ : arr.length - 1 - right++;
    newArr.push(arr[idx]);

    leftSide = !leftSide;
  }

  return newArr;
}

export function takeEnds<T>(arr: T[], count: number): T[] {
  const newArr: T[] = [];
  for (let i = 0; i < arr.length; i++) {}

  return newArr;
}

/**
 * Expects uniform keys
 * @param objects
 */
export function objectToArray<T extends string>(
  objects: Record<T, string | number>[],
  headerTransform = (s: string): string => s,
  headerSort = (_a: string, _b: string) => 0
): (string | number)[][] {
  if (!objects) return [];

  const keys = Object.keys(objects[0]) as T[];
  keys.sort(headerSort);
  const header = [keys.map(headerTransform) as (string | number)[]];
  const rows = objects.map((o) => keys.map((k) => o[k] as string | number));

  return header.concat(rows);
}

export function omit<T extends string, V>(
  object: Record<T, V>,
  keys: T[]
): Record<T, V> {
  const copy = { ...object };
  keys.forEach((k) => delete copy[k]);
  return copy;
}

export function formatText(text: string): string {
  let spaced = "";
  for (const char of text) {
    spaced += char.toUpperCase() === char ? " " + char : char;
  }

  const capitalized = spaced.charAt(0).toLocaleUpperCase() + text.slice(1);
  return capitalized;
}
