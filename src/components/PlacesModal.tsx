import { useState, FormEvent } from "react";
import { DiscoverCard } from "../types";
import { CustomStore, User } from "../lib/db";
import { X, Star, MapPin, Clock, MessageSquare, Plus, Check } from "lucide-react";
import { motion } from "motion/react";
import { getPlaceImageUrl } from "../utils";

interface PlacesModalProps {
  card: DiscoverCard | CustomStore;
  user: User | null;
  onClose: () => void;
}

interface Review {
  authorName: string;
  authorAvatar: string;
  rating: number;
  text: string;
  createdAt: string;
}

export default function PlacesModal({ card, user, onClose }: PlacesModalProps) {
  const isCustomStore = "imageUrl" in card;
  const placeName = card.name;
  const placeType = card.type;
  const placeWhatsNew = card.whatsNew;
  const placeVibe = card.vibe;
  const placeLocality = "locality" in card ? card.locality : "";

  const coverImage = isCustomStore
    ? (card as CustomStore).imageUrl
    : getPlaceImageUrl(placeName, placeType);

  // Default simulated reviews
  const [reviews, setReviews] = useState<Review[]>([
    {
      authorName: "Anjali Deshmukh",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      rating: 5,
      text: "Absolutely stunning spot. Visited this weekend and the queue was totally justified. Extremely pleasant staff!",
      createdAt: "2 days ago"
    },
    {
      authorName: "Vikram Malhotra",
      authorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      rating: 4,
      text: "Excellent vibes. Good coffee roast profile, though peak hours can get noisy. Highly recommended for remote working!",
      createdAt: "4 days ago"
    }
  ]);

  const [newReviewText, setNewReviewText] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const reviewItem: Review = {
        authorName: user ? user.username : "Local Scout",
        authorAvatar: user ? user.avatarUrl : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        rating: newRating,
        text: newReviewText,
        createdAt: "Just now"
      };

      setReviews(prev => [reviewItem, ...prev]);
      setNewReviewText("");
      setSubmitted(true);
      setSubmitting(false);
      setTimeout(() => setSubmitted(false), 2000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      
      {/* Drawer Container Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="bg-white rounded-[32px] overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col justify-between shadow-2xl border border-orange-100"
      >
        {/* Banner header element with escape button */}
        <div className="relative h-64 w-full bg-slate-150 shrink-0">
          <img
            src={coverImage}
            alt={placeName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Tag parameters overlays */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-orange-600 text-white px-3 py-1.5 rounded-full shadow-sm">
              {placeType}
            </span>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-white text-slate-900 px-3 py-1.5 rounded-full shadow-sm">
              📍 {placeLocality}
            </span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/45 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Place Title banner element */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h3 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-none">
              {placeName}
            </h3>
            <p className="text-white/80 font-mono text-[10px] uppercase font-bold tracking-widest mt-1.5">
              VIBE: {placeVibe.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Core Content Body Scrolling */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 select-none">
          
          {/* Description highlight */}
          <div>
            <span className="text-[10px] font-black font-mono text-orange-600 uppercase tracking-widest block mb-2">What is New here?</span>
            <p className="text-sm md:text-base font-bold text-slate-800 leading-relaxed font-sans">
              {placeWhatsNew}
            </p>
          </div>

          {/* Useful local logistics coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-orange-150/60">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-slate-900 leading-none">Standard Operational Hours</h5>
                <p className="text-xs text-neutral-500 mt-1">8:30 AM – 10:30 PM (Varies during national holidays)</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-slate-900 leading-none">Hyperlocal Directions Advice</h5>
                <p className="text-xs text-neutral-500 mt-1">Approximately 600m hike from St. Andrew's Church limits.</p>
              </div>
            </div>
          </div>

          {/* Reviews Thread Log Feed */}
          <div className="pt-6 border-t border-orange-150/60 space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-orange-600" />
              Local Commuter Reviews ({reviews.length})
            </h4>

            <div className="space-y-3">
              {reviews.map((rev, rIdx) => (
                <div key={rIdx} className="bg-orange-50/10 border border-orange-100 p-4 rounded-2xl flex gap-3 text-xs leading-normal">
                  <img
                    src={rev.authorAvatar}
                    alt={rev.authorName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-orange-150 object-cover shrink-0"
                  />
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-center w-full">
                      <p className="font-bold text-slate-800">{rev.authorName}</p>
                      <span className="text-[9px] font-mono font-bold text-neutral-400">{rev.createdAt}</span>
                    </div>
                    {/* Stars bar */}
                    <div className="flex select-none gap-0.5 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, sIdx) => (
                        <Star key={sIdx} className="w-3 h-3 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-neutral-600 mt-1 font-semibold">{rev.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave detailed rating feedback box */}
          <div className="p-5 bg-orange-50/40 rounded-3xl border border-orange-150 space-y-4">
            <div>
              <h4 className="text-xs font-black text-orange-950 uppercase tracking-wide font-display">Contribute Local Scout Vibe</h4>
              <p className="text-[10px] text-neutral-500">Have you checked out this spot? Log your ratings to inform other Mumbaikars!</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-neutral-550 font-bold uppercase">Rate Spot:</span>
                <div className="flex gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="cursor-pointer transform hover:scale-110 active:scale-90 transition-all"
                    >
                      <Star className={`w-4 h-4 ${star <= newRating ? "fill-amber-500" : "text-neutral-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Share your experience (croissant was flaky, barista guides, etc)..."
                  className="flex-grow bg-white border border-orange-200 text-xs px-3 py-2 outline-none rounded-xl font-semibold focus:border-orange-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm cursor-pointer shrink-0 uppercase tracking-widest flex items-center gap-1 font-mono"
                >
                  {submitted ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {submitted ? "Added" : submitting ? "Adding" : "Post"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
