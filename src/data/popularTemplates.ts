import { CardSetTemplate } from '@/types/game';

const getAvatar = (seed: string, style: string = 'avataaars') => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0f172a,1e293b,334155`;
};

// 1. THE OFFICE (US) TEMPLATE
export const THE_OFFICE_TEMPLATE: CardSetTemplate = {
  id: 'the-office-us',
  title: 'The Office (Dunder Mifflin)',
  description: 'Guess who from Scranton! Featuring Michael Scott, Dwight, Jim, Pam, and the Dunder Mifflin crew.',
  creatorName: 'Dunder Mifflin Staff',
  isPublic: true,
  tags: ['TV Show', 'Comedy', 'The Office', 'Popular'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cards: [
    { id: 'off_1', name: 'Michael Scott', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/dc/MichaelScott.png', attributes: {} },
    { id: 'off_2', name: 'Dwight Schrute', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Dwight_Schrute.jpg', attributes: {} },
    { id: 'off_3', name: 'Jim Halpert', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Jim_Halpert.jpg', attributes: {} },
    { id: 'off_4', name: 'Pam Beesly', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/6/67/Pam_Beesly.jpg', attributes: {} },
    { id: 'off_5', name: 'Andy Bernard', imageUrl: getAvatar('Andy Bernard'), attributes: {} },
    { id: 'off_6', name: 'Ryan Howard', imageUrl: getAvatar('Ryan Howard'), attributes: {} },
    { id: 'off_7', name: 'Angela Martin', imageUrl: getAvatar('Angela Martin'), attributes: {} },
    { id: 'off_8', name: 'Kevin Malone', imageUrl: getAvatar('Kevin Malone'), attributes: {} },
    { id: 'off_9', name: 'Oscar Martinez', imageUrl: getAvatar('Oscar Martinez'), attributes: {} },
    { id: 'off_10', name: 'Stanley Hudson', imageUrl: getAvatar('Stanley Hudson'), attributes: {} },
    { id: 'off_11', name: 'Phyllis Vance', imageUrl: getAvatar('Phyllis Vance'), attributes: {} },
    { id: 'off_12', name: 'Creed Bratton', imageUrl: getAvatar('Creed Bratton'), attributes: {} },
    { id: 'off_13', name: 'Meredith Palmer', imageUrl: getAvatar('Meredith Palmer'), attributes: {} },
    { id: 'off_14', name: 'Toby Flenderson', imageUrl: getAvatar('Toby Flenderson'), attributes: {} },
    { id: 'off_15', name: 'Kelly Kapoor', imageUrl: getAvatar('Kelly Kapoor'), attributes: {} },
    { id: 'off_16', name: 'Darryl Philbin', imageUrl: getAvatar('Darryl Philbin'), attributes: {} },
  ]
};

// 2. HOLLYWOOD ACTORS & ACTRESSES
export const HOLLYWOOD_ACTORS_TEMPLATE: CardSetTemplate = {
  id: 'hollywood-stars',
  title: 'Hollywood Movie Stars',
  description: 'Iconic actors and actresses from blockbuster films like Inception, Avengers, Barbie, and Oppenheimer.',
  creatorName: 'Cinema Club',
  isPublic: true,
  tags: ['Movies', 'Hollywood', 'Actors', 'Celebrities'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cards: [
    { id: 'hol_1', name: 'Leonardo DiCaprio', imageUrl: getAvatar('Leonardo DiCaprio', 'micah'), attributes: {} },
    { id: 'hol_2', name: 'Scarlett Johansson', imageUrl: getAvatar('Scarlett Johansson', 'micah'), attributes: {} },
    { id: 'hol_3', name: 'Brad Pitt', imageUrl: getAvatar('Brad Pitt', 'micah'), attributes: {} },
    { id: 'hol_4', name: 'Zendaya', imageUrl: getAvatar('Zendaya', 'micah'), attributes: {} },
    { id: 'hol_5', name: 'Tom Cruise', imageUrl: getAvatar('Tom Cruise', 'micah'), attributes: {} },
    { id: 'hol_6', name: 'Margot Robbie', imageUrl: getAvatar('Margot Robbie', 'micah'), attributes: {} },
    { id: 'hol_7', name: 'Robert Downey Jr.', imageUrl: getAvatar('Robert Downey Jr', 'micah'), attributes: {} },
    { id: 'hol_8', name: 'Jennifer Lawrence', imageUrl: getAvatar('Jennifer Lawrence', 'micah'), attributes: {} },
    { id: 'hol_9', name: 'Keanu Reeves', imageUrl: getAvatar('Keanu Reeves', 'micah'), attributes: {} },
    { id: 'hol_10', name: 'Emma Stone', imageUrl: getAvatar('Emma Stone', 'micah'), attributes: {} },
    { id: 'hol_11', name: 'Ryan Gosling', imageUrl: getAvatar('Ryan Gosling', 'micah'), attributes: {} },
    { id: 'hol_12', name: 'Anne Hathaway', imageUrl: getAvatar('Anne Hathaway', 'micah'), attributes: {} },
  ]
};

// 3. MARVEL SUPERHERO LEGENDS
export const MARVEL_SUPERHEROES_TEMPLATE: CardSetTemplate = {
  id: 'marvel-superheroes',
  title: 'Marvel Avengers & Legends',
  description: 'Assemble your favorite Marvel heroes and villains from the MCU universe!',
  creatorName: 'Marvel Universe',
  isPublic: true,
  tags: ['Marvel', 'Superheroes', 'Comics', 'Action'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cards: [
    { id: 'mcu_1', name: 'Iron Man', imageUrl: getAvatar('Iron Man', 'bottts'), attributes: {} },
    { id: 'mcu_2', name: 'Captain America', imageUrl: getAvatar('Captain America', 'bottts'), attributes: {} },
    { id: 'mcu_3', name: 'Thor', imageUrl: getAvatar('Thor', 'bottts'), attributes: {} },
    { id: 'mcu_4', name: 'Black Widow', imageUrl: getAvatar('Black Widow', 'bottts'), attributes: {} },
    { id: 'mcu_5', name: 'Spider-Man', imageUrl: getAvatar('Spider Man', 'bottts'), attributes: {} },
    { id: 'mcu_6', name: 'Doctor Strange', imageUrl: getAvatar('Doctor Strange', 'bottts'), attributes: {} },
    { id: 'mcu_7', name: 'Black Panther', imageUrl: getAvatar('Black Panther', 'bottts'), attributes: {} },
    { id: 'mcu_8', name: 'Wanda Maximoff', imageUrl: getAvatar('Wanda Maximoff', 'bottts'), attributes: {} },
    { id: 'mcu_9', name: 'Hulk', imageUrl: getAvatar('Hulk', 'bottts'), attributes: {} },
    { id: 'mcu_10', name: 'Loki', imageUrl: getAvatar('Loki', 'bottts'), attributes: {} },
    { id: 'mcu_11', name: 'Hawkeye', imageUrl: getAvatar('Hawkeye', 'bottts'), attributes: {} },
    { id: 'mcu_12', name: 'Thanos', imageUrl: getAvatar('Thanos', 'bottts'), attributes: {} },
  ]
};

export const ALL_POPULAR_TEMPLATES: CardSetTemplate[] = [
  THE_OFFICE_TEMPLATE,
  HOLLYWOOD_ACTORS_TEMPLATE,
  MARVEL_SUPERHEROES_TEMPLATE,
];
