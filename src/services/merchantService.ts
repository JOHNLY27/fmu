import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { BUTUAN_STORES } from '../constants/butuanStores';

export interface Merchant {
  id: string;
  name: string;
  category: string;
  address: string;
  barangay: string;
  rating: number;
  isOpen: boolean;
  openHours: string;
  isVerified: boolean;
  isFeatured: boolean;
  image?: string;
  description?: string;
  tags?: string[];
}

export const subscribeToActiveMerchants = (callback: (merchants: Merchant[]) => void) => {
  const q = query(
    collection(db, 'merchants'), 
    where('isArchived', '==', false)
  );
  
  return onSnapshot(q, (snapshot) => {
    const merchants: Merchant[] = [];
    snapshot.forEach((docSnap) => {
      merchants.push({ id: docSnap.id, ...docSnap.data() } as Merchant);
    });
    
    // Sort in memory to avoid needing a Firestore composite index
    const sorted = merchants.sort((a, b) => a.name.localeCompare(b.name));
    
    callback(sorted);
  });
};
