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

let LEADERBOARD_SLOTS = 5;
let colors = shuffle(COLORS);
let maxPoints = COLORS.length / 2; // points to win a game (matched pairs)
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
let clicks = 0; //tracks for first and second click
let points = 0; //matched cards
let totalClicks = 0; //total amount of clicks
let first; // first card clicked
let second; // second card clicked

/** Shuffle array items in-place and return shuffled array. */
function shuffle(items) {
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
  let startContainer = document.getElementById("start"),
    pointsWrapper = document.getElementById("points-wrapper");

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
  let gameBoard = document.getElementById("game");

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
          displayWin();
        }, FOUND_MATCH_WAIT_MSECS);
      }

      // if not a match, flip both cards and reset clicks to 0
    } else {
      setTimeout(() => {
        unFlipCard([first, second]);
        resetClicks();
      }, FOUND_MATCH_WAIT_MSECS);
    }
    // if this is first click, flip this card, total click count +1, and store this card as first card
  } else if (clicks == 0 && !thisCard.classList.contains("flipped")) {
    flipCard(thisCard);
    updateClick();
    first = thisCard;
  }
}

/** Updates points based on cards matched, resets points if "reset" is passed into arg */
function updatePoints() {
  let container = document.querySelector(".points");

  //if reset is being passed in, reset points to 0
  arguments[0] === "reset" ? (points = 0) : points++;
  container.innerHTML = points;
}

/** Updates clicks and returns total clicks in DOM*/
function updateClick() {
  let container = document.querySelector(".clicks");

  if (arguments[0] === "reset") {
    clicks = 0;
    totalClicks = 0;
    container.innerHTML = "0";
  } else {
    clicks++;
    // if points is 6 then game is over and does not track clicks
    if (points != maxPoints) {
      totalClicks++;
      container.innerHTML = totalClicks;
    }
  }
}

/** Sets click to 0 */
function resetClicks() {
  clicks = 0;
}

/** Sets header to Win msg, toggles restart btn and highscore */
function displayWin() {
  let header = document.querySelector("#header h1"),
      restartBtn = document.querySelector("#restart"),
      submitBtn = document.querySelector("#submit-score");

  header.innerHTML = "You Win!";
  restartBtn.classList.toggle("hide");

  if (scoreIsEligible() || leaderboard.length < LEADERBOARD_SLOTS) {
    submitBtn.classList.toggle("hide");
  }
}

/** Restarts game with new board, reset clicks and text */
function restartGame() {
  let header = document.querySelector("#header h1"),
      gameBoard = document.getElementById("game"),
      restartBtn = document.querySelector("#restart");

  header.innerHTML = "Memory Game";
  updatePoints("reset");
  updateClick("reset");
  restartBtn.classList.toggle("hide");
  gameBoard.innerHTML = "";

  colors = shuffle(COLORS);
  createCards(colors);
}

/** Sort leaderboard to ascending order */
function sortLeaderboard(leaderboard) {
  let sorted = [];
  for (let item of leaderboard) {
    sorted.push([item[0], item[1]]);
  }
  sorted.sort(function (a, b) {
    return a[1] - b[1];
  });

  return sorted;
}

/** Saves score to localstorage leaderboard */
function scoreIsEligible() {
  let currentScores = leaderboard.map((entry) => entry[1]);

  let newHighScore = function (score) {
    return score > totalClicks;
  };

  return currentScores.some(newHighScore);
}

/** Checks if there are empty slots in leaderboard or if current points is lower than ones recorded on list.
 * If true, name and points are saved to local storage and DOM is updated to reflect that */
function submitScore() {
  let submitBtn = document.querySelector("#submit-score"),
      newScore = [prompt("Enter your name") || "Anonymous", totalClicks || 0],
      scoreEligible = scoreIsEligible();
      leaderboard = sortLeaderboard(leaderboard);

  if (leaderboard.length < LEADERBOARD_SLOTS) {
    leaderboard.push(newScore);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  } else if (scoreEligible) {
    leaderboard.pop();
    leaderboard.push(newScore);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  }

  submitBtn.classList.toggle("hide");
  openLeaderboard();
}

/** Appends new list item per entry in leaderboard, toggles hide class on leaderboard container */
function openLeaderboard() {
  let board = sortLeaderboard(leaderboard),
      boardContainer = document.querySelector("#leaderboard");

  boardContainer.classList.toggle("hide");

  board.forEach(function (item) {
    let li = document.createElement("li");
    let scoreList = document.querySelector("#leaderboard .scores");
    li.innerHTML = `<span class="score"><span>${item[0]} </span> <span>${item[1]}</span></span>`;
    scoreList.append(li);
  });
}

/** Removes list items in leaderboard, toggles hide class on leaderboard container */
function closeLeaderboard() {
  let boardContainer = document.querySelector("#leaderboard"),
      scoreList = document.querySelector("#leaderboard .scores");

  boardContainer.classList.toggle("hide");
  scoreList.innerHTML = "";
}
