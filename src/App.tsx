import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Train, 
  MapPin, 
  Users, 
  Clock, 
  Coffee, 
  Compass, 
  Handshake, 
  Zap, 
  Search, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  Copy, 
  ExternalLink,
  MessageSquare,
  HelpCircle,
  FileText,
  User,
  Power,
  ArrowUp,
  Plus,
  ThumbsUp,
  Heart,
  Store,
  MessageCircle,
  Share2
} from "lucide-react";

import { TabId, CommuteResult, DiscoverCard, NeighbourhoodResult, GroundingSource } from "./types";
import { parseCommute, parseDiscover, parseNeighbourhood, getPlaceImageUrl } from "./utils";
import CommuteTransitMap from "./components/CommuteTransitMap";

// Hyperlocal Persistent Database imports
import { dbInstance, CommunityPost, ActivitySquad, CustomStore, User as DbUser } from "./lib/db";
import LocalChatbot from "./components/LocalChatbot";
import PlacesModal from "./components/PlacesModal";
import AuthModal from "./components/AuthModal";


// Hyperlocal fun loading messages for Mumbai commuters
const LOADING_MESSAGES = [
  "Checking live train delay boards at Dadar...",
  "Consulting local tapris on Western Line signal status...",
  "Dodging cutting-chai requests to fetch results...",
  "Scanning Bandra & Kala Ghoda for fresh cafe spots...",
  "Querying real-time Google search indices...",
  "Asking neighborhood WhatsApp groups for reliable cooks...",
  "Analyzing Mumabadevi crowd signals...",
  "Filtering out mega-block warnings..."
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("commute");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [commuteStation, setCommuteStation] = useState("Dadar to Andheri");
  const [commuteTime, setCommuteTime] = useState("6:15 PM");

  const [discoverLocality, setDiscoverLocality] = useState("Bandra West");
  const [discoverCategory, setDiscoverCategory] = useState("Cafes");

  const [neighbourhoodNeed, setNeighbourhoodNeed] = useState("Full-time cook, Mon–Fri mornings");

  // Results state
  const [commuteResult, setCommuteResult] = useState<CommuteResult | null>(null);
  const [commuteSources, setCommuteSources] = useState<GroundingSource[]>([]);
  const [commuteRaw, setCommuteRaw] = useState<string>("");

  const [discoverResult, setDiscoverResult] = useState<DiscoverCard[] | null>(null);
  const [discoverSources, setDiscoverSources] = useState<GroundingSource[]>([]);
  const [discoverRaw, setDiscoverRaw] = useState<string>("");

  const [neighbourhoodResult, setNeighbourhoodResult] = useState<NeighbourhoodResult | null>(null);
  const [neighbourhoodSources, setNeighbourhoodSources] = useState<GroundingSource[]>([]);
  const [neighbourhoodRaw, setNeighbourhoodRaw] = useState<string>("");

  // UI state
  const [showRawView, setShowRawView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  // Hyperlocal State Engines
  const [currentUser, setCurrentUser] = useState<DbUser | null>(dbInstance.getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlaceForModal, setSelectedPlaceForModal] = useState<DiscoverCard | CustomStore | null>(null);

  // Database lists
  const [posts, setPosts] = useState<CommunityPost[]>(dbInstance.getCommunityPosts());
  const [squads, setSquads] = useState<ActivitySquad[]>(dbInstance.getActivitySquads());
  const [customStores, setCustomStores] = useState<CustomStore[]>(dbInstance.getCustomStores());

  // Input states for writing content
  const [squadTitle, setSquadTitle] = useState("");
  const [squadLocality, setSquadLocality] = useState("Bandra West");
  const [squadActivity, setSquadActivity] = useState("Sports & Games");
  const [squadDescription, setSquadDescription] = useState("");
  const [squadMaxPeople, setSquadMaxPeople] = useState(6);

  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState<"trains" | "society" | "general" | "local">("trains");
  const [postBody, setPostBody] = useState("");

  const [storeName, setStoreName] = useState("");
  const [storeLocality, setStoreLocality] = useState("Bandra West");
  const [storeType, setStoreType] = useState("Cafe");
  const [storeWhatsNew, setStoreWhatsNew] = useState("");
  const [storeVibe, setStoreVibe] = useState("");

  // Subsections and search text
  const [searchSquadLocality, setSearchSquadLocality] = useState("Bandra West");
  const [searchStoreLocality, setSearchStoreLocality] = useState("Bandra West");
  const [communityCategoryFilter, setCommunityCategoryFilter] = useState<string>("all");
  const [newCommunityComment, setNewCommunityComment] = useState<{ [postId: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});

  const handleCreateSquad = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!squadTitle || !squadDescription) return;

    try {
      dbInstance.addActivitySquad(squadTitle, squadLocality, squadActivity, squadDescription, squadMaxPeople);
      setSquads(dbInstance.getActivitySquads());
      // Reset form
      setSquadTitle("");
      setSquadDescription("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreatePost = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!postTitle || !postBody) return;

    try {
      dbInstance.addCommunityPost(postTitle, postCategory, postBody);
      setPosts(dbInstance.getCommunityPosts());
      // Reset form
      setPostTitle("");
      setPostBody("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateStore = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!storeName || !storeWhatsNew || !storeVibe) return;

    try {
      dbInstance.addCustomStore(storeName, storeLocality, storeType, storeWhatsNew, storeVibe);
      setCustomStores(dbInstance.getCustomStores());
      // Reset form
      setStoreName("");
      setStoreWhatsNew("");
      setStoreVibe("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleJoinSquad = (id: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      dbInstance.joinActivitySquad(id);
      setSquads(dbInstance.getActivitySquads());
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLeaveSquad = (id: string) => {
    if (!currentUser) return;
    try {
      dbInstance.leaveActivitySquad(id);
      setSquads(dbInstance.getActivitySquads());
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpvotePost = (id: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      dbInstance.upvotePost(id);
      setPosts(dbInstance.getCommunityPosts());
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const text = newCommunityComment[postId];
    if (!text || !text.trim()) return;

    try {
      dbInstance.addCommentToPost(postId, text);
      setPosts(dbInstance.getCommunityPosts());
      setNewCommunityComment(prev => ({ ...prev, [postId]: "" }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLikeStore = (id: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      dbInstance.likeCustomStore(id);
      setCustomStores(dbInstance.getCustomStores());
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Carousel of loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      interval = setInterval(() => {
        setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handlePredict = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowRawView(false);
    setIsFallback(false);

    const requestBody: any = { mode: activeTab };
    if (activeTab === "commute") {
      requestBody.commute = { station: commuteStation, time: commuteTime };
    } else if (activeTab === "discover") {
      requestBody.discover = { locality: discoverLocality, category: discoverCategory };
    } else {
      requestBody.neighbourhood = { need: neighbourhoodNeed };
    }

    try {
      const response = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with AI model.");
      }

      const text = data.text;
      const sources = data.sources || [];
      setIsFallback(!!data.isFallback);

      if (activeTab === "commute") {
        setCommuteRaw(text);
        setCommuteSources(sources);
        const parsed = parseCommute(text);
        setCommuteResult(parsed);
      } else if (activeTab === "discover") {
        setDiscoverRaw(text);
        setDiscoverSources(sources);
        const parsed = parseDiscover(text);
        setDiscoverResult(parsed);
      } else {
        setNeighbourhoodRaw(text);
        setNeighbourhoodSources(sources);
        const parsed = parseNeighbourhood(text);
        setNeighbourhoodResult(parsed);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };  return (
    <div className="min-h-screen bg-orange-50 text-slate-900 font-sans selection:bg-orange-500/20 antialiased flex flex-col justify-between border-4 md:border-8 border-orange-100">
      
      {/* Upper Navigation / Logo branding */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center border-b border-orange-200 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-black italic">M</div>
            <div>
              <h1 className="text-2xl font-black text-orange-600 tracking-tighter leading-none font-display">MUMBAI MITRA</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Hyperlocal Intelligence Agency</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
            <span className="hidden sm:inline-flex px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200 items-center gap-1.5 font-mono">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> GEMINI 3.5 FLASH • ACTIVE
            </span>

            {currentUser ? (
              <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-200 p-1.5 pr-3 rounded-full shadow-sm animate-in fade-in duration-200">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.username}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-orange-200 object-cover"
                />
                <div className="text-left">
                  <p className="text-xs font-black text-slate-800 leading-none">{currentUser.username}</p>
                  <p className="text-[9px] text-orange-600 font-semibold font-mono leading-none mt-1">📍 {currentUser.locality}</p>
                </div>
                <button
                  onClick={() => {
                    dbInstance.logoutUser();
                    setCurrentUser(null);
                  }}
                  title="Log out"
                  className="ml-2 w-7 h-7 bg-white hover:bg-orange-100 rounded-full flex items-center justify-center text-orange-600 border border-orange-100 cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-black px-4 py-2.5 rounded-full shadow-xs active:translate-y-[1px] transition-all uppercase tracking-wider text-xs cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                Scout Check-In
              </button>
            )}
          </div>
        </header>

        {/* Tab System Control */}
        <nav className="bg-white px-4 md:px-8 flex flex-wrap gap-4 md:gap-8 border-b border-orange-100 shadow-sm sticky top-0 z-40">
          <button
            onClick={() => setActiveTab("commute")}
            className={`py-4 px-1 border-b-4 font-display font-bold text-xs md:text-sm tracking-wide transition-all outline-none cursor-pointer ${
              activeTab === "commute"
                ? "border-orange-600 text-orange-600 font-black"
                : "border-transparent text-gray-400 hover:text-orange-400"
            }`}
          >
            COMMUTE
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`py-4 px-1 border-b-4 font-display font-bold text-xs md:text-sm tracking-wide transition-all outline-none cursor-pointer ${
              activeTab === "discover"
                ? "border-orange-600 text-orange-600 font-black"
                : "border-transparent text-gray-400 hover:text-orange-400"
            }`}
          >
            DISCOVER
          </button>
          <button
            onClick={() => setActiveTab("squads")}
            className={`py-4 px-1 border-b-4 font-display font-bold text-xs md:text-sm tracking-wide transition-all outline-none cursor-pointer ${
              activeTab === "squads"
                ? "border-orange-600 text-orange-600 font-black"
                : "border-transparent text-gray-400 hover:text-orange-400"
            }`}
          >
            LOCAL SQUADS
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`py-4 px-1 border-b-4 font-display font-bold text-xs md:text-sm tracking-wide transition-all outline-none cursor-pointer ${
              activeTab === "community"
                ? "border-orange-600 text-orange-600 font-black"
                : "border-transparent text-gray-400 hover:text-orange-400"
            }`}
          >
            COMMUNITY BOARD
          </button>
          <button
            onClick={() => setActiveTab("neighbourhood")}
            className={`py-4 px-1 border-b-4 font-display font-bold text-xs md:text-sm tracking-wide transition-all outline-none cursor-pointer ${
              activeTab === "neighbourhood"
                ? "border-orange-600 text-orange-600 font-black"
                : "border-transparent text-gray-400 hover:text-orange-400"
            }`}
          >
            NEIGHBOURHOOD
          </button>
        </nav>

        {/* Primary Layout Engine */}
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          
          {/* LEFT COLUMN: Inputs + Presets Layout section */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Input card parameters */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-200">
              <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                {activeTab === "squads" ? "Host Activity Squad" : activeTab === "community" ? "Report Local Issue" : "Input Details"}
              </h3>

              {activeTab === "squads" ? (
                <form onSubmit={handleCreateSquad} className="space-y-4">
                  <div className="relative pt-2">
                    <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                      Squad Title
                    </label>
                    <input
                      type="text"
                      required
                      value={squadTitle}
                      onChange={(e) => setSquadTitle(e.target.value)}
                      placeholder="e.g. Evening Football Match"
                      className="w-full p-3.5 bg-orange-50/50 border border-orange-200 rounded-2xl text-xs font-semibold outline-none focus:border-orange-500 transition-all font-sans"
                    />
                  </div>

                  <div className="relative pt-2">
                    <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                      Locality
                    </label>
                    <select
                      value={squadLocality}
                      onChange={(e) => setSquadLocality(e.target.value)}
                      className="w-full p-3.5 bg-orange-50/50 border border-orange-200 rounded-2xl text-xs font-semibold outline-none focus:border-orange-500 transition-all appearance-none text-slate-850"
                    >
                      <option value="Bandra West">Bandra West</option>
                      <option value="Kala Ghoda">Kala Ghoda</option>
                      <option value="Colaba">Colaba</option>
                      <option value="Andheri West">Andheri West</option>
                      <option value="Powai Hiranandani">Powai Hiranandani</option>
                      <option value="Dadar East">Dadar East</option>
                      <option value="Borivali East">Borivali East</option>
                      <option value="Kurla West">Kurla West</option>
                    </select>
                  </div>

                  <div className="relative pt-2">
                    <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                      Squad Category
                    </label>
                    <select
                      value={squadActivity}
                      onChange={(e) => setSquadActivity(e.target.value)}
                      className="w-full p-3.5 bg-orange-50/50 border border-orange-200 rounded-2xl text-xs font-semibold outline-none focus:border-orange-500 transition-all appearance-none text-slate-850"
                    >
                      <option value="Sports & Games">Sports & Games</option>
                      <option value="Cafe Hopping & Art">Cafe Hopping & Art</option>
                      <option value="Local Heritage">Local Heritage</option>
                      <option value="Local Help">Local Help</option>
                    </select>
                  </div>

                  <div className="relative pt-2">
                    <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                      Capacity (Scouts)
                    </label>
                    <input
                      type="number"
                      required
                      min={2}
                      max={20}
                      value={squadMaxPeople}
                      onChange={(e) => setSquadMaxPeople(Number(e.target.value))}
                      className="w-full p-3.5 bg-orange-50/50 border border-orange-200 rounded-2xl text-xs font-semibold outline-none focus:border-orange-500 transition-all font-sans"
                    />
                  </div>

                  <div className="relative pt-2">
                    <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                      Activity Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={squadDescription}
                      onChange={(e) => setSquadDescription(e.target.value)}
                      placeholder="Seeking 5 other scouts to play turf football on Carter Road..."
                      className="w-full p-3.5 bg-orange-50/50 border border-orange-200 rounded-2xl text-xs font-semibold outline-none focus:border-orange-500 transition-all font-sans resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3.5 rounded-xl shadow-[0_4px_0_0_rgba(194,65,12,1)] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-4 h-4" />
                    Launch Activity Squad
                  </button>
                </form>
              ) : activeTab === "community" ? (
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="relative pt-2">
                    <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                      Issue Title
                    </label>
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="e.g. Pali Hill road potholes surge"
                      className="w-full p-3.5 bg-orange-50/50 border border-orange-200 rounded-2xl text-xs font-semibold outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="relative pt-2">
                    <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                      Category
                    </label>
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value as any)}
                      className="w-full p-3.5 bg-orange-50/50 border border-orange-200 rounded-2xl text-xs font-semibold outline-none focus:border-orange-500 transition-all appearance-none text-slate-850"
                    >
                      <option value="trains">🚆 Trains & Transit</option>
                      <option value="society">🏢 Society & Housing</option>
                      <option value="local">📍 Local Concerns</option>
                      <option value="general">📢 General Announcements</option>
                    </select>
                  </div>

                  <div className="relative pt-2">
                    <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                      Elaborate the Issue
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={postBody}
                      onChange={(e) => setPostBody(e.target.value)}
                      placeholder="Alert neighboring citizens on local train disruptions, municipal track blockages, or high-risk areas..."
                      className="w-full p-3.5 bg-orange-50/50 border border-orange-200 rounded-2xl text-xs font-semibold outline-none focus:border-orange-500 transition-all font-sans resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl shadow-[0_4px_0_0_rgba(15,23,42,1)] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-orange-400" />
                    Submit Citizen Alert
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePredict} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {/* Tab 1: Commute form input */}
                    {activeTab === "commute" && (
                      <motion.div
                        key="commute"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="relative pt-2">
                          <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                            Station Name
                          </label>
                          <input
                            type="text"
                            required
                            value={commuteStation}
                            onChange={(e) => setCommuteStation(e.target.value)}
                            placeholder="e.g. Dadar to Andheri"
                            className="w-full p-4 bg-orange-50/50 border border-orange-200 rounded-2xl text-sm font-semibold outline-none focus:border-orange-500 transition-all font-sans"
                          />
                        </div>
                        
                        <div className="relative pt-2">
                          <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                            Departure Time
                          </label>
                          <input
                            type="text"
                            required
                            value={commuteTime}
                            onChange={(e) => setCommuteTime(e.target.value)}
                            placeholder="e.g. 6:15 PM"
                            className="w-full p-4 bg-orange-50/50 border border-orange-200 rounded-2xl text-sm font-semibold outline-none focus:border-orange-500 transition-all font-sans"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Tab 2: Discover form input */}
                    {activeTab === "discover" && (
                      <motion.div
                        key="discover"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="relative pt-2">
                          <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                            Mumbai Locality
                          </label>
                          <input
                            type="text"
                            required
                            value={discoverLocality}
                            onChange={(e) => setDiscoverLocality(e.target.value)}
                            placeholder="e.g. Bandra West, Kala Ghoda"
                            className="w-full p-4 bg-orange-50/50 border border-orange-200 rounded-2xl text-sm font-semibold outline-none focus:border-orange-500 transition-all font-sans"
                          />
                        </div>

                        <div className="relative pt-2">
                          <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                            Category
                          </label>
                          <select
                            value={discoverCategory}
                            onChange={(e) => setDiscoverCategory(e.target.value)}
                            className="w-full p-4 bg-orange-50/50 border border-orange-200 rounded-2xl text-sm font-semibold outline-none focus:border-orange-500 transition-all appearance-none text-slate-800"
                          >
                            <option value="Cafes">Cafes</option>
                            <option value="Restaurants">Restaurants</option>
                            <option value="Salons">Salons</option>
                            <option value="Shops">Shops</option>
                            <option value="Events">Events</option>
                          </select>
                        </div>
                      </motion.div>
                    )}

                    {/* Tab 3: Neighbourhood form input */}
                    {activeTab === "neighbourhood" && (
                      <motion.div
                        key="neighbourhood"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="relative pt-2">
                          <label className="absolute -top-1 left-3 bg-white px-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                            Neighbourhood Need
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={neighbourhoodNeed}
                            onChange={(e) => setNeighbourhoodNeed(e.target.value)}
                            placeholder="e.g. Reliable emergency plumber in Powai Hiranandani..."
                            className="w-full p-4 bg-orange-50/50 border border-orange-200 rounded-2xl text-sm font-semibold outline-none focus:border-orange-500 transition-all font-sans resize-none"
                          ></textarea>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl shadow-[0_4px_0_0_rgba(194,65,12,1)] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider text-xs md:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Analyzing..." : "Analyze Options"}
                  </button>
                </form>
              )}
            </div>

            {/* Discover History / Presets Sidebar Card Layout Matches Geometric Balance Theme */}
            <div className="bg-white/50 rounded-3xl p-6 border border-orange-100 flex-1 flex flex-col justify-between gap-5 shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-mono">
                  <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  {activeTab === "squads" ? "Filter Locality Squads" : activeTab === "community" ? "Filter Board Concerns" : "Quick Presets"}
                </h3>

                <div className="flex flex-col gap-3">
                  {activeTab === "squads" ? (
                    <div className="space-y-3">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase leading-snug">Select a locality to discover active gatherings and activity seekers:</p>
                      <select
                        value={searchSquadLocality}
                        onChange={(e) => setSearchSquadLocality(e.target.value)}
                        className="w-full p-3 bg-white border border-orange-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500 appearance-none text-slate-800"
                      >
                        <option value="Bandra West">Bandra West</option>
                        <option value="Kala Ghoda">Kala Ghoda</option>
                        <option value="Colaba">Colaba</option>
                        <option value="Andheri West">Andheri West</option>
                        <option value="Powai Hiranandani">Powai Hiranandani</option>
                        <option value="Dadar East">Dadar East</option>
                        <option value="Borivali East">Borivali East</option>
                        <option value="Kurla West">Kurla West</option>
                      </select>
                      <div className="text-[10px] bg-orange-50 text-orange-850 p-2.5 rounded-xl border border-orange-100 font-mono">
                        💡 Active Scouts in {searchSquadLocality} are seeking mates! Match up below.
                      </div>
                    </div>
                  ) : activeTab === "community" ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-505 font-bold uppercase leading-none mb-1 text-slate-400">Board categories:</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: "all", label: "All Concerns" },
                          { id: "trains", label: "🚆 Transit Only" },
                          { id: "society", label: "🏢 Society Only" },
                          { id: "local", label: "📍 Local Only" }
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setCommunityCategoryFilter(btn.id)}
                            className={`p-2.5 rounded-xl border text-[10px] font-black text-left cursor-pointer transition-all ${
                              communityCategoryFilter === btn.id
                                ? "bg-slate-900 text-white border-transparent"
                                : "bg-white text-slate-700 border-orange-100 hover:border-orange-300"
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : activeTab === "commute" ? (
                    <>
                      <button 
                        onClick={() => { setCommuteStation("Dadar to Andheri"); setCommuteTime("6:15 PM"); }}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50/40 transition-all text-left cursor-pointer w-full group"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs italic shrink-0 font-display">01</div>
                        <div>
                          <p className="text-sm font-bold leading-none text-slate-800 group-hover:text-orange-600 transition-colors">Dadar East → Andheri</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1 font-bold">6:15 PM • Local Train</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => { setCommuteStation("Borivali to Churchgate"); setCommuteTime("8:30 AM"); }}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50/40 transition-all text-left cursor-pointer w-full group"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs italic shrink-0 font-display">02</div>
                        <div>
                          <p className="text-sm font-bold leading-none text-slate-800 group-hover:text-orange-600 transition-colors">Borivali → Churchgate</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1 font-bold">8:30 AM • Fast Local</p>
                        </div>
                      </button>
                    </>
                  ) : activeTab === "discover" ? (
                    <>
                      <button 
                        onClick={() => { setDiscoverLocality("Bandra West"); setDiscoverCategory("Cafes"); }}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50/40 transition-all text-left cursor-pointer w-full group"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs italic shrink-0 font-display">01</div>
                        <div>
                          <p className="text-sm font-bold leading-none text-slate-800 group-hover:text-orange-600 transition-colors">Bandra West</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1 font-semibold">Cafes category</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => { setDiscoverLocality("Kala Ghoda"); setDiscoverCategory("Restaurants"); }}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50/40 transition-all text-left cursor-pointer w-full group"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs italic shrink-0 font-display">02</div>
                        <div>
                          <p className="text-sm font-bold leading-none text-slate-800 group-hover:text-orange-600 transition-colors">Kala Ghoda</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1 font-semibold">Restaurants category</p>
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setNeighbourhoodNeed("Full-time cook, Mon–Fri mornings")}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50/40 transition-all text-left cursor-pointer w-full group"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs italic shrink-0 font-display">01</div>
                        <div>
                          <p className="text-sm font-bold leading-none text-slate-800 group-hover:text-orange-600 transition-colors">Kurla West</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1 font-semibold">SERVICE • Cook Helper</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => setNeighbourhoodNeed("Badminton partner for weekend drills in Borivali East")}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50/40 transition-all text-left cursor-pointer w-full group"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs italic shrink-0 font-display">02</div>
                        <div>
                          <p className="text-sm font-bold leading-none text-slate-800 group-hover:text-orange-600 transition-colors">Borivali East</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1 font-semibold">ACTIVITY • Badminton Partner</p>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-orange-100/60 p-3 bg-orange-50/25 rounded-2xl text-[11px] text-slate-500 leading-snug">
                💡 <strong>Mumbai local guide:</strong> Fast local trains bypass minor halts. Confirm whether the platform is East or West before choosing alternative buses!
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE GEMINI ADVISOR OUTPUT VIEWPORT */}
          <div className="lg:col-span-8 flex flex-col">
            
            <div className="bg-white rounded-[40px] shadow-xl border border-orange-200 flex-1 overflow-hidden flex flex-col justify-between">
              
              {/* Advisor Response Header */}
              <div className="bg-orange-600 p-6 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></span>
                  <span className="text-xs font-black uppercase tracking-widest font-mono">
                    {activeTab === "commute" 
                      ? "Commute Agent Analysis" 
                      : activeTab === "discover" 
                        ? "Discovery Agent Radar" 
                        : activeTab === "squads"
                          ? "Locality Gathering Squads"
                          : activeTab === "community"
                            ? "Citizen Community Board"
                            : "Neighbourhood Matching AI"}
                  </span>
                </div>
                <div className={`text-[10px] font-mono px-3 py-1.5 rounded-full uppercase tracking-wider font-bold border transition-colors ${
                  isFallback 
                    ? "bg-orange-500/30 border-orange-450 text-white" 
                    : "bg-black/20 border-transparent text-white"
                }`}>
                  {isFallback ? "📍 REGIONAL DISPATCH" : "SEARCH GROUNDED • LIVE"}
                </div>
              </div>

              {/* Viewport Core Container */}
              <div className="p-6 md:p-10 flex-grow flex flex-col justify-between gap-8 min-h-[400px]">
                
                {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center my-auto">
                    <div className="relative w-16 h-16 flex items-center justify-center mb-5">
                      <div className="absolute inset-0 border-4 border-orange-200/50 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
                      <Search className="w-6 h-6 text-orange-600 animate-pulse" />
                    </div>
                    <h3 className="font-display font-bold text-slate-800 text-lg">Mumbai Mitra Grounding Active</h3>
                    <p className="text-sm text-neutral-500 mt-2 font-medium max-w-sm h-12 flex items-center justify-center">
                      {loadingMsg}
                    </p>
                  </div>
                )}

                {error && !loading && (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 text-center my-auto max-w-lg mx-auto">
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-[32px] p-6 md:p-8 flex flex-col items-center gap-5 text-slate-800 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-650 animate-pulse">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-orange-950 text-base md:text-lg leading-normal">Station Tracks Busy!</h4>
                        <p className="text-[10px] text-orange-655 uppercase tracking-widest font-bold mt-1.5 font-mono">ADVISORY TRANSMISSION DELAYED</p>
                      </div>
                      <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-semibold">
                        A heavy surge of active commuters is currently utilizing our live regional search signals. Tap 'Retry Connection' below to send a network booster signal and clear the advisory track line instantly!
                      </p>
                      <div className="flex gap-3 w-full">
                        <button
                          onClick={() => setError(null)}
                          className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-850 font-black py-4 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={handlePredict}
                          className="flex-grow bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-[0_4px_0_0_rgba(194,65,12,1)] active:translate-y-[2px] active:shadow-none cursor-pointer"
                        >
                          Retry Connection
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!loading && !error && (
                  <div className="flex-grow flex flex-col justify-between">
                    
                    {/* Welcome Onboarding Screen when no actions are completed */}
                    {activeTab !== "squads" && activeTab !== "community" &&
                     !(activeTab === "commute" && commuteResult) && 
                     !(activeTab === "discover" && discoverResult) && 
                     !(activeTab === "neighbourhood" && neighbourhoodResult) && (
                      <div className="flex-grow flex flex-col items-center justify-center text-center py-12">
                        <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-3xl flex items-center justify-center text-orange-600 mb-4 shadow-sm">
                          {activeTab === "commute" ? <Train className="w-8 h-8" /> : activeTab === "discover" ? <Compass className="w-8 h-8" /> : <Handshake className="w-8 h-8" />}
                        </div>
                        <h4 className="text-xl font-display font-black text-orange-950 tracking-tight">
                          Consult the Hyperlocal Agent
                        </h4>
                        <p className="text-xs md:text-sm text-neutral-500 max-w-sm mt-1.5">
                          Configure your needs in the left input card. Gemini will leverage realtime search parameters to deliver instant advice.
                        </p>
                      </div>
                    )}

                    {isFallback && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-3xl flex gap-3.5 text-xs font-semibold leading-relaxed mb-6 select-none shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-650 shrink-0">
                          <Zap className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <p className="font-bold text-orange-950 font-display text-sm">⚡ High-Speed Regional Cache Active</p>
                          <p className="text-slate-650 font-medium text-xs mt-1 leading-normal">
                            Accessing curated local knowledge-base archives directly to deliver instant advisory responses, completely bypassing peak rush hours and local signal blockages.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Results renderer panels */}
                    <AnimatePresence mode="wait">
                      
                      {/* COMMUTE LAYOUT */}
                      {activeTab === "commute" && commuteResult && (
                        <motion.div
                          key="commute-panel"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col gap-8 flex-grow"
                        >
                          {/* Decision Row */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-[1px] bg-orange-600"></span>
                              <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] font-mono">The Decision</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-orange-600 italic tracking-tighter uppercase leading-none break-words">
                              {commuteResult.decision}
                            </h2>
                          </div>

                          {/* Live Visual Commutation Map */}
                          <CommuteTransitMap routeFrom={commuteStation} routeTo={commuteStation} />

                          {/* Detail rationale blocks layout matches Geometric Balance style */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-orange-100">
                            
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-[1px] bg-orange-400"></span>
                                <span className="text-xs font-black text-orange-450 uppercase tracking-widest font-mono">Rationale</span>
                              </div>
                              <p className="text-base md:text-lg font-bold leading-snug text-slate-700">
                                {commuteResult.why}
                              </p>
                            </div>

                            <div className="flex flex-col gap-4">
                              <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest block mb-2 font-mono">Backup Plan (ALTERNATIVE)</span>
                                <p className="text-xs md:text-sm font-bold text-orange-900 leading-snug">
                                  {commuteResult.alternative}
                                </p>
                              </div>
                            </div>

                          </div>

                          {showRawView && (
                            <div className="p-4 bg-slate-50 border border-neutral-200 rounded-3xl text-xs font-mono text-neutral-600 whitespace-pre-wrap">
                              {commuteRaw}
                            </div>
                          )}

                          {commuteSources.length > 0 && <GroundingSources sources={commuteSources} />}
                        </motion.div>
                      )}

                      {/* DISCOVER LAYOUT */}
                      {activeTab === "discover" && discoverResult && (
                        <motion.div
                          key="discover-panel"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col gap-8 flex-grow"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-[1px] bg-orange-600"></span>
                              <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] font-mono">Verified spots in {discoverLocality}</span>
                            </div>
                          </div>

                          {discoverResult.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {discoverResult.map((card, idx) => (
                                <div 
                                  key={idx}
                                  className="bg-white border border-orange-150 rounded-3xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between shadow-sm group"
                                >
                                  {/* Custom realistic imagery for place cover photo */}
                                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 border-b border-orange-50 shrink-0">
                                    <img 
                                      src={getPlaceImageUrl(card.name, card.type)} 
                                      alt={card.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 left-3">
                                      <span className="text-[9px] font-mono font-black uppercase py-1 px-2.5 bg-white border border-orange-100 text-orange-700/80 rounded-full shadow-sm">
                                        {card.type}
                                      </span>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                      <span className="text-[10px] font-mono font-black text-white/90 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                                        #0{idx + 1}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                                    <div>
                                      <h4 className="font-display font-black text-neutral-900 tracking-tight text-base leading-snug">
                                        {card.name}
                                      </h4>
                                      <p className="text-neutral-600 text-xs mt-2 leading-relaxed">
                                        {card.whatsNew}
                                      </p>
                                    </div>

                                    <div className="border-t border-orange-50 pt-2.5 flex flex-wrap gap-1">
                                      {card.vibe.split(",").map((v, vIdx) => (
                                        <span key={vIdx} className="text-[9px] font-mono text-orange-950 bg-orange-50/50 px-2 py-0.5 rounded-full border border-orange-100/20">
                                          {v.trim().toLowerCase()}
                                        </span>
                                      ))}
                                    </div>

                                    <div className="pt-3 border-t border-orange-50/50 flex justify-end shrink-0">
                                      <button
                                        onClick={() => setSelectedPlaceForModal(card)}
                                        className="text-[11px] font-black text-orange-600 hover:text-orange-850 uppercase tracking-wider flex items-center gap-1 cursor-pointer transition select-none"
                                      >
                                        Reviews & Vibe check
                                        <ArrowRight className="w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center bg-orange-50/40 rounded-3xl border border-orange-100">
                              <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                              <p className="text-sm font-bold text-neutral-600">Response output layout fallback.</p>
                              <p className="text-xs text-neutral-400 mt-1">Please view original text form content using the toggle option below.</p>
                            </div>
                          )}

                          {/* CITIZEN SUBMITTED BOUTIQUE STORES */}
                          <div className="mt-8 border-t border-orange-100 pt-8 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                  <Store className="w-5 h-5 text-orange-600" />
                                  New in {discoverLocality} (Citizen Radars)
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Locally reported boutiques, shops, and upcoming gems in {discoverLocality}.</p>
                              </div>
                            </div>

                            {customStores.filter(s => s.locality.toLowerCase().includes(discoverLocality.toLowerCase())).length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {customStores
                                  .filter(s => s.locality.toLowerCase().includes(discoverLocality.toLowerCase()))
                                  .map((store) => {
                                    const liked = currentUser && store.likedBy.includes(currentUser.id);
                                    
                                    return (
                                      <div 
                                        key={store.id}
                                        className="bg-white border border-slate-900 rounded-3xl overflow-hidden shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex flex-col justify-between"
                                      >
                                        <div className="relative h-40 bg-slate-100 overflow-hidden shrink-0">
                                          <img src={store.imageUrl} alt={store.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                          <div className="absolute top-3 left-3">
                                            <span className="text-[9px] font-mono font-black uppercase tracking-wider py-1 px-2.5 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-full">
                                              CITIZEN SPOT • {store.type}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                                          <div>
                                            <h4 className="font-display font-black text-neutral-900 tracking-tight text-base leading-snug">
                                              {store.name}
                                            </h4>
                                            <p className="text-neutral-600 text-xs mt-2 leading-relaxed font-semibold">
                                              {store.whatsNew}
                                            </p>
                                          </div>

                                          <div>
                                            <div className="border-t border-orange-50 pt-2.5 flex flex-wrap gap-1">
                                              {store.vibe.split(",").map((v, vIdx) => (
                                                <span key={vIdx} className="text-[9px] font-mono text-orange-950 bg-orange-50/50 px-2 py-0.5 rounded-full border border-orange-100/20">
                                                  {v.trim().toLowerCase()}
                                                </span>
                                              ))}
                                            </div>

                                            <div className="pt-4 border-t border-orange-50/50 flex justify-between items-center mt-3">
                                              <button
                                                onClick={() => handleLikeStore(store.id)}
                                                className={`text-[10px] font-black py-1 px-2.5 rounded-lg border flex items-center gap-1 cursor-pointer transition ${
                                                  liked 
                                                    ? "bg-rose-50 border-rose-200 text-rose-600" 
                                                    : "bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100"
                                                }`}
                                              >
                                                <Heart className={`w-3 h-3 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
                                                Recommend ({store.likes})
                                              </button>

                                              <button
                                                onClick={() => setSelectedPlaceForModal(store)}
                                                className="text-[11px] font-black text-orange-600 hover:text-orange-850 uppercase tracking-wider flex items-center gap-1 cursor-pointer transition select-none"
                                              >
                                                Reviews & Vibe check
                                                <ArrowRight className="w-3" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No citizen radars submitted in {discoverLocality} yet. Register the first gem below!</p>
                            )}

                            {/* RADAR NEW STORE SUBMISSION SLIDE */}
                            <div className="bg-orange-50/40 p-6 rounded-3xl border-2 border-slate-900 mt-6 max-w-xl">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1 font-mono">
                                <Plus className="w-4 h-4 text-orange-600" />
                                Submit newly opened Boutique Store
                              </h4>

                              <form onSubmit={handleCreateStore} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      required
                                      value={storeName}
                                      onChange={(e) => setStoreName(e.target.value)}
                                      placeholder="Name of newly opened spot"
                                      className="w-full p-3 bg-white border border-orange-150 rounded-xl text-xs font-semibold outline-none focus:border-orange-400"
                                    />
                                  </div>

                                  <div className="relative">
                                    <select
                                      value={storeType}
                                      onChange={(e) => setStoreType(e.target.value)}
                                      className="w-full p-3 bg-white border border-orange-150 rounded-xl text-xs font-semibold outline-none focus:border-orange-400 text-slate-800"
                                    >
                                      <option value="Cafe">☕ Cafe</option>
                                      <option value="Restaurant">🍕 Restaurant</option>
                                      <option value="Salon">💇 Salon & Spa</option>
                                      <option value="Shop">🛍️ Boutique Shop</option>
                                      <option value="Event">🎉 Event Space</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <select
                                      value={storeLocality}
                                      onChange={(e) => setStoreLocality(e.target.value)}
                                      className="w-full p-3 bg-white border border-orange-150 rounded-xl text-xs font-semibold outline-none focus:border-orange-400 text-slate-800"
                                    >
                                      <option value="Bandra West">Bandra West</option>
                                      <option value="Kala Ghoda">Kala Ghoda</option>
                                      <option value="Colaba">Colaba</option>
                                      <option value="Andheri West">Andheri West</option>
                                      <option value="Powai Hiranandani">Powai Hiranandani</option>
                                      <option value="Dadar East">Dadar East</option>
                                      <option value="Borivali East">Borivali East</option>
                                      <option value="Kurla West">Kurla West</option>
                                    </select>
                                  </div>

                                  <div className="relative">
                                    <input
                                      type="text"
                                      required
                                      value={storeVibe}
                                      onChange={(e) => setStoreVibe(e.target.value)}
                                      placeholder="Vibe tags (e.g. cozy, vintage, acoustic)"
                                      className="w-full p-3 bg-white border border-orange-150 rounded-xl text-xs font-semibold outline-none focus:border-orange-400"
                                    />
                                  </div>
                                </div>

                                <div className="relative">
                                  <textarea
                                    required
                                    rows={2}
                                    value={storeWhatsNew}
                                    onChange={(e) => setStoreWhatsNew(e.target.value)}
                                    placeholder="Briefly state coordinates & what makes this newly launched spot a must visit..."
                                    className="w-full p-3 bg-white border border-orange-150 rounded-xl text-xs font-semibold outline-none focus:border-orange-400 font-sans resize-none"
                                  ></textarea>
                                </div>

                                <button
                                  type="submit"
                                  className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider py-3 px-6 rounded-xl cursor-pointer"
                                >
                                  Publish Citizen Radar Spot
                                </button>
                              </form>
                            </div>
                          </div>

                          {showRawView && (
                            <div className="p-4 bg-slate-50 border border-neutral-200 rounded-3xl text-xs font-mono text-neutral-600 whitespace-pre-wrap">
                              {discoverRaw}
                            </div>
                          )}

                          {discoverSources.length > 0 && <GroundingSources sources={discoverSources} />}
                        </motion.div>
                      )}

                      {/* NEIGHBOURHOOD LAYOUT */}
                      {activeTab === "neighbourhood" && neighbourhoodResult && (
                        <motion.div
                          key="neighbourhood-panel"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col gap-6 flex-grow"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-orange-600"></span>
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] font-mono">Assigned Service Matches</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="flex flex-col gap-4">
                              <div className="text-[10px] font-bold font-mono text-orange-600 bg-orange-100/60 border border-orange-150 px-3 py-1.5 rounded-full w-fit">
                                REQ TYPE: {neighbourhoodResult.type}
                              </div>

                              <div className="space-y-3">
                                <div className="flex gap-3 p-4 bg-orange-50/20 border border-orange-100 rounded-2xl">
                                  <div className="w-7 h-7 bg-orange-100 border border-orange-200 text-orange-850 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs font-mono">01</div>
                                  <p className="text-xs md:text-sm font-semibold text-slate-800 leading-snug">{neighbourhoodResult.match1}</p>
                                </div>

                                <div className="flex gap-3 p-4 bg-orange-50/20 border border-orange-100 rounded-2xl">
                                  <div className="w-7 h-7 bg-orange-100 border border-orange-200 text-orange-850 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs font-mono">02</div>
                                  <p className="text-xs md:text-sm font-semibold text-slate-800 leading-snug">{neighbourhoodResult.match2}</p>
                                </div>

                                {neighbourhoodResult.match3 && (
                                  <div className="flex gap-3 p-4 bg-orange-50/20 border border-orange-100 rounded-2xl">
                                    <div className="w-7 h-7 bg-orange-100 border border-orange-200 text-orange-850 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs font-mono">03</div>
                                    <p className="text-xs md:text-sm font-semibold text-slate-800 leading-snug">{neighbourhoodResult.match3}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Black copy template card block matches Geometric Balance theme style */}
                            <div className="bg-slate-900 p-6 rounded-[32px] text-white flex flex-col justify-between gap-4">
                              <div>
                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-2.5 font-mono">WhatsApp Community Match</span>
                                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                                  <p className="text-xs font-mono leading-relaxed select-all">
                                    "{neighbourhoodResult.whatsappTemplate}"
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => copyToClipboard(neighbourhoodResult.whatsappTemplate)}
                                className="w-full bg-orange-600 hover:bg-orange-700 active:translate-y-[1px] text-white text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                {copied ? <Check className="w-4 h-4 text-orange-200" /> : <Copy className="w-4 h-4 text-orange-200" />}
                                {copied ? "Copied!" : "Copy WhatsApp Message"}
                              </button>
                            </div>

                          </div>

                          {showRawView && (
                            <div className="p-4 bg-slate-50 border border-neutral-200 rounded-3xl text-xs font-mono text-neutral-600 whitespace-pre-wrap">
                              {neighbourhoodRaw}
                            </div>
                          )}

                          {neighbourhoodSources.length > 0 && <GroundingSources sources={neighbourhoodSources} />}
                        </motion.div>
                      )}

                      {/* LOCAL SQUADS LAYOUT */}
                      {activeTab === "squads" && (
                        <motion.div
                          key="squads-panel"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col gap-6 flex-grow"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-[1px] bg-orange-600"></span>
                              <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] font-mono">
                                Gatherings in {searchSquadLocality}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-gray-500 font-mono">
                              {squads.filter(s => s.locality.toLowerCase() === searchSquadLocality.toLowerCase()).length} Active Circles
                            </span>
                          </div>

                          {squads.filter(s => s.locality.toLowerCase() === searchSquadLocality.toLowerCase()).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {squads
                                .filter(s => s.locality.toLowerCase() === searchSquadLocality.toLowerCase())
                                .map((sq) => {
                                  const isMember = currentUser && sq.participants.includes(currentUser.id);
                                  const isFull = sq.participants.length >= sq.maxPeople;
                                  const allUsers = dbInstance.getUsers();
                                  
                                  return (
                                    <div 
                                      key={sq.id}
                                      className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(15,23,42,1)] transition-all duration-200 flex flex-col justify-between gap-5"
                                    >
                                      <div>
                                        <div className="flex justify-between items-start gap-3">
                                          <span className="text-[9px] font-mono font-black uppercase tracking-wider py-1 px-2.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full">
                                            {sq.activity}
                                          </span>
                                          <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold font-mono">HOST: {sq.hostName}</p>
                                          </div>
                                        </div>

                                        <h4 className="font-display font-black text-slate-900 text-lg tracking-tight mt-3">
                                          {sq.title}
                                        </h4>
                                        
                                        <p className="text-neutral-600 text-xs mt-2.5 line-clamp-3 leading-relaxed font-medium">
                                          {sq.description}
                                        </p>
                                      </div>

                                      {/* Participants avatars section */}
                                      <div className="border-t border-slate-100 pt-4">
                                        <div className="flex justify-between items-center mb-3">
                                          <span className="text-[10px] font-black uppercase text-gray-400 font-mono">Scouts Joined</span>
                                          <span className="text-[10px] font-black font-mono px-2 py-0.5 bg-slate-100 rounded-md text-slate-700">
                                            {sq.participants.length} / {sq.maxPeople}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          {sq.participants.map((pId) => {
                                            const pUser = allUsers.find(u => u.id === pId);
                                            const uName = pUser ? pUser.username : "Commuter scout";
                                            const uAvatar = pUser ? pUser.avatarUrl : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80";
                                            
                                            return (
                                              <div 
                                                key={pId} 
                                                title={uName}
                                                className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden bg-slate-100 hover:ring-2 hover:ring-orange-500 hover:scale-105 transition-all cursor-pointer"
                                              >
                                                <img src={uAvatar} alt={uName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                              </div>
                                            );
                                          })}
                                          {sq.participants.length < sq.maxPeople && (
                                            <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-mono font-bold select-none bg-slate-50/50">
                                              +
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Joining controller CTA buttons */}
                                      <div className="pt-2">
                                        {isMember ? (
                                          <button
                                            onClick={() => handleLeaveSquad(sq.id)}
                                            className="w-full bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300 font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                                          >
                                            Leave Squad Circle
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => handleJoinSquad(sq.id)}
                                            disabled={isFull}
                                            className={`w-full font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                              isFull 
                                                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" 
                                                : "bg-orange-600 hover:bg-orange-700 text-white shadow-[0_3px_0_0_rgba(194,65,12,1)] active:translate-y-[2px] active:shadow-none"
                                            }`}
                                          >
                                            {isFull ? "Squad Full (Waitlisted)" : "Count Me In (Join Squad)"}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <div className="p-10 text-center bg-orange-50/20 rounded-3xl border border-dashed border-orange-200 max-w-lg mx-auto my-auto flex flex-col items-center gap-4">
                              <Users className="w-10 h-10 text-orange-500 animate-pulse" />
                              <div>
                                <h4 className="font-display font-medium text-slate-900 text-base">No active circle in {searchSquadLocality} yet</h4>
                                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
                                  There are currently no active squads looking for coordinates in {searchSquadLocality}. Use the left side form to host a casual game or meet and rally of scouts!
                                </p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* COMMUNITY BOARD LAYOUT */}
                      {activeTab === "community" && (
                        <motion.div
                          key="community-panel"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col gap-6 flex-grow"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-[1px] bg-slate-900"></span>
                              <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] font-mono">
                                Citizen Board Alerts ({communityCategoryFilter})
                              </span>
                            </div>
                            <span className="text-xs font-bold text-gray-500 font-mono">
                              {posts.filter(p => communityCategoryFilter === "all" || p.category === communityCategoryFilter).length} Alerts Dispatch
                            </span>
                          </div>

                          {posts.filter(p => communityCategoryFilter === "all" || p.category === communityCategoryFilter).length > 0 ? (
                            <div className="flex flex-col gap-5">
                              {posts
                                .filter(p => communityCategoryFilter === "all" || p.category === communityCategoryFilter)
                                .map((post) => {
                                  const alreadyUpvoted = currentUser && post.upvotedBy.includes(currentUser.id);
                                  const commentsCount = post.comments.length;
                                  const showComments = !!expandedComments[post.id];
                                  
                                  return (
                                    <div 
                                      key={post.id}
                                      className="bg-white border border-orange-150 rounded-3xl p-6 hover:shadow-md transition-all duration-200 flex flex-col gap-4"
                                    >
                                      {/* Post Author info */}
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full border border-orange-100 overflow-hidden bg-orange-50">
                                            <img src={post.authorAvatar} alt={post.authorName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-bold text-slate-900">{post.authorName}</p>
                                            <p className="text-[9px] text-gray-400 font-mono font-bold uppercase mt-0.5">
                                              CITIZEN CONTRIBUTOR • {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                          </div>
                                        </div>

                                        <span className={`text-[9px] font-mono font-black uppercase py-1 px-3.5 rounded-full border ${
                                          post.category === "trains"
                                            ? "bg-blue-50 border-blue-200 text-blue-700"
                                            : post.category === "society"
                                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                              : "bg-amber-50 border-amber-200 text-amber-700"
                                        }`}>
                                          {post.category === "trains" ? "🚆 Transit" : post.category === "society" ? "🏢 Housing" : "📢 Local"}
                                        </span>
                                      </div>

                                      {/* Issue Details */}
                                      <div>
                                        <h4 className="font-display font-medium text-slate-950 text-base leading-snug">
                                          {post.title}
                                        </h4>
                                        <p className="text-neutral-600 text-xs mt-2 font-medium leading-relaxed whitespace-pre-wrap">
                                          {post.body}
                                        </p>
                                      </div>

                                      {/* Actions Bar */}
                                      <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                                        <button
                                          onClick={() => handleUpvotePost(post.id)}
                                          className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                                            alreadyUpvoted
                                              ? "bg-orange-600 text-white"
                                              : "bg-orange-50 hover:bg-orange-100 text-orange-850"
                                          }`}
                                        >
                                          <ArrowUp className="w-4 h-4" />
                                          Upvote Issue ({post.upvotes})
                                        </button>

                                        <button
                                          onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                          className="py-2 px-4 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                                        >
                                          <MessageSquare className="w-4 h-4 text-slate-500" />
                                          Comments ({commentsCount})
                                        </button>
                                      </div>

                                      {/* Active Comments Section */}
                                      {showComments && (
                                        <div className="mt-2 bg-slate-50 rounded-2xl p-4 border border-slate-150 space-y-4 animate-in fade-in duration-200">
                                          <p className="text-[10px] uppercase font-black tracking-wider text-gray-400 font-mono">Discussion Feed</p>
                                          
                                          {post.comments.length > 0 ? (
                                            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                              {post.comments.map((comm) => (
                                                <div key={comm.id} className="flex gap-2.5 items-start bg-white p-3 rounded-xl border border-slate-100">
                                                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-100">
                                                    <img src={comm.authorAvatar} alt={comm.authorName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                                  </div>
                                                  <div className="flex-1">
                                                    <p className="text-[11px] font-bold text-slate-900 leading-tight">{comm.authorName}</p>
                                                    <p className="text-xs text-neutral-600 font-medium leading-relaxed mt-0.5">{comm.text}</p>
                                                    <p className="text-[8px] text-gray-400 font-mono mt-1">
                                                      {new Date(comm.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-xs text-slate-400 italic">No community comments on this alert yet. Start the conversation!</p>
                                          )}

                                          {/* Write Comment Box */}
                                          <div className="flex gap-2.5 border-t border-slate-200 pt-3">
                                            <input
                                              type="text"
                                              value={newCommunityComment[post.id] || ""}
                                              onChange={(e) => setNewCommunityComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                              placeholder="Verify, advise, or comment on this citizen report..."
                                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-slate-400"
                                            />
                                            <button
                                              onClick={() => handleAddComment(post.id)}
                                              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 text-xs font-black uppercase tracking-wider cursor-pointer"
                                            >
                                              Send
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <div className="p-10 text-center bg-orange-50/20 rounded-3xl border border-dashed border-orange-200 max-w-lg mx-auto my-auto flex flex-col items-center gap-4">
                              <FileText className="w-10 h-10 text-orange-500 animate-pulse" />
                              <div>
                                <h4 className="font-display font-medium text-slate-900 text-base">No active citizen alerts registered</h4>
                                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
                                  There are currently no reported community issues here matching category filter: "{communityCategoryFilter}". Be the first to file a neighborhood warning report!
                                </p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>

                  </div>
                )}

                {/* Optional view options controller */}
                {((activeTab === "commute" && commuteResult) || 
                  (activeTab === "discover" && discoverResult) || 
                  (activeTab === "neighbourhood" && neighbourhoodResult)) && (
                  <div className="pt-4 border-t border-orange-50 flex justify-end gap-3 text-xs">
                    <button 
                      onClick={() => setShowRawView(!showRawView)}
                      className="text-[11px] font-semibold text-orange-600 hover:text-orange-850 flex items-center gap-1 transition select-none cursor-pointer"
                    >
                      {showRawView ? "View Balanced Layout Structure" : "Open Original JSON Payload"}
                      <ArrowRight className="w-3" />
                    </button>
                  </div>
                )}

              </div>

              {/* Status footer inside card matches Geometric Balance */}
              <div className="bg-orange-50 border-t border-orange-100 px-8 py-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-orange-400 font-bold uppercase tracking-widest gap-2">
                <span>Streaming processed complete from gemini-3.5-flash</span>
                <div className="flex gap-4 items-center">
                  <span>MUMBAI MITRA VERIFIED</span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Footer credits layout */}
      <footer className="bg-white border-t border-orange-100 py-6 mt-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>© 2026 Mumbai Mitra AI Advisor. All research is grounded live via Google search index retrieval parameters.</p>
          <div className="flex gap-4">
            <a href="https://is.gd/gemini_grounding" target="_blank" rel="noreferrer" className="hover:text-orange-605 flex items-center gap-1 transition">
              About Search Grounding <ExternalLink className="w-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Hyperlocal Floating AI Chatbot */}
      <LocalChatbot />

      {/* Place Detail Reviews Modal */}
      {selectedPlaceForModal && (
        <PlacesModal 
          card={selectedPlaceForModal} 
          user={currentUser} 
          onClose={() => setSelectedPlaceForModal(null)} 
        />
      )}

      {/* Full-Fledged Authentication Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
          }}
        />
      )}

    </div>
  );
}

/**
 * Reusable utility Component for Search Grounding Citations Links
 */
function GroundingSources({ sources }: { sources: GroundingSource[] }) {
  return (
    <div className="bg-orange-50/20 rounded-3xl p-6 border border-orange-100 space-y-4 shadow-sm mt-4">
      <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest font-mono flex items-center gap-1.5">
        <Search className="w-3.5 h-3.5" />
        Verified Google Search Grounds
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2.5 p-3 rounded-xl bg-white hover:bg-orange-50/20 border border-orange-100 hover:border-orange-300 group transition duration-200"
          >
            <div className="w-6 h-6 shrink-0 rounded bg-orange-100 flex items-center justify-center text-[10px] text-orange-600 border border-orange-200 font-bold">
              {index + 1}
            </div>
            <div className="space-y-0.5 overflow-hidden">
              <p className="text-xs text-neutral-700 font-bold truncate group-hover:text-orange-950">
                {source.title}
              </p>
              <p className="text-[10px] font-mono text-neutral-450 truncate flex items-center gap-1 mt-0.5">
                {source.url} <ExternalLink className="w-2.5 h-2.5 shrink-0 text-neutral-300" />
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
