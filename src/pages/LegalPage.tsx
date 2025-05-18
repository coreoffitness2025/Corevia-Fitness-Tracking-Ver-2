import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import LegalContent from '../components/settings/LegalPage';

const LegalPage: React.FC = () => {
  const { type = 'privacy' } = useParams<{ type?: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/settings');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <LegalContent 
          initialTab={type === 'terms' ? 'terms' : 'privacy'} 
          onBack={handleBack} 
        />
      </div>
    </Layout>
  );
};

export default LegalPage; 