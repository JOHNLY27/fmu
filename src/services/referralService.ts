import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc, 
  runTransaction,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredUserId: string;
  codeUsed: string;
  status: 'pending' | 'completed';
  rewarded: boolean;
  createdAt: any;
}

export const referralService = {
  /**
   * Links a user to a referrer code.
   * Does not issue reward yet (typically happens after first order).
   */
  async claimReferral(userId: string, code: string) {
    // 1. Check if user already has a referrer
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('User protocol not found.');
    if (userSnap.data().referredBy) throw new Error('You have already entered a mission code.');

    // 2. Find the referrer by code
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', code.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Invalid mission code. Identification failed.');
    }

    const referrerDoc = querySnapshot.docs[0];
    const referrerId = referrerDoc.id;

    if (referrerId === userId) {
      throw new Error('You cannot refer your own identity.');
    }

    // 3. Create the referral link
    await updateDoc(userRef, {
      referredBy: referrerId,
      referralCodeUsed: code.toUpperCase(),
      referralStatus: 'pending'
    });

    return referrerDoc.data().name || 'Agent';
  },

  /**
   * Finalizes the referral reward (₱50 for both)
   * This should be called when the referred user completes their first order.
   */
  async processReferralReward(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const referrerId = userData.referredBy;

      if (!referrerId || userData.referralStatus === 'completed') return;

      // Atomic Transaction for the double-credit ₱50
      await runTransaction(db, async (transaction) => {
        const referredWalletRef = doc(db, 'wallets', userId);
        const referrerWalletRef = doc(db, 'wallets', referrerId);

        const referredSnap = await transaction.get(referredWalletRef);
        const referrerSnap = await transaction.get(referrerWalletRef);

        const rewardAmount = 50;

        // Update Referred User Wallet
        const curReferredBal = referredSnap.exists() ? referredSnap.data().balance : 0;
        transaction.update(referredWalletRef, { 
          balance: curReferredBal + rewardAmount,
          lastUpdated: new Date().toISOString()
        });

        // Update Referrer Wallet
        const curReferrerBal = referrerSnap.exists() ? referrerSnap.data().balance : 0;
        transaction.update(referrerWalletRef, { 
          balance: curReferrerBal + rewardAmount,
          lastUpdated: new Date().toISOString()
        });

        // Log Transactions for audit
        const transRef1 = doc(collection(db, 'transactions'));
        const transRef2 = doc(collection(db, 'transactions'));

        transaction.set(transRef1, {
          userId: userId,
          type: 'referral_reward',
          amount: rewardAmount,
          title: 'Referral Bonus',
          description: 'Mission reward for joining via code',
          createdAt: serverTimestamp(),
          status: 'completed'
        });

        transaction.set(transRef2, {
          userId: referrerId,
          type: 'referral_reward',
          amount: rewardAmount,
          title: 'Recruitment Bonus',
          description: `Reward for referring ${userData.name || 'a new agent'}`,
          createdAt: serverTimestamp(),
          status: 'completed'
        });

        // Mark user referral as finalized
        transaction.update(userRef, { referralStatus: 'completed' });
      });

      console.log('Referral rewards processed successfully.');
    } catch (e) {
      console.error('Failed to process referral reward:', e);
    }
  }
};
