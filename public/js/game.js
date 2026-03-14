// Hangman Game Logic

const MAX_ERRORS = 6;
const WIN_POINTS = 100;
const STREAK_BONUS = 25;

let currentWord = '';
let currentWordId = null;
let currentHint = '';
let currentCategory = '';
let guessedLetters = [];
let errors = 0;
let streak = 0;
let score = window.GAME_CONFIG.initialScore;
let gameOver = false;

// DOM Elements
const wordDisplay = document.getElementById('word-display');
const hintText = document.getElementById('hint-text');
const categoryBadge = document.getElementById('category-badge');
const keyboard = document.getElementById('keyboard');
const gameStatus = document.getElementById('game-status');
const currentScoreEl = document.getElementById('current-score');
const newGameBtn = document.getElementById('new-game-btn');
const modal = document.getElementById('game-modal');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalWord = document.getElementById('modal-word');
const modalScoreLabel = document.getElementById('modal-score-label');
const modalScoreValue = document.getElementById('modal-score-value');
const modalPlayAgain = document.getElementById('modal-play-again');

// Initialize keyboard
function initKeyboard() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  keyboard.innerHTML = '';
  
  letters.forEach(letter => {
    const key = document.createElement('button');
    key.className = 'key';
    key.textContent = letter;
    key.dataset.letter = letter;
    key.addEventListener('click', () => handleGuess(letter));
    keyboard.appendChild(key);
  });
}

// Start new game - fetch word from Supabase, fallback to words.js
async function startNewGame() {
  hintText.textContent = 'Loading...';
  let wordData;
  try {
    const res = await fetch('/api/words/random');
    if (!res.ok) throw new Error('Failed to fetch word');
    const data = await res.json();
    if (!data.word) throw new Error('Empty word');
    wordData = data;
  } catch (err) {
    console.error('API failed, using local words:', err);
    wordData = typeof getRandomWord === 'function'
      ? await getRandomWord()
      : { word: 'HANGMAN', hint: 'The game you are playing', category: 'GAME' };
    wordData.word_id = null;
  }
  currentWord = wordData.word;
  currentWordId = wordData.word_id ?? null;
  currentHint = wordData.hint || '';
  currentCategory = wordData.category || 'DESIGN';
  guessedLetters = [];
  errors = 0;
  gameOver = false;
  
  // Reset UI
  categoryBadge.textContent = currentCategory;
  hintText.textContent = `Hint: ${currentHint}`;
  gameStatus.textContent = '';
  
  // Reset keyboard
  document.querySelectorAll('.key').forEach(key => {
    key.disabled = false;
    key.classList.remove('correct', 'wrong');
  });
  
  // Reset hangman
  document.querySelectorAll('.body-part').forEach(part => {
    part.classList.remove('visible');
  });
  
  // Update word display
  updateWordDisplay();
  
  // Hide modal
  modal.classList.remove('visible', 'win', 'lose');
}

// Update word display
function updateWordDisplay() {
  if (!currentWord) {
    wordDisplay.innerHTML = '<span class="game-status">No word loaded. Click NEW WORD.</span>';
    return;
  }
  wordDisplay.innerHTML = currentWord.split('').map(letter => {
    const isRevealed = guessedLetters.includes(letter);
    return `<div class="letter-box ${isRevealed ? 'revealed' : ''}">${isRevealed ? letter : '_'}</div>`;
  }).join('');
}

// Handle letter guess
function handleGuess(letter) {
  if (gameOver || guessedLetters.includes(letter)) return;
  
  guessedLetters.push(letter);
  const key = document.querySelector(`.key[data-letter="${letter}"]`);
  key.disabled = true;
  
  if (currentWord.includes(letter)) {
    // Correct guess
    key.classList.add('correct');
    updateWordDisplay();
    checkWin();
  } else {
    // Wrong guess
    key.classList.add('wrong');
    errors++;
    showBodyPart(errors - 1);
    checkLose();
  }
}

// Show body part
function showBodyPart(index) {
  const part = document.querySelector(`.body-part[data-part="${index}"]`);
  if (part) {
    part.classList.add('visible');
  }
}

// Check win condition
function checkWin() {
  const allRevealed = currentWord.split('').every(letter => guessedLetters.includes(letter));
  
  if (allRevealed) {
    gameOver = true;
    streak++;
    const points = WIN_POINTS + (streak > 1 ? STREAK_BONUS * (streak - 1) : 0);
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
    
    // Update server
    updateScore(score, false, currentWordId, 0);
    
    // Show modal
    showModal(false, 0);
  }
}

// Show game over modal
function showModal(won, points) {
  modal.classList.add('visible');
  modal.classList.add(won ? 'win' : 'lose');
  
  if (won) {
    modalIcon.innerHTML = '<img src="/smile.svg" alt="" class="modal-icon-img" aria-hidden="true">';
    modalTitle.textContent = 'YOU WON!';
    modalMessage.textContent = streak > 1 ? `${streak} wins in a row!` : 'Congratulations!';
    modalScoreLabel.textContent = 'Points earned:';
    modalScoreValue.textContent = `+${points}`;
  } else {
    modalIcon.innerHTML = '<img src="/skull.svg" alt="" class="modal-icon-img" aria-hidden="true">';
    modalTitle.textContent = 'GAME OVER';
    modalMessage.textContent = 'Try again!';
    modalScoreLabel.textContent = 'Current score:';
    modalScoreValue.textContent = score;
  }
  
  modalWord.textContent = currentWord;
}

// Update score on server
async function updateScore(newScore, won, wordId, gameScore) {
  try {
    await fetch('/api/update-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newScore, won, wordId, gameScore })
    });
  } catch (error) {
    console.error('Failed to update score:', error);
  }
}

// Keyboard input
document.addEventListener('keydown', (e) => {
  const letter = e.key.toUpperCase();
  if (/^[A-Z]$/.test(letter) && !gameOver) {
    handleGuess(letter);
  }
});

// Event listeners
newGameBtn.addEventListener('click', startNewGame);
modalPlayAgain.addEventListener('click', startNewGame);

// Initialize game
initKeyboard();
startNewGame();
