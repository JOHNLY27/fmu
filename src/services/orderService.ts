import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export type OrderStatus = 'pending' | 'accepted' | 'picked_up' | 'completed' | 'cancelled';

export interface Order {
  id?: string;
  userId: string;
  riderId?: string | null;
  type: 'ride' | 'food' | 'parcel' | 'pabili';
  status: OrderStatus;
  pickupLocation: string;
  dropoffLocation: string;
  price: number;
  itemDetails?: string;
  customerCity?: string;
  customerProvince?: string;
  createdAt?: any;
}

// 1. User Creates an Order (Ride or Food)
export const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'riderId' | 'createdAt'>) => {
  try {
    const ordersRef = collection(db, 'orders');
    const newOrder = {
      ...orderData,
      status: 'pending',
      riderId: null,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(ordersRef, newOrder);
    return docRef.id; // Return the new ID so the User app can track it
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// 2. Rider App listnes real-time for 'pending' jobs IN THEIR LOCATION
export const subscribeToAvailableJobs = (
  callback: (jobs: Order[]) => void
) => {
  const q = query(
    collection(db, 'orders'), 
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const jobs: Order[] = [];
    snapshot.forEach((doc) => {
      jobs.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    // Sort locally to bypass Firebase composite index requirements
    jobs.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
    
    callback(jobs);
  });
};

// 3. Rider accepts a job
export const acceptOrder = async (orderId: string, riderId: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    // Quick check if it's still available
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists() && orderSnap.data().status === 'pending') {
      await updateDoc(orderRef, {
        status: 'accepted',
        riderId: riderId
      });
      return true;
    }
    return false; // Someone else took it or it was cancelled
  } catch (error) {
    console.error("Error accepting order:", error);
    throw error;
  }
};

// 4. Update order status (picked_up, completed, etc.)
export const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: newStatus
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// 5. User App listens to their specific order to see when a rider accepts it
export const subscribeToOrder = (orderId: string, callback: (order: Order | null) => void) => {
  const orderRef = doc(db, 'orders', orderId);

  return onSnapshot(orderRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Order);
    } else {
      callback(null);
    }
  });
};

// 6. User App: Subscribe to ALL of the user's orders (for Activity/History screen)
export const subscribeToUserOrders = (
  userId: string,
  callback: (orders: Order[]) => void
) => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    
    // Sort locally to bypass Firebase composite index requirements
    orders.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
    
    callback(orders);
  });
};

// 7. Cancel an order (only if still pending)
export const cancelOrder = async (orderId: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists() && orderSnap.data().status === 'pending') {
      await updateDoc(orderRef, { status: 'cancelled' });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

// 8. Rider App: Subscribe to jobs accepted by the rider
export const subscribeToRiderJobs = (
  riderId: string,
  callback: (orders: Order[]) => void
) => {
  const q = query(
    collection(db, 'orders'),
    where('riderId', '==', riderId)
  );

  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    
    // Sort locally (newest first)
    orders.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
    
    callback(orders);
  });
};
