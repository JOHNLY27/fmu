import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ChatMessage {
  id?: string;
  orderId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp | null;
}

// 1. Send a new message
export const sendMessage = async (orderId: string, senderId: string, text: string) => {
  try {
    const messagesRef = collection(db, 'messages');
    await addDoc(messagesRef, {
      orderId,
      senderId,
      text,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// 2. Listen to messages for a specific order in real time
export const subscribeToMessages = (orderId: string, callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, 'messages'),
    where('orderId', '==', orderId)
  );

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    
    // Sort locally to bypass Firebase composite index requirements
    messages.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeA - timeB; // Ascending order
    });
    
    callback(messages);
  });
};
