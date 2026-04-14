import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Restaurant } from '../types';
import { RESTAURANTS as MOCK_RESTAURANTS } from '../constants/data';

// Fetch all restaurants from Firestore
export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const q = query(collection(db, 'restaurants'), orderBy('rating', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const restaurants: Restaurant[] = [];
    querySnapshot.forEach((doc) => {
      restaurants.push(doc.data() as Restaurant);
    });
    
    return restaurants;
  } catch (error) {
    console.error("Error fetching restaurants: ", error);
    return [];
  }
};

// Admin helper function to populate the database initially!
export const seedDatabase = async () => {
  try {
    console.log("Starting to seed database...");
    let addedCount = 0;
    
    for (const restaurant of MOCK_RESTAURANTS) {
      // Use the restaurant ID as the document ID in Firestore
      const docRef = doc(db, 'restaurants', restaurant.id);
      await setDoc(docRef, restaurant);
      addedCount++;
    }
    
    console.log(`Successfully seeded ${addedCount} restaurants to Firestore!`);
    return true;
  } catch (error) {
    console.error("Error seeding database: ", error);
    return false;
  }
};
