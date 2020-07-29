import { expect } from "chai";
import { step } from "mocha-steps";

import {
  createGreeting,
  getPluralS,
  isPluralFromCount,
  notEmptyString,
  isNegOne,
  getPositiveMin,
  IItem,
  addItem,
  createNewItem,
  findFirstMarkable,
  TItemStatus,
  getCMWTDstring,
  statusToMark,
  isReviewableList,
  markFirstMarkableIfPossible,
  getFirstReviewableIndex,
  mapUnmarkedToIndexAndFilter,
  getFirstUnmarkedAfterIndex,
  getCMWTDindex,
  isMarkableList,
  SIMenterFocusState,
  IAppData,
  SIMenterReviewState,
  TValidAnswer,
  getTextByIndex,
  getStatusByIndex,
	createBlankData,
	createStarterData,
	hideAllCompleted,
	countHideable,
} from "../src";

export const FRUITS = [
  "apple",
  "banana",
  "cherry",
  "dragonfruit",
  "elderberry",
];

// box operator === square brackets
const wrapStrInBoxOp = (s: string): string => "[" + s + "]";

const markAllAs = (arr: IItem[]) => (s: TItemStatus): IItem[] =>
  arr.map((x) => ({ index: x.index, status: s, textName: x.textName, isHidden: x.isHidden }));

const makeNItemArray = (n: number): IItem[] => {
  let todoList: IItem[] = [];
  for (let i = 0; i < n; i++) {
    todoList = addItem(todoList)(
      createNewItem(FRUITS[i % FRUITS.length])(todoList.length)
    );
  }
  return todoList;
};

const listToMarksString = (arr: IItem[]) =>
  arr
    .map((x) => x.status)
    .map((x) => statusToMark(x))
    .map((x) => wrapStrInBoxOp(x))
    .join(" ");

describe("MAIN TESTS", () => {
  // smoke test
  describe("Greet User", () => {
    it('should say "Welcome to FP AutoFocus!"', () => {
      const greeting: string = createGreeting("Welcome to")("FP AutoFocus!");

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

//// findFirstMarkable originally called 'getFirstUnmarked'
describe("REVIEW MODE UNIT TESTS", () => {
  describe("Finding unmarked todos", () => {
    it("when there is one item, returns the first unmarked item", () => {
      const todoList: IItem[] = makeNItemArray(1);
      const lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      expect(todoList.length).equals(1);
      expect(findFirstMarkable(todoList)(lastDone)).equals(0);
    });

    it("when there are multiple items, returns the first unmarked item", () => {
      const todoList: IItem[] = makeNItemArray(2);
      let lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      todoList[0].status = "complete";
      lastDone = 0;
      expect(findFirstMarkable(todoList)(lastDone)).equals(1);
    });

    it("returns -1 when there are no todos", () => {
      const todoList: IItem[] = makeNItemArray(0);
      const lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      expect(findFirstMarkable(todoList)(lastDone)).equals(-1);
    });

    it("returns -1 when there are no unmarked todos", () => {
      let todoList: IItem[] = makeNItemArray(2);
      let lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      todoList = markAllAs(todoList)("complete");
      lastDone = 0;
      expect(findFirstMarkable(todoList)(lastDone)).equals(-1);
    });

    it("when there are both marked and unmarked items, returns the unmarked item", () => {
      const todoList: IItem[] = makeNItemArray(2);
      const lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      todoList[0].status = "dotted";
      todoList[1].status = "unmarked";
      expect(getFirstReviewableIndex(todoList)(lastDone)).equals(1);
    });
  });

  // isReviewableList was originally 'readyToReview'
  describe("Ready to review check", () => {
    it("determines list `[o] [o] [o]` NOT ready for review", () => {
      let todoList: IItem[] = makeNItemArray(3);
      const lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      todoList = markAllAs(todoList)("dotted");
      expect(listToMarksString(todoList)).equals("[o] [o] [o]");
      expect(isReviewableList(todoList)(lastDone)).equals(false);
      expect(getFirstReviewableIndex(todoList)(lastDone)).equals(-1); // findFirstMarkable
    });

    it("determines list `[x] [x] [x]` NOT ready for review", () => {
      let todoList: IItem[] = makeNItemArray(3);
      let lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      todoList = markAllAs(todoList)("complete");
      lastDone = 0;
      expect(listToMarksString(todoList)).equals("[x] [x] [x]");
      expect(isReviewableList(todoList)(lastDone)).equals(false);
      expect(getFirstReviewableIndex(todoList)(lastDone)).equals(-1);
    });

    it("determines list `[x] [x] [o]` NOT ready for review", () => {
      let todoList: IItem[] = makeNItemArray(3);
      let lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      todoList = markAllAs(todoList)("complete");
      todoList[2].status = "dotted";
      lastDone = 1;
      expect(listToMarksString(todoList)).equals("[x] [x] [o]"); // note: the order in which they were completed could be either 0,1 or 1,0
      expect(isReviewableList(todoList)(lastDone)).equals(false);
    });

    it("determines list `[x] [o] [ ]` ready for review", () => {
      let todoList: IItem[] = makeNItemArray(3);
      let lastDone: number = -1; // lastDone was a string originally
      todoList[0].status = "complete"; // note: this test does not use the official app API to mutate app state
      lastDone = 0; // lastDone = todoList[0].textName;
      todoList = markFirstMarkableIfPossible(todoList)(lastDone); // markFirstMarkableIfPossible was originally 'setupReview'
      expect(getCMWTDstring(todoList)).equals(FRUITS[1]);
      expect(listToMarksString(todoList)).equals("[x] [o] [ ]");
      expect(isReviewableList(todoList)(lastDone)).equals(true);
      expect(getFirstReviewableIndex(todoList)(lastDone)).equals(2);
      expect(lastDone).equals(0);
    });

    // note: this IS markable, just not yet reviewable
    it("determines list `[x] [ ] [ ]` NOT ready for review but IS auto-markable", () => {
      const todoList: IItem[] = makeNItemArray(3);
      let lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      todoList[0].status = "complete";
      lastDone = 0;
      expect(listToMarksString(todoList)).equals("[x] [ ] [ ]");
      expect(isMarkableList(todoList)(lastDone)).equals(true); // diff from original tests
      expect(isReviewableList(todoList)(lastDone)).equals(false); // diff from original tests
      expect(getFirstReviewableIndex(todoList)(lastDone)).equals(-1);
    });

    it("determines list `[o] [ ] [o]` NOT ready for review", () => {
      let todoList: IItem[] = makeNItemArray(3);
      const lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      todoList[0].status = "dotted";
      todoList[2].status = "dotted";
      expect(listToMarksString(todoList)).equals("[o] [ ] [o]");
      expect(isReviewableList(todoList)(lastDone)).equals(false);
      expect(getFirstReviewableIndex(todoList)(lastDone)).equals(-1);
    });

    // new test for fp-autofocus
    it("determines list `[o] [ ] [x]` ready for review", () => {
      let todoList: IItem[] = makeNItemArray(3);
      let lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      todoList[0].status = "dotted";
      todoList[2].status = "complete";
      lastDone = 2;
      expect(listToMarksString(todoList)).equals("[o] [ ] [x]");
      expect(isReviewableList(todoList)(lastDone)).equals(true);
      expect(getFirstReviewableIndex(todoList)(lastDone)).equals(1);
    });

    it("determines list `[o] [ ] [o] [ ]` ready for review", () => {
      let todoList: IItem[] = makeNItemArray(4);
      const lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      todoList[0].status = "dotted";
      todoList[2].status = "dotted";
      expect(listToMarksString(todoList)).equals("[o] [ ] [o] [ ]");
      expect(isReviewableList(todoList)(lastDone)).equals(true);
      expect(getFirstReviewableIndex(todoList)(lastDone)).equals(3);
    });

    it("determines list `[x] [o] [ ]` ready for review", () => {
      const todoList: IItem[] = makeNItemArray(3);
      let lastDone: number = -1; // note: this test does not use the official app API to mutate app state
      todoList[0].status = "complete";
      lastDone = 0;
      todoList[1].status = "dotted";
      expect(listToMarksString(todoList)).equals("[x] [o] [ ]");
      expect(isReviewableList(todoList)(lastDone)).equals(true);
      expect(getFirstReviewableIndex(todoList)(lastDone)).equals(2);
    });
  });

  // todoList = markFirstMarkableIfPossible(todoList)(lastDone);
  // SIMenterFocusState(myApp)
  describe("Determining the last done index", () => {
    it("gets the correct index as last done", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(3),
        lastDone: -1,
      };
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); // todoList = setupReview(todoList);
      myApp = SIMenterFocusState(myApp);
      // [todoList, lastDone] = conductFocus(todoList, lastDone, {
      //   workLeft: "n"
      // });
      expect(myApp.lastDone).equals(0); // original: 'getLastDoneIndex(todoList, lastDone)'
      expect(listToMarksString(myApp.myList)).equals("[x] [ ] [ ]");
    });
  });

  describe("Determining where reviews start", () => {
    it("should return index 2 on list with `[x] [o] [ ]` state", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(3),
        lastDone: -1,
      };
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); // mark the first item
      // todoList = conductAllReviews(todoList, lastDone, ['q']); // effectively not necessary for this test, but left in for demo purposes
      myApp = SIMenterFocusState(myApp);
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); // mark the second item now
      expect(getFirstReviewableIndex(myApp.myList)(myApp.lastDone)).equals(2);
      expect(listToMarksString(myApp.myList)).equals("[x] [o] [ ]");
    });
  });
});

describe("FP TESTS", () => {
  describe("Counting of unmarked items", () => {
    it("returns 2 for a list of two unmarked items", () => {
      const todoList: IItem[] = makeNItemArray(2);
      expect(mapUnmarkedToIndexAndFilter(todoList).length).equals(2);
    });
  });

  describe("Finding of first unmarked items after a specified index", () => {
    it("returns 1 for a list of 2 items where the first item is marked", () => {
      let todoList: IItem[] = makeNItemArray(2);
      const lastDone = -1; // note: this test does not use the official app API to mutate app state
      todoList = markFirstMarkableIfPossible(todoList)(lastDone);
      getFirstUnmarkedAfterIndex(todoList)(getCMWTDindex(todoList));
    });
	});
	
	describe("hideAllCompleted", () => {
		it("returns back a list of items where completed and unhidden items are now hidden", () => {
			const appData: IAppData = createStarterData();
			expect(countHideable(appData.myList)).equals(1); // BEFORE
			appData.myList = hideAllCompleted(appData.myList);
			expect(countHideable(appData.myList)).equals(0); // AFTER
		})
	})
});

describe("FOCUS MODE INTEGRATION TESTS", () => {
  describe("Entering focus mode", () => {
    it("when there 0 items does not affect the todo list, or lastDone", () => {
      let myApp: IAppData = { currentState: "menu", myList: [], lastDone: -1 };
      //// [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft: 'y'}); // "There are no todo items."
      myApp = SIMenterFocusState(myApp);
      expect(myApp.myList.length).equals(0);
      expect(getCMWTDindex(myApp.myList)).equals(-1);
      expect(myApp.lastDone).equals(-1);
    });

    it("when no marked items exist, leaves todo list & cmwtd as-is", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(1),
        lastDone: -1,
      };
      myApp = SIMenterFocusState(myApp);
      // [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft: 'y'}); // "The CMWTD has not been set."
      expect(myApp.myList.length).equals(1);
      expect(getCMWTDindex(myApp.myList)).equals(-1);
    });
  });

  describe("Finding marked todos", () => {
    it("returns the last marked item", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(2),
        lastDone: -1,
      };
      myApp.myList = markAllAs(myApp.myList)("dotted");
      expect(getCMWTDindex(myApp.myList)).equals(1);
    });

    it("returns -1 when there are no todos", () => {
      let myApp: IAppData = { currentState: "menu", myList: [], lastDone: -1 };
      expect(getCMWTDindex(myApp.myList)).equals(-1);
    });

    it("returns -1 index when there are no marked todos", () => {
      const myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(2),
        lastDone: -1,
      };
      expect(getCMWTDindex(myApp.myList)).equals(-1);
    });

    it("when there are both marked and unmarked items, returns the marked item", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(2),
        lastDone: -1,
      };
      myApp.myList[0].status = "dotted"; // getStatusByIndex(myApp.myList)(0) // note: this test does not use the official app API to mutate app state
      expect(getCMWTDindex(myApp.myList)).equals(0);
    });
  });

  describe("Updating the CMWTD", () => {
    it("updates CMWTD from something to nothing", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(1),
        lastDone: -1,
      };
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      myApp = SIMenterFocusState(myApp); //[todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
      expect(getStatusByIndex(myApp.myList)(0)).equals("complete");
      expect(myApp.myList.length).equals(1);
      expect(getCMWTDindex(myApp.myList)).equals(-1);
      expect(getTextByIndex(myApp.myList)(myApp.lastDone)).equals(FRUITS[0]);
    });

    // issue: Dev rewrites tests to use intended functions instead of raw mutations #287
    it("updates CMWTD from last marked item to the previous marked", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(2),
        lastDone: -1,
      };
      myApp.myList = markAllAs(myApp.myList)("dotted");
      myApp = SIMenterFocusState(myApp); // [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
      expect(getStatusByIndex(myApp.myList)(1)).equals("complete");
      expect(myApp.myList.length).equals(2);
      expect(getCMWTDstring(myApp.myList)).equals(FRUITS[0]);
      expect(getTextByIndex(myApp.myList)(myApp.lastDone)).equals(FRUITS[1]);
    });
  });

  // formerly "First mini E2E test"
  describe("integration test of list completion", () => {
    describe("should lead to CMWTD of empty string", () => {
      let myApp: IAppData = { currentState: "menu", myList: [], lastDone: -1 };
      const aList = ["a"];

      step("should confirm 1 item has been added", () => {
        aList.forEach((x) => {
          myApp.myList = addItem(myApp.myList)(
            createNewItem(x)(myApp.myList.length)
          );
        });

        expect(myApp.myList.length).equals(1);
      });

      step("should confirm that the 1st item has been marked", () => {
        myApp.myList = markFirstMarkableIfPossible(myApp.myList)(
          myApp.lastDone
        );
        // todoList = setupReview(todoList);
        expect(getStatusByIndex(myApp.myList)(0)).equals("dotted");
      });

      step("should re-confirm 1 item have been marked", () => {
        const answers001: TValidAnswer[] = ["q"];

        myApp = SIMenterReviewState(myApp)(answers001);
        //todoList = conductAllReviews(todoList, lastDone, answers001);
        expect(listToMarksString(myApp.myList)).equals("[o]");
      });

      step(
        "should confirm that CMWTD has been updated to last marked item",
        () => {
          expect(getCMWTDstring(myApp.myList)).equals(
            getTextByIndex(myApp.myList)(0)
          );
        }
      );

      step("should confirm that lastDone has NOT been updated YET", () => {
        expect(myApp.lastDone).equals(-1);
      });

      step("should confirm only item has been completed", () => {
        // [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft: "n"});
        myApp = SIMenterFocusState(myApp);
        expect(getStatusByIndex(myApp.myList)(0)).equals("complete");
      });

      step("should confirm that CMWTD has been updated", () => {
        expect(getCMWTDindex(myApp.myList)).equals(-1);
      });

      step("should confirm that lastDone has been updated", () => {
        expect(myApp.lastDone).equals(0);
      });
    });
  });
});

describe("Simple E2E test", () => {
  describe("should pass each successive step", () => {
    let myApp: IAppData = { currentState: "menu", myList: [], lastDone: -1 };
    const firstThree = ["Write report", "Check email", "Tidy desk"];

    step("should confirm 3 specific items have been added", () => {
      firstThree.forEach((x) => {
        myApp.myList = addItem(myApp.myList)(
          createNewItem(x)(myApp.myList.length)
        );
      });

      expect(myApp.myList.length).equals(3);
      expect(listToMarksString(myApp.myList)).equals("[ ] [ ] [ ]");
    });

    step("should confirm that the 1st item has been marked", () => {
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      expect(listToMarksString(myApp.myList)).equals("[o] [ ] [ ]");
    });

    step("should confirm 3 items have been marked", () => {
      const answers001: TValidAnswer[] = ["y", "y"];
      myApp = SIMenterReviewState(myApp)(answers001);
      expect(listToMarksString(myApp.myList)).equals("[o] [o] [o]");
    });

    step("should confirm that CMWTD has been updated to last item", () => {
      expect(getCMWTDstring(myApp.myList)).equals(
        getTextByIndex(myApp.myList)(2)
      );
    });

    step("should confirm 3rd item has been completed", () => {
      // and that CMWTD & lastDone have been updated
      const beforeCMWTDindex = getCMWTDindex(myApp.myList);
      myApp = SIMenterFocusState(myApp); // conductFocus(todoList, lastDone, {workLeft: "n"});
      expect(getStatusByIndex(myApp.myList)(2)).equals("complete");
      expect(getCMWTDstring(myApp.myList)).equals(
        getTextByIndex(myApp.myList)(1)
      );
      expect(myApp.lastDone).equals(beforeCMWTDindex);
    });

    step("should confirm that all items are indexed sequentially", () => {
      for (let i = 0; i < myApp.myList.length; i++) {
        expect(myApp.myList[i].index).equals(i);
      }
    });
  });
});

describe("Long E2E test", () => {
  describe("should pass each successive step", () => {
    let myApp: IAppData = { currentState: "menu", myList: [], lastDone: -1 };
    const longList = [
      "Email",
      "In-Tray",
      "Voicemail",
      "Project X Report",
      "Tidy Desk",
      "Call Dissatisfied Customer",
      "Make Dental Appointment",
      "File Invoices",
      "Discuss Project Y with Bob",
      "Back Up",
    ];

    // create 10 items, and add them to the list
    step("should confirm 10 items have been added", () => {
      longList.forEach((x) => {
        myApp.myList = addItem(myApp.myList)(
          createNewItem(x)(myApp.myList.length)
        );
      });

      expect(myApp.myList.length).equals(10);
    });

    // "put a dot in front of the first task"
    step("should confirm that the 1st item has been marked", () => {
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      expect(getStatusByIndex(myApp.myList)(0)).equals("dotted");
    });

    // "Now ask yourself 'What do I want to do more than Email?'
    // You decide you want to do Voicemail more than Email.
    // Put a dot in front of it.
    // Now ask yourself 'What do I want to do more than Voicemail?'
    // You decide you want to tidy your desk."
    // review items, saying yes only for 3rd & 5th items
    step("should confirm 3 items have been marked", () => {
      const answers001: TValidAnswer[] = ["n", "y", "n", "y", "q"];
      myApp = SIMenterReviewState(myApp)(answers001);
      expect(listToMarksString(myApp.myList)).equals(
        "[o] [ ] [o] [ ] [o] [ ] [ ] [ ] [ ] [ ]"
      );
    });

    step(
      "should confirm that CMWTD has been updated to last marked item",
      () => {
        expect(getCMWTDstring(myApp.myList)).equals(
          getTextByIndex(myApp.myList)(4)
        );
      }
    );

    // // Do the "Tidy Desk" task (last marked item / CMWTD)
    step("should confirm 3rd item has been completed", () => {
      //// [todoList,  lastDone] = conductFocus(todoList, lastDone, {workLeft: "n"});
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); // todoList = setupReview(todoList);
      myApp = SIMenterFocusState(myApp);
      expect(getStatusByIndex(myApp.myList)(4)).equals("complete");
    });

    step("should confirm that CMWTD has been updated", () => {
      expect(getCMWTDstring(myApp.myList)).equals(
        getTextByIndex(myApp.myList)(2)
      );
    });

    // // note: this is not specifically part of the e2e flow, but
    // // please leave as is
    // // 1. setting up reviews here should do nothing
    step("should confirm starting new review leaves list alone", () => {
      const beforeList: string = listToMarksString(myApp.myList);
      const beforeCMWTD: string = String(getCMWTDstring(myApp.myList));
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      const afterList: string = listToMarksString(myApp.myList);
      const afterCMWTD: string = String(getCMWTDstring(myApp.myList));
      expect(beforeList).equals(afterList);
      expect(beforeCMWTD).equals(afterCMWTD);
    });

    // // again, this next step is not strictly part of the e2e flow
    // // but, still, it is useful to test in situations such as this
    step("should confirm review-then-quit leaves list as-is", () => {
      const answers: TValidAnswer[] = ["q"]; // immediately quitting, w/ no 'y' or 'n' answers
      myApp = SIMenterReviewState(myApp)(answers);
      expect(listToMarksString(myApp.myList)).equals(
        "[o] [ ] [o] [ ] [x] [ ] [ ] [ ] [ ] [ ]"
      );
    });

    // // "Now start again from Tidy Desk (i.e. the last task you did).
    // // and ask yourself 'What do I want to do more than Voicemail?'
    // // The only task you want to do more than Voicemail is Back Up."
    // // review items, saying yes only to last item (in this review it will be the 5th)
    step("should confirm 3 specific items have been marked", () => {
      const answers002: TValidAnswer[] = ["n", "n", "n", "n", "y"];
      myApp = SIMenterReviewState(myApp)(answers002);
      expect(listToMarksString(myApp.myList)).equals(
        "[o] [ ] [o] [ ] [x] [ ] [ ] [ ] [ ] [o]"
      );
    });

    // // "Do it." (Back Up)
    step("should confirm last item has been done", () => {
      //// [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
      myApp = SIMenterFocusState(myApp);
      expect(listToMarksString(myApp.myList)).equals(
        "[o] [ ] [o] [ ] [x] [ ] [ ] [ ] [ ] [x]"
      );
      expect(myApp.lastDone).equals(9);
    });

    // // "There are no further tasks beyond Back Up, so there is no
    // // need to check whether you want to do any tasks more than
    // // you want to do Voicemail. You just do it."
    step("should confirm last marked item is done next", () => {
      //[todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
      myApp = SIMenterFocusState(myApp);
      expect(listToMarksString(myApp.myList)).equals(
        "[o] [ ] [x] [ ] [x] [ ] [ ] [ ] [ ] [x]"
      );
      expect(myApp.lastDone).equals(2);
    });

    // // "You already know that you want to do Email more than In-tray, so you start
    // // scanning from the first task after the task you have just done (Voicemail)."
    // // "You decide you want to do Make Dental Appointment"
    step("should confirm 3 specific items have been marked", () => {
      const answers003: TValidAnswer[] = ["n", "n", "y", "n", "y"];
      //todoList = conductAllReviews(todoList, lastDone, answers003);
      myApp = SIMenterReviewState(myApp)(answers003);
      expect(listToMarksString(myApp.myList)).equals(
        "[o] [ ] [x] [ ] [x] [ ] [o] [ ] [o] [x]"
      );
    });

    // // As this is the last task on the list you do it immediately,
    // // and then do Make Dental Appointment immediately too.
    step("should confirm 4 specific items have been completed", () => {
      // [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
      // [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
      myApp = SIMenterFocusState(myApp);
      myApp = SIMenterFocusState(myApp);
      expect(listToMarksString(myApp.myList)).equals(
        "[o] [ ] [x] [ ] [x] [ ] [x] [ ] [x] [x]"
      );
    });

    step("should confirm that all items are indexed sequentially", () => {
      for (let i = 0; i < myApp.myList.length; i++) {
        expect(myApp.myList[i].index).equals(i);
      }
    });
  });
});

describe("REVIEW MODE INTEGRATION TESTS", () => {
  describe("Reviewing 0 item list", () => {
    // when there are no todo items, does not affect the todo list
    it("returns back empty list", () => {
      let myApp: IAppData = { currentState: "menu", myList: [], lastDone: -1 };
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); // "There are no todo items."
      //todoList = conductAllReviews(todoList, lastDone, []); // "There are no todo items."
      myApp = SIMenterReviewState(myApp)([]);
      expect(myApp.myList.length).equals(0);
      expect(getCMWTDindex(myApp.myList)).equals(-1);
    });
  });

  describe("Setting up review for 1 item list", () => {
    // with no dottable items returns back the items as is
    it("returns list with marked item as-is", () => {
      // make a list with one marked item
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(1),
        lastDone: -1,
      };
      myApp.myList[0].status = "dotted";
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      expect(listToMarksString(myApp.myList)).equals("[o]");
    });

    // with only one dottable item returns a dotted item
    it("returns list with unmarked item marked", () => {
      // make a list with one unmarked item
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(1),
        lastDone: -1,
      };
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      expect(listToMarksString(myApp.myList)).equals("[o]");
    });
  });

  describe("Reviewing 2 item list", () => {
    it(`with 'y' answer results in two marked items & 2nd item cmwtd`, () => {
      // make a list with one marked, one complete
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(2),
        lastDone: -1,
      };
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      myApp = SIMenterReviewState(myApp)(["y"]);
      expect(myApp.myList.length).equals(2);
      expect(getCMWTDstring(myApp.myList)).equals(FRUITS[1]);
    });

    // with no dottable items returns back the items as is
    // doesn't affect the list if all items are dotted to begin with
    it("returns list with 0 unmarked items as-is", () => {
      // make a list with one marked, one complete
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(2),
        lastDone: -1,
      };
      myApp.myList = markAllAs(myApp.myList)("dotted");
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); // "There are no ready items."
      myApp = SIMenterReviewState(myApp)([]);
      expect(myApp.myList.length).equals(2);
      expect(getCMWTDstring(myApp.myList)).equals(FRUITS[1]);
    });

    // issue: Architect assess whether firstReady func is appropriate for test #288
    it("returns list as-is when first non-complete, non-archived item is marked", () => {
      // returns back first non-complete, non-archived "ready" item as marked
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(2),
        lastDone: -1,
      };
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); // intentional double invocation
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); // intentional double invocation
      expect(myApp.myList[0].status).equals("dotted");
      expect(myApp.myList[1].status).equals("unmarked");
      expect(getCMWTDstring(myApp.myList)).equals(FRUITS[0]);
    });

    // should result in the first item being dotted if it wasn't already
    it("modifies list where 1st item is not marked", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(2),
        lastDone: -1,
      };
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      expect(myApp.myList[0].status).equals("dotted");
    });
  });

  describe("Conducting reviews", () => {
    // with no dottable items returns back the items as is
    it("when 0 ready items, doesn't affect the todo list", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(2),
        lastDone: -1,
      };

      myApp.myList[0].status = "complete";
      myApp.myList[1].status = "complete";

      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      myApp = SIMenterReviewState(myApp)([]);

      expect(myApp.myList.length).equals(2);
      expect(getCMWTDindex(myApp.myList)).equals(-1);
    });

    it("should return a list of items marked `[o] [ ] [o]` for input [`n`, `y`] ", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(3),
        lastDone: -1,
      };

      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      myApp = SIMenterReviewState(myApp)(["n", "y"]); // reviews from last marked (CMWTD) if lastDone is not set

      expect(getCMWTDstring(myApp.myList)).equals(FRUITS[2]);
      expect(listToMarksString(myApp.myList)).equals("[o] [ ] [o]");
    });

    it("should return a list of items marked `[o] [ ] [ ]` for input [`n`, `n`]", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(3),
        lastDone: -1,
      };

      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      myApp = SIMenterReviewState(myApp)(["n", "n"]);
      expect(getCMWTDstring(myApp.myList)).equals(FRUITS[0]);
      expect(listToMarksString(myApp.myList)).equals("[o] [ ] [ ]");
    });

    it("reviews from first unmarked if CMWTD is not set", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(3),
        lastDone: -1,
      };
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      myApp = SIMenterFocusState(myApp);
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      myApp = SIMenterReviewState(myApp)(["y"]);
      expect(listToMarksString(myApp.myList)).equals("[x] [o] [o]");
    });
  });

  // issue: Dev refactors "review from lastDone if set" case into suite #290
  describe("reviews from lastDone if set", () => {
    let myApp: IAppData = {
      currentState: "menu",
      myList: makeNItemArray(5),
      lastDone: -1,
    };

    step("should allow correct first review and focus", () => {
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone);
      myApp = SIMenterReviewState(myApp)(["n", "y", "n", "n"]);
      //[todoList, lastDone ] = conductFocus(todoList, lastDone, {workLeft: 'n'});
      myApp = SIMenterFocusState(myApp);
      expect(listToMarksString(myApp.myList)).equals("[o] [ ] [x] [ ] [ ]");
      expect(getCMWTDstring(myApp.myList)).equals(myApp.myList[0].textName);
    });

    step("should allow correct 2nd review", () => {
      myApp = SIMenterReviewState(myApp)(["n", "y"]);
      expect(listToMarksString(myApp.myList)).equals("[o] [ ] [x] [ ] [o]");
    });
  });

  // formerly "Second mini E2E test"
  describe("integration test of review completion", () => {
    describe("should lead to no reviewable items", () => {
      let myApp: IAppData = { currentState: "menu", myList: [], lastDone: -1 };
      const aList = ["a", "b"];

      step("should confirm 2 items has been added", () => {
        aList.forEach((x) => {
          myApp.myList = addItem(myApp.myList)(
            createNewItem(x)(myApp.myList.length)
          );
        });

        expect(myApp.myList.length).equals(2);
      });

      step("should confirm that the 1st item has been marked", () => {
        myApp.myList = markFirstMarkableIfPossible(myApp.myList)(
          myApp.lastDone
        );
        expect(myApp.myList[0].status).equals("dotted");
      });

      step("should re-confirm 1 item have been marked", () => {
        myApp = SIMenterReviewState(myApp)(["y"]);
        expect(listToMarksString(myApp.myList)).equals("[o] [o]");
      });

      step(
        "should confirm that CMWTD has been updated to last marked item",
        () => {
          expect(getCMWTDstring(myApp.myList)).equals(myApp.myList[1].textName);
        }
      );

      step("should confirm that reviewing does nothing now", () => {
        myApp.myList = markFirstMarkableIfPossible(myApp.myList)(
          myApp.lastDone
        );
        expect(myApp.myList[0].status).equals("dotted");
        expect(myApp.myList[1].status).equals("dotted");
      });

      step("should confirm only item has been completed", () => {
        //[todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft: "n"});
        myApp = SIMenterFocusState(myApp);
        expect(myApp.myList[1].status).equals("complete");
      });

      step("should confirm that CMWTD has been updated", () => {
        expect(getCMWTDstring(myApp.myList)).equals(myApp.myList[0].textName);
      });
    });
  });

  describe("Reviewing lists with completed items", () => {
    it("works only on reviewable subset of list", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(5),
        lastDone: 0,
      };
      myApp.myList[0].status = "complete";
      myApp.myList[2].status = "complete";
      myApp.myList[4].status = "complete";
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); //todoList = setupReview(todoList);
      myApp = SIMenterReviewState(myApp)(["y"]); //todoList = conductAllReviews(todoList, lastDone, ['y']);
      expect(listToMarksString(myApp.myList)).equals("[x] [o] [x] [o] [x]");
    });
  });
});

describe("TODO LIST INTEGRATION TESTS", () => {
  describe("List to marks function", () => {
    it("should return a list of items marked `[o] [ ]` for a given list", () => {
      const todoList: IItem[] = makeNItemArray(2);
      todoList[0].status = "dotted";
      expect(listToMarksString(todoList)).equals("[o] [ ]");
    });
  });

  describe("Conducting list iteration", () => {
    it("should correctly update CMWTD for input `[n, y]` ", () => {
      let myApp: IAppData = {
        currentState: "menu",
        myList: makeNItemArray(3),
        lastDone: -1,
      };
      myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); // "There are no todo items."
      myApp = SIMenterReviewState(myApp)(["n", "y"]); //todoList = conductAllReviews(todoList, lastDone, ['y']);
      expect(getCMWTDstring(myApp.myList)).equals(FRUITS[2]);
    });
  });
});
