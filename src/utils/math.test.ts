import { clamp, weightedAverage } from "./math";

describe("utils > math", () => {
  describe("clamp", () => {
    it("should retain value within range", () => {
      expect(clamp(3, 1, 5)).toStrictEqual(3);
    });

    it("should retain negative value within range", () => {
      expect(clamp(-3, -5, -1)).toStrictEqual(-3);
    });

    it("should retain value on lower limit", () => {
      expect(clamp(1, 1, 5)).toStrictEqual(1);
    });

    it("should retain value on upper limit", () => {
      expect(clamp(5, 1, 5)).toStrictEqual(5);
    });

    it("should clamp lower value to min", () => {
      expect(clamp(0, 1, 5)).toStrictEqual(1);
    });

    it("should clamp higher value to max", () => {
      expect(clamp(7, 1, 5)).toStrictEqual(5);
    });

    it("should clamp NaN to middle value", () => {
      expect(clamp(NaN, 1, 5)).toStrictEqual(3);
    });
  });

  describe("weightedAverage", () => {
    test("1", () => {
      expect(
        weightedAverage([
          [5, 5],
          [1, 1],
          [1, 1],
          [1, 1],
        ])
      ).toStrictEqual(3.5);
    });
  });
});
