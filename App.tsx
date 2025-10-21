import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { generateBuildGuide, compareBuildGuides, startChatSession } from './services/geminiService';
import { CULTIVATION_PATHS, PLAYSTYLES, LINH_CAN_OPTIONS, TINH_ANH_OPTIONS } from './constants';
import { CultivationPath, Playstyle, BuildGuide, LinhCan, HistoryItem, TinhAnh, ChatMessage } from './types';
import { Header } from './components/Header';
import { BuildForm } from './components/BuildForm';
import { ResultDisplay } from './components/ResultDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { ComparisonModal } from './components/ComparisonModal';
import { ChatModal } from './components/ChatModal';
import { GeneralChat } from './components/GeneralChat';
import { API_KEY_STORAGE_KEY, hasApiKey } from './services/geminiService';


const ApiKeyPrompt: React.FC<{ onKeySubmit: (key: string) => void }> = ({ onKeySubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onKeySubmit(key.trim());
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-brand-surface p-8 rounded-xl shadow-2xl border border-gray-700/50">
        <div className="text-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
              Yêu Cầu API Key
            </h1>
          <p className="mt-2 text-brand-text-secondary">
            Vui lòng nhập API Key Gemini của bạn để bắt đầu.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="apiKey" className="sr-only">Gemini API Key</label>
            <input
              id="apiKey"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-4 py-3 text-brand-text placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition duration-200"
              placeholder="Dán API Key của bạn vào đây"
              required
            />
          </div>
          <p className="text-xs text-center text-brand-text-secondary">
            Key của bạn được lưu trữ an toàn trong trình duyệt và không được chia sẻ đi bất cứ đâu.
          </p>
          <div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg shadow-lg hover:shadow-glow-primary transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lưu và Tiếp Tục
            </button>
          </div>
        </form>
         <div className="mt-6 text-center">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-brand-secondary hover:text-brand-primary underline transition-colors"
            >
              Lấy API Key từ Google AI Studio
            </a>
        </div>
      </div>
    </div>
  );
};


const STORAGE_KEY = 'qcph_build_history';

// Helper function to gracefully handle localStorage quota errors
const saveAndManageHistory = (updatedHistory: HistoryItem[]): HistoryItem[] => {
  let historyToSave = [...updatedHistory];
  // Enforce a hard cap of 20 items. The newest items are at the start.
  if (historyToSave.length > 20) {
    historyToSave = historyToSave.slice(0, 20);
  }

  while (historyToSave.length > 0) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(historyToSave));
      return historyToSave; // Success
    } catch (e) {
      if (e instanceof DOMException && ['QuotaExceededError', 'NS_ERROR_DOM_QUOTA_REACHED'].includes(e.name)) {
        // Quota exceeded, remove the oldest item (at the end of the array) and retry.
        const removedItem = historyToSave.pop();
        console.warn(`LocalStorage quota exceeded. Removing oldest history item to free up space:`, removedItem);
      } else {
        console.error("Failed to save history", e);
        // On other errors, return the original intended state to avoid data loss in memory for the current session.
        return updatedHistory; 
      }
    }
  }

  // This is reached if we couldn't even save a single item. Try to save an empty array.
  try {
    window.localStorage.setItem(STORAGE_KEY, '[]');
  } catch (e) {
    console.error("Failed to clear history in localStorage", e);
  }
  return []; // Return empty array if all else fails
};

type ActiveTab = 'build' | 'chat';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-lg font-semibold border-b-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/50
            ${active 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-brand-text-secondary hover:text-brand-text hover:border-gray-500'
            }`}
    >
        {children}
    </button>
);


const App: React.FC = () => {
  const [isKeyAvailable, setIsKeyAvailable] = useState(hasApiKey());
  const [activeTab, setActiveTab] = useState<ActiveTab>('build');
  const [selectedPaths, setSelectedPaths] = useState<CultivationPath[]>([CULTIVATION_PATHS[0].value]);
  const [selectedLinhCan, setSelectedLinhCan] = useState<LinhCan>(LinhCan.None);
  const [selectedTinhAnh, setSelectedTinhAnh] = useState<TinhAnh>(TinhAnh.None);
  const [playstyle, setPlaystyle] = useState<Playstyle>(PLAYSTYLES[0].value);
  const [customPlaystyle, setCustomPlaystyle] = useState<string>('');
  const [buildResult, setBuildResult] = useState<BuildGuide | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [buildHistory, setBuildHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryItem, setActiveHistoryItem] = useState<HistoryItem | null>(null);

  // State for comparison feature
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [buildsToCompare, setBuildsToCompare] = useState<[HistoryItem, HistoryItem] | null>(null);

  // State for chat feature
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  useEffect(() => {
    try {
      const storedHistory = window.localStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
         // Migration for old history items
        const migratedHistory = parsedHistory.map((item: any) => {
          if (item.path && !item.paths) { // Check for old format
            return { ...item, paths: [item.path], path: undefined };
          }
           if (!item.paths || item.paths.length === 0) { // Handle case where paths is missing or empty
              return {...item, paths: [CULTIVATION_PATHS[0].value]}
          }
          return item;
        }).filter((item: any) => item.paths && item.paths.length > 0);
        setBuildHistory(migratedHistory);
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleGenerateBuild = useCallback(async (
    paths: CultivationPath[] = selectedPaths,
    linhCan: LinhCan = selectedLinhCan,
    tinhAnh: TinhAnh = selectedTinhAnh,
    ps: string = playstyle === Playstyle.Custom ? customPlaystyle : playstyle
  ) => {
     if (paths.length === 0) {
      setError('Vui lòng chọn ít nhất một Lộ Tuyến Tu Luyện.');
      return;
    }
    if (playstyle === Playstyle.Custom && !customPlaystyle.trim()) {
      setError('Vui lòng nhập mô tả cho phong cách chơi tùy chỉnh.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBuildResult(null);
    setActiveHistoryItem(null);

    try {
      const finalPlaystyle = ps;
      const result = await generateBuildGuide(paths, linhCan, tinhAnh, finalPlaystyle);
      setBuildResult(result);

      const newHistoryItem: HistoryItem = {
        id: `build-${Date.now()}`,
        timestamp: Date.now(),
        paths: paths,
        linhCan: linhCan,
        tinhAnh: tinhAnh,
        playstyle: finalPlaystyle,
        build: result,
        chatHistory: []
      };
      
      setActiveHistoryItem(newHistoryItem);

      setBuildHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory];
        const managedHistory = saveAndManageHistory(updatedHistory);
        return managedHistory;
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tạo build. Vui lòng thử lại.';
       if (errorMessage.includes("API key not valid")) {
            setError('API Key không hợp lệ. Vui lòng kiểm tra lại.');
            // Clear the invalid key to prompt for a new one
            window.localStorage.removeItem(API_KEY_STORAGE_KEY);
            setIsKeyAvailable(false);
        } else {
            setError(errorMessage);
        }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPaths, selectedLinhCan, selectedTinhAnh, playstyle, customPlaystyle]);

  const handleFeelingLucky = useCallback(() => {
    setError(null);
    // Randomly select 1 or 2 paths
    const shuffledPaths = [...CULTIVATION_PATHS].sort(() => 0.5 - Math.random());
    const pathCount = Math.random() < 0.7 ? 1 : 2; // 70% chance for 1 path, 30% for 2
    const randomPaths = shuffledPaths.slice(0, pathCount).map(p => p.value);
    
    // Randomly select a non-custom playstyle
    const predefinedPlaystyles = PLAYSTYLES.filter(p => p.value !== Playstyle.Custom);
    const randomPlaystyle = predefinedPlaystyles[Math.floor(Math.random() * predefinedPlaystyles.length)].value;

    // Randomly select Linh Can and Tinh Anh
    const randomLinhCan = LINH_CAN_OPTIONS[Math.floor(Math.random() * LINH_CAN_OPTIONS.length)].value;
    const randomTinhAnh = TINH_ANH_OPTIONS[Math.floor(Math.random() * TINH_ANH_OPTIONS.length)].value;

    setSelectedPaths(randomPaths);
    setPlaystyle(randomPlaystyle);
    setSelectedLinhCan(randomLinhCan);
    setSelectedTinhAnh(randomTinhAnh);
    setCustomPlaystyle('');

    handleGenerateBuild(randomPaths, randomLinhCan, randomTinhAnh, randomPlaystyle);

  }, [handleGenerateBuild]);

  const handleStartComparison = useCallback(async (builds: [HistoryItem, HistoryItem]) => {
    setBuildsToCompare(builds);
    setIsComparisonModalOpen(true);
    setIsComparing(true);
    setComparisonResult(null);
    try {
      const result = await compareBuildGuides(builds[0], builds[1]);
      setComparisonResult(result);
    } catch (e) {
      console.error("Comparison failed", e);
      setComparisonResult("Rất tiếc, đã có lỗi xảy ra khi so sánh hai build này. Vui lòng thử lại.");
    } finally {
      setIsComparing(false);
    }
  }, []);

  const handleStartChat = useCallback(() => {
    if (activeHistoryItem) {
      try {
        const session = startChatSession(activeHistoryItem.build, activeHistoryItem.chatHistory);
        setChatSession(session);
        setIsChatModalOpen(true);
      } catch(e) {
        console.error("Failed to start chat session", e);
        setError("Không thể bắt đầu phiên trò chuyện. Vui lòng thử lại.");
      }
    }
  }, [activeHistoryItem]);

  const handleSaveChatHistory = (messages: ChatMessage[]) => {
    if (!activeHistoryItem) return;

    const updatedHistory = buildHistory.map(item => {
        if (item.id === activeHistoryItem.id) {
            return { ...item, chatHistory: messages };
        }
        return item;
    });
    
    const managedHistory = saveAndManageHistory(updatedHistory);
    setBuildHistory(managedHistory);

    const currentActiveItem = managedHistory.find(item => item.id === activeHistoryItem.id);
    if(currentActiveItem) {
        setActiveHistoryItem(currentActiveItem);
    } else {
        // This can happen if the active item was the one pruned to save space.
        setActiveHistoryItem(null);
    }
  };

  const handleClearChatHistory = () => {
      if (!activeHistoryItem) return;

      const updatedHistory = buildHistory.map(item => {
          if (item.id === activeHistoryItem.id) {
              const newItem = { ...item };
              delete newItem.chatHistory;
              return newItem;
          }
          return item;
      });
      
      const managedHistory = saveAndManageHistory(updatedHistory);
      setBuildHistory(managedHistory);
      
      const currentActiveItem = managedHistory.find(item => item.id === activeHistoryItem.id);
      if (currentActiveItem) {
          setActiveHistoryItem(currentActiveItem);
      }
  };

  const handlePathChange = (path: CultivationPath) => {
    setError(null);
    setSelectedPaths(prevPaths => {
      if (prevPaths.includes(path)) {
        if (prevPaths.length === 1) return prevPaths;
        return prevPaths.filter(p => p !== path);
      } else {
        return [...prevPaths, path].slice(-2); // Allow max 2 paths
      }
    });
  };

  const handlePlaystyleChange = (value: Playstyle) => {
    setPlaystyle(value);
    if (error) setError(null);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setBuildResult(item.build);
    setActiveHistoryItem(item);
    setSelectedPaths(item.paths);
    setSelectedLinhCan(item.linhCan);
    setSelectedTinhAnh(item.tinhAnh || TinhAnh.None);

    const isPredefined = PLAYSTYLES.some(p => p.value === item.playstyle);
    if (isPredefined) {
      setPlaystyle(item.playstyle as Playstyle);
      setCustomPlaystyle('');
    } else {
      setPlaystyle(Playstyle.Custom);
      setCustomPlaystyle(item.playstyle);
    }
    
    const mainElement = document.querySelector('main');
    if(mainElement) mainElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử build không? Thao tác này không thể hoàn tác.")) {
      setBuildHistory([]);
      setBuildResult(null);
      setActiveHistoryItem(null);
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error("Failed to clear history from localStorage", e);
      }
    }
  };

  const handleLoadBuildFromJsonString = (jsonString: string) => {
    try {
      const loadedBuild = JSON.parse(jsonString);
      if (loadedBuild && typeof loadedBuild.gioiThieu !== 'undefined' && Array.isArray(loadedBuild.nghichThienCaiMenh)) {
        setError(null);
        setBuildResult(loadedBuild as BuildGuide);
        setActiveHistoryItem(null); // Loaded builds are not in history, so no chat context
        const mainElement = document.querySelector('main');
        if(mainElement) mainElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        throw new Error("Invalid build file structure.");
      }
    } catch (e) {
      console.error("Failed to load build from JSON", e);
      setError("Tập tin build không hợp lệ hoặc đã bị hỏng. Vui lòng thử lại với một tập tin khác.");
      setBuildResult(null);
    }
  };

  const handleKeySubmit = (key: string) => {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setIsKeyAvailable(true);
  };

  if (!isKeyAvailable) {
    return <ApiKeyPrompt onKeySubmit={handleKeySubmit} />;
  }

  return (
    <>
      <div className="min-h-screen bg-brand-bg font-sans text-brand-text">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Header />

          <div className="flex justify-center border-b border-gray-700 mt-8">
              <TabButton active={activeTab === 'build'} onClick={() => setActiveTab('build')}>Tạo Build</TabButton>
              <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>Hỏi Đáp AI</TabButton>
          </div>
          
          {activeTab === 'build' && (
            <main className="mt-8">
              <div className="bg-brand-surface p-6 rounded-lg shadow-lg border border-gray-700/50">
                <BuildForm
                  selectedPaths={selectedPaths}
                  onPathChange={handlePathChange}
                  selectedLinhCan={selectedLinhCan}
                  onLinhCanChange={setSelectedLinhCan}
                  selectedTinhAnh={selectedTinhAnh}
                  onTinhAnhChange={setSelectedTinhAnh}
                  playstyle={playstyle}
                  onPlaystyleChange={handlePlaystyleChange}
                  customPlaystyle={customPlaystyle}
                  onCustomPlaystyleChange={setCustomPlaystyle}
                  onSubmit={() => handleGenerateBuild()}
                  onFeelingLucky={handleFeelingLucky}
                  isLoading={isLoading}
                />
              </div>

              <div className="mt-8">
                <ResultDisplay
                  isLoading={isLoading}
                  error={error}
                  buildResult={buildResult}
                  onLoadBuild={handleLoadBuildFromJsonString}
                  onStartChat={handleStartChat}
                  canChat={!!activeHistoryItem}
                />
              </div>

              <HistoryPanel 
                history={buildHistory}
                onSelect={handleSelectHistoryItem}
                onClear={handleClearHistory}
                onCompare={handleStartComparison}
              />
            </main>
          )}

          {activeTab === 'chat' && (
            <main className="mt-8">
              <GeneralChat />
            </main>
          )}
          
        </div>
      </div>
      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        isLoading={isComparing}
        result={comparisonResult}
        builds={buildsToCompare}
      />
      {chatSession && activeHistoryItem && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          chatSession={chatSession}
          initialHistory={activeHistoryItem.chatHistory || []}
          onSaveHistory={handleSaveChatHistory}
          onClearHistory={handleClearChatHistory}
        />
      )}
    </>
  );
};

export default App;
