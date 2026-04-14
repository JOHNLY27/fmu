export interface RiderRequirements {
  licenseNumber: string;
  vehiclePlateNumber: string;
  vehicleModel: string;
}

export interface UserLocation {
  country: string;
  province: string;
  city: string;
  barangay?: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'rider';
  location?: UserLocation;
  requirements?: RiderRequirements;
  avatar?: string;
  phone?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  image: string;
  isStaffPick?: boolean;
  isFreeDelivery?: boolean;
  status?: 'Fastest' | 'Popular' | 'Trending' | 'Reliable';
}

export interface Job {
  id: string;
  type: 'Food' | 'Ride' | 'Parcel';
  title: string;
  amount: number;
  distance: string;
  location: string;
  time: string;
  image: string;
  isPriority?: boolean;
  tip?: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  image?: string;
  status?: 'sent' | 'delivered' | 'seen';
}

export type StoreCategory = 
  | 'All'
  | 'Restaurant'
  | 'Grocery'
  | 'Pharmacy'
  | 'Hardware'
  | 'Electronics'
  | 'Bakery'
  | 'Cafe'
  | 'Sari-Sari'
  | 'Market'
  | 'Clothing'
  | 'Pet Shop'
  | 'Others';

export interface Store {
  id: string;
  name: string;
  category: StoreCategory;
  address: string;
  barangay: string;
  image: string;
  rating: number;
  isOpen: boolean;
  openHours: string;
  description: string;
  tags: string[];
  isFeatured?: boolean;
  isVerified?: boolean;
}

export interface PabiliItem {
  id: string;
  name: string;
  quantity: string;
  estimatedPrice: string;
  notes?: string;
}

export interface Order {
  id: string;
  type: 'food' | 'ride' | 'parcel' | 'pabili';
  status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  total: number;
  createdAt: string;
  items?: string;
  restaurant?: string;
  riderId?: string;
  riderName?: string;
  storeName?: string;
  storeAddress?: string;
  pabiliItems?: PabiliItem[];
  specialInstructions?: string;
  estimatedTotal?: number;
}
