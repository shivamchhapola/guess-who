import { CardSetTemplate } from '@/types/game';

// 1. THE OFFICE (US) TEMPLATE — 100% Real actor photos
export const THE_OFFICE_TEMPLATE: CardSetTemplate = {
  id: 'the-office-us',
  title: 'The Office (Dunder Mifflin)',
  description: 'Guess who from Scranton! Featuring Michael Scott, Dwight, Jim, Pam, and the full Dunder Mifflin crew.',
  creatorName: 'Dunder Mifflin Staff',
  isPublic: true,
  tags: ['TV Show', 'Comedy', 'The Office', 'Popular'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cards: [
    { id: 'off_1',  name: 'Michael Scott',   imageUrl: '/templates/office/michael-scott.jpg',   attributes: {} },
    { id: 'off_2',  name: 'Dwight Schrute',  imageUrl: '/templates/office/dwight-schrute.jpg',  attributes: {} },
    { id: 'off_3',  name: 'Jim Halpert',     imageUrl: '/templates/office/jim-halpert.jpg',     attributes: {} },
    { id: 'off_4',  name: 'Pam Beesly',      imageUrl: '/templates/office/pam-beesly.jpg',      attributes: {} },
    { id: 'off_5',  name: 'Andy Bernard',    imageUrl: '/templates/office/andy-bernard.jpg',    attributes: {} },
    { id: 'off_6',  name: 'Ryan Howard',     imageUrl: '/templates/office/ryan-howard.jpg',     attributes: {} },
    { id: 'off_7',  name: 'Angela Martin',   imageUrl: '/templates/office/angela-martin.jpg',   attributes: {} },
    { id: 'off_8',  name: 'Kevin Malone',    imageUrl: '/templates/office/kevin-malone.jpg',    attributes: {} },
    { id: 'off_9',  name: 'Oscar Martinez',  imageUrl: '/templates/office/oscar-martinez.jpg',  attributes: {} },
    { id: 'off_10', name: 'Stanley Hudson',  imageUrl: '/templates/office/stanley-hudson.jpg',  attributes: {} },
    { id: 'off_11', name: 'Phyllis Vance',   imageUrl: '/templates/office/phyllis-vance.jpg',   attributes: {} },
    { id: 'off_12', name: 'Creed Bratton',   imageUrl: '/templates/office/creed-bratton.jpg',   attributes: {} },
    { id: 'off_13', name: 'Meredith Palmer', imageUrl: '/templates/office/meredith-palmer.jpg', attributes: {} },
    { id: 'off_14', name: 'Toby Flenderson', imageUrl: '/templates/office/toby-flenderson.jpg', attributes: {} },
    { id: 'off_15', name: 'Kelly Kapoor',    imageUrl: '/templates/office/kelly-kapoor.jpg',    attributes: {} },
    { id: 'off_16', name: 'Darryl Philbin',  imageUrl: '/templates/office/darryl-philbin.jpg',  attributes: {} },
  ],
};

// 2. HOLLYWOOD STARS — 100% Real actor headshots
export const HOLLYWOOD_ACTORS_TEMPLATE: CardSetTemplate = {
  id: 'hollywood-stars',
  title: 'Hollywood Movie Stars',
  description: 'Iconic actors and actresses from blockbuster films — Inception, Avengers, Barbie, and Oppenheimer!',
  creatorName: 'Cinema Club',
  isPublic: true,
  tags: ['Movies', 'Hollywood', 'Actors', 'Celebrities'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cards: [
    { id: 'hol_1',  name: 'Leonardo DiCaprio',  imageUrl: '/templates/hollywood/leo-dicaprio.jpg',        attributes: {} },
    { id: 'hol_2',  name: 'Scarlett Johansson', imageUrl: '/templates/hollywood/scarlett-johansson.jpg',  attributes: {} },
    { id: 'hol_3',  name: 'Brad Pitt',          imageUrl: '/templates/hollywood/brad-pitt.jpg',           attributes: {} },
    { id: 'hol_4',  name: 'Zendaya',            imageUrl: '/templates/hollywood/zendaya.jpg',             attributes: {} },
    { id: 'hol_5',  name: 'Tom Cruise',         imageUrl: '/templates/hollywood/tom-cruise.jpg',          attributes: {} },
    { id: 'hol_6',  name: 'Margot Robbie',      imageUrl: '/templates/hollywood/margot-robbie.jpg',       attributes: {} },
    { id: 'hol_7',  name: 'Robert Downey Jr.',  imageUrl: '/templates/hollywood/robert-downey-jr.jpg',    attributes: {} },
    { id: 'hol_8',  name: 'Jennifer Lawrence',  imageUrl: '/templates/hollywood/jennifer-lawrence.jpg',   attributes: {} },
    { id: 'hol_9',  name: 'Keanu Reeves',       imageUrl: '/templates/hollywood/keanu-reeves.jpg',        attributes: {} },
    { id: 'hol_10', name: 'Emma Stone',         imageUrl: '/templates/hollywood/emma-stone.jpg',          attributes: {} },
    { id: 'hol_11', name: 'Ryan Gosling',       imageUrl: '/templates/hollywood/ryan-gosling.jpg',        attributes: {} },
    { id: 'hol_12', name: 'Anne Hathaway',      imageUrl: '/templates/hollywood/anne-hathaway.jpg',       attributes: {} },
  ],
};

// 3. MARVEL AVENGERS — 100% Real MCU actor photos
export const MARVEL_SUPERHEROES_TEMPLATE: CardSetTemplate = {
  id: 'marvel-superheroes',
  title: 'Marvel Avengers & Legends',
  description: 'Assemble! Guess your favorite Marvel heroes and villains from the MCU universe.',
  creatorName: 'Marvel Universe',
  isPublic: true,
  tags: ['Marvel', 'Superheroes', 'Comics', 'Action'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cards: [
    { id: 'mcu_1',  name: 'Iron Man',        imageUrl: '/templates/marvel/iron-man.jpg',        attributes: {} },
    { id: 'mcu_2',  name: 'Captain America', imageUrl: '/templates/marvel/captain-america.jpg', attributes: {} },
    { id: 'mcu_3',  name: 'Thor',            imageUrl: '/templates/marvel/thor.jpg',            attributes: {} },
    { id: 'mcu_4',  name: 'Black Widow',     imageUrl: '/templates/marvel/black-widow.jpg',     attributes: {} },
    { id: 'mcu_5',  name: 'Spider-Man',      imageUrl: '/templates/marvel/spider-man.jpg',      attributes: {} },
    { id: 'mcu_6',  name: 'Captain Marvel',  imageUrl: '/templates/marvel/captain-marvel.jpg',  attributes: {} },
    { id: 'mcu_7',  name: 'Black Panther',   imageUrl: '/templates/marvel/black-panther.jpg',   attributes: {} },
    { id: 'mcu_8',  name: 'Scarlet Witch',   imageUrl: '/templates/marvel/scarlet-witch.jpg',   attributes: {} },
    { id: 'mcu_9',  name: 'Nick Fury',       imageUrl: '/templates/marvel/nick-fury.jpg',       attributes: {} },
    { id: 'mcu_10', name: 'Hawkeye',         imageUrl: '/templates/marvel/hawkeye.jpg',         attributes: {} },
    { id: 'mcu_11', name: 'Hulk',            imageUrl: '/templates/marvel/hulk.jpg',            attributes: {} },
    { id: 'mcu_12', name: 'Doctor Strange',  imageUrl: '/templates/marvel/doctor-strange.jpg',  attributes: {} },
    { id: 'mcu_13', name: 'Loki',            imageUrl: '/templates/marvel/loki.jpg',            attributes: {} },
    { id: 'mcu_14', name: 'Thanos',          imageUrl: '/templates/marvel/thanos.jpg',          attributes: {} },
  ],
};

export const ALL_POPULAR_TEMPLATES: CardSetTemplate[] = [
  THE_OFFICE_TEMPLATE,
  HOLLYWOOD_ACTORS_TEMPLATE,
  MARVEL_SUPERHEROES_TEMPLATE,
];
