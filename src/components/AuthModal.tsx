import { useState, FormEvent } from "react";
import { User } from "../lib/db";
import { dbInstance } from "../lib/db";
import { X, UserPlus, LogIn, Check, AlertCircle, Heart } from "lucide-react";
import { motion } from "motion/react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const MUMBAI_LOCALITIES = [
  "Bandra West",
  "Kala Ghoda",
  "Colaba",
  "Andheri West",
  "Powai Hiranandani",
  "Dadar East",
  "Borivali East",
  "Kurla West"
];

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [locality, setLocality] = useState("Bandra West");
  const [bio, setBio] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        if (!username || !email || !locality) {
          throw new Error("Missing required profile fields.");
        }
        const user = dbInstance.registerUser(username, email, locality, undefined, bio);
        onSuccess(user);
        onClose();
      } else {
        if (!email) {
          throw new Error("Please fill in registered email.");
        }
        const user = dbInstance.loginUser(email);
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="bg-white rounded-[32px] overflow-hidden max-w-sm w-full p-6 md:p-8 flex flex-col gap-6 shadow-2xl border border-orange-100"
      >
        {/* Header content section */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono font-black uppercase text-orange-600 tracking-wider">
              {isSignUp ? "Create Scout Profile" : "Commuter Check-In"}
            </span>
            <h3 className="text-xl font-display font-black tracking-tight text-neutral-900 leading-none mt-1">
              {isSignUp ? "Sign Up to Mumbai Mitra" : "Log In to Account"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic warning banner */}
        {error && (
          <div className="bg-orange-100/40 border border-orange-200/50 p-3.5 rounded-2xl flex gap-2.5 text-xs text-orange-950 font-bold font-sans">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-orange-700" />
            <p className="leading-snug">{error}</p>
          </div>
        )}

        {/* Formulation */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Scout Full Name</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Aarav Mehta"
                className="w-full p-3 bg-orange-50/50 border border-orange-100 rounded-xl text-xs font-semibold outline-none focus:border-orange-500 font-sans"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-405 font-mono">Registered Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aarav@mumbai.com"
              className="w-full p-3 bg-orange-50/50 border border-orange-100 rounded-xl text-xs font-semibold outline-none focus:border-orange-500 font-sans"
            />
          </div>

          {isSignUp && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-405 font-mono">Home Locality / Base</label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full p-3 bg-orange-50/50 border border-orange-100 rounded-xl text-xs font-semibold outline-none focus:border-orange-500 appearance-none text-slate-800"
                >
                  {MUMBAI_LOCALITIES.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-405 font-mono">Short Bio (Who are you? - Optional)</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Cafe hopper, daily local train rider"
                  className="w-full p-3 bg-orange-50/50 border border-orange-100 rounded-xl text-xs font-semibold outline-none focus:border-orange-500 font-sans"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {isSignUp ? "Generate Profile" : "Secure Log In"}
          </button>
        </form>

        {/* Change form type trigger */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-xs font-bold text-orange-600 hover:text-orange-850 cursor-pointer"
          >
            {isSignUp ? "Already registered? Go to Log In" : "Need an account? Go to Sign Up"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
