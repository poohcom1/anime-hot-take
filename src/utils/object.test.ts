import { objectToArray, takePingPong } from "./object";

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

  describe("objectToArr", () => {
    it("should map objects", () => {
      const objects = [
        {
          name: "Hayate",
          age: 16,
        },
        { name: "Nagi", age: 13 },
        { name: "Tama", age: 10 },
      ];

      const table = objectToArray(objects);

      expect(table[0]).toStrictEqual(["name", "age"]);
      expect(table[1]).toStrictEqual(["Hayate", 16]);
      expect(table[2]).toStrictEqual(["Nagi", 13]);
      expect(table[3]).toStrictEqual(["Tama", 10]);
    });
  });
});
