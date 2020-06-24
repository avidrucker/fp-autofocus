import { expect } from "chai";

import { createGreeting, getPluralS, isPluralFromCount, notEmptyString, isNegOne, getPositiveMin } from "../src";

describe("MAIN TESTS", () => {
  // smoke test
  describe("Greet User", () => {
    it('should say "Welcome to FP AutoFocus!"', () => {
      const greeting: string = createGreeting('Welcome to')('FP AutoFocus!');

      expect(greeting).equals("Welcome to FP AutoFocus!");
    });
  });
});

describe("UTILITY TESTS", () => {
  describe("Pluralization of words", () => {
    it("returns word that ends in 's' when count is zero", () => {
      const word: string = "cup";
      const count: number = 0;
      const suffix: string = getPluralS(isPluralFromCount(count));
      expect(`${count} ${word}${suffix}`).equals("0 cups");
    });

    it("returns word that doesn't end in 's' when count is one", () => {
      const word: string = "cup";
      const count: number = 1;
      const suffix: string = getPluralS(isPluralFromCount(count));
      expect(`${count} ${word}${suffix}`).equals("1 cup");
    });

    it("returns word that ends in 's' when count not one or zero", () => {
      const word: string = "cup";
      const count: number = 5;
      const suffix: string = getPluralS(isPluralFromCount(count));
      expect(`${count} ${word}${suffix}`).equals("5 cups");
    });
  });

	// originally "isDefinedString"
  describe("notEmptyString", () => {
    it("returns false when variable is an empty string", () => {
      const emptyString: string = "";
      expect(notEmptyString(emptyString)).equals(false);
    });

    it("returns true when variable has a non-empty, non-null value", () => {
      const boy: string = "Harry";
      expect(notEmptyString(boy)).equals(true);
    });
  });

	// originally "isNeg1"
  describe("isNegOne", () => {
    it("returns true when -1 argument is passed in", () => {
      expect(isNegOne(-1)).equals(true);
    });

    it("returns false when 5 argument is passed in", () => {
      expect(isNegOne(5)).equals(false);
    });
  });

  // originally "getMinFrom0Up"
  describe("getPositiveMin", () => {
    describe("returns the lower of two numbers that are 0 or higher", () => {
      it("giving -1 back when (-5,-3) is passed in", () => {
        expect(getPositiveMin(-5)(-3)).equals(-1);
      });
      it("giving 7 back when (-1,7) is passed in", () => {
        expect(getPositiveMin(-1)(7)).equals(7);
      });
      it("giving 2 back when (2,-1) is passed in", () => {
        expect(getPositiveMin(2)(-1)).equals(2);
      });
      it("giving 3 back when (3,20) is passed in", () => {
        expect(getPositiveMin(3)(20)).equals(3);
      });
    });
  });
});