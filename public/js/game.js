// Hangman Game Logic

const MAX_ERRORS = 6;
const WIN_POINTS = 100;
const STREAK_BONUS = 25;
const MAX_WORD_REFRESHES = 5;

let currentWord = "";
let currentWordId = null;
let currentHint = "";
let currentCategory = "";
let guessedLetters = [];
let errors = 0;
let streak = 0;
let wordRefreshCount = 0;
let shouldResetHangman = true;
let score = window.GAME_CONFIG.initialScore;
let gameOver = false;

// DOM Elements
const wordDisplay = document.getElementById("word-display");
const hintText = document.getElementById("hint-text");
const categoryBadge = document.getElementById("category-badge");
const keyboard = document.getElementById("keyboard");
const gameStatus = document.getElementById("game-status");
const currentScoreEl = document.getElementById("current-score");
const newGameBtn = document.getElementById("new-game-btn");
const modal = document.getElementById("game-modal");
const modalWinMessage = document.getElementById("modal-win-message");
const modalWinWord = document.getElementById("modal-win-word");
const modalWinScoreValue = document.getElementById("modal-win-score-value");
const modalLoseWord = document.getElementById("modal-lose-word");
const modalLoseScoreValue = document.getElementById("modal-lose-score-value");
const modalWinContinueBtn = document.getElementById("modal-win-continue");
const modalLosePlayAgainBtn = document.getElementById("modal-lose-play-again");

function updateNewWordButtonState() {
    const refreshesLeft = Math.max(0, MAX_WORD_REFRESHES - wordRefreshCount);
    const refreshLimitReached =
        !gameOver && wordRefreshCount >= MAX_WORD_REFRESHES;

    newGameBtn.disabled = refreshLimitReached;
    newGameBtn.textContent = refreshLimitReached
        ? "ANSWER TO CONTINUE"
        : `NEW WORD (${refreshesLeft})`;
}

// Initialize keyboard
function initKeyboard() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    keyboard.innerHTML = "";

    letters.forEach((letter) => {
        const key = document.createElement("button");
        key.className = "key";
        key.textContent = letter;
        key.dataset.letter = letter;
        key.addEventListener("click", () => handleGuess(letter));
        keyboard.appendChild(key);
    });
}

// Start new game - fetch word from Supabase, fallback to words.js
async function startNewGame() {
    hintText.textContent = "Loading...";
    let wordData;
    try {
        const res = await fetch("/api/words/random");
        if (!res.ok) throw new Error("Failed to fetch word");
        const data = await res.json();
        if (!data.word) throw new Error("Empty word");
        wordData = data;
    } catch (err) {
        console.error("API failed, using local words:", err);
        wordData =
            typeof getRandomWord === "function"
                ? await getRandomWord()
                : {
                      word: "HANGMAN",
                      hint: "The game you are playing",
                      category: "GAME",
                  };
        wordData.word_id = null;
    }
    currentWord = wordData.word.trim().toUpperCase();
    currentWordId = wordData.word_id ?? null;
    currentHint = wordData.hint || "";
    currentCategory = wordData.category || "DESIGN";
    guessedLetters = [];
    gameOver = false;

    // Reset UI
    categoryBadge.textContent = currentCategory;
    hintText.textContent = `Hint: ${currentHint}`;
    gameStatus.textContent = "";

    // Reset keyboard
    document.querySelectorAll(".key").forEach((key) => {
        key.disabled = false;
        key.classList.remove("correct", "wrong");
    });

    if (shouldResetHangman) {
        errors = 0;
        // Full reset only after game over (or first load)
        document.querySelectorAll(".body-part").forEach((part) => {
            part.classList.remove("visible");
        });
        shouldResetHangman = false;
    }

    // Update word display
    updateWordDisplay();

    // Hide modal
    modal.classList.remove("visible", "win", "lose");
}

// Update word display
function updateWordDisplay() {
    if (!currentWord) {
        wordDisplay.innerHTML =
            '<span class="game-status">No word loaded. Click NEW WORD.</span>';
        return;
    }
    wordDisplay.innerHTML = currentWord
        .split("")
        .map((letter) => {
            const isRevealed = guessedLetters.includes(letter);
            return `<div class="letter-box ${isRevealed ? "revealed" : ""}">${isRevealed ? letter : "_"}</div>`;
        })
        .join("");
}

// Handle letter guess
function handleGuess(letter) {
    if (gameOver || guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);
    const key = document.querySelector(`.key[data-letter="${letter}"]`);
    key.disabled = true;

    if (currentWord.includes(letter)) {
        // Correct guess
        key.classList.add("correct");
        updateWordDisplay();
        checkWin();
    } else {
        // Wrong guess
        key.classList.add("wrong");
        errors++;
        showBodyPart(errors - 1);
        checkLose();
    }
}

// Show body part
function showBodyPart(index) {
    const part = document.querySelector(`.body-part[data-part="${index}"]`);
    if (part) {
        part.classList.add("visible");
    }
}

// Check win condition
function checkWin() {
    const allRevealed = currentWord
        .split("")
        .every((letter) => guessedLetters.includes(letter));

    if (allRevealed) {
        gameOver = true;
        streak++;
        const points =
            WIN_POINTS + (streak > 1 ? STREAK_BONUS * (streak - 1) : 0);
        score += points;
        currentScoreEl.textContent = score;

        // Update server
        updateScore(score, true, currentWordId, points);

        // Show modal
        showModal(true, points);
    }
}

// Check lose condition
function checkLose() {
    if (errors >= MAX_ERRORS) {
        gameOver = true;
        streak = 0;
        // Next round starts fresh after full hangman is collected.
        shouldResetHangman = true;

        // Update server
        updateScore(score, false, currentWordId, 0);

        // Show modal
        showModal(false, 0);
    }
}

// Show game over modal
function showModal(won, points) {
    modal.classList.add("visible");
    modal.classList.add(won ? "win" : "lose");
    // Player completed the round; refresh allowance resets for next word.
    wordRefreshCount = 0;
    updateNewWordButtonState();

    if (won) {
        modalWinMessage.textContent =
            streak > 1 ? `${streak} wins in a row!` : "Congratulations!";
        modalWinWord.textContent = currentWord;
        modalWinScoreValue.textContent = `+${points}`;
    } else {
        modalLoseWord.textContent = currentWord;
        modalLoseScoreValue.textContent = score;
    }
}

// Update score on server
async function updateScore(newScore, won, wordId, gameScore) {
    try {
        await fetch("/api/update-score", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ newScore, won, wordId, gameScore }),
        });
    } catch (error) {
        console.error("Failed to update score:", error);
    }
}

// Keyboard input
document.addEventListener("keydown", (e) => {
    const letter = e.key.toUpperCase();
    if (/^[A-Z]$/.test(letter) && !gameOver) {
        handleGuess(letter);
    }
});

// Event listeners
newGameBtn.addEventListener("click", () => {
    if (!gameOver && wordRefreshCount >= MAX_WORD_REFRESHES) {
        gameStatus.textContent =
            "You reached 5 word refreshes. Solve this word to continue.";
        return;
    }

    if (!gameOver) {
        wordRefreshCount++;
    }

    startNewGame();
    updateNewWordButtonState();
});
modalWinContinueBtn.addEventListener("click", startNewGame);
modalLosePlayAgainBtn.addEventListener("click", startNewGame);

// Initialize game
initKeyboard();
updateNewWordButtonState();
startNewGame();
