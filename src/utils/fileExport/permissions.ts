
import { Filesystem } from '@capacitor/filesystem';
import { toast } from 'sonner';

/**
 * Check if we have permission to write to external storage on Android
 * and request it if necessary
 */
export async function checkAndRequestPermissions() {
  try {
    console.log('Starting permission check process for Android');
    
    // Check current permissions status
    const permResult = await Filesystem.checkPermissions();
    console.log('Current permissions status:', permResult);
    
    // If we don't have permission, request it
    if (permResult.publicStorage !== 'granted') {
      console.log('Public storage permission not granted, requesting...');
      
      try {
        // Request permissions
        const requestResult = await Filesystem.requestPermissions();
        console.log('Permission request result:', requestResult);
        
        if (requestResult.publicStorage !== 'granted') {
          console.warn('Storage permission denied by user');
          toast.error('Potrebna je dozvola za pristup skladištu da bi se fajl sačuvao. Molimo omogućite dozvole u podešavanjima aplikacije.');
          return false;
        }
      } catch (permError) {
        console.error('Error requesting permissions:', permError);
        toast.error('Greška pri traženju dozvola. Pokušajte ručno omogućiti pristup u podešavanjima aplikacije.');
        return false;
      }
    }
    
    console.log('Storage permission granted successfully');
    return true;
  } catch (error) {
    console.error('Permission checking error:', error);
    // We'll still try to save even if permission checking fails
    return true;
  }
}
