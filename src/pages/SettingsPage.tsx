import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import Layout from '../components/common/Layout';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';

const SettingsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleAccountDelete = async () => {
        if (!user) {
            toast.error("로그인이 필요합니다.");
            return;
        }

        if (window.confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            try {
                // Firestore에서 사용자 관련 데이터 삭제
                await FirebaseFirestore.deleteDocument({
                    collection: 'users',
                    id: user.uid,
                });
                await FirebaseFirestore.deleteDocument({
                    collection: 'userSettings',
                    id: user.uid,
                });

                // 관련된 다른 데이터 삭제 (예: 운동 기록, 식단 기록 등)
                // 이 부분은 실제 요건에 맞게 추가 구현이 필요합니다.

                // Firebase Authentication에서 사용자 삭제
                await FirebaseAuthentication.deleteUser();

                toast.success('계정이 성공적으로 삭제되었습니다.');
                await logout();
                navigate('/login', { replace: true });

            } catch (error: any) {
                console.error("계정 삭제 실패:", error);
                toast.error(error.message || "계정 삭제에 실패했습니다. 다시 로그인한 후 시도해주세요.");
            }
        }
    };

    return (
        <Layout>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">설정</h1>

                <Card>
                    <h2 className="text-lg font-semibold mb-2">테마 설정</h2>
                    <div className="flex justify-between items-center">
                        <span>다크 모드</span>
                        <ThemeToggle />
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold mb-2">계정 관리</h2>
                    <Button
                        onClick={handleAccountDelete}
                        className="w-full bg-red-500 hover:bg-red-600 text-white"
                    >
                        회원 탈퇴
                    </Button>
                </Card>
            </div>
        </Layout>
    );
};

export default SettingsPage;
