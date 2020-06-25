import { expect } from "chai";
import { step } from 'mocha-steps';

import { createGreeting, getPluralS, isPluralFromCount, notEmptyString, isNegOne, getPositiveMin, 
	IItem, addItem, createNewItem, findFirstMarkable, TItemStatus, getCMWTDstring, statusToMark, 
	isReviewableList, markFirstMarkableIfPossible, getFirstReviewableIndex, mapUnmarkedToIndexAndFilter, 
	getFirstUnmarkedAfterIndex, getCMWTDindex, isMarkableList, SIMenterFocusState, IAppData } from "../src";

export const FRUITS = [
  "apple",
  "banana",
  "cherry",
  "dragonfruit",
  "elderberry"
];

// box operator === square brackets
const wrapStrInBoxOp = (s: string): string => "[" + s + "]";

const markAllAs = (arr: IItem[]) => (s: TItemStatus): IItem[] =>
	arr.map(x => ({index: x.index, status: s, textName: x.textName}));

const makeNItemArray = (n: number): IItem[] => {
 let todoList: IItem[] = [];
  for (let i = 0; i < n; i++) {
		todoList = addItem(todoList)
			(createNewItem(FRUITS[i % FRUITS.length])
				(todoList.length)
			);
  }
  return todoList;
};

const listToMarksString = (arr: IItem[]) =>
	arr.map(x => x.status)
		.map(x => statusToMark(x))
		.map(x => wrapStrInBoxOp(x))
		.join(' ');

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

//// findFirstMarkable originally called 'getFirstUnmarked'
describe("REVIEW MODE UNIT TESTS", () => {
  describe("Finding unmarked todos", () => {
    it("when there is one item, returns the first unmarked item", () => {
			const todoList: IItem[] = makeNItemArray(1);
			const lastDone: number = -1;
      expect(todoList.length).equals(1);
      expect(findFirstMarkable(todoList)(lastDone)).equals(0);
    });

    it("when there are multiple items, returns the first unmarked item", () => {
			const todoList: IItem[] = makeNItemArray(2);
			let lastDone: number = -1;
			todoList[0].status = 'complete';
			lastDone = 0;
      expect(findFirstMarkable(todoList)(lastDone)).equals(1);
    });

    it("returns -1 when there are no todos", () => {
			const todoList: IItem[] = makeNItemArray(0);
			const lastDone: number = -1;
      expect(findFirstMarkable(todoList)(lastDone)).equals(-1);
    });

    it("returns -1 when there are no unmarked todos", () => {
			let todoList: IItem[] = makeNItemArray(2);
			let lastDone: number = -1;
			todoList = markAllAs(todoList)('complete');
			lastDone = 0;
      expect(findFirstMarkable(todoList)(lastDone)).equals(-1);
    });

    it("when there are both marked and unmarked items, returns the unmarked item", () => {
			const todoList: IItem[] = makeNItemArray(2);
			const lastDone: number = -1;
      todoList[0].status = 'dotted';
      todoList[1].status = 'unmarked';
      expect(getFirstReviewableIndex(todoList)(lastDone)).equals(1);
    });
  });

	// isReviewableList was originally 'readyToReview'
  describe("Ready to review check", () => {
    it("determines list `[o] [o] [o]` NOT ready for review", () => {
			let todoList: IItem[] = makeNItemArray(3);
			const lastDone: number = -1;
      todoList = markAllAs(todoList)('dotted');
      expect(listToMarksString(todoList)).equals("[o] [o] [o]");
			expect(isReviewableList(todoList)(lastDone)).equals(false);
			expect(getFirstReviewableIndex(todoList)(lastDone)).equals(-1);
			//// findFirstMarkable
    });

    it("determines list `[x] [x] [x]` NOT ready for review", () => {
			let todoList: IItem[] = makeNItemArray(3);
			let lastDone: number = -1;
      todoList = markAllAs(todoList)('complete');
			lastDone = 0;
			expect(listToMarksString(todoList)).equals("[x] [x] [x]");
			expect(isReviewableList(todoList)(lastDone)).equals(false);
			expect(getFirstReviewableIndex(todoList)(lastDone)).equals(-1);
    });

    it("determines list `[x] [x] [o]` NOT ready for review", () => {
			let todoList: IItem[] = makeNItemArray(3);
			let lastDone: number = -1;
      todoList = markAllAs(todoList)('complete');
			todoList[2].status = 'dotted';
			lastDone = 1;
      expect(listToMarksString(todoList)).equals("[x] [x] [o]"); // note: the order in which they were completed could be either 0,1 or 1,0
      expect(isReviewableList(todoList)(lastDone)).equals(false);
    });

    it("determines list `[x] [o] [ ]` ready for review", () => {
      let todoList: IItem[] = makeNItemArray(3);
      let lastDone: number = -1; // lastDone was a string originally
      todoList[0].status = 'complete';
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
			let lastDone: number = -1;
			todoList[0].status = 'complete';
			lastDone = 0;
			expect(listToMarksString(todoList)).equals("[x] [ ] [ ]");
			expect(isMarkableList(todoList)(lastDone)).equals(true); // diff from original tests
			expect(isReviewableList(todoList)(lastDone)).equals(false); // diff from original tests
			expect(getFirstReviewableIndex(todoList)(lastDone)).equals(-1);
    });

    it("determines list `[o] [ ] [o]` NOT ready for review", () => {
			let todoList: IItem[] = makeNItemArray(3);
			const lastDone: number = -1;
      todoList[0].status = 'dotted';
      todoList[2].status = 'dotted';
      expect(listToMarksString(todoList)).equals("[o] [ ] [o]");
			expect(isReviewableList(todoList)(lastDone)).equals(false);
			expect(getFirstReviewableIndex(todoList)(lastDone)).equals(-1);
		});
		
		// new test for fp-autofocus
		it("determines list `[o] [ ] [x]` ready for review", () => {
			let todoList: IItem[] = makeNItemArray(3);
			let lastDone: number = -1;
      todoList[0].status = 'dotted';
			todoList[2].status = 'complete';
			lastDone = 2;
      expect(listToMarksString(todoList)).equals("[o] [ ] [x]");
			expect(isReviewableList(todoList)(lastDone)).equals(true);
			expect(getFirstReviewableIndex(todoList)(lastDone)).equals(1);
    });

    it("determines list `[o] [ ] [o] [ ]` ready for review", () => {
			let todoList: IItem[] = makeNItemArray(4);
			const lastDone: number = -1;
      todoList[0].status = 'dotted';
      todoList[2].status = 'dotted';
      expect(listToMarksString(todoList)).equals("[o] [ ] [o] [ ]");
			expect(isReviewableList(todoList)(lastDone)).equals(true);
			expect(getFirstReviewableIndex(todoList)(lastDone)).equals(3);
    });

    it("determines list `[x] [o] [ ]` ready for review", () => {
			const todoList: IItem[] = makeNItemArray(3);
			let lastDone: number = -1;
			todoList[0].status = 'complete';
			lastDone = 0;
      todoList[1].status = 'dotted';
      expect(listToMarksString(todoList)).equals("[x] [o] [ ]");
			expect(isReviewableList(todoList)(lastDone)).equals(true);
			expect(getFirstReviewableIndex(todoList)(lastDone)).equals(2);
    });
  });

	// todoList = markFirstMarkableIfPossible(todoList)(lastDone);
	// SIMenterFocusState(myApp)
  describe("Determining the last done index", () => {
    it("gets the correct index as last done", () => {
      let myApp: IAppData = {currentState: 'menu', myList: makeNItemArray(3), lastDone: -1};
			myApp.myList = markFirstMarkableIfPossible(myApp.myList)(myApp.lastDone); // todoList = setupReview(todoList);
			myApp = SIMenterFocusState(myApp);
			// [todoList, lastDone] = conductFocus(todoList, lastDone, {
      //   workLeft: "n"
      // });
      expect(myApp.lastDone).equals(0); // original: 'getLastDoneIndex(todoList, lastDone)'
      expect(listToMarksString(myApp.myList)).equals("[x] [ ] [ ]");
    });
  });

  // describe("Determining where reviews start", () => {
  //   it("should return index 2 on list with `[x] [o] [ ]` state", () => {
  //     let todoList: IItem[] = makeNItemArray(3);
  //     let lastDone: string = "";
  //     todoList = setupReview(todoList); // mark the first item
  //     // todoList = conductAllReviews(todoList, lastDone, ['q']); // effectively not necessary for this test, but left in for demo purposes
  //     [todoList, lastDone] = conductFocus(todoList, lastDone, {
  //       workLeft: "n"
  //     });
  //     todoList = setupReview(todoList); // mark the second item now
  //     expect(determineReviewStart(todoList, lastDone)).equals(2);
  //     expect(listToMarksString(todoList)).equals("[x] [o] [ ]");
  //   });
  // });
});

describe("FP TESTS", () => {
	describe("Counting of unmarked items", () => {
		it('returns 2 for a list of two unmarked items', () => {
			const todoList: IItem[] = makeNItemArray(2);
			expect(mapUnmarkedToIndexAndFilter(todoList).length).equals(2);
		});
	});

	describe('Finding of first unmarked items after a specified index', () => {
		it('returns 1 for a list of 2 items where the first item is marked', () => {
			let todoList: IItem[] = makeNItemArray(2);
			const lastDone = -1;
			todoList = markFirstMarkableIfPossible(todoList)(lastDone);
			getFirstUnmarkedAfterIndex(todoList)(getCMWTDindex(todoList));
		})
	})
})

describe('Simple E2E test', () => {
  describe('should pass each successive step', () => {
		let todoList: IItem[] = [];
		const firstThree = ["Write report","Check email","Tidy desk"];
		let lastDone: number = -1;

		step('should confirm 3 specific items have been added', () => {
			firstThree.forEach(
					x => {todoList = addItem(todoList)(createNewItem(x)(todoList.length))}
				);

			expect(todoList.length).equals(3);
			expect(listToMarksString(todoList)).equals("[ ] [ ] [ ]");
		});

		step('should confirm that the 1st item has been marked', () => {
			todoList = markFirstMarkableIfPossible(todoList)(lastDone);
			expect(listToMarksString(todoList)).equals("[o] [ ] [ ]");
		})

		// TODO: re-implement
		// step('should confirm 3 items have been marked', () => {
		// 	const answers001 = ['y','y'];
		// 	todoList = conductAllReviews(todoList, lastDone, answers001);
		// 	expect(listToMarksString(todoList)).equals("[o] [o] [o]");
		// });

		// step('should confirm that CMWTD has been updated to last item',() => {
		// 	expect(getCMWTDstring(todoList)).equals(todoList[2].textName);
		// });

		// step('should confirm 3rd item has been completed',() => { 
		// 	// and that CMWTD & lastDone have been updated
		// 	const beforeCMWTD = String(getCMWTDstring(todoList));
		// 	[todoList, lastDone] = conductFocus(todoList, lastDone, {workLeft: "n"});
		// 	expect(todoList[2].status).equals('complete');
		// 	expect(getCMWTDstring(todoList)).equals(todoList[1].textName);
		// 	expect(lastDone).equals(beforeCMWTD);
		// });
	});
});

describe('Long E2E test', () => {
  describe('should pass each successive step', () => {
		let todoList: IItem[] = [];
		const longList = ["Email", "In-Tray", "Voicemail", "Project X Report",
			"Tidy Desk", "Call Dissatisfied Customer", "Make Dental Appointment",
			"File Invoices", "Discuss Project Y with Bob", "Back Up"];
		let lastDone: number = -1;

		// create 10 items, and add them to the list
		step('should confirm 10 items have been added', () => {
			longList.forEach(
				x => {todoList = addItem(todoList)(createNewItem(x)(todoList.length))}
			);

			expect(todoList.length).equals(10);
		});

		// "put a dot in front of the first task"
		step('should confirm that the 1st item has been marked', () => {
			todoList = markFirstMarkableIfPossible(todoList)(lastDone);
			expect(todoList[0].status).equals('dotted');
		})

		// TODO: re-implement
		// "Now ask yourself 'What do I want to do more than Email?'
		// You decide you want to do Voicemail more than Email.
		// Put a dot in front of it.
		// Now ask yourself 'What do I want to do more than Voicemail?'
		// You decide you want to tidy your desk."
		// review items, saying yes only for 3rd & 5th items
		// step('should confirm 3 items have been marked', () => {
		// 	const answers001 = ['n','y','n','y','q'];
		// 	todoList = conductAllReviews(todoList, lastDone, answers001);
		// 	expect(listToMarksString(todoList)).equals(
		// 		"[o] [ ] [o] [ ] [o] [ ] [ ] [ ] [ ] [ ]");
		// });

		// step('should confirm that CMWTD has been updated to last marked item',() => {
		// 	expect(getCMWTDstring(todoList)).equals(todoList[4].textName);
		// });

		// // Do the "Tidy Desk" task (last marked item / CMWTD)
		// step('should confirm 3rd item has been completed',() => {
		// 	[todoList,  lastDone] = conductFocus(todoList, lastDone, {workLeft: "n"});
		// 	expect(todoList[4].status).equals('complete');
		// });

		// step('should confirm that CMWTD has been updated',() => {
		// 	expect(getCMWTDstring(todoList)).equals(todoList[2].textName);
		// });

		// // note: this is not specifically part of the e2e flow, but
		// // please leave as is
		// // 1. setting up reviews here should do nothing
		// step('should confirm starting new review leaves list alone', () => {
		// 	const beforeList: string = listToMarksString(todoList);
		// 	const beforeCMWTD: string = String(getCMWTDstring(todoList));
		// 	todoList = markFirstMarkableIfPossible(todoList)(lastDone);
		// 	const afterList: string = listToMarksString(todoList);
		// 	const afterCMWTD: string = String(getCMWTDstring(todoList));
		// 	expect(beforeList).equals(afterList);
		// 	expect(beforeCMWTD).equals(afterCMWTD);
		// })

		// // again, this next step is not strictly part of the e2e flow
		// // but, still, it is useful to test in situations such as this
		// step('should confirm review-then-quit leaves list as-is', () => {
		// 	const answer = ['q']; // immediately quitting, w/ no 'y' or 'n' answers
		// 	todoList = conductAllReviews(todoList, lastDone, answer);
		// 	expect(listToMarksString(todoList)).equals(
		// 		"[o] [ ] [o] [ ] [x] [ ] [ ] [ ] [ ] [ ]");
		// });

		// // "Now start again from Tidy Desk (i.e. the last task you did).
		// // and ask yourself 'What do I want to do more than Voicemail?'
		// // The only task you want to do more than Voicemail is Back Up."
		// // review items, saying yes only to last item (in this review it will be the 5th)
		// step('should confirm 3 specific items have been marked', () => {
		// 	const answers002 = ['n','n','n','n','y'];
		// 	todoList = conductAllReviews(todoList, lastDone, answers002);
		// 	expect(listToMarksString(todoList)).equals(
		// 		"[o] [ ] [o] [ ] [x] [ ] [ ] [ ] [ ] [o]");
		// });

		// // "Do it." (Back Up)
		// step('should confirm last item has been done', () => {
		// 	[todoList, lastDone] = conductFocus(
		// 		todoList, lastDone, {workLeft:'n'});
		// 		expect(listToMarksString(todoList)).equals(
		// 			"[o] [ ] [o] [ ] [x] [ ] [ ] [ ] [ ] [x]");
		// 		expect(lastDone).equals(todoList[9].textName);
		// });

		// // "There are no further tasks beyond Back Up, so there is no
		// // need to check whether you want to do any tasks more than
		// // you want to do Voicemail. You just do it."
		// step('should confirm last marked item is done next', () => {
		// 	[todoList, lastDone] = conductFocus(
		// 		todoList, lastDone, {workLeft:'n'});
		// 		expect(listToMarksString(todoList)).equals(
		// 			"[o] [ ] [x] [ ] [x] [ ] [ ] [ ] [ ] [x]");
		// 		expect(lastDone).equals(todoList[2].textName);
		// });

		// // "You already know that you want to do Email more than In-tray, so you start
		// // scanning from the first task after the task you have just done (Voicemail)."
		// // "You decide you want to do Make Dental Appointment"
		// step('should confirm 3 specific items have been marked', () => {
		// 	const answers003 = ['n','n','y','n','y'];
		// 	todoList = conductAllReviews(todoList, lastDone, answers003);
		// 	expect(listToMarksString(todoList)).equals(
		// 		"[o] [ ] [x] [ ] [x] [ ] [o] [ ] [o] [x]");
		// });

		// // As this is the last task on the list you do it immediately,
		// // and then do Make Dental Appointment immediately too.
		// step('should confirm 4 specific items have been completed', () => {
		// 	[todoList, lastDone] = conductFocus(
		// 		todoList, lastDone, {workLeft:'n'});
		// 	[todoList, lastDone] = conductFocus(
		// 			todoList, lastDone, {workLeft:'n'});
		// 	expect(listToMarksString(todoList)).equals(
		// 		"[o] [ ] [x] [ ] [x] [ ] [x] [ ] [x] [x]");
		// });
	}); 
});