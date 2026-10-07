const PAIRS_COUNT = 8;
const MISMATCH_DELAY = 1000;
const STORAGE_KEY = 'game-results';

let activeModal = null;
let modalEscapeHandler = null;

const cardData = [
  { id: 1, image: './assets/cheese.svg', alt: 'Сыр' },
  { id: 2, image: './assets/cookie.svg', alt: 'Печенька' },
  { id: 3, image: './assets/magic.svg', alt: 'Магический шар' },
  { id: 4, image: './assets/mango.svg', alt: 'Манго' },
  { id: 5, image: './assets/potato.svg', alt: 'Картошка фри' },
  { id: 6, image: './assets/puzzle.svg', alt: 'Пазлик' },
  { id: 7, image: './assets/rainbow.svg', alt: 'Радуга' },
  { id: 8, image: './assets/unicorn.svg', alt: 'Еднорог' }
];

const state = {
  firstCard: null,
  secondCard: null,
  moves: 0,
  pairs: 0,
  lockBoard: false,
  gameFinished: false,
  closeTimer: null,
  resultSaved: false
};


const elements = {
  app: null,
  board: null,
  moves: null,
  pairs: null,
  newGameButton: null,
  leaderboardButton: null
};

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function createButton(text, className = 'button') {
  const button = createElement('button', className, text);
  button.type = 'button';
  return button;
}

function createApp() {
  const app = createElement('main', 'app');
  const header = createElement('header', 'header');
  const brand = createElement('div', 'header__brand');
  const logo = createElement('div', 'header__logo');
  
  const logoImage = document.createElement('img');
  logoImage.src = './assets/logo.svg';
  logoImage.alt = 'Logo';
  const brandText = createElement('div');
  const title = createElement('h1', 'header__title', 'Memory Game');
  const subtitle = createElement('p', 'header__subtitle', 'Найди все пары');

  logo.append(logoImage);
  brandText.append(title, subtitle);
  brand.append(logo, brandText);

  const actions = createElement('div', 'header__actions');

  elements.newGameButton = createButton('Новая игра', 'button button--primary');
  elements.leaderboardButton = createButton('Таблица лидеров', 'button');

  actions.append(elements.newGameButton, elements.leaderboardButton);
  header.append(brand, actions);

  const stats = createElement('section', 'stats');

  const movesStat = createElement('div', 'stat');
  const movesLabel = createElement('span', 'stat__label', 'Ходы');
  elements.moves = createElement('strong', 'stat__value', '0');
  movesStat.append(movesLabel, elements.moves);

  const pairsStat = createElement('div', 'stat');
  const pairsLabel = createElement('span', 'stat__label', 'Найдено пар');
  elements.pairs = createElement('strong', 'stat__value', `0 / ${PAIRS_COUNT}`);
  pairsStat.append(pairsLabel, elements.pairs);

  stats.append(movesStat, pairsStat);

  elements.board = createElement('section', 'game-board');

  app.append(header, stats, elements.board);
  document.body.append(app);

  elements.newGameButton.addEventListener('click', startNewGame);
  elements.leaderboardButton.addEventListener('click', showLeaderboard);

  return app;
}


function shuffleCards(cards) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function createGameCards() {
  const duplicated = [...cardData, ...cardData].map((card, index) => ({
    ...card,
    uniqueId: index
  }));

  return shuffleCards(duplicated);
}


function createCard(card) {
  const button = createElement('button', 'card');
  button.type = 'button';
  const inner = createElement('span', 'card__inner');
  const back = createElement('span', 'card__face card__face--back');
  const front = createElement('span', 'card__face card__face--front');
  const image = document.createElement('img');
  image.className = 'card__image';
  image.src = card.image;
  image.alt = card.alt;
  image.draggable = false;
  front.append(image);
  inner.append(back, front);
  button.append(inner);
  button.addEventListener('click', () => handleCardClick(button, card));
  return button;
}

function renderCards(cards) {
  elements.board.replaceChildren();
  cards.forEach((card) => {
    elements.board.append(createCard(card));
  });
}

function openCard(cardElement) {
  cardElement.classList.add('card--open');
}

function closeCard(cardElement) {
  cardElement.classList.remove('card--open');
}

function resetSelection() {
  state.firstCard = null;
  state.secondCard = null;
}


function handleCardClick(cardElement, cardDataItem) {
  if (state.lockBoard || state.gameFinished) {
    return;
  }

  if (
    cardElement.classList.contains('card--open') ||
    cardElement.classList.contains('card--matched')
  ) {
    return;
  }

  openCard(cardElement);

  if (!state.firstCard) {
    state.firstCard = {
      element: cardElement,
      data: cardDataItem
    };
    return;
  }

  state.secondCard = {
    element: cardElement,
    data: cardDataItem
  };

  state.moves += 1;
  updateStats();
  checkPair();
}

function checkPair() {
  const isMatch = state.firstCard.data.id === state.secondCard.data.id;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function handleMatch() {
  state.firstCard.element.classList.add('card--matched');
  state.secondCard.element.classList.add('card--matched');

  state.firstCard.element.disabled = true;
  state.secondCard.element.disabled = true;

  state.pairs += 1;
  updateStats();

  resetSelection();

  if (state.pairs === PAIRS_COUNT) {
    finishGame();
  }
}

function handleMismatch() {
  state.lockBoard = true;

  state.closeTimer = window.setTimeout(() => {
    if (!state.firstCard || !state.secondCard) {
      state.lockBoard = false;
      return;
    }

    closeCard(state.firstCard.element);
    closeCard(state.secondCard.element);

    resetSelection();
    state.lockBoard = false;
    state.closeTimer = null;
  }, MISMATCH_DELAY);
}


function updateStats() {
  elements.moves.textContent = String(state.moves);
  elements.pairs.textContent = `${state.pairs} / ${PAIRS_COUNT}`;
}

function startNewGame() {
  window.clearTimeout(state.closeTimer);
  state.closeTimer = null;

  if (activeModal) {
    closeModal();
  }

  state.firstCard = null;
  state.secondCard = null;
  state.moves = 0;
  state.pairs = 0;
  state.lockBoard = false;
  state.gameFinished = false;
  state.resultSaved = false;

  updateStats();
  renderCards(createGameCards());
}

function finishGame() {
  state.gameFinished = true;
  state.resultSaved = true;

  saveResult(state.moves);

  window.setTimeout(() => {
    showVictory();
  }, 250);
}

function getResults() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (result) =>
        Number.isInteger(result.moves) &&
        result.moves > 0 &&
        typeof result.date === 'string' &&
        Number.isFinite(result.timestamp)
    );
  } catch (error) {
    return [];
  }
}

function saveResult(moves) {
  const results = getResults();

  results.push({
    moves,
    date: formatDate(new Date()),
    timestamp: Date.now()
  });

  results.sort((a, b) => {
    if (a.moves !== b.moves) {
      return a.moves - b.moves;
    }

    return a.timestamp - b.timestamp;
  });

  const topResults = results.slice(0, 10);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(topResults));
  } catch (error) {
  }
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function createModal() {
  const modal = createElement('div', 'modal');

  const content = createElement('div', 'modal__content');
  content.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  modal.append(content);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  return { modal, content };
}

function openModal(content, focusElement) {
  closeModal();
  const { modal, content: modalContent } = createModal();
  modalContent.append(content);
  document.body.append(modal);
  activeModal = modal;
  document.body.classList.add('modal-open');
  modal.classList.add('modal--open');
  modalEscapeHandler = (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', modalEscapeHandler);
  if (focusElement) {
    window.setTimeout(() => focusElement.focus(), 0);
  }
}

function closeModal() {
  if (!activeModal) {
    return;
  }

  activeModal.remove();
  activeModal = null;

  document.body.classList.remove('modal-open');

  if (modalEscapeHandler) {
    document.removeEventListener('keydown', modalEscapeHandler);
    modalEscapeHandler = null;
  }
}

function createModalHeader(titleText, descriptionText) {
  const header = createElement('div', 'modal__header');

  const text = createElement('div');
  const title = createElement('h2', 'modal__title', titleText);
  text.append(title);

  if (descriptionText) {
    const description = createElement('p', 'modal__text', descriptionText);
    text.append(description);
  }

  const closeButton = createButton('×', 'modal__close');

  header.append(text, closeButton);

  return { header, closeButton };
}

function showVictory() {
  const content = createElement('div');

  const { header, closeButton } = createModalHeader(
    'Победа!',
    'Все картинки обрели свою пару :)'
  );

  const result = createElement('div', 'result');

  const movesRow = createElement('div', 'result__row');
  movesRow.append(
    createElement('span', '', 'Количество ходов'),
    createElement('strong', 'result__value', String(state.moves))
  );

  const pairsRow = createElement('div', 'result__row');
  pairsRow.append(
    createElement('span', '', 'Найдено пар'),
    createElement('strong', 'result__value', `${state.pairs} / ${PAIRS_COUNT}`)
  );

  result.append(movesRow, pairsRow);

  const actions = createElement('div', 'modal__actions');
  const newGameButton = createButton('Новая игра', 'button button--primary');
  const closeGameButton = createButton('Закрыть', 'button');

  actions.append(newGameButton, closeGameButton);

  content.append(header, result, actions);

  closeButton.addEventListener('click', closeModal);
  closeGameButton.addEventListener('click', closeModal);
  newGameButton.addEventListener('click', startNewGame);

  openModal(content, newGameButton);
}

function showLeaderboard() {
  const content = createElement('div');

  const { header, closeButton } = createModalHeader(
    'Таблица лидеров',
    'Топ 10 игр'
  );

  const results = getResults();

  if (results.length === 0) {
    const empty = createElement(
      'p',
      'leaderboard__empty',
      'Пока нет результатов. Найдите все пары, чтобы попасть в таблицу.'
    );

    const actions = createElement('div', 'modal__actions');
    const closeButtonBottom = createButton('Закрыть', 'button button--primary');

    actions.append(closeButtonBottom);
    content.append(header, empty, actions);

    closeButton.addEventListener('click', closeModal);
    closeButtonBottom.addEventListener('click', closeModal);

    openModal(content, closeButton);
    return;
  }

  const table = createElement('table', 'leaderboard');

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  ['Место', 'Ходы', 'Дата'].forEach((text) => {
    headerRow.append(createElement('th', '', text));
  });

  thead.append(headerRow);

  const tbody = document.createElement('tbody');

  results.forEach((result, index) => {
    const row = document.createElement('tr');
    row.append(
      createElement('td', '', String(index + 1)),
      createElement('td', '', String(result.moves)),
      createElement('td', '', result.date)
    );
    tbody.append(row);
  });

  table.append(thead, tbody);

  const actions = createElement('div', 'modal__actions');
  const closeButtonBottom = createButton('Закрыть', 'button button--primary');
  actions.append(closeButtonBottom);

  content.append(header, table, actions);

  closeButton.addEventListener('click', closeModal);
  closeButtonBottom.addEventListener('click', closeModal);

  openModal(content, closeButton);
}


function init() {
  createApp();
  startNewGame();
}

init();
