// Local fallback if JSON loading fails
const FALLBACK_WORDS = {
  game: [{ word: 'HANGMAN', hint: 'The game you are playing' }]
};

let words = FALLBACK_WORDS;
let categories = Object.keys(words);
let wordsLoadPromise = null;

function pickRandomWord(wordMap) {
  const availableCategories = Object.keys(wordMap);
  if (!availableCategories.length) {
    return {
      word: 'HANGMAN',
      hint: 'The game you are playing',
      category: 'GAME'
    };
  }

  const category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
  const wordList = wordMap[category] || [];
  const wordObj = wordList[Math.floor(Math.random() * wordList.length)];

  if (!wordObj) {
    return {
      word: 'HANGMAN',
      hint: 'The game you are playing',
      category: 'GAME'
    };
  }

  return {
    word: wordObj.word,
    hint: wordObj.hint,
    category: category.toUpperCase()
  };
}

async function loadWords() {
  if (wordsLoadPromise) {
    return wordsLoadPromise;
  }

  wordsLoadPromise = fetch('/data/words.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load words.json (${response.status})`);
      }
      return response.json();
    })
    .then((data) => {
      const loadedCategories = Object.keys(data || {});
      if (!loadedCategories.length) {
        throw new Error('words.json is empty');
      }
      words = data;
      categories = loadedCategories;
    })
    .catch((error) => {
      console.error('Failed to load local words JSON:', error);
      words = FALLBACK_WORDS;
      categories = Object.keys(words);
    });

  return wordsLoadPromise;
}

async function getRandomWord() {
  await loadWords();
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  return pickRandomWord({ [randomCategory]: words[randomCategory] });
}

// Start loading immediately so fallback is ready faster if API fails.
loadWords();
