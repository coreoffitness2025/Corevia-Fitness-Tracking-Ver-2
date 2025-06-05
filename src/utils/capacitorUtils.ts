import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

// 플랫폼 확인
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

// 카메라 권한 요청 및 사진 촬영
export const takePhoto = async (): Promise<string | null> => {
  try {
    if (!isNativePlatform()) {
      // 웹에서는 기존 방식 사용
      return await takePhotoWeb();
    }

    // 네이티브에서는 Capacitor Camera 사용
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    return image.dataUrl || null;
  } catch (error) {
    console.error('사진 촬영 실패:', error);
    return null;
  }
};

// 갤러리에서 사진 선택
export const pickPhotoFromGallery = async (): Promise<string | null> => {
  try {
    if (!isNativePlatform()) {
      // 웹에서는 기존 방식 사용
      return await pickPhotoWeb();
    }

    // 네이티브에서는 Capacitor Camera 사용
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    return image.dataUrl || null;
  } catch (error) {
    console.error('갤러리 사진 선택 실패:', error);
    return null;
  }
};

// 웹용 카메라 (기존 방식)
const takePhotoWeb = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    };
    
    input.click();
  });
};

// 웹용 갤러리 (기존 방식)
const pickPhotoWeb = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    };
    
    input.click();
  });
};

// 로컬 알림 전송
export const scheduleNotification = async (
  title: string, 
  body: string, 
  delayInSeconds: number = 0
): Promise<boolean> => {
  try {
    if (!isNativePlatform()) {
      // 웹에서는 Web Notifications API 사용
      return await scheduleWebNotification(title, body, delayInSeconds);
    }

    // 알림 권한 요청
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
      console.warn('알림 권한이 거부되었습니다');
      return false;
    }

    // 알림 예약
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: delayInSeconds > 0 ? { at: new Date(Date.now() + delayInSeconds * 1000) } : undefined,
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }
      ]
    });

    return true;
  } catch (error) {
    console.error('알림 스케줄링 실패:', error);
    return false;
  }
};

// 웹용 알림
const scheduleWebNotification = async (
  title: string, 
  body: string, 
  delayInSeconds: number = 0
): Promise<boolean> => {
  try {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        if (delayInSeconds > 0) {
          setTimeout(() => {
            new Notification(title, { body });
          }, delayInSeconds * 1000);
        } else {
          new Notification(title, { body });
        }
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('웹 알림 실패:', error);
    return false;
  }
};

// 햅틱 피드백
export const triggerHapticFeedback = async (style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> => {
  try {
    if (!isNativePlatform()) {
      // 웹에서는 진동 API 사용
      if ('vibrate' in navigator) {
        const pattern = style === 'light' ? [50] : style === 'medium' ? [100] : [200];
        navigator.vibrate(pattern);
      }
      return;
    }

    // 네이티브에서는 Capacitor Haptics 사용
    const impactStyle = style === 'light' ? ImpactStyle.Light : 
                       style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy;
    
    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.error('햅틱 피드백 실패:', error);
  }
};

// 상태바 설정 (앱에서만)
export const setStatusBarColor = async (color: string): Promise<void> => {
  try {
    if (!isNativePlatform()) return;
    
    const { StatusBar } = await import('@capacitor/status-bar');
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.error('상태바 색상 설정 실패:', error);
  }
}; 