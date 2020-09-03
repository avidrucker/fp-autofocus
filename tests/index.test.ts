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
  findFirstMarkable,
  TItemStatus,
  getCMWTDstring,
  statusToMark,
  isReviewableList,
  markFirstMarkableIfPossible,
  getFirstReviewableIndex,
  getCMWTDindex,
  isMarkableList,
  SIMenterFocusState,
  IAppData,
  TValidAnswer,
  getTextByIndex,
  getStatusByIndex,
	createBlankData,
	createDemoData,
	countHideable,
	SIMresolveHideAndArchiveState,
	hideAllCompletedInAppData,
	moveHiddenToArchive,
	UNSET_LASTDONE,
	SIMenterMarkAndReviewState,
	SIMcreateAndAddNewItem,
	populateDemoAppByList,
	makeNewDemoDataOfLength,
	// countHidden,
	mapUnmarkedToIDAndFilter,
	get1stUnmarkedIndexAfter,
	SIMfocusAMAP,
	longE2Elist,
} from "../src";

// box operator === square brackets
const wrapStrInBoxOp = (s: string): string => "[" + s + "]";

// TODO: replace markAllAs with native API implementation
//    that uses, for example, SIMreview and answerAllYes
const markAllAs = (arr: IItem[]) => (s: TItemStatus): IItem[] =>
  arr.map((x) => ({ id: x.id, status: s, textName: x.textName, isHidden: x.isHidden }));

const listToMarksString = (arr: IItem[]) =>
  arr
    .map((x) => x.status)
    .map((x) => statusToMark(x))
    .map((x) => wrapStrInBoxOp(x))
    .join(" ");

// test utility functions
const expectNoCMWTD = (appData: IAppData): Chai.Assertion =>
  expect(getCMWTDindex(appData.myList)).equals(-1);

const expectLastDoneUnset = (appData: IAppData): Chai.Assertion =>
  expect(appData.lastDone).equals(UNSET_LASTDONE);

const expectMarkable = (appData: IAppData) => (b: boolean): Chai.Assertion =>
	expect(isMarkableList(appData.myList)(appData.lastDone)).equals(b);

const expectReviewable = (appData: IAppData) => (b: boolean): Chai.Assertion =>
	expect(isReviewableList(appData.myList)(appData.lastDone)).equals(b);

const expectMarksString = (appData: IAppData) => (s: string): Chai.Assertion =>
	expect(listToMarksString(appData.myList)).equals(s);

const expectFirstReviewable = (appData: IAppData) => (n: number): Chai.Assertion =>
	expect(getFirstReviewableIndex(appData.myList)(appData.lastDone)).equals(n);

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

  describe("isNegOne", () => {
    it("returns true when -1 argument is passed in", () => {
      expect(isNegOne(-1)).equals(true);
    });

    it("returns false when 5 argument is passed in", () => {
      expect(isNegOne(5)).equals(false);
    });
	});
	
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

describe("REVIEW MODE UNIT TESTS", () => {
  describe("Finding unmarked todos", () => {
    it("when there is one item, returns the first unmarked item", () => {
      const myApp: IAppData = makeNewDemoDataOfLength(1);
      expect(myApp.myList.length).equals(1);
      expect(findFirstMarkable(myApp.myList)(myApp.lastDone)).equals(0);
    });

    it("when there are multiple items, returns the first unmarked item", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(2);
      myApp = SIMenterMarkAndReviewState(myApp)([]);
			myApp = SIMenterFocusState(myApp);
      expect(findFirstMarkable(myApp.myList)(myApp.lastDone)).equals(1);
    });

    it("returns -1 when there are no todos", () => {
      const myApp: IAppData = makeNewDemoDataOfLength(0);
      expect(findFirstMarkable(myApp.myList)(myApp.lastDone)).equals(-1);
    });

    it("returns -1 when there are no unmarked todos", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(2);
      myApp = SIMenterMarkAndReviewState(myApp)(['y']);
      myApp = SIMenterFocusState(myApp);
      myApp = SIMenterFocusState(myApp);
      expect(findFirstMarkable(myApp.myList)(myApp.lastDone)).equals(-1);
    });

    it("when there are both marked and unmarked items, returns the unmarked item", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(2);
      myApp = SIMenterMarkAndReviewState(myApp)([]);
      expectFirstReviewable(myApp)(1);
    });
	});
	
  describe("Ready to review check", () => {
    it("determines list `[o] [o] [o]` NOT ready for review", () => {
      const myApp: IAppData = makeNewDemoDataOfLength(3); // ISSUE: Dev upgrades tests to use native APi #20
      myApp.myList = markAllAs(myApp.myList)("dotted");
      expectMarksString(myApp)("[o] [o] [o]");
      expectReviewable(myApp)(false);
      expectFirstReviewable(myApp)(-1); // findFirstMarkable
    });

    it("determines list `[x] [x] [x]` NOT ready for review", () => {
      const myApp: IAppData = makeNewDemoDataOfLength(3);
      myApp.myList = markAllAs(myApp.myList)("complete"); // ISSUE: Dev upgrades tests to use native APi #20
      myApp.lastDone = 0;
      expectMarksString(myApp)("[x] [x] [x]");
      expectReviewable(myApp)(false);
      expectFirstReviewable(myApp)(-1);
    });

    it("determines list `[x] [x] [o]` NOT ready for review", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(3);
			const answers1: TValidAnswer[] = ["y", "n"];
			myApp = SIMenterMarkAndReviewState(myApp)(answers1);
			myApp = SIMenterFocusState(myApp);
			myApp = SIMenterFocusState(myApp);
			expectMarkable(myApp)(true);
			expectReviewable(myApp)(false);
			const answers2: TValidAnswer[] = ["y"];
			myApp = SIMenterMarkAndReviewState(myApp)(answers2);
			expectMarksString(myApp)("[x] [x] [o]"); // note: the order in which they were completed could be either 0,1 or 1,0
      expectReviewable(myApp)(false);
    });

    it("determines list `[x] [ ] [ ]` NOT ready for review, but IS markable", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(3);
      myApp = SIMenterMarkAndReviewState(myApp)([]); // mark the first item
			myApp = SIMenterFocusState(myApp);
			expectMarksString(myApp)("[x] [ ] [ ]");
			expectReviewable(myApp)(false);
			expectMarkable(myApp)(true);
		});
		
    // note: this IS markable and WILL BE reviewable once "auto-dotted"
    it("determines list `[x] [ ] [ ]` markable but NOT YET ready for review", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(3);
      myApp = SIMenterMarkAndReviewState(myApp)([]); // mark the first item
			myApp = SIMenterFocusState(myApp);
			
			expectMarksString(myApp)("[x] [ ] [ ]");
			expectMarkable(myApp)(true);
			expectReviewable(myApp)(false); // diff from original tests
			// expectFirstReviewable(myApp)(-1);
      // expect(myApp.lastDone).equals(0);
    });

    it("determines list `[o] [ ] [o]` NOT ready for review", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(3);
      myApp = SIMenterMarkAndReviewState(myApp)(['n','y']);
			expectMarksString(myApp)("[o] [ ] [o]");
      expectReviewable(myApp)(false);
      expectFirstReviewable(myApp)(-1);
		});
		
    it("determines list `[o] [ ] [x]` ready for review", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(3);
			myApp = SIMenterMarkAndReviewState(myApp)(['n','y']);
			myApp = SIMenterFocusState(myApp);
      expectMarksString(myApp)("[o] [ ] [x]");
      expectReviewable(myApp)(true);
      expectFirstReviewable(myApp)(1);
    });

    it("determines list `[o] [ ] [o] [ ]` ready for review", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(4);
			myApp = SIMenterMarkAndReviewState(myApp)(['n','y','q']);
			expectMarksString(myApp)("[o] [ ] [o] [ ]");
			expectReviewable(myApp)(true);
      expectFirstReviewable(myApp)(3);
    });

    it("determines list `[x] [o] [ ]` ready for review", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(3);
			myApp = SIMenterMarkAndReviewState(myApp)([]);
			myApp = SIMenterFocusState(myApp);
			myApp = SIMenterMarkAndReviewState(myApp)(['n']);
      expectMarksString(myApp)("[x] [o] [ ]");
      expectReviewable(myApp)(true);
      expectFirstReviewable(myApp)(2);
    });
  });

  describe("Determining the last done index", () => {
    it("gets the correct index as last done", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(3);
			myApp = SIMenterMarkAndReviewState(myApp)([]);
			myApp = SIMenterFocusState(myApp);
			// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
			// TODO: implement test to confirm that workLeft can be set to true and a duplicate item is successfully added
      // [todoList, lastDone] = conductFocus(todoList, lastDone, {
      //   workLeft: "n"
      // });
      expect(myApp.lastDone).equals(0); // original: 'getLastDoneIndex(todoList, lastDone)'
      expectMarksString(myApp)("[x] [ ] [ ]");
    });
  });

  describe("Determining where reviews start", () => {
    it("should return index -1 (not reviewable) on list with `[x] [o] [o]` state", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(3);
			myApp = SIMenterMarkAndReviewState(myApp)([]); // mark first markable
      myApp = SIMenterFocusState(myApp);
      myApp = SIMenterMarkAndReviewState(myApp)(['y']); // mark first markable // this should do nothing, since this list is not currently markable
      expectFirstReviewable(myApp)(-1);
			expectMarksString(myApp)("[x] [o] [o]");
			expectReviewable(myApp)(false);
    });
  });
});

describe("FP TESTS", () => {
  describe("Counting of unmarked items", () => {
    it("returns 2 for a list of two unmarked items", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(2);
      expect(mapUnmarkedToIDAndFilter(myApp.myList).length).equals(2);
    });
  });

  describe("Finding of first unmarked items after a specified index", () => {
    it("returns 1 for a list of 2 items where the first item is marked", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(2);
			myApp = SIMenterMarkAndReviewState(myApp)([]);
      expect(get1stUnmarkedIndexAfter(myApp.myList)(getCMWTDindex(myApp.myList))).equals(1);
    });
	});
	
	describe("hideAllCompleted", () => {
		it("returns back item list where completed, unhidden items are hidden, archive is length of 1", () => {
			let appData: IAppData = createDemoData(); // hover over function for JSDoc docstring documentation
			expect(countHideable(appData.myList)).equals(1); // BEFORE
			appData = moveHiddenToArchive(hideAllCompletedInAppData(appData));
			expect(countHideable(appData.myList)).equals(0); // AFTER
			expect(appData.myArchive.length).equals(1);
		})
	});

	describe('addItem', () => {
		// Dev resolves bug where user is erroneously
		//    allowed to create no-header-text items #24
		it('does nothing to list if input IItem object has no header text', () => {
			// 1. create blank app data
			let myApp: IAppData = createBlankData();
			// 2. attempt to add a new item to it, w/o any header text ("")
			myApp = SIMcreateAndAddNewItem(myApp)("");
			// 3. expect that myList length is zero
			expect(myApp.myList.length).equals(0);
		});

		// Dev clarifies native API for item creation, enforces strict usage of
		//     combined myList, myArchive count for ID generation #22
		it('uses correctly incremented nextID', () => {
			// 1. create blank app data
			let myApp: IAppData = createBlankData();
			// 2. add new item with dummy text "a"
			myApp = SIMcreateAndAddNewItem(myApp)("a");
			// 3. mark first item by doing a no answer review
			myApp = SIMenterMarkAndReviewState(myApp)([]);
			// 4. focus on first item to complete it
			myApp = SIMenterFocusState(myApp);
			// 5. hide first item
			myApp = moveHiddenToArchive(hideAllCompletedInAppData(myApp));
			// 6. create a new item w/ dummy text "b"
			myApp = SIMcreateAndAddNewItem(myApp)("b");
			// 7. expect that this newly created item "b" has an ID of 1 (correctly incremented)
			//    and that the first item in the archive (item "a") is of ID 0
			expect(myApp.myArchive[0].id).equals(0);
			expect(myApp.myList[0].id).equals(1);
		});
	});
});

describe("FOCUS MODE INTEGRATION TESTS", () => {
  describe("Entering focus mode", () => {
    it("when there 0 items does not affect the todo list, or lastDone", () => {
			let myApp: IAppData = createBlankData();
			// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
      //// [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft: 'y'}); // "There are no todo items."
      myApp = SIMenterFocusState(myApp);
      expect(myApp.myList.length).equals(0);
      expectNoCMWTD(myApp);
      expectLastDoneUnset(myApp);
    });

    it("when no marked items exist, leaves todo list & cmwtd as-is", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(1);
			myApp = SIMenterFocusState(myApp);
			// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
      // [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft: 'y'}); // "The CMWTD has not been set."
      expect(myApp.myList.length).equals(1);
      expectMarksString(myApp)("[ ]");
    });
  });

  describe("Finding marked todos", () => {
    it("returns the last marked item", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(2);
      myApp.myList = markAllAs(myApp.myList)("dotted"); // ISSUE: Dev upgrades tests to use native APi #20
      // expect(getCMWTDindex(myApp.myList)).equals(1);
      expectMarksString(myApp)("[o] [o]");
    });

    it("returns -1 when there are no todos", () => {
      let myApp: IAppData = createBlankData();
      expectNoCMWTD(myApp);
      expect(myApp.myList.length).equals(0);
    });

    it("returns -1 index when there are no marked todos", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(2);
      expectNoCMWTD(myApp);
      expectMarksString(myApp)("[ ] [ ]");
    });

    it("when there are both marked and unmarked items, returns the marked item", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(2);
      myApp.myList[0].status = "dotted"; // getStatusByIndex(myApp.myList)(0)  // ISSUE: Dev upgrades tests to use native APi #20
      expect(getCMWTDindex(myApp.myList)).equals(0);
    });
  });

  describe("Updating the CMWTD", () => {
    it("updates CMWTD from something to nothing", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(1);
      expectMarksString(myApp)("[ ]");
      myApp = SIMenterMarkAndReviewState(myApp)([]); // mark first markable
      // ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
			expectMarksString(myApp)("[o]");
			myApp = SIMenterFocusState(myApp); //[todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
      expectMarksString(myApp)("[x]");
			expectNoCMWTD(myApp);
			// TODO: replace direct string comparison for expect equals with status string comparsion
      // TODO: comfirm correct lastDone update behavior in its own test
      // expect(getTextByIndex(myApp.myList)(myApp.lastDone)).equals(FRUITS[0]);
    });

    // issue: Dev rewrites tests to use intended functions instead of raw mutations #287
    it("updates CMWTD from bottom-most marked item to 2nd bottom-most", () => {
      // // ORIGINAL: let myApp: IAppData = makeNewAppData(2);
      let myApp: IAppData = makeNewDemoDataOfLength(2);
			// // TODO: replace markAllAs with native API (stub function: reviewAllYes())
			myApp.myList = markAllAs(myApp.myList)("dotted");
			// // ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
			expect(getCMWTDindex(myApp.myList)).equals(1);
			myApp = SIMenterFocusState(myApp); // [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
			expectMarksString(myApp)("[o] [x]");
			expect(getCMWTDindex(myApp.myList)).equals(0);
    });
  });

  // formerly "First mini E2E test"
  describe("integration test of list completion", () => {
    describe("should lead to CMWTD of empty string", () => {
      let myApp: IAppData = createBlankData();
			const aList = ["a"];
			
      step("should confirm 1 item has been added", () => {
				myApp = populateDemoAppByList(myApp)(aList);
        expect(myApp.myList.length).equals(1);
      });

      step("should confirm 1st item has been auto-marked", () => {
        const answers001: TValidAnswer[] = ["q"];
        myApp = SIMenterMarkAndReviewState(myApp)(answers001);;
				expectMarksString(myApp)("[o]");
      });

      step(
        "should confirm that CMWTD has been updated to last marked item",
        () => {
          expect(getCMWTDstring(myApp.myList)).equals(
            getTextByIndex(myApp.myList)(0)
          );
        }
      );

      step("should confirm that lastDone has NOT been updated YET from default -1", () => {
        expectLastDoneUnset(myApp);
      });

      step("should confirm only item has been completed", () => {
				// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
        // [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft: "n"});
        myApp = SIMenterFocusState(myApp);
        expectMarksString(myApp)("[x]");
      });

      step("should confirm that CMWTD has been updated", () => {
        expectNoCMWTD(myApp);
      });

      step("should confirm that lastDone has been updated", () => {
        expect(myApp.lastDone).equals(0);
      });
    });
  });
});

describe("E2E TESTS", () => {
	describe("Simple E2E test", () => {
		describe("should pass each successive step", () => {
			let myApp: IAppData = createBlankData();
			const firstThree = ["Write report", "Check email", "Tidy desk"];
			
			step("should confirm 3 specific items have been added", () => {
				myApp = populateDemoAppByList(myApp)(firstThree);	
				expect(myApp.myList.length).equals(3);
				expectMarksString(myApp)("[ ] [ ] [ ]");
			});
	
			step("should confirm 3 items have been marked", () => {
				const answers001: TValidAnswer[] = ["y", "y"];
				myApp = SIMenterMarkAndReviewState(myApp)(answers001);
				expectMarksString(myApp)("[o] [o] [o]");
			});
	
      step("should confirm that CMWTD has been updated to last item", () => {
				expect(getCMWTDindex(myApp.myList)).equals(2);
			});
	
			step("should confirm 3rd item has been completed", () => {
        // NOTE: multiple item tests should take multiple tests...
        // and that CMWTD & lastDone have been updated
				// const beforeCMWTDindex = getCMWTDindex(myApp.myList);
				// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
				myApp = SIMenterFocusState(myApp); // conductFocus(todoList, lastDone, {workLeft: "n"});
				// expect(getStatusByIndex(myApp.myList)(2)).equals("complete");
				// expect(getCMWTDstring(myApp.myList)).equals(
				// 	getTextByIndex(myApp.myList)(1)
				// );
        // expect(myApp.lastDone).equals(beforeCMWTDindex);
        expectMarksString(myApp)("[o] [o] [x]");
			});
  
      // note: this test would not work in the context of hidden items
			step("should confirm that all items are indexed sequentially", () => {
				for (let i = 0; i < myApp.myList.length; i++) {
					expect(myApp.myList[i].id).equals(i);
				}
			});
		});
	});
	
	describe("Long E2E test", () => {
		describe("should pass each successive step", () => {
			let myApp: IAppData = createBlankData();

			// create 10 items, and add them to the list
			step("should confirm 10 items have been added", () => {
				myApp = populateDemoAppByList(myApp)(longE2Elist);	
				expect(myApp.myList.length).equals(10);
			});
	
			// "put a dot in front of the first task"
			step("should confirm that the 1st item has been marked", () => {
				myApp = SIMenterMarkAndReviewState(myApp)([]); // mark first markable
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
				myApp = SIMenterMarkAndReviewState(myApp)(answers001);
				expectMarksString(myApp)(
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
				// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
        //// [todoList,  lastDone] = conductFocus(todoList, lastDone, {workLeft: "n"});
        
        // note: API evolution
        // 1: todoList = setupReview(todoList); // pure, focus on list only
				// 2: myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); // mutation of substate, uses multiple accessors, works with app state
        // 3: myApp = SIMenterMarkAndReviewState(myApp)([]); // mark first markable // 1 output, no argument accessors, no mutation
        myApp = SIMenterMarkAndReviewState(myApp)([]); // mark first markable
        myApp = SIMenterFocusState(myApp);
				expect(getStatusByIndex(myApp.myList)(4)).equals("complete");
			});
	
			step("should confirm that CMWTD has been updated", () => {
				expect(getCMWTDindex(myApp.myList)).equals(2);
			});
	
			// // note: this is not specifically part of the e2e flow, but
			// // please leave as is
			// // 1. setting up reviews here should do nothing
			step("should confirm starting new review leaves list alone", () => {
				const beforeList: string = listToMarksString(myApp.myList);
				const beforeCMWTD: string = String(getCMWTDstring(myApp.myList));
				myApp = SIMenterMarkAndReviewState(myApp)([]);
				const afterList: string = listToMarksString(myApp.myList);
				const afterCMWTD: string = String(getCMWTDstring(myApp.myList));
				expect(beforeList).equals(afterList);
				expect(beforeCMWTD).equals(afterCMWTD);
			});
	
			// // again, this next step is not strictly part of the e2e flow
			// // but, still, it is useful to test in situations such as this
			step("should confirm review-then-quit leaves list as-is", () => {
				const answers: TValidAnswer[] = ["q"]; // immediately quitting, w/ no 'y' or 'n' answers
				myApp = SIMenterMarkAndReviewState(myApp)(answers);
				expectMarksString(myApp)(
					"[o] [ ] [o] [ ] [x] [ ] [ ] [ ] [ ] [ ]"
				);
			});
	
			// // "Now start again from Tidy Desk (i.e. the last task you did).
			// // and ask yourself 'What do I want to do more than Voicemail?'
			// // The only task you want to do more than Voicemail is Back Up."
			// // review items, saying yes only to last item (in this review it will be the 5th)
			step("should confirm 3 specific items have been marked", () => {
				const answers002: TValidAnswer[] = ["n", "n", "n", "n", "y"];
				myApp = SIMenterMarkAndReviewState(myApp)(answers002);
				expectMarksString(myApp)(
					"[o] [ ] [o] [ ] [x] [ ] [ ] [ ] [ ] [o]"
				);
			});
	
			// // "Do it." (Back Up)
			step("should confirm last item has been done", () => {
				// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
				//// [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
				myApp = SIMenterFocusState(myApp);
				expectMarksString(myApp)(
					"[o] [ ] [o] [ ] [x] [ ] [ ] [ ] [ ] [x]"
				);
				expect(myApp.lastDone).equals(9); // TODO: replace with tail() and k("ID")
			});
	
			// // "There are no further tasks beyond Back Up, so there is no
			// // need to check whether you want to do any tasks more than
			// // you want to do Voicemail. You just do it."
			step("should confirm last marked item is done next", () => {
				// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
				//[todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
				myApp = SIMenterFocusState(myApp);
				expectMarksString(myApp)(
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
				myApp = SIMenterMarkAndReviewState(myApp)(answers003);
				expectMarksString(myApp)(
					"[o] [ ] [x] [ ] [x] [ ] [o] [ ] [o] [x]"
				);
			});
	
			// // As this is the last task on the list you do it immediately,
			// // and then do Make Dental Appointment immediately too.
			step("should confirm 4 specific items have been completed", () => {
				// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
				// [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
				// [todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft:'n'});
				myApp = SIMenterFocusState(myApp);
				myApp = SIMenterFocusState(myApp);
				expectMarksString(myApp)(
					"[o] [ ] [x] [ ] [x] [ ] [x] [ ] [x] [x]"
				);
			});
	
			step("should confirm that all items are indexed sequentially", () => {
				for (let i = 0; i < myApp.myList.length; i++) {
					expect(myApp.myList[i].id).equals(i);
				}
			});
		});
	});

	// confirm resolution of bug where list with 2 items where
	//   1 item is hidden and then archived and the remaining
	//   unmarked item cannot be marked (but should be) 
	describe("E2E test to isolate & confirm & resolve archive bug", () => {
		let myApp: IAppData = createBlankData();
		const firstTwo = ["a", "b"];

		step("should confirm 2 items have been added", () => {
			myApp = populateDemoAppByList(myApp)(firstTwo);
			expect(myApp.myList.length).equals(2);
			expectMarksString(myApp)("[ ] [ ]");
		});

		step("should confirm that the 1st item has been marked", () => {
			myApp = SIMenterMarkAndReviewState(myApp)([]); // "There are no todo items."
			expectMarksString(myApp)("[o] [ ]");
		});

		step("should confirm that the 1st item has been completed", () => {
			myApp = SIMenterFocusState(myApp);
			expectMarksString(myApp)("[x] [ ]");
		});

		step("should confirm 1st item has been hidden & archived", () => {
			myApp = SIMresolveHideAndArchiveState(myApp);
			expectMarksString(myApp)("[ ]");
		});

		step("should confirm that both myList and myArchive have 1 item", () => {
			expect(myApp.myList.length).equals(1);
			expect(myApp.myArchive.length).equals(1);
		});

		step("should confirm myList isMarkable and NOT reviewable, and lastDone is unset", () => {
			expectMarkable(myApp)(true);
			expectReviewable(myApp)(false);
			expectLastDoneUnset(myApp);
		});
	})

	// attempt to "sort" (do in order) item list by number priority (1,2,3...N)
	// question: are there any hitches in attempting to do this?
	// question: what are the number of reviews needed to "sort" this list?
	describe("E2E test to 'sort' a list of number items from lowest to highest (1,2,3...)", () => {
		let myApp: IAppData = createBlankData();
		const numberList = ["25","16","104","39","5","86","23","1","105","94","34"];

		step("should confirm N items have been added", () => {
			myApp = populateDemoAppByList(myApp)(numberList);
			expect(myApp.myList.length).equals(numberList.length);
			expectMarksString(myApp)("[ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]");
		});

		step("should confirm that list has been marked in a descending order", () => {
			myApp = SIMenterMarkAndReviewState(myApp)(['y','n','n','y','n','n','y','n','n','n']);
			expectMarksString(myApp)("[o] [o] [ ] [ ] [o] [ ] [ ] [o] [ ] [ ] [ ]");
		});

		// ~~use stubbed function, focus as much as possible "AMAP"~~
		// correction: the review algorithm needs to be redone after each
		//   focus in order to reassess, 'Are there "higher priority" items after
		//   the "last marked item" / "current priority item"?'
		step("should confirm highest priority items completed, save for 1st item which is still marked", () => {
			// myApp = SIMfocusAMAP(myApp);
			myApp = SIMenterFocusState(myApp);
			myApp = SIMenterFocusState(myApp);
			myApp = SIMenterFocusState(myApp);
			expectMarksString(myApp)("[o] [x] [ ] [ ] [x] [ ] [ ] [x] [ ] [ ] [ ]");
		});

		step("should confirm that list has been marked in a descending order", () => {
			myApp = SIMenterMarkAndReviewState(myApp)(['n','n','n','y','n','n','n']);
			// "25","16","104","39","5","86","23","1","105","94","34"
			expectMarksString(myApp)("[o] [x] [ ] [ ] [x] [ ] [o] [x] [ ] [ ] [ ]");
		});

		// since the remainder of marked items now have no higher priority items
		// in the unmarked part of the list, these marked items can be
		// completed in order all in one swoop
		step("should confirm highest priority items completed, save for 1st item which is still marked", () => {
			myApp = SIMfocusAMAP(myApp);
			expectMarksString(myApp)("[x] [x] [ ] [ ] [x] [ ] [x] [x] [ ] [ ] [ ]");
		});

		step("should confirm that the next item that will be marked will be index 2", () => {
			expect(findFirstMarkable(myApp.myList)(myApp.lastDone)).equals(2);
		})

		step("should confirm that the list is markable", () => {
			expectMarkable(myApp)(true);
		})

		step("auto-marking should mark the first markable item", () => {
			myApp = SIMenterMarkAndReviewState(myApp)(['y','n','n','n','y']);
			// "25","16","104","39","5","86","23","1","105","94","34"
			expectMarksString(myApp)("[x] [x] [o] [o] [x] [ ] [x] [x] [ ] [ ] [o]");
		});

		step("should confirm highest priority items completed, save for 1st item which is still marked", () => {
			// myApp = SIMfocusAMAP(myApp);
			myApp = SIMenterFocusState(myApp);
			myApp = SIMenterFocusState(myApp);
			expectMarksString(myApp)("[x] [x] [o] [x] [x] [ ] [x] [x] [ ] [ ] [x]");
		});

		step("auto-marking should mark the first markable item", () => {
			myApp = SIMenterMarkAndReviewState(myApp)(['y','n','n']);
			// "25","16","104","39","5","86","23","1","105","94","34"
			expectMarksString(myApp)("[x] [x] [o] [x] [x] [o] [x] [x] [ ] [ ] [x]");
		});

		step("should confirm highest priority items completed, save for 1st item which is still marked", () => {
			// myApp = SIMfocusAMAP(myApp);
			myApp = SIMenterFocusState(myApp);
			expectMarksString(myApp)("[x] [x] [o] [x] [x] [x] [x] [x] [ ] [ ] [x]");
		});

		step("auto-marking should mark the first markable item", () => {
			myApp = SIMenterMarkAndReviewState(myApp)(['n','y']);
			// "25","16","104","39","5","86","23","1","105","94","34"
			expectMarksString(myApp)("[x] [x] [o] [x] [x] [x] [x] [x] [ ] [o] [x]");
		});

		// since the remainder of marked items now have no higher priority items
		// in the unmarked part of the list, these marked items can be
		// completed in order all in one swoop
		step("should confirm highest priority items completed, save for 1st item which is still marked", () => {
			myApp = SIMfocusAMAP(myApp);
			expectMarksString(myApp)("[x] [x] [x] [x] [x] [x] [x] [x] [ ] [x] [x]");
		});

		step("auto-marking should mark the first markable item", () => {
			myApp = SIMenterMarkAndReviewState(myApp)([]);
			// "25","16","104","39","5","86","23","1","105","94","34"
			myApp= SIMenterFocusState(myApp);
			expectMarksString(myApp)("[x] [x] [x] [x] [x] [x] [x] [x] [x] [x] [x]");
		});
	})
});

describe("REVIEW MODE INTEGRATION TESTS", () => {
  describe("Reviewing 0 item list", () => {
    // when there are no todo items, does not affect the todo list
    it("returns back empty list", () => {
      let myApp: IAppData = createBlankData();
      myApp = SIMenterMarkAndReviewState(myApp)([]); // "There are no todo items."
      expect(myApp.myList.length).equals(0);
      expectNoCMWTD(myApp); // expect(getCMWTDindex(myApp.myList)).equals(-1);
    });
  });

  describe("Setting up review for 1 item list", () => {
    // with no dottable items returns back the items as is
    it("returns list with marked item as-is", () => {
      // make a list with one marked item
			let myApp: IAppData = makeNewDemoDataOfLength(1);
			myApp = SIMenterMarkAndReviewState(myApp)([]); // dots the only item
      myApp = SIMenterMarkAndReviewState(myApp)([]); // there are no further dottable items
      expectMarksString(myApp)("[o]");
    });

    // with only one dottable item returns a dotted item
    it("returns list with unmarked item marked", () => {
      // make a list with one unmarked item
      let myApp: IAppData = makeNewDemoDataOfLength(1);
      myApp = SIMenterMarkAndReviewState(myApp)([]); // dots the only item
      expectMarksString(myApp)("[o]");
    });
  });

	describe("Setting up review for 2 item list", () => {
		// should NOT mark the 2nd item when the 1st item is completed because it is the last done
		it(`returns back list of "[x] [ ]" for input "[x] [ ] (none hidden)"`, () => {
			let myApp: IAppData = makeNewDemoDataOfLength(2);
			myApp = SIMenterMarkAndReviewState(myApp)([]); // dots the only item
			myApp = SIMenterFocusState(myApp);
			expectMarksString(myApp)("[x] [ ]");
			myApp = SIMenterMarkAndReviewState(myApp)([]); // 2nd item IS dottable now
			expectMarksString(myApp)("[x] [o]");
			expectReviewable(myApp)(false);
		});

		// should mark the 2nd item when the 1st item is completed AND HIDDEN
		it(`returns back list of "[o]" for input "[x] [ ] (1 hidden)"`, () => {
			let myApp: IAppData = makeNewDemoDataOfLength(2);
			myApp = SIMenterMarkAndReviewState(myApp)([]); // dots the first markable item
			myApp = SIMenterFocusState(myApp);
			
			expectMarksString(myApp)("[x] [ ]");
			// expect(countHideable(myApp.myList)).equals(1);
			// expect(countHidden(myApp.myList)).equals(0);
			
			myApp = SIMresolveHideAndArchiveState(myApp);
			
			// expect(countHideable(myApp.myList)).equals(0);
			// expect(countHidden(myApp.myList)).equals(0);
			// expect(myApp.myList.length).equals(1);
			// expect(myApp.myArchive.length).equals(1);

			expectMarkable(myApp)(true);
			expectReviewable(myApp)(false);
			myApp = SIMenterMarkAndReviewState(myApp)([]); // dots the first markable item

      expectMarksString(myApp)("[o]");
		});
	})

  describe("Reviewing 2 item list", () => {
    it(`with 'y' answer results in two marked items & 2nd item cmwtd`, () => {
			// make a list with one marked, one complete
			let myApp: IAppData = makeNewDemoDataOfLength(2);
			myApp = SIMenterMarkAndReviewState(myApp)(["y"]);
			expectMarksString(myApp)("[o] [o]");
			expect(getCMWTDindex(myApp.myList)).equals(1);
    });

    // with no dottable items returns back the items as is
    // doesn't affect the list if all items are dotted to begin with
    it("returns already marked list with items as-is", () => {
			// make a list with one marked, one complete
			let myApp: IAppData = makeNewDemoDataOfLength(2);
			myApp = SIMenterMarkAndReviewState(myApp)(["y"]);
			myApp = SIMenterMarkAndReviewState(myApp)([]);
			expectMarksString(myApp)("[o] [o]");
			expect(getCMWTDindex(myApp.myList)).equals(1);
    });

    // issue: Architect assess whether firstReady func is appropriate for test #288
    it("returns list as-is when first non-complete, non-archived item is marked", () => {
      // returns back first non-complete, non-archived "ready" item as marked
      let myApp: IAppData = makeNewDemoDataOfLength(2);
      myApp = SIMenterMarkAndReviewState(myApp)([]); // intentional double invocation
      myApp = SIMenterMarkAndReviewState(myApp)([]); // intentional double invocation
      expectMarksString(myApp)("[o] [ ]");
      expect(getCMWTDindex(myApp.myList)).equals(0);
    });

    // should result in the first item being dotted if it wasn't already
    it("modifies list where 1st item is not marked", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(2);
      myApp = SIMenterMarkAndReviewState(myApp)([]);
      expectMarksString(myApp)("[o] [ ]");
		});
  });

  describe("Conducting reviews", () => {
    // with no dottable items returns back the items as is
    it("when 0 ready items, doesn't affect the todo list", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(2);
			myApp = SIMenterMarkAndReviewState(myApp)(["y"]);
			myApp = SIMenterFocusState(myApp);
			myApp = SIMenterFocusState(myApp);
			expectMarksString(myApp)("[x] [x]");
      myApp = SIMenterMarkAndReviewState(myApp)([]);
			expectMarksString(myApp)("[x] [x]");
    });

    it("should return a list of items marked `[o] [ ] [o]` for input [`n`, `y`] ", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(3);
      myApp = SIMenterMarkAndReviewState(myApp)(["n", "y"]); // reviews from last marked (CMWTD) if lastDone is not set
      expectMarksString(myApp)("[o] [ ] [o]");
    });

    it("should return a list of items marked `[o] [ ] [ ]` for input [`n`, `n`]", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(3);
		  myApp = SIMenterMarkAndReviewState(myApp)(["n", "n"]);
      expectMarksString(myApp)("[o] [ ] [ ]");
    });

		// fixed as a result of correction by algorithm author
		// old version: "reviews from first unmarked if CMWTD is not set"
    it("ensures 1st uncompleted item dotted, then first review is in comparison against", () => {
      let myApp: IAppData = makeNewDemoDataOfLength(3);
      myApp = SIMenterMarkAndReviewState(myApp)([]);
			myApp = SIMenterFocusState(myApp);
			expectNoCMWTD(myApp);
      myApp = SIMenterMarkAndReviewState(myApp)(["y"]);
      expectMarksString(myApp)("[x] [o] [o]");
    });
  });

  // issue: Dev refactors "review from lastDone if set" case into suite #290
  describe("reviews from lastDone if set", () => {
    let myApp: IAppData = makeNewDemoDataOfLength(5);

    step("should allow correct first review and focus", () => {
			myApp = SIMenterMarkAndReviewState(myApp)(["n", "y", "n", "n"]);
			// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
      //[todoList, lastDone ] = conductFocus(todoList, lastDone, {workLeft: 'n'});
      myApp = SIMenterFocusState(myApp);
      expectMarksString(myApp)("[o] [ ] [x] [ ] [ ]");
      expect(getCMWTDstring(myApp.myList)).equals(myApp.myList[0].textName);
    });

    step("should allow correct 2nd review", () => {
      myApp = SIMenterMarkAndReviewState(myApp)(["n", "y"]);
      expectMarksString(myApp)("[o] [ ] [x] [ ] [o]");
    });
  });

  // formerly "Second mini E2E test"
  describe("integration test of review completion", () => {
    describe("should lead to no reviewable items", () => {
      let myApp: IAppData = createBlankData();
			const aList = ["a", "b"];
			
      step("should confirm 2 items has been added", () => {
				myApp = populateDemoAppByList(myApp)(aList);
        expect(myApp.myList.length).equals(2);
      });

      step("should confirm that the 1st item has been marked", () => {
        myApp = SIMenterMarkAndReviewState(myApp)([]);
        expect(myApp.myList[0].status).equals("dotted");
      });

      step("should re-confirm 1 item have been marked", () => {
        myApp = SIMenterMarkAndReviewState(myApp)(["y"]);
        expectMarksString(myApp)("[o] [o]");
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
				// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
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
    it("works only on reviewable subset of list, compares against lastDone", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(5);
			myApp = SIMenterMarkAndReviewState(myApp)(["n", "y","n","y",]);
			myApp = SIMenterFocusState(myApp);
			myApp = SIMenterFocusState(myApp);
			myApp = SIMenterFocusState(myApp);
			expectMarksString(myApp)("[x] [ ] [x] [ ] [x]");
			myApp = SIMenterMarkAndReviewState(myApp)(["y", "y"]);
      expectMarksString(myApp)("[x] [o] [x] [o] [x]");
    });
  });
});

describe("TODO LIST INTEGRATION TESTS", () => {
  describe("List to marks function", () => {
    it("should return a list of items marked `[o] [ ]` for a given list", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(2);
			myApp = SIMenterMarkAndReviewState(myApp)([]);
      expectMarksString(myApp)("[o] [ ]");
    });
  });

  describe("Conducting list iteration", () => {
    it("should correctly update CMWTD for input `[n, y]` ", () => {
			let myApp: IAppData = makeNewDemoDataOfLength(3);
      myApp = SIMenterMarkAndReviewState(myApp)(["n", "y"]);
			expectMarksString(myApp)("[o] [ ] [o]");
    });
  });
});
