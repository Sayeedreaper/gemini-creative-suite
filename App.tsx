import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ChatInterface } from './components/ChatInterface';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { Storyteller } from './components/Storyteller';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Chat);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.Chat:
        return <ChatInterface />;
      case AppTab.Analyze:
        return <ImageAnalyzer />;
      case AppTab.Story:
        return <Storyteller />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
