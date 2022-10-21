"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */

const FOUND_MATCH_WAIT_MSECS = 1000;
const COLORS = [
  "red",
  "blue",
  "green",
  "orange",
  "indigo",
  "purple",
  "red",
  "blue",
  "green",
  "orange",
  "indigo",
  "purple",
];

const colors = shuffle(COLORS);
const maxPoints = COLORS.length / 2; // points to win a game (matched pairs)
let clicks = 0; //tracks for first and second click
let points = 0; //matched cards
let totalClicks = 0; //total amount of clicks
let first;
let second;

/** Shuffle array items in-place and return shuffled array. */

function shuffle(items) {
  // This algorithm does a "perfect shuffle", where there won't be any
  // statistical bias in the shuffle (many naive attempts to shuffle end up not
  // be a fair shuffle). This is called the Fisher-Yates shuffle algorithm; if
  // you're interested, you can learn about it, but it's not important.

  for (let i = items.length - 1; i > 0; i--) {
    // generate a random index between 0 and i
    let j = Math.floor(Math.random() * i);
    // swap item at i <-> item at j
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

/** Hides start container and creates cards to start playing */
function startGame() {
  const startContainer = document.getElementById("start");
  const pointsWrapper = document.getElementById("points-wrapper");
  startContainer.classList.toggle("hide");
  pointsWrapper.classList.toggle("hide");
  createCards(colors);
}

/** Create card for every color in colors (each will appear twice)
 *
 * Each div DOM element will have:
 * - a class with the value of the color
 * - a click event listener for each card to handleCardClick
 */

function createCards(colors) {
  const gameBoard = document.getElementById("game");
  for (let color of colors) {
    let div = document.createElement("div");
    div.classList.add(color);
    div.addEventListener("click", handleCardClick);
    gameBoard.append(div);
  }
}

/** Flip a card face-up. */
function flipCard(card) {
  setTimeout(() => {
    card.classList.add("flipped");
  }, 100);
}

/** Flip a card face-down. */
function unFlipCard(cards) {
  cards.forEach((card) => {
    card.classList.remove("flipped");
  });
}

/** Handle clicking on a card: this could be first-card or second-card. */
function handleCardClick(e) {
  let thisCard = e.target;

  // if this is 2nd click and card is not flipped, total click count +1, and store this card as second card
  if (clicks == 1 && !thisCard.classList.contains("flipped")) {
    flipCard(thisCard);
    updateClick();
    second = thisCard;

    // if first and second have the same color class, +1 point and reset clicks to 0
    if (first.classList[0] === second.classList[0]) {
      updatePoints();
      resetClicks();
      if (points === maxPoints) {
        setTimeout(() => {
          showRestart();
        }, 1000);
      }

      // if not a match, flip both cards and reset clicks to 0
    } else {
      setTimeout(() => {
        unFlipCard([first, second]);
        resetClicks();
      }, 1000);
    }
    // if this is first click, flip this card, total click count +1, and store this card as first card
  } else if (clicks == 0) {
    flipCard(thisCard);
    updateClick();
    first = thisCard;
  }
}

/** Updates points based on how many cards are matched */
function updatePoints() {
  points++;
  let container = document.querySelector(".points");
  container.innerHTML = points;
}

/** Updates clicks and shows total clicks in DOM*/
function updateClick() {
  clicks++;
  // if points is 6 then game is over and does not track clicks
  if (points != maxPoints) {
    totalClicks++;
    let container = document.querySelector(".clicks");
    container.innerHTML = totalClicks;
  }
}

/** Resets click tracker to 0 */
function resetClicks() {
  clicks = 0;
}

// Shows a You Win msg and gives user a button to refresh the game
function showRestart() {
  const header = document.querySelector("#header h1");
  const wrapper = document.querySelector(".wrapper");
  let restartBtn = document.createElement("button");
  header.innerHTML = "You Win!";
  restartBtn.classList.add("btn");
  restartBtn.innerHTML = "Restart Game?";
  restartBtn.addEventListener("click", function () {
    location.reload();
  });
  wrapper.append(restartBtn);
}
