import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  limit, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { BUTUAN_RESTAURANTS } from '../constants/butuanRestaurants';
import { BUTUAN_STORES } from '../constants/butuanStores';

export const migrateStoresToCloud = async () => {
  console.log('--- SYSTEM: INITIALIZING CLOUD MIGRATION ---');
  
  try {
    // 1. Get current cloud state
    const currentSnap = await getDocs(collection(db, 'merchants'));
    const existingNames = new Set(currentSnap.docs.map(doc => doc.data().name));

    // 2. Combine all local data
    const allStores = [
      ...BUTUAN_RESTAURANTS.map(r => ({ ...r, role: 'restaurant' })),
      ...BUTUAN_STORES.map(s => ({ ...s, role: 'store' }))
    ];

    // 3. Selective Injection
    let migratedCount = 0;
    for (const store of allStores) {
      if (existingNames.has(store.name)) continue;

      const { id, ...data } = store; 
      await addDoc(collection(db, 'merchants'), {
        ...data,
        isOpen: true,
        isVerified: true,
        isArchived: false,
        createdAt: new Date().toISOString(),
        deliveryTime: (data as any).deliveryTime || '20-30m',
        deliveryFee: (data as any).deliveryFee || 35,
        rating: (data as any).rating || 4.5
      });
      migratedCount++;
      console.log(`--- SYNC: [${data.name}] DEPLOYED ---`);
    }

    // 4. Seed Categories if empty
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      const standardCats = [
        { label: 'Restaurant', emoji: '🍽️' }, { label: 'Grocery', emoji: '🛒' },
        { label: 'Pharmacy', emoji: '💊' }, { label: 'Hardware', emoji: '🔨' },
        { label: 'Cafe', emoji: '☕' }, { label: 'Bakery', emoji: '🍞' },
        { label: 'Electronics', emoji: '📱' }, { label: 'Sari-Sari', emoji: '🏠' },
        { label: 'Market', emoji: '🧺' }, { label: 'Clothing', emoji: '👕' },
        { label: 'Pet Shop', emoji: '🐾' }
      ];
      for (const cat of standardCats) await addDoc(collection(db, 'categories'), cat);
      console.log('--- SYSTEM: CATEGORIES SEEDED ---');
    }

    // 5. Repair Legacy Stores (Force-Sync isArchived flag)
    const merchantsToRepair = await getDocs(collection(db, 'merchants'));
    let repairedCount = 0;
    
    for (const mDoc of merchantsToRepair.docs) {
      if (mDoc.data().isArchived === undefined) {
        const mRef = doc(db, 'merchants', mDoc.id);
        await updateDoc(mRef, { isArchived: false });
        repairedCount++;
      }
    }

    if (repairedCount > 0) {
      console.log(`--- SYSTEM: ${repairedCount} RECORDS SECURED. ---`);
    }

  } catch (e) {
    console.error('--- ALERT: MIGRATION CONFLICT ---', e);
  }
};
