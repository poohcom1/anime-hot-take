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
