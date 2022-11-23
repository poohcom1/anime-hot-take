import { takePingPong } from "./object";

describe("utils > object", () => {
  describe("takePingPong", () => {
    it("should take ping pong", () => {
      const arr = [1, 2, 3, 4, 5];
      const newArr = takePingPong(arr);

      expect(newArr[0]).toStrictEqual(1);
      expect(newArr[1]).toStrictEqual(5);
      expect(newArr[2]).toStrictEqual(2);
      expect(newArr[3]).toStrictEqual(4);
      expect(newArr[4]).toStrictEqual(3);
    });
  });
});
