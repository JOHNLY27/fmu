import { Restaurant, MenuItem, StoreCategory } from '../types';

export const FOOD_CATEGORIES: { label: string; icon: string; emoji: string }[] = [
  { label: 'Chicken / Meals', icon: 'nutrition', emoji: '🍗' },
  { label: 'Pizza / Pasta', icon: 'pizza', emoji: '🍕' },
  { label: 'Burgers / Quick Bites', icon: 'fast-food', emoji: '🍔' },
  { label: 'Chinese / Noodles', icon: 'restaurant', emoji: '🥢' },
  { label: 'Drinks / Desserts', icon: 'ice-cream', emoji: '🍦' },
];

export const BUTUAN_RESTAURANTS: Restaurant[] = [
  // === CHICKEN / MEALS ===
  {
    id: 'rest1',
    name: 'Jollibee - J.C. Aquino',
    category: 'Chicken / Meals',
    image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=800',
    rating: 4.9,
    deliveryTime: '20-30m',
    deliveryFee: 35,
    isVerified: true,
    isFeatured: true,
    menu: [
      { id: 'jb1', name: '1-pc. Chickenjoy w/ Rice', price: 105, description: 'The famous crispylicious, juicylicious Chickenjoy!', category: 'Chicken' },
      { id: 'jb2', name: '2-pc. Chickenjoy w/ Rice', price: 185, description: 'Double the joy!', category: 'Chicken' },
      { id: 'jb3', name: 'Yumburger', price: 55, description: 'The burger that made Jollibee famous.', category: 'Burgers' },
      { id: 'jb4', name: 'Jolly Spaghetti', price: 75, description: 'Meatiest, cheesiest, spaghettiest!', category: 'Pasta' },
      { id: 'jb5', name: 'Burger Steak w/ Rice', price: 99, description: 'Beef patty topped with mushroom sauce.', category: 'Meals' },
      { id: 'jb6', name: 'Peach Mango Pie', price: 45, description: 'Sweet peach and mango filling.', category: 'Desserts' },
    ]
  },
  {
    id: 'rest2',
    name: "McDonald's - SM City",
    category: 'Chicken / Meals',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
    rating: 4.7,
    deliveryTime: '25-35m',
    deliveryFee: 35,
    isVerified: true,
    menu: [
      { id: 'mc1', name: 'Big Mac Meal', price: 215, description: 'Double layer of sear-sizzled 100% pure beef.', category: 'Burgers' },
      { id: 'mc2', name: '1-pc. Chicken McDo w/ Rice', price: 110, description: 'Crispy and juicy Fried Chicken.', category: 'Chicken' },
      { id: 'mc3', name: 'Quarter Pounder w/ Cheese', price: 195, description: 'Pure beef patty with cheese.', category: 'Burgers' },
      { id: 'mc4', name: 'McFlurry Oreo', price: 65, description: 'Creamy soft serve with Oreo.', category: 'Desserts' },
    ]
  },
  {
    id: 'rest3',
    name: 'Mang Inasal - Gaisano',
    category: 'Chicken / Meals',
    image: 'https://images.unsplash.com/photo-1544025162-d7b6e0655d05?w=800',
    rating: 4.8,
    deliveryTime: '30-45m',
    deliveryFee: 30,
    isVerified: true,
    menu: [
      { id: 'mi1', name: 'PM1 Chicken Inasal (Pecho)', price: 155, description: 'Flame-grilled chicken with rice.', category: 'Chicken' },
      { id: 'mi2', name: 'Pork Sisig', price: 145, description: 'Savory grilled pork.', category: 'Meals' },
      { id: 'mi3', name: 'Halo-Halo Regular', price: 85, description: 'Classic Filipino dessert.', category: 'Desserts' },
    ]
  },
  {
    id: 'rest4',
    name: 'Chowking - Langihan',
    category: 'Chicken / Meals',
    image: 'https://images.unsplash.com/photo-1544025162-d7b6e0655d05?w=800',
    rating: 4.6,
    deliveryTime: '20-30m',
    deliveryFee: 30,
    isVerified: true,
    menu: [
      { id: 'ck1', name: 'Chao Fan w/ Siomai', price: 125, description: 'Fried rice with steamed pork siomai.', category: 'Meals' },
      { id: 'ck2', name: 'Pili Chicken w/ Rice', price: 115, description: 'Chinese-style fried chicken.', category: 'Chicken' },
      { id: 'ck3', name: 'Lauriat Mea', price: 195, description: 'Complete Chinese feast.', category: 'Combo Meals' },
    ]
  },
  {
    id: 'restkfc',
    name: 'KFC - SM Butuan',
    category: 'Chicken / Meals',
    image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=800',
    rating: 4.7,
    deliveryTime: '25-35m',
    deliveryFee: 40,
    isVerified: true,
    menu: [
      { id: 'kfc1', name: 'Zinger Meal', price: 185, description: 'Hot & Spicy chicken burger.', category: 'Burgers' },
      { id: 'kfc2', name: '2-pc. Fried Chicken Combo', price: 199, description: 'Original Recipe chicken with rice and soda.', category: 'Chicken' },
    ]
  },
  {
    id: 'restandoks',
    name: "Andok's - J.C. Aquino",
    category: 'Chicken / Meals',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
    rating: 4.6,
    deliveryTime: '15-25m',
    deliveryFee: 25,
    menu: [
      { id: 'an1', name: 'Liempo Solo', price: 210, description: 'Grilled pork belly secret recipe.', category: 'Meals' },
      { id: 'an2', name: 'Dokito Frito 1-pc', price: 95, description: 'Premium fried chicken.', category: 'Chicken' },
    ]
  },

  // === PIZZA / PASTA ===
  {
    id: 'rest5',
    name: 'Greenwich - Robinsons',
    category: 'Pizza / Pasta',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    rating: 4.5,
    deliveryTime: '35-50m',
    deliveryFee: 40,
    isVerified: true,
    menu: [
      { id: 'gw1', name: 'Ham & Cheese Pizza (9")', price: 299, description: 'Classic flavors.', category: 'Pizza' },
      { id: 'gw2', name: 'Lasagna Supreme', price: 145, description: 'Multi-layer pasta with beef sauce.', category: 'Pasta' },
    ]
  },
  {
    id: 'restsha',
    name: "Shakey's Pizza - SM",
    category: 'Pizza / Pasta',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=800',
    rating: 4.8,
    deliveryTime: '40-55m',
    deliveryFee: 50,
    isVerified: true,
    menu: [
      { id: 'sk1', name: 'Manager’s Special Pizza', price: 545, description: 'Loaded with beef, ham, onion, and more.', category: 'Pizza' },
      { id: 'sk2', name: 'Chiken & Mojos', price: 425, description: 'The legendary combo.', category: 'Chicken' },
    ]
  },

  // === BURGERS / QUICK BITES ===
  {
    id: 'restang',
    name: "Angel's Burger - Montilla",
    category: 'Burgers / Quick Bites',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    rating: 4.3,
    deliveryTime: '10-20m',
    deliveryFee: 20,
    menu: [
      { id: 'ab1', name: 'Buy 1 Take 1 Burger', price: 45, description: 'Our famous deal.', category: 'Burgers' },
      { id: 'ab2', name: 'Cheeseburger', price: 40, description: 'Classic cheese and beef.', category: 'Burgers' },
    ]
  },
  {
    id: 'restmin',
    name: "Minute Burger - Baan",
    category: 'Burgers / Quick Bites',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
    rating: 4.4,
    deliveryTime: '15-25m',
    deliveryFee: 20,
    menu: [
      { id: 'mb1', name: 'Bacon Cheese Burger', price: 85, description: 'Double beef, double taste.', category: 'Burgers' },
      { id: 'mb2', name: 'Black Pepper Burger', price: 75, description: 'Spicy and savory.', category: 'Burgers' },
    ]
  },
];
