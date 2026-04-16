import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Uploads a file (from a URI) to Firebase Storage
 * @param uri The local URI of the file
 * @param path The path in Firebase Storage where the file should be saved
 * @returns The download URL of the uploaded file
 */
export const uploadImage = async (uri: string, path: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
