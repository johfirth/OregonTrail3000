// ============================================================
// Artemis Trail — Space Trivia Question Bank
// Teen Jeopardy-level questions about NASA, lunar missions,
// and space science. Used as an alternative skill challenge
// during EVA surface operations.
// ============================================================

export interface TriviaQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0-3
  category: 'LUNAR_MISSIONS' | 'NASA_HISTORY' | 'SPACE_SCIENCE' | 'ARTEMIS_PROGRAM';
  difficulty: 'MEDIUM' | 'HARD';
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  // === LUNAR MISSIONS ===
  {
    id: 'lm-01',
    question: 'Who was the first person to walk on the Moon?',
    options: ['Buzz Aldrin', 'Neil Armstrong', 'Michael Collins', 'John Glenn'],
    correctIndex: 1,
    category: 'LUNAR_MISSIONS',
    difficulty: 'MEDIUM',
  },
  {
    id: 'lm-02',
    question: 'Which Apollo mission was the first to land humans on the Moon?',
    options: ['Apollo 10', 'Apollo 11', 'Apollo 12', 'Apollo 13'],
    correctIndex: 1,
    category: 'LUNAR_MISSIONS',
    difficulty: 'MEDIUM',
  },
  {
    id: 'lm-03',
    question: 'Apollo 13 is famous for what event during its mission?',
    options: ['First Moon landing', 'Oxygen tank explosion', 'First spacewalk', 'Lunar rover deployment'],
    correctIndex: 1,
    category: 'LUNAR_MISSIONS',
    difficulty: 'MEDIUM',
  },
  {
    id: 'lm-04',
    question: 'Which Apollo mission was the last to land humans on the Moon?',
    options: ['Apollo 15', 'Apollo 16', 'Apollo 17', 'Apollo 18'],
    correctIndex: 2,
    category: 'LUNAR_MISSIONS',
    difficulty: 'MEDIUM',
  },
  {
    id: 'lm-05',
    question: 'What was the name of the Apollo 11 lunar module?',
    options: ['Columbia', 'Eagle', 'Intrepid', 'Aquarius'],
    correctIndex: 1,
    category: 'LUNAR_MISSIONS',
    difficulty: 'HARD',
  },
  {
    id: 'lm-06',
    question: 'Which country\'s Luna 2 probe was the first human-made object to reach the Moon?',
    options: ['United States', 'Soviet Union', 'China', 'France'],
    correctIndex: 1,
    category: 'LUNAR_MISSIONS',
    difficulty: 'HARD',
  },
  {
    id: 'lm-07',
    question: 'How many people have walked on the Moon as of the Apollo program?',
    options: ['6', '8', '10', '12'],
    correctIndex: 3,
    category: 'LUNAR_MISSIONS',
    difficulty: 'HARD',
  },
  {
    id: 'lm-08',
    question: 'What did Apollo 15 astronauts first use on the Moon?',
    options: ['Solar panels', 'Lunar Roving Vehicle', 'Telescope', 'Seismometer'],
    correctIndex: 1,
    category: 'LUNAR_MISSIONS',
    difficulty: 'HARD',
  },
  {
    id: 'lm-09',
    question: 'Who was the command module pilot of Apollo 11 who stayed in orbit?',
    options: ['Buzz Aldrin', 'Pete Conrad', 'Michael Collins', 'Alan Shepard'],
    correctIndex: 2,
    category: 'LUNAR_MISSIONS',
    difficulty: 'MEDIUM',
  },
  {
    id: 'lm-10',
    question: 'The Sea of Tranquility is located on which celestial body?',
    options: ['Mars', 'The Moon', 'Venus', 'Europa'],
    correctIndex: 1,
    category: 'LUNAR_MISSIONS',
    difficulty: 'MEDIUM',
  },

  // === NASA HISTORY ===
  {
    id: 'nh-01',
    question: 'In what year was NASA founded?',
    options: ['1955', '1958', '1961', '1963'],
    correctIndex: 1,
    category: 'NASA_HISTORY',
    difficulty: 'MEDIUM',
  },
  {
    id: 'nh-02',
    question: 'Who was the first American in space?',
    options: ['John Glenn', 'Alan Shepard', 'Gus Grissom', 'Scott Carpenter'],
    correctIndex: 1,
    category: 'NASA_HISTORY',
    difficulty: 'MEDIUM',
  },
  {
    id: 'nh-03',
    question: 'Which president challenged the US to land on the Moon by the end of the 1960s?',
    options: ['Dwight Eisenhower', 'John F. Kennedy', 'Lyndon Johnson', 'Richard Nixon'],
    correctIndex: 1,
    category: 'NASA_HISTORY',
    difficulty: 'MEDIUM',
  },
  {
    id: 'nh-04',
    question: 'What does NASA stand for?',
    options: [
      'National Aeronautics and Space Administration',
      'National Aviation and Space Agency',
      'North American Space Administration',
      'National Aeronautics and Science Agency',
    ],
    correctIndex: 0,
    category: 'NASA_HISTORY',
    difficulty: 'MEDIUM',
  },
  {
    id: 'nh-05',
    question: 'The Space Shuttle Challenger disaster occurred in which year?',
    options: ['1984', '1986', '1988', '1990'],
    correctIndex: 1,
    category: 'NASA_HISTORY',
    difficulty: 'MEDIUM',
  },
  {
    id: 'nh-06',
    question: 'Which space station was the first to be continuously occupied?',
    options: ['Skylab', 'Mir', 'International Space Station', 'Tiangong'],
    correctIndex: 2,
    category: 'NASA_HISTORY',
    difficulty: 'HARD',
  },
  {
    id: 'nh-07',
    question: 'Who was the first American woman in space?',
    options: ['Valentina Tereshkova', 'Sally Ride', 'Mae Jemison', 'Christa McAuliffe'],
    correctIndex: 1,
    category: 'NASA_HISTORY',
    difficulty: 'MEDIUM',
  },
  {
    id: 'nh-08',
    question: 'What was the name of NASA\'s first space telescope launched in 1990?',
    options: ['Kepler', 'Hubble', 'James Webb', 'Chandra'],
    correctIndex: 1,
    category: 'NASA_HISTORY',
    difficulty: 'MEDIUM',
  },
  {
    id: 'nh-09',
    question: 'Which rocket powered the Apollo missions to the Moon?',
    options: ['Atlas V', 'Delta IV', 'Saturn V', 'Titan II'],
    correctIndex: 2,
    category: 'NASA_HISTORY',
    difficulty: 'MEDIUM',
  },
  {
    id: 'nh-10',
    question: 'Project Mercury was NASA\'s first program to put humans where?',
    options: ['On the Moon', 'In Earth orbit', 'On Mars', 'In deep space'],
    correctIndex: 1,
    category: 'NASA_HISTORY',
    difficulty: 'HARD',
  },

  // === SPACE SCIENCE ===
  {
    id: 'ss-01',
    question: 'How long does it take light to travel from Earth to the Moon?',
    options: ['About 1.3 seconds', 'About 8 minutes', 'About 4 hours', 'About 1 minute'],
    correctIndex: 0,
    category: 'SPACE_SCIENCE',
    difficulty: 'HARD',
  },
  {
    id: 'ss-02',
    question: 'What is the approximate distance from Earth to the Moon?',
    options: ['24,000 miles', '93,000 miles', '240,000 miles', '1,000,000 miles'],
    correctIndex: 2,
    category: 'SPACE_SCIENCE',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ss-03',
    question: 'The Moon\'s gravity is approximately what fraction of Earth\'s?',
    options: ['1/2', '1/4', '1/6', '1/10'],
    correctIndex: 2,
    category: 'SPACE_SCIENCE',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ss-04',
    question: 'What causes the phases of the Moon?',
    options: [
      'Earth\'s shadow on the Moon',
      'The Moon\'s rotation speed',
      'The relative positions of Earth, Moon, and Sun',
      'Solar flares',
    ],
    correctIndex: 2,
    category: 'SPACE_SCIENCE',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ss-05',
    question: 'What is lunar regolith?',
    options: ['Moon rocks', 'Fine dust and soil on the Moon\'s surface', 'Underground ice', 'Volcanic lava'],
    correctIndex: 1,
    category: 'SPACE_SCIENCE',
    difficulty: 'HARD',
  },
  {
    id: 'ss-06',
    question: 'What element is most abundant in the Sun?',
    options: ['Helium', 'Carbon', 'Hydrogen', 'Oxygen'],
    correctIndex: 2,
    category: 'SPACE_SCIENCE',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ss-07',
    question: 'A day on the Moon (one full rotation) is approximately how long in Earth days?',
    options: ['1 day', '7 days', '27.3 days', '365 days'],
    correctIndex: 2,
    category: 'SPACE_SCIENCE',
    difficulty: 'HARD',
  },
  {
    id: 'ss-08',
    question: 'What is the name for the point in orbit closest to Earth?',
    options: ['Apogee', 'Perigee', 'Perihelion', 'Zenith'],
    correctIndex: 1,
    category: 'SPACE_SCIENCE',
    difficulty: 'HARD',
  },
  {
    id: 'ss-09',
    question: 'What protects astronauts from solar radiation on the Moon?',
    options: ['The Moon\'s atmosphere', 'Earth\'s magnetosphere', 'Their spacesuits and habitat shielding', 'Lunar caves'],
    correctIndex: 2,
    category: 'SPACE_SCIENCE',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ss-10',
    question: 'Water ice on the Moon is primarily found where?',
    options: ['On the equator', 'In permanently shadowed craters at the poles', 'In the mantle', 'On the far side'],
    correctIndex: 1,
    category: 'SPACE_SCIENCE',
    difficulty: 'MEDIUM',
  },

  // === ARTEMIS PROGRAM ===
  {
    id: 'ap-01',
    question: 'NASA\'s Artemis program aims to land humans at which region of the Moon?',
    options: ['Equator', 'North Pole', 'South Pole', 'Far side'],
    correctIndex: 2,
    category: 'ARTEMIS_PROGRAM',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ap-02',
    question: 'The Artemis program\'s crew spacecraft is called what?',
    options: ['Starliner', 'Dragon', 'Orion', 'Cygnus'],
    correctIndex: 2,
    category: 'ARTEMIS_PROGRAM',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ap-03',
    question: 'What is the name of NASA\'s mega-rocket built for Artemis?',
    options: ['Falcon Heavy', 'Space Launch System (SLS)', 'New Glenn', 'Vulcan Centaur'],
    correctIndex: 1,
    category: 'ARTEMIS_PROGRAM',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ap-04',
    question: 'The Lunar Gateway is planned to be what type of structure?',
    options: ['Surface habitat', 'Orbiting space station', 'Landing pad', 'Fuel depot'],
    correctIndex: 1,
    category: 'ARTEMIS_PROGRAM',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ap-05',
    question: 'Artemis I was an uncrewed test flight in which year?',
    options: ['2020', '2021', '2022', '2023'],
    correctIndex: 2,
    category: 'ARTEMIS_PROGRAM',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ap-06',
    question: 'Which company is developing the Human Landing System (HLS) for Artemis III?',
    options: ['Blue Origin', 'SpaceX', 'Boeing', 'Lockheed Martin'],
    correctIndex: 1,
    category: 'ARTEMIS_PROGRAM',
    difficulty: 'HARD',
  },
  {
    id: 'ap-07',
    question: 'ISRU stands for what concept critical to Artemis base camp plans?',
    options: [
      'International Space Research Union',
      'In-Situ Resource Utilization',
      'Integrated Systems Recovery Unit',
      'Inter-Station Refueling Utility',
    ],
    correctIndex: 1,
    category: 'ARTEMIS_PROGRAM',
    difficulty: 'HARD',
  },
  {
    id: 'ap-08',
    question: 'Why is the lunar south pole a priority for Artemis missions?',
    options: [
      'It has the smoothest terrain',
      'It is closest to Earth',
      'It may contain water ice in permanently shadowed craters',
      'It receives the most sunlight',
    ],
    correctIndex: 2,
    category: 'ARTEMIS_PROGRAM',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ap-09',
    question: 'The Artemis program is named after which figure from mythology?',
    options: ['Greek goddess of the Moon', 'Roman god of war', 'Greek god of the Sun', 'Egyptian goddess of the sky'],
    correctIndex: 0,
    category: 'ARTEMIS_PROGRAM',
    difficulty: 'MEDIUM',
  },
  {
    id: 'ap-10',
    question: 'Shackleton Crater at the lunar south pole is named after which explorer?',
    options: ['Ernest Shackleton', 'Robert Scott', 'Roald Amundsen', 'Edmund Hillary'],
    correctIndex: 0,
    category: 'ARTEMIS_PROGRAM',
    difficulty: 'HARD',
  },
];

export function getRandomTrivia(usedIds: string[]): TriviaQuestion | null {
  const available = TRIVIA_QUESTIONS.filter(q => !usedIds.includes(q.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
