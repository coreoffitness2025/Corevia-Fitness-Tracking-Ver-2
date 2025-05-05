import React from 'react';
import Layout from '../components/common/Layout';

const ProfilePage: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">프로필</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p>프로필 페이지입니다.</p>
      </div>
    </Layout>
  );
};

export default ProfilePage; 