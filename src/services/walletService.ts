import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  setDoc, 
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  createdAt: string;
  serviceType?: string;
}

export const subscribeToWallet = (userId: string, callback: (balance: number) => void) => {
  const walletRef = doc(db, 'wallets', userId);
  
  return onSnapshot(walletRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().balance || 0);
    } else {
      // Initialize wallet if it doesn't exist
      setDoc(walletRef, { balance: 500, lastUpdated: new Date().toISOString() }); // Start with 500 free credits for testing
      callback(500);
    }
  });
};

export const subscribeToTransactions = (userId: string, callback: (transactions: Transaction[]) => void) => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach((docSnap) => {
      transactions.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
    });
    
    // Sort in memory to avoid index requirements
    const sorted = transactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    callback(sorted);
  });
};

export const topUpWallet = async (userId: string, amount: number) => {
  return addTransaction(userId, amount, 'credit', 'Wallet Top-up (Simulated)');
};

export const sendMoneyToUser = async (senderId: string, recipientEmail: string, amount: number) => {
  // 1. Find recipient
  const userQuery = query(collection(db, 'users'), where('email', '==', recipientEmail.toLowerCase()));
  const userSnapshot = await getDocs(userQuery);
  
  if (userSnapshot.empty) {
    throw new Error('User not found. Please check the email.');
  }
  
  const recipientDoc = userSnapshot.docs[0];
  const recipientId = recipientDoc.id;
  const recipientName = recipientDoc.data().name || 'Fetch User';
  
  // 2. Perform atomic transaction
  await runTransaction(db, async (transaction) => {
    const senderRef = doc(db, 'wallets', senderId);
    const recipientRef = doc(db, 'wallets', recipientId);
    
    const senderSnap = await transaction.get(senderRef);
    const recipientSnap = await transaction.get(recipientRef);
    
    const senderBalance = senderSnap.exists() ? senderSnap.data().balance : 0;
    const recipientBalance = recipientSnap.exists() ? recipientSnap.data().balance : 0;
    
    if (senderBalance < amount) {
      throw new Error('Insufficient balance.');
    }
    
    // Update balances
    transaction.update(senderRef, { balance: senderBalance - amount, lastUpdated: new Date().toISOString() });
    
    if (recipientSnap.exists()) {
      transaction.update(recipientRef, { balance: recipientBalance + amount, lastUpdated: new Date().toISOString() });
    } else {
      transaction.set(recipientRef, { balance: amount, lastUpdated: new Date().toISOString() });
    }
    
    // Record transactions
    const txCol = collection(db, 'transactions');
    const senderTxRef = doc(txCol);
    const recipientTxRef = doc(txCol);
    
    transaction.set(senderTxRef, {
      userId: senderId,
      amount,
      type: 'debit',
      description: `Sent to ${recipientName}`,
      createdAt: new Date().toISOString()
    });
    
    transaction.set(recipientTxRef, {
      userId: recipientId,
      amount,
      type: 'credit',
      description: `Received from sender`,
      createdAt: new Date().toISOString()
    });
  });
};

export const deductFromWallet = async (userId: string, amount: number, description: string) => {
  return addTransaction(userId, amount, 'debit', description);
};

export const addTransaction = async (userId: string, amount: number, type: 'credit' | 'debit', description: string, serviceType?: string) => {
  const walletRef = doc(db, 'wallets', userId);
  const walletSnap = await getDoc(walletRef);
  const currentBalance = walletSnap.exists() ? walletSnap.data().balance : 0;
  
  const newBalance = type === 'credit' ? currentBalance + amount : currentBalance - amount;
  
  // 1. Update balance
  await updateDoc(walletRef, { 
    balance: newBalance, 
    lastUpdated: new Date().toISOString() 
  });
  
  // 2. Record transaction
  const txData: any = {
    userId,
    amount,
    type,
    description,
    createdAt: new Date().toISOString()
  };
  if (serviceType) txData.serviceType = serviceType;
  
  await addDoc(collection(db, 'transactions'), txData);
};
