import { Network } from '@capacitor/network';
import { toast } from 'react-hot-toast';

// 네트워크 상태 타입
export type NetworkStatus = {
  connected: boolean;
  connectionType: string;
};

// 네트워크 상태 리스너 콜백 타입
type NetworkStatusListener = (status: NetworkStatus) => void;

// 네트워크 상태 리스너 목록
const listeners: NetworkStatusListener[] = [];

// 현재 네트워크 상태
let currentStatus: NetworkStatus = {
  connected: true, // 기본값은 연결됨으로 가정
  connectionType: 'unknown'
};

/**
 * 네트워크 상태 초기화 및 리스너 설정
 */
export const initNetworkMonitoring = async (): Promise<NetworkStatus> => {
  try {
    // 현재 네트워크 상태 가져오기
    currentStatus = await Network.getStatus();
    
    // 네트워크 상태 변경 리스너 설정
    Network.addListener('networkStatusChange', (status) => {
      // 상태 업데이트
      currentStatus = status;
      
      // 연결 상태 변경 알림
      if (status.connected) {
        try {
          toast.success('네트워크에 연결되었습니다.');
        } catch (e) { console.log('네트워크에 연결되었습니다.'); }
        console.log('네트워크 연결됨:', status.connectionType);
      } else {
        try {
          toast.error('네트워크 연결이 끊어졌습니다. 오프라인 모드로 전환합니다.');
        } catch (e) { console.log('네트워크 연결이 끊어졌습니다. 오프라인 모드로 전환합니다.'); }
        console.warn('네트워크 연결 끊김');
      }
      
      // 등록된 모든 리스너에게 알림
      listeners.forEach(listener => listener(status));
    });
    
    console.log('네트워크 모니터링이 초기화되었습니다. 현재 상태:', currentStatus);
    return currentStatus;
  } catch (error) {
    console.error('네트워크 모니터링 초기화 오류:', error);
    return {
      connected: false,
      connectionType: 'none'
    };
  }
};

/**
 * 네트워크 상태 변경 리스너 추가
 */
export const addNetworkListener = (listener: NetworkStatusListener): void => {
  listeners.push(listener);
};

/**
 * 네트워크 상태 변경 리스너 제거
 */
export const removeNetworkListener = (listener: NetworkStatusListener): void => {
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
};

/**
 * 현재 네트워크 상태 가져오기
 */
export const getCurrentNetworkStatus = async (): Promise<NetworkStatus> => {
  try {
    currentStatus = await Network.getStatus();
    return currentStatus;
  } catch (error) {
    console.error('네트워크 상태 확인 오류:', error);
    return currentStatus; // 마지막으로 알려진 상태 반환
  }
};

/**
 * 네트워크 연결 여부 확인
 */
export const isNetworkConnected = async (): Promise<boolean> => {
  const status = await getCurrentNetworkStatus();
  return status.connected;
};

/**
 * 네트워크 연결이 필요한 작업을 실행하기 전에 확인
 * @param onConnected 네트워크 연결 시 실행할 함수
 * @param onDisconnected 네트워크 연결 끊김 시 실행할 함수 (선택적)
 */
export const withNetworkCheck = async <T>(
  onConnected: () => Promise<T>,
  onDisconnected?: () => Promise<T> | void
): Promise<T | void> => {
  const isConnected = await isNetworkConnected();
  
  if (isConnected) {
    return onConnected();
  } else {
    if (onDisconnected) {
      return onDisconnected();
    } else {
      try {
        toast.error('네트워크 연결이 필요합니다.');
      } catch (e) { console.log('네트워크 연결이 필요합니다.'); }
      console.warn('네트워크 연결 없이 작업을 시도했습니다.');
    }
  }
}; 