import { CardSetTemplate } from '@/types/game';

// Helper to generate SVG avatar URLs with distinct hairstyles & features
const getAvatarUrl = (seed: string, style: string = 'avataaars') => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0f172a,1e293b,334155`;
};

export const CLASSIC_GUESS_WHO_TEMPLATE: CardSetTemplate = {
  id: 'classic-24',
  title: 'Classic Characters (24 Grid)',
  description: 'The iconic 24-character Guess Who board set with traits like hair color, glasses, hats, and facial hair.',
  creatorName: 'GuessWhoMaker Core',
  isPublic: true,
  tags: ['Classic', '24 Cards', 'Standard', 'Popular'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cards: [
    {
      id: 'c1',
      name: 'Alex',
      imageUrl: getAvatarUrl('Alex'),
      attributes: { gender: 'male', hairColor: 'black', hairLength: 'short', glasses: false, hat: false, facialHair: true, eyeColor: 'brown' }
    },
    {
      id: 'c2',
      name: 'Alfred',
      imageUrl: getAvatarUrl('Alfred'),
      attributes: { gender: 'male', hairColor: 'red', hairLength: 'long', glasses: false, hat: false, facialHair: true, eyeColor: 'blue' }
    },
    {
      id: 'c3',
      name: 'Anita',
      imageUrl: getAvatarUrl('Anita'),
      attributes: { gender: 'female', hairColor: 'blonde', hairLength: 'long', glasses: false, hat: false, facialHair: false, eyeColor: 'blue' }
    },
    {
      id: 'c4',
      name: 'Anne',
      imageUrl: getAvatarUrl('Anne'),
      attributes: { gender: 'female', hairColor: 'black', hairLength: 'short', glasses: true, hat: false, facialHair: false, eyeColor: 'brown' }
    },
    {
      id: 'c5',
      name: 'Bernard',
      imageUrl: getAvatarUrl('Bernard'),
      attributes: { gender: 'male', hairColor: 'brown', hairLength: 'short', glasses: false, hat: true, facialHair: false, eyeColor: 'brown' }
    },
    {
      id: 'c6',
      name: 'Bill',
      imageUrl: getAvatarUrl('Bill'),
      attributes: { gender: 'male', hairColor: 'bald', hairLength: 'none', glasses: false, hat: false, facialHair: true, eyeColor: 'brown' }
    },
    {
      id: 'c7',
      name: 'Clara',
      imageUrl: getAvatarUrl('Clara'),
      attributes: { gender: 'female', hairColor: 'red', hairLength: 'short', glasses: true, hat: false, facialHair: false, eyeColor: 'green' }
    },
    {
      id: 'c8',
      name: 'David',
      imageUrl: getAvatarUrl('David'),
      attributes: { gender: 'male', hairColor: 'blonde', hairLength: 'short', glasses: false, hat: false, facialHair: true, eyeColor: 'blue' }
    },
    {
      id: 'c9',
      name: 'Eric',
      imageUrl: getAvatarUrl('Eric'),
      attributes: { gender: 'male', hairColor: 'blonde', hairLength: 'short', glasses: false, hat: true, facialHair: false, eyeColor: 'blue' }
    },
    {
      id: 'c10',
      name: 'Frans',
      imageUrl: getAvatarUrl('Frans'),
      attributes: { gender: 'male', hairColor: 'red', hairLength: 'short', glasses: false, hat: false, facialHair: false, eyeColor: 'brown' }
    },
    {
      id: 'c11',
      name: 'George',
      imageUrl: getAvatarUrl('George'),
      attributes: { gender: 'male', hairColor: 'white', hairLength: 'short', glasses: false, hat: true, facialHair: false, eyeColor: 'brown' }
    },
    {
      id: 'c12',
      name: 'Herman',
      imageUrl: getAvatarUrl('Herman'),
      attributes: { gender: 'male', hairColor: 'bald', hairLength: 'none', glasses: false, hat: false, facialHair: false, eyeColor: 'brown' }
    },
    {
      id: 'c13',
      name: 'Holly',
      imageUrl: getAvatarUrl('Holly'),
      attributes: { gender: 'female', hairColor: 'brown', hairLength: 'long', glasses: true, hat: true, facialHair: false, eyeColor: 'green' }
    },
    {
      id: 'c14',
      name: 'Joe',
      imageUrl: getAvatarUrl('Joe'),
      attributes: { gender: 'male', hairColor: 'blonde', hairLength: 'short', glasses: true, hat: false, facialHair: false, eyeColor: 'blue' }
    },
    {
      id: 'c15',
      name: 'Maria',
      imageUrl: getAvatarUrl('Maria'),
      attributes: { gender: 'female', hairColor: 'brown', hairLength: 'long', glasses: false, hat: true, facialHair: false, eyeColor: 'brown' }
    },
    {
      id: 'c16',
      name: 'Max',
      imageUrl: getAvatarUrl('Max'),
      attributes: { gender: 'male', hairColor: 'black', hairLength: 'short', glasses: true, hat: false, facialHair: true, eyeColor: 'brown' }
    },
    {
      id: 'c17',
      name: 'Paul',
      imageUrl: getAvatarUrl('Paul'),
      attributes: { gender: 'male', hairColor: 'white', hairLength: 'short', glasses: true, hat: false, facialHair: false, eyeColor: 'blue' }
    },
    {
      id: 'c18',
      name: 'Peter',
      imageUrl: getAvatarUrl('Peter'),
      attributes: { gender: 'male', hairColor: 'white', hairLength: 'short', glasses: false, hat: false, facialHair: false, eyeColor: 'blue' }
    },
    {
      id: 'c19',
      name: 'Philip',
      imageUrl: getAvatarUrl('Philip'),
      attributes: { gender: 'male', hairColor: 'black', hairLength: 'short', glasses: false, hat: false, facialHair: true, eyeColor: 'brown' }
    },
    {
      id: 'c20',
      name: 'Richard',
      imageUrl: getAvatarUrl('Richard'),
      attributes: { gender: 'male', hairColor: 'bald', hairLength: 'none', glasses: false, hat: false, facialHair: true, eyeColor: 'brown' }
    },
    {
      id: 'c21',
      name: 'Robert',
      imageUrl: getAvatarUrl('Robert'),
      attributes: { gender: 'male', hairColor: 'brown', hairLength: 'short', glasses: true, hat: false, facialHair: false, eyeColor: 'blue' }
    },
    {
      id: 'c22',
      name: 'Sam',
      imageUrl: getAvatarUrl('Sam'),
      attributes: { gender: 'male', hairColor: 'white', hairLength: 'none', glasses: true, hat: false, facialHair: false, eyeColor: 'brown' }
    },
    {
      id: 'c23',
      name: 'Tom',
      imageUrl: getAvatarUrl('Tom'),
      attributes: { gender: 'male', hairColor: 'black', hairLength: 'none', glasses: true, hat: false, facialHair: false, eyeColor: 'blue' }
    },
    {
      id: 'c24',
      name: 'Victor',
      imageUrl: getAvatarUrl('Victor'),
      attributes: { gender: 'male', hairColor: 'white', hairLength: 'short', glasses: false, hat: false, facialHair: false, eyeColor: 'blue' }
    }
  ]
};
