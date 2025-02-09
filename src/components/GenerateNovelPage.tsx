import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FolderOpen, FileText, BookOpen, PenLine, ChevronDown, Import as Export, Save, Moon, User, Clock, ChevronLeft, ChevronRight, Volume2, Plus, Pencil, Star, ArrowLeft } from 'lucide-react';
import { synthesizeSpeech } from '../services/textToSpeech';

interface NovelData {
  title: string;
  characters: number;
  plotSummary: string;
  additionalInfo: string;
  toneOfStory: string;
  storyStructure: string;
  genre: string;
  era: string;
  generationTime: number;
  type: 'episodic' | 'one-shot';
  coverImage?: string;
}

interface Message {
  id: number;
  text: string;
  isAI: boolean;
  sender: 'Sun' | 'Schebel' | 'System';
  avatar: string;
}

const GenerateNovelPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [novelData, setNovelData] = useState<NovelData | null>(null);
  const [language, setLanguage] = useState('Thai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentNovelIndex, setCurrentNovelIndex] = useState(0);
  const [activeContent, setActiveContent] = useState<'projects' | 'tables' | 'novel'>('novel');
  const [rightContent, setRightContent] = useState<'chat' | 'outline' | 'settings'>('chat');
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(4);

  const [characters, setCharacters] = useState([
    {
      id: 1,
      name: 'ชื่อ',
      status: 'active',
      isStarred: true
    },
    {
      id: 2,
      name: 'ชื่อ',
      status: 'active',
      isStarred: true
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "เฮ้ย ชอบเกมที่เธอวาดมากเลย สวยจัง ทำไมไม่ลองมาทำงานที่บริษัทเราดูล่ะ?",
      isAI: false,
      sender: "Sun",
      avatar: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=50&h=50&fit=crop"
    },
    {
      id: 2,
      text: "ขอบคุณค่ะ แต่ว่าชอบทำงานฟรีแลนซ์มากกว่า",
      isAI: true,
      sender: "Schebel",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop"
    },
    {
      id: 3,
      text: "โห ทำไมล่ะ? ที่บริษัทเรามีสวัสดิการดีนะ แถมได้เจอเพื่อนร่วมงานเพียบเลย สนุกแน่นอน!",
      isAI: false,
      sender: "Sun",
      avatar: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=50&h=50&fit=crop"
    },
    {
      id: 4,
      text: "ชอบทำงานคนเดียวมากกว่าค่ะ",
      isAI: true,
      sender: "Schebel",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop"
    }
  ]);

  // Get current messages
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const novels = [
    {
      id: 1,
      title: "Freelance girl and direct sales guy",
      summary: "A freelance girl who cherished solitude crossed paths with a direct sales guy whose charm thrived on connection, and together, they redefined their worlds.",
    },
    {
      id: 2,
      title: "Digital Dreams",
      summary: "Where art meets gaming in the modern world",
    },
    {
      id: 3,
      title: "Creative Connections",
      summary: "Two different souls connected by their passion for games",
    }
  ];

  const generateSpeech = useCallback(async (text: string) => {
    try {
      setIsGeneratingSpeech(true);
      const audioContent = await synthesizeSpeech(text);
      
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      setAudioPlayer(audio);
      await audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
    } finally {
      setIsGeneratingSpeech(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
    };
  }, [audioPlayer]);

  useEffect(() => {
    // Check if we have data from navigation state
    if (location.state?.novelData) {
      setNovelData(location.state.novelData);
      // Initialize the chat with the novel data
      if (location.state.mode === 'create') {
        const initialMessage: Message = {
          id: messages.length + 1,
          text: `สร้างนิยายเรื่อง "${location.state.novelData.title}" ที่มีเนื้อเรื่องเกี่ยวกับ ${location.state.novelData.plotSummary}`,
          isAI: false,
          sender: "System",
          avatar: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=50&h=50&fit=crop"
        };
        setMessages(prev => [...prev, initialMessage]);
      }
    } else {
      // Check localStorage as fallback
      const savedNovelData = localStorage.getItem('novelData');
      if (savedNovelData) {
        setNovelData(JSON.parse(savedNovelData));
      } else {
        navigate('/create-novel');
      }
    }
  }, [location.state, navigate]);

  const generateText = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    const lastMessage = messages[messages.length - 1];
    const isSunNext = lastMessage.sender === 'Schebel';
    
    // Use novel data to influence the conversation
    let newText = '';
    
    if (novelData) {
      // Generate response based on novel data and context
      if (isSunNext) {
        const responses = [
          `ฉันชอบแนวคิดเรื่อง ${novelData.title} มาก โดยเฉพาะในส่วนของ ${novelData.plotSummary}`,
          `เรื่องราวแนว ${novelData.genre} นี่น่าสนใจมากเลย คุณคิดยังไงกับการพัฒนาตัวละครต่อ?`,
          `บรรยากาศแบบ ${novelData.era} เข้ากับโทนเรื่อง ${novelData.toneOfStory} ได้ดีมากเลย`
        ];
        newText = responses[Math.floor(Math.random() * responses.length)];
      } else {
        const responses = [
          `ขอบคุณค่ะ ฉันตั้งใจให้เรื่องนี้มีความพิเศษในแบบ ${novelData.toneOfStory}`,
          `ใช่ค่ะ ฉันวางโครงเรื่องแบบ ${novelData.storyStructure} เพื่อให้เข้ากับธีมหลัก`,
          `ฉันพยายามสร้างตัวละครให้สมจริงในบริบทของยุค ${novelData.era} ค่ะ`
        ];
        newText = responses[Math.floor(Math.random() * responses.length)];
      }
    } else {
      // Fallback responses if no novel data
      newText = isSunNext ? 
        "เล่าเพิ่มเติมเกี่ยวกับแนวคิดของเรื่องได้ไหม?" : 
        "ฉันกำลังพัฒนาเนื้อเรื่องให้น่าสนใจมากขึ้นค่ะ";
    }

    const newMessage: Message = {
      id: messages.length + 1,
      text: newText,
      isAI: true,
      sender: isSunNext ? 'Sun' : 'Schebel',
      avatar: isSunNext 
        ? "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=50&h=50&fit=crop"
        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop"
    };

    setMessages(prev => [...prev, newMessage]);
    setIsGenerating(false);

    // If we're on the last page and add a new message, move to the new last page
    const totalPages = Math.ceil((messages.length + 1) / messagesPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(totalPages);
    }
  };

  const navigateToNovel = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentNovelIndex > 0) {
      setCurrentNovelIndex(currentNovelIndex - 1);
    } else if (direction === 'next' && currentNovelIndex < novels.length - 1) {
      setCurrentNovelIndex(currentNovelIndex + 1);
    }
  };

  const convertMessagesToCSV = (messageIds: number[]) => {
    const messagesToExport = messages.filter(message => messageIds.includes(message.id));
    const header = "Id,Sender,Text,IsAI\n";
    const csvRows = messagesToExport.map(message => {
      return `${message.id},${message.sender},"${message.text.replace(/"/g, '""')}",${message.isAI}`;
    }).join('\n');
    return header + csvRows;
  };

  const downloadCSV = (csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const messageIds = messages.map(message => message.id);
    const csvData = convertMessagesToCSV(messageIds);
    downloadCSV(csvData, 'all_messages.csv');
    setIsExportModalOpen(false);
  };

  const handleExportSelected = () => {
    if (selectedMessages.length === 0) {
      alert('Please select at least one message to export.');
      return;
    }
    const csvData = convertMessagesToCSV(selectedMessages);
    downloadCSV(csvData, 'selected_messages.csv');
    setIsExportModalOpen(false);
  };

  const handleSelectMessage = (messageId: number) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  // Calculate total pages
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const renderRightContent = () => {
    switch (rightContent) {
      case 'chat':
        return (
          <>
            {/* Chat Area */}
            <div className="flex-1 overflow-auto p-4">
              {currentMessages.map((message) => (
                <div key={message.id} className="flex items-start mb-6">
                  <div className="flex items-start">
                    <img 
                      src={message.avatar}
                      alt={message.sender}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium text-sm mb-1">{message.sender}</div>
                      <div className="bg-[#2a2a2a] p-4 rounded-lg max-w-xl">
                        <p className="text-white">{message.text}</p>
                      </div>
                      <button
                        onClick={() => generateSpeech(message.text)}
                        disabled={isGeneratingSpeech}
                        className={`mt-2 px-4 py-1 bg-blue-500 text-sm rounded hover:bg-blue-600 flex items-center gap-2 ${
                          isGeneratingSpeech ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        {isGeneratingSpeech ? 'กำลังสร้างเสียง...' : 'สร้างเสียง'}
                      </button>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMessages.includes(message.id)}
                    onChange={() => handleSelectMessage(message.id)}
                    className="ml-2"
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2 p-4 border-t border-gray-800">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded ${
                    currentPage === number 
                      ? 'bg-blue-500' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-700 rounded">
                  <Moon className="w-5 h-5" />
                </button>
                <button 
                  onClick={generateText}
                  disabled={isGenerating}
                  className={`px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors ${
                    isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGenerating ? 'กำลังสร้าง...' : 'สร้างข้อความ'}
                </button>
              </div>
            </div>
          </>
        );
      case 'tables':
        return (
          <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">ตัวละครทั้งหมด</h2>
              <button className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors">
                เพิ่มเสียงตัวละคร
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {characters.map((character) => (
                <div key={character.id} className="relative group">
                  <div className="bg-[#1a1a1a] rounded-lg p-6 flex flex-col items-center">
                    <div className="relative">
                      <div className="w-24 h-24 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl text-gray-400">{character.name}</span>
                      </div>
                      {character.isStarred && (
                        <Star className="absolute top-0 right-0 w-5 h-5 text-yellow-500" fill="currentColor" />
                      )}
                    </div>
                    <span className="text-gray-400">สถานะ</span>
                    <button className="mt-2">
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Character Card */}
              <div className="relative group">
                <div className="bg-[#1a1a1a] rounded-lg p-6 flex flex-col items-center justify-center h-full cursor-pointer hover:bg-[#2a2a2a] transition-colors">
                  <div className="w-24 h-24 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-blue-500" />
                  </div>
                  <span className="text-gray-400">เพิ่มตัวละคร</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'outline':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Character Profiles</h2>
            <div className="space-y-6">
              <div className="bg-[#2a2a2a] p-4 rounded-lg">
                <h3 className="font-medium mb-2">Sun</h3>
                <p className="text-gray-300">A playful man who works at a game company. He's known for his good mood and excellent communication skills. Always trying to bring people together and make work fun.</p>
              </div>
              <div className="bg-[#2a2a2a] p-4 rounded-lg">
                <h3 className="font-medium mb-2">Schebel</h3>
                <p className="text-gray-300">A talented freelance artist who prefers solitude. She's calm and reserved, expressing herself better through her art than words. Values independence in her work.</p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Story Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Writing Style
                </label>
                <select className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-2">
                  <option>Casual Chat</option>
                  <option>Formal</option>
                  <option>Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Language
                </label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-2"
                >
                  <option value="Thai">Thai</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!novelData) return null;

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f0f0f] p-4 flex flex-col">
        {/* Logo */}
        <Link to="/" className="flex items-center mb-8 hover:opacity-80">
          <PenLine className="h-6 w-6" />
          <span className="ml-2 text-xl font-semibold">WriteWhisper</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveContent('projects')}
            className={`flex items-center px-3 py-2 text-gray-300 hover:bg-[#2a2a2a] rounded-lg w-full ${activeContent === 'projects' ? 'bg-[#2a2a2a]' : ''}`}
          >
            <FolderOpen className="w-5 h-5 mr-3" />
            Projects
          </button>
          <button 
            onClick={() => setActiveContent('tables')}
            className={`flex items-center px-3 py-2 text-gray-300 hover:bg-[#2a2a2a] rounded-lg w-full ${activeContent === 'tables' ? 'bg-[#2a2a2a]' : ''}`}
          >
            <FileText className="w-5 h-5 mr-3" />
            Character Voices
          </button>
          <button 
            onClick={() => setActiveContent('novel')}
            className={`flex items-center px-3 py-2 text-gray-300 hover:bg-[#2a2a2a] rounded-lg w-full ${activeContent === 'novel' ? 'bg-[#2a2a2a]' : ''}`}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            AI Novel Generator
          </button>
        </nav>

        {/* Story Chapters */}
        <div className="mt-8">
          <div className="flex items-center px-4 py-2 text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            Chapters
          </div>
          <div className="space-y-1">
            <button className="w-full text-left px-4 py-2 rounded hover:bg-[#2a2a2a] text-sm">
              Chapter 1: First Meeting
            </button>
            <button className="w-full text-left px-4 py-2 rounded hover:bg-[#2a2a2a] text-sm">
              Chapter 2: The Proposal
            </button>
            <button className="w-full text-left px-4 py-2 rounded hover:bg-[#2a2a2a] text-sm">
              Chapter 3: Working Together
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="pt-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-300" />
            </div>
            <div className="ml-3">
              <div className="font-medium">User</div>
              <div className="text-sm text-gray-400">Points: 2000</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigateToNovel('prev')}
                disabled={currentNovelIndex === 0}
                className={`p-2 rounded-full ${currentNovelIndex === 0 ? 'text-gray-600' : 'hover:bg-gray-700'}`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">{novels[currentNovelIndex].title}</h1>
                <p className="text-sm text-gray-400">{novels[currentNovelIndex].summary}</p>
              </div>
              <button 
                onClick={() => navigateToNovel('next')}
                disabled={currentNovelIndex === novels.length - 1}
                className={`p-2 rounded-full ${currentNovelIndex === novels.length - 1 ? 'text-gray-600' : 'hover:bg-gray-700'}`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="ml-8 flex items-center text-sm text-gray-400">
              <span>{messages.length} messages</span>
              <div className="mx-2">•</div>
              <div className="flex items-center">
                {language}
                <ChevronDown className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg overflow-hidden">
              <button
                onClick={() => setRightContent('chat')}
                className={`px-4 py-2 ${rightContent === 'chat' ? 'bg-blue-500' : 'bg-gray-700'}`}
              >
                Chat
              </button>
              <button
                onClick={() => setRightContent('outline')}
                className={`px-4 py-2 ${rightContent === 'outline' ? 'bg-blue-500' : 'bg-gray-700'}`}
              >
                Characters
              </button>
              <button
                onClick={() => setRightContent('settings')}
                className={`px-4 py-2 ${rightContent === 'settings' ? 'bg-blue-500' : 'bg-gray-700'}`}
              >
                Settings
              </button>
            </div>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              <Export className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </header>

        {/* Right Content Area */}
        {renderRightContent()}
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0f0f0f] w-full max-w-md p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Export Options</h2>
            <p className="text-gray-400 mb-4">Choose how you want to export your messages:</p>
            <div className="space-y-4">
              <button
                onClick={handleExportAll}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Export All Messages
              </button>
              <button
                onClick={handleExportSelected}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Export Selected Messages
              </button>
            </div>
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="mt-6 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateNovelPage;