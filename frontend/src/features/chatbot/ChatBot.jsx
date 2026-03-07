import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Sparkles,
  User,
  Bot,
  Loader2,
} from 'lucide-react';
import chatbot_logo from '../../assets/chatbot_logo.png';

// ChatBot Component
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm KareerAssist 👋 Your personal AI career assistant. I can help you with:",
      options: [
        '🎯 New job matches',
        '📋 Application status',
        '💡 Career advice',
        '📝 Resume tips',
      ],
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState({
    right: 20,
    bottom: 20,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Dragging functionality
  const handleMouseDown = (e) => {
    if (isOpen && !isMinimized) return; // Don't drag when chat is open
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    // Calculate new position from right and bottom
    const newRight = window.innerWidth - e.clientX - (64 - dragOffset.x);
    const newBottom = window.innerHeight - e.clientY - (64 - dragOffset.y);

    // Keep within viewport bounds
    const maxRight = window.innerWidth - 80;
    const maxBottom = window.innerHeight - 80;

    setPosition({
      right: Math.max(10, Math.min(newRight, maxRight)),
      bottom: Math.max(10, Math.min(newBottom, maxBottom)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Mock bot responses based on user input
  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes('job') ||
      lowerMessage.includes('opening') ||
      lowerMessage.includes('match')
    ) {
      return {
        text: 'Great! I found 3 new job matches for you based on your profile:\n\n🔹 Senior React Developer at TechCorp\n💰 ₹18-25 LPA | 📍 Bangalore\n\n🔹 Full Stack Engineer at StartupXYZ\n💰 ₹15-22 LPA | 📍 Remote\n\n🔹 Frontend Lead at InnovateLabs\n💰 ₹20-30 LPA | 📍 Hyderabad\n\nWould you like to see more details or apply?',
        options: ['Show details', 'Apply now', 'More jobs'],
      };
    }

    if (
      lowerMessage.includes('application') ||
      lowerMessage.includes('applied') ||
      lowerMessage.includes('status')
    ) {
      return {
        text: "Here's the status of your recent applications:\n\n✅ Software Engineer at Google\nStatus: Under Review (Applied 3 days ago)\n\n⏳ Backend Developer at Amazon\nStatus: Screening (Applied 5 days ago)\n\n🎉 Full Stack Developer at Microsoft\nStatus: Interview Scheduled (Tomorrow 3 PM)\n\nWould you like interview preparation tips?",
        options: [
          'Interview tips',
          'View all applications',
          'Withdraw application',
        ],
      };
    }

    if (
      lowerMessage.includes('interview') ||
      lowerMessage.includes('preparation') ||
      lowerMessage.includes('tips')
    ) {
      return {
        text: 'I can help you prepare for your interview! Here are some tips:\n\n✨ Practice with AI Mock Interview\n📚 Review common questions for your role\n💼 Research the company culture\n🎯 Prepare STAR format answers\n\nWould you like to start a mock interview session?',
        options: [
          'Start mock interview',
          'Common questions',
          'Company research',
        ],
      };
    }

    if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
      return {
        text: "Let me analyze your resume! Your profile is 85% complete. Here's what you can improve:\n\n📝 Add more project details\n🎯 Include quantifiable achievements\n💡 Update your skills section\n\nWant me to generate suggestions based on your target roles?",
        options: ['Generate suggestions', 'View resume', 'Edit profile'],
      };
    }

    if (lowerMessage.includes('salary') || lowerMessage.includes('pay')) {
      return {
        text: 'Based on your experience and skills, the market salary range for similar profiles is:\n\n💰 Average: ₹18-24 LPA\n📈 Top 10%: ₹28-35 LPA\n🎯 Your target: ₹22-28 LPA\n\nWould you like to see salary trends for specific companies?',
        options: ['Company salaries', 'Negotiate tips', 'Skill gaps'],
      };
    }

    return {
      text: "I'm here to help! I can assist you with:\n\n🎯 Finding job matches\n📋 Checking application status\n💡 Interview preparation\n📝 Resume improvements\n💰 Salary insights\n\nWhat would you like to know?",
      options: ['Find jobs', 'Application status', 'Career advice'],
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: botResponse.text,
        options: botResponse.options,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (action) => {
    setInputValue(action);
    handleSendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'default',
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-gray-200 mb-4 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[min(600px,calc(100vh-160px))]'
            } w-[min(400px,calc(100vw-40px))] flex flex-col`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">KareerAssist</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-100">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMinimize}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-5 h-5" />
                ) : (
                  <Minimize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={toggleChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                      } gap-2`}
                  >
                    {message.type === 'bot' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[75%] ${message.type === 'user' ? 'order-1' : ''
                        }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 ${message.type === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                          }`}
                      >
                        <p className="text-sm whitespace-pre-line leading-relaxed">
                          {message.text}
                        </p>
                      </div>

                      {message.options && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickAction(option)}
                              className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Container */}
              <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Powered by AI • Your data is secure
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <div
        // onMouseDown={handleMouseDown}
        className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <button
          onClick={toggleChat}
          className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-110 flex items-center justify-center group overflow-hidden"
          aria-label="Open KareerAssist"
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <>
              {/* Logo - Replace with your actual logo */}
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <img
                    src={chatbot_logo}
                    alt="KareerAssist"
                    className="w-8 h-8"
                  />
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                3
              </div>
            </>
          )}

          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>

          {/* Tooltip */}
          {!isOpen && (
            <div className="absolute right-20 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Chat with KareerAssist
              <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-gray-900"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
