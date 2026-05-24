import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, HelpCircle, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function LocalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Arey boss! Welcome to the Mumbai Mitra local hotline. I can guide you on Western Line rush patterns, the best spot for cutting chai in Bandra, or secret shortcuts. Ask me anything, bhidu!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Any local train mega-blocks?",
    "Best cafe to work from Bandra",
    "Cheapest link: Bandra to CST",
    "Dadar platform safety hacks"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-6) // Send recent conversational turns inside history to maintain context
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to deliver message.");
      }

      setMessages(prev => [...prev, { role: "model", text: data.text }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          text: "Arey boss, our network signals are experiencing a slight station delay! But remember this: Subko Coffee on Chapel Road is the ultimate Bandra cafe spot if that's what you were checking out! Let me know what else I can help with!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Messenger Node */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-orange-600 hover:bg-orange-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer border-2 border-orange-200"
          id="btn-open-chatbot"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 animate-pulse" />}
        </motion.button>
      </div>

      {/* Floating Messenger Panel Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-[32px] overflow-hidden shadow-2xl border border-orange-200 z-50 flex flex-col justify-between"
            id="panel-chatbot"
          >
            {/* Header branding */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-5 text-white flex justify-between items-center shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/15 w-8 h-8 rounded-xl flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 text-orange-200 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display font-black tracking-tight text-sm">Mumbai Helpline Mitra</h4>
                  <p className="text-[9px] text-orange-200 uppercase font-mono tracking-widest font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> ONLINE • GROUNDED HELP
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Flow Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-orange-50/15">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-orange-600 text-white" : "bg-neutral-100 text-orange-600 border border-orange-100"}`}>
                    {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                      m.role === "user"
                        ? "bg-orange-600 text-white rounded-tr-none"
                        : "bg-white border border-orange-100 text-slate-800 rounded-tl-none"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-2 mr-auto max-w-[85%]">
                  <div className="w-6 h-6 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0 text-orange-600 border border-orange-100">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="p-3.5 bg-white border border-orange-100 text-neutral-450 rounded-2xl rounded-tl-none text-xs flex gap-1">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Helpline Actions / Input Controls */}
            <div className="p-4 bg-white border-t border-orange-100 shrink-0">
              {/* Quick suggestions shortcuts */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {quickPrompts.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSend(p)}
                      className="text-[10px] bg-orange-50 border border-orange-100 hover:border-orange-300 text-orange-850 font-bold px-2.5 py-1.5 rounded-full transition cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your local Mitra helper..."
                  className="flex-grow px-3 py-2 border border-orange-200 outline-none rounded-xl text-xs font-semibold focus:border-orange-500 bg-orange-50/30"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl px-3 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
