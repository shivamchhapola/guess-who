export const PRIMARY_MODIFIERS = [
  'Captain', 'Shadow', 'Sly', 'Pixel', 'Cheeky', 'Cyber', 'Witty', 'Turbo',
  'Laser', 'Cosmic', 'Neon', 'Velvet', 'Retro', 'Jolly', 'Astral', 'Snazzy',
  'Glitch', 'Clever', 'Breezy', 'Mystic', 'Phantom', 'Dapper', 'Groovy', 'Spiffy',
  'Funky', 'Hyper', 'Electric', 'Solar', 'Vivid', 'Sneaky', 'Zen', 'Atomic',
  'Chilly', 'Daring', 'Epic', 'Fierce', 'Giggling', 'Heroic', 'Iron', 'Jazzy',
  'Lucky', 'Mighty', 'Noble', 'Orbit', 'Psycho', 'Quirky', 'Radical', 'Sonic'
];

export const SECONDARY_NOUNS = [
  'Guess', 'Master', 'Detective', 'Fox', 'Ninja', 'Panda', 'Falcon', 'Wizard',
  'Turtle', 'Llama', 'Owl', 'Viper', 'Bandit', 'Joker', 'Ace', 'Goblin',
  'Otter', 'Bear', 'Panther', 'Phoenix', 'Penguin', 'Rabbit', 'Tiger', 'Dragon',
  'Koala', 'Badger', 'Dolphin', 'Giraffe', 'Hamster', 'Jaguar', 'Raven', 'Shark',
  'Sloth', 'Vulture', 'Walrus', 'Zebra', 'Capybara', 'Chameleon', 'Gecko', 'Lemur',
  'Meerkat', 'Narwhal', 'Quokka', 'Raccoon', 'Toucan', 'Yeti', 'Lynx', 'Moose'
];

export const AVATAR_STYLES = [
  { id: 'avataaars', label: 'People', icon: '🧑' },
  { id: 'bottts', label: 'Robots', icon: '🤖' },
  { id: 'personas', label: 'Personas', icon: '🎭' },
  { id: 'big-smile', label: 'Expressive', icon: '😄' },
  { id: 'pixel-art', label: 'Pixel', icon: '👾' },
];

export const SEED_VARIATIONS = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Sam', 'Dakota', 'Skyler', 'Felix', 'Maya', 'Leo', 'Nova'
];

export function generateRandomName(): string {
  const primary = PRIMARY_MODIFIERS[Math.floor(Math.random() * PRIMARY_MODIFIERS.length)];
  const secondary = SECONDARY_NOUNS[Math.floor(Math.random() * SECONDARY_NOUNS.length)];
  return `${primary} ${secondary}`;
}

export function generateRandomAvatar(): string {
  const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)].id;
  const seed = SEED_VARIATIONS[Math.floor(Math.random() * SEED_VARIATIONS.length)];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}
