
import { Filesystem } from '@capacitor/filesystem';
import { toast } from 'sonner';

/**
 * Check if we have permission to write to external storage on Android
 * and request it if necessary
 */
export async function checkAndRequestPermissions() {
  try {
    console.log('Starting permission check process');
    
    // Check current permissions status
    const permResult = await Filesystem.checkPermissions();
    console.log('Current permissions status:', permResult);
    
    // On Android, always request permissions explicitly 
    // This ensures the user sees the permission dialog
    console.log('Explicitly requesting storage permissions...');
    
    try {
      const requestResult = await Filesystem.requestPermissions();
      console.log('Permission request result:', requestResult);
      
      if (requestResult.publicStorage !== 'granted') {
        console.warn('Permission not granted after request');
        throw new Error('Potrebna je dozvola za pristup skladištu. Molimo omogućite u podešavanjima aplikacije.');
      }
      
      console.log('Storage permission granted successfully');
      return true;
    } catch (permError) {
      console.error('Error requesting permissions:', permError);
      toast.error('Greška pri traženju dozvola. Molimo omogućite pristup skladištu ručno u podešavanjima aplikacije.');
      throw permError;
    }
  } catch (error) {
    console.error('Permission error:', error);
    throw error;
  }
}
