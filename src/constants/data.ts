import { Restaurant, Job } from '../types';

export const RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Zen Sushi Bar',
    cuisine: ['Japanese', 'Healthy', 'Sushi'],
    rating: 4.8,
    deliveryTime: '15-25 min',
    deliveryFee: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    isFreeDelivery: true,
    status: 'Fastest'
  },
  {
    id: '2',
    name: 'Mamma Mia Pizzeria',
    cuisine: ['Italian', 'Comfort', 'Fast Food'],
    rating: 4.5,
    deliveryTime: '30-45 min',
    deliveryFee: '$1.99 Delivery',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'The Green Leaf',
    cuisine: ['Salads', 'Vegan', 'Healthy'],
    rating: 4.7,
    deliveryTime: '20-35 min',
    deliveryFee: 'Popular',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    status: 'Popular'
  },
  {
    id: '4',
    name: 'Breakfast Club',
    cuisine: ['Brunch', 'Desserts', 'Coffee'],
    rating: 4.6,
    deliveryTime: '25-40 min',
    deliveryFee: 'Trending',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    status: 'Trending'
  },
  {
    id: '5',
    name: 'Juicy Burger Co.',
    cuisine: ['American', 'Fast Food', 'Burgers'],
    rating: 4.4,
    deliveryTime: '15-30 min',
    deliveryFee: 'Reliable',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    status: 'Reliable'
  },
  {
    id: '6',
    name: 'Bangkok Street Food',
    cuisine: ['Thai', 'Asian', 'Spicy'],
    rating: 4.9,
    deliveryTime: '35-50 min',
    deliveryFee: '$0.99 Delivery',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop',
    isStaffPick: true
  }
];

export const JOBS: Job[] = [
  {
    id: '1',
    type: 'Food',
    title: 'Artisan Hearth Bakery',
    amount: 18.20,
    distance: '0.8 miles away',
    location: 'West End District',
    time: 'Ready in 5 mins',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    type: 'Ride',
    title: 'Passenger Pickup',
    amount: 24.50,
    distance: '1.2 miles away',
    location: 'Terminal A Arrival',
    time: '8.4 mile trip estimated',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    type: 'Food',
    title: 'The Burger Lab',
    amount: 12.00,
    distance: '2.4 miles away',
    location: 'South Plaza',
    time: 'Includes $4.00 tip',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
    isPriority: true,
    tip: 4.00
  }
];

export const FOOD_CATEGORIES = [
  'All Eats', 'Fast Food', 'Healthy', 'Desserts', 'Asian', 'Italian'
];
