import { Send, TrendingUp, Zap, RotateCcw, Square, Bot, User, Sparkles } from 'lucide-react';
import { useChat } from './hooks/useChat';
import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SUGGESTIONS = [
  'ما هو أكثر بحث رائج عن صيانة المنازل اليوم؟',
  'اقترح حملة تسويقية لخدمات السباكة',
  'أعطني فكرة محتوى فيديو لفيسبوك ريلز',
  'كيف أزيد عدد الحرفيين المسجلين في المنصة؟',
  'حلل المنافسة في سوق خدمات التنظيف',
  'اقترح استراتيجية تسعير لخدمات الكهرباء',
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      <span className="text-xs text-gray-500 mr-2">الوكيل يفكر...</span>
    </div>
  );
}

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1 ${
        isUser 
          ? 'bg-gradient-to-br from-orange-500 to-amber-600' 
          : 'bg-gradient-to-br from-gray-700 to-gray-800 ring-1 ring-gray-600'
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-orange-400" />}
      </div>

      {/* Message content */}
      <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
        isUser
          ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/10'
          : 'bg-[#1a1a2e] text-gray-200 ring-1 ring-white/5'
      }`}>
        {isUser ? (
          <p className="text-[15px] leading-relaxed">{content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none 
            prose-headings:text-orange-400 prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-1.5
            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-2
            prose-strong:text-orange-300
            prose-li:text-gray-300 prose-li:my-0.5
            prose-ul:my-1 prose-ol:my-1
            prose-a:text-orange-400 prose-a:no-underline hover:prose-a:underline
            prose-code:text-orange-300 prose-code:bg-black/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-hr:border-gray-700/50 prose-hr:my-3
            prose-blockquote:border-orange-500/50 prose-blockquote:text-gray-400"
            dir="rtl"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, clearMessages } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);

  // Hide suggestions after first message
  useEffect(() => {
    if (messages.length > 0) setShowSuggestions(false);
  }, [messages]);

  const handleSuggestion = (text: string) => {
    const fakeEvent = {
      target: { value: text },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(fakeEvent);
    setTimeout(() => {
      const form = document.querySelector('form');
      form?.requestSubmit();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      form?.requestSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white" dir="rtl">
      <div className="h-screen flex flex-col">

        {/* Header */}
        <header className="bg-[#0d0d1a]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-xl shadow-lg shadow-orange-500/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-[#0d0d1a]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Bricool<span className="text-orange-400"> AI</span>
                </h1>
                <p className="text-[11px] text-gray-500 -mt-0.5">وكيل الذكاء التجاري</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>محادثة جديدة</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Messages area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

              {/* Welcome screen */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl scale-150" />
                    <div className="relative bg-gradient-to-br from-orange-500 to-amber-600 p-5 rounded-2xl shadow-2xl shadow-orange-500/20">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    مرحباً بك في <span className="text-orange-400">Bricool AI</span>
                  </h2>
                  <p className="text-gray-500 mb-8 max-w-md leading-relaxed text-sm">
                    وكيلك الذكي لتحليل السوق، اقتراح استراتيجيات التسويق، وتوليد أفكار المحتوى لخدمات الصيانة المنزلية
                  </p>

                  {/* Suggestion chips */}
                  {showSuggestions && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl w-full">
                      {SUGGESTIONS.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestion(suggestion)}
                          className="group text-right bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-orange-500/30 rounded-xl px-4 py-3 transition-all duration-200"
                        >
                          <div className="flex items-start gap-2.5">
                            <Zap className="w-4 h-4 text-orange-500/60 group-hover:text-orange-400 mt-0.5 flex-shrink-0 transition-colors" />
                            <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
                              {suggestion}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              {messages.map((message, index) => (
                <MessageBubble key={index} role={message.role} content={message.content} />
              ))}

              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 ring-1 ring-gray-600">
                    <Bot className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="bg-[#1a1a2e] rounded-2xl px-5 py-2 ring-1 ring-white/5">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-white/5 bg-[#0d0d1a]/80 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
              <form onSubmit={handleSubmit} className="flex gap-2.5 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب سؤالك هنا..."
                    rows={1}
                    className="w-full bg-white/[0.04] text-white placeholder-gray-600 border border-white/[0.08] rounded-xl px-4 py-3 pr-4 text-[15px] focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all resize-none leading-relaxed"
                    disabled={isLoading}
                    style={{ minHeight: '48px', maxHeight: '150px' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 150) + 'px';
                    }}
                  />
                </div>
                {isLoading ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 p-3 rounded-xl transition-all flex-shrink-0"
                    title="إيقاف"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all flex-shrink-0 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/25 disabled:shadow-none"
                    title="إرسال"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </form>
              <p className="text-[11px] text-gray-600 text-center mt-2">
                Bricool AI مدعوم بالذكاء الاصطناعي • الإجابات قد تحتوي على أخطاء
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
