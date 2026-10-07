const PAIRS_COUNT = 8;

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
  const logo = createElement('div', 'header__logo', 'M');
  const brandText = createElement('div');
  const title = createElement('h1', 'header__title', 'Memory Game');
  const subtitle = createElement('p', 'header__subtitle', 'Найди все пары');

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

createApp() 