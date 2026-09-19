import { ProblemProps } from '../domain/entities/Problem.js';

export const INITIAL_PROBLEMS: Omit<ProblemProps, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'parking-lot',
    title: 'Parking Lot',
    difficulty: 'Easy',
    description:
      'Design a parking lot system that manages vehicles entering and leaving a multi-floor parking facility.',
    concepts: [
      'Classes and objects',
      'Inheritance',
      'Encapsulation',
      'Interfaces',
      'Strategy pattern',
    ],
    requirements: [
      'The parking lot can have multiple floors.',
      'Each floor contains different types of parking spots.',
      'The system should support cars, motorcycles and trucks.',
      'A vehicle should be assigned an appropriate parking spot.',
      'A parking ticket should be generated when a vehicle enters.',
      'The system should calculate parking fees when the vehicle exits.',
      'The system should handle the case when no suitable spot is available.',
      'The design should allow new vehicle types to be added later.',
    ],
    evaluationFocus: [
      'Vehicle abstraction',
      'Parking spot responsibility',
      'Fee calculation',
      'Extensibility',
      'Spot allocation',
    ],
  },
  {
    slug: 'vending-machine',
    title: 'Vending Machine',
    difficulty: 'Medium',
    description:
      'Design a vending machine that allows users to select products, insert money and receive products and change.',
    concepts: [
      'State pattern',
      'Interfaces',
      'Encapsulation',
      'Composition',
      'Extensibility',
    ],
    requirements: [
      'The machine should display available products.',
      'Each product has a name, price and quantity.',
      'A user can select a product.',
      'The machine should accept money.',
      'The machine should reject insufficient payment.',
      'The machine should return change when applicable.',
      'The machine should dispense the selected product.',
      'The machine should handle out-of-stock products.',
      'The design should support different payment methods later.',
    ],
    evaluationFocus: [
      'State management',
      'Payment abstraction',
      'Inventory responsibility',
      'Error handling',
      'Extensibility',
    ],
  },
  {
    slug: 'elevator-system',
    title: 'Elevator System',
    difficulty: 'Medium',
    description:
      'Design an elevator system that manages multiple elevators and responds to requests from different floors.',
    concepts: [
      'State',
      'Strategy',
      'Interfaces',
      'Object collaboration',
      'Encapsulation',
    ],
    requirements: [
      'The building contains multiple floors.',
      'The system can contain multiple elevators.',
      'A user can request an elevator from a floor.',
      'A user can select a destination floor.',
      'The system should select an appropriate elevator.',
      'An elevator should track its current floor and direction.',
      'The system should handle requests while elevators are moving.',
      'The design should allow different elevator-selection strategies later.',
      'The system should handle invalid floor requests.',
    ],
    evaluationFocus: [
      'Elevator selection',
      'State management',
      'Strategy abstraction',
      'Request handling',
      'Extensibility',
    ],
  },
];
