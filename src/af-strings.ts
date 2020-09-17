// TODO: assess whether creating a JSON file instead is more appropriate for your needs
// TODO: assess which strings are needed only for console (command line) app
export const doneFocusing = 'Once you finish focusing on this task, tap the enter key.';
export const skippingReview = `Skipping review (list is not reviewable)...`;
export const emptyList = "There are no items in your to-do list.";
export const makeMenuSelection = `Please make a menu selection.`;
export const automarkingFirstMarkable = `Auto-marking first markable item...`;
export const cantAutomark = `Unable to auto-mark. Returning list as is...`;
export const cantFocus = `Cannot focus at this time. Mark (dot) an item first.`;
export const readAboutApp = `This is a stub for About AutoFocus...`;
export const errorReadingState = `It appears there was an error reading state...`;
export const errorMutatingState = `It appears there was an error mutating state...`;
export const setupDemoData = `Setting up starting demo data...`;
export const demoDataComplete = `... demo data setup is complete.`;
export const wantToHideCompleted = "Do you want to hide completed items? ([y]es / [n]o) ";
export const enterNewItem = `Please enter a to-do item: `;
export const indexAtEndOfArr = `Index is at the end of the array: returning not found...`;
export const notMarkableOrReviewable = `List is neither markable nor reviewable.`;
export const cantMarkOrReviewBecauseNoItems = "Your list is empty. First, add some items.";
export const noHideableFound = `No hideable items found. First, focus on items to complete them.`;
export const confirmHiding = `Hiding hideable items...`;
export const nothingToSave = `There is no list data yet to save.`;
export const nothingToToggleHide = `No hideable/showable items found. First, focus on items to \
complete them.`;
export const listHeader = 'AUTOFOCUS LIST';
export const byeMessage = `See you!`;
export const fence = `----------`;
export const menuHeader = 'MAIN MENU';
export const hidingAllHideable = `Hiding all hideable items...`;
export const showingAllShowable = `Showing all showable items...`;

export const pwaMadeWith = `This AutoFocus PWA (Progress Web App) was made using TypeScript and ReactJS.`;
export const claMadeWith = `This AutoFocus CLA (Command Line App) was made using TypeScript and NodeJS.`;

export const credits1 = `The AutoFocus (FVP) algorithm was designed by Mark Forster.`
export const credits2 = `This program was architected and written by Avi Drucker.`

export const whyUseAnAlgoHeader = "Why Use an Algorithm for a To-Do List";
export const whyUseAnAlgoBody = `The AutoFocus algorithm, unlike most to-do list systems today, \
helps you (1) determine what you are most ready for and wanting to do at any given time, and \
(2) to take a bias towards action on such tasks.`;

export const howItWorksHeader = `How AutoFocus Works (simplified)`;
export const howItWorksBody = `1. First you add one or more todo items to your list
2. Then, you review your list, dotting the items you feel ready to do now
3. Lastly, you do the bottom-most dotted item & cross it out`;

export const stepByStepExHeader = `Step by Step Example`;
export const stepByStepExBody =
`Let's say you want to do three things: "finish trig homework", "wash the dishes", and "pack \
for tomorrow's trip". You add these three things to your list. Note, the 1st item you add gets \
dotted and becomes your "priority" item. You then run down the list after the 1st item and ask \
yourself, "Do I want to do this item more than [current priority item]?" Let's say you answer \
"no" to dishes and "yes" to packing. Your list will have dots by the first and third items, and \
the bottom-most dotted item becomes your new "priority" item. Now that all items have been \
reviewed, it's a good time to do one (or more). You do your packing, and, once you stop packing, \
you cross the last item of your list. Your list is now one dotted item, one item with no dot, \
and one completed item marked with an X or strikethrough.`;

export const pressEnterKeyToReturn = "Press the enter key to return to the main menu.";