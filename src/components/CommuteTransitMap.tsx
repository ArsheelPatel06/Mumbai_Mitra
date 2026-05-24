import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, Info, ArrowRight, Train, HelpCircle } from "lucide-react";

interface StationNode {
  id: string;
  name: string;
  x: number;
  y: number;
  lines: string[];
  crowdLevel: "Moderate" | "Extremely Dense" | "Mild" | "Super Crowd";
  avgDelay: string;
}

export default function CommuteTransitMap({ routeFrom = "Dadar", routeTo = "Andheri" }: { routeFrom?: string; routeTo?: string }) {
  const [selectedStation, setSelectedStation] = useState<StationNode | null>(null);
  
  // Clean string helper for routing lookup
  const cleanFrom = routeFrom.toLowerCase();
  const cleanTo = routeTo.toLowerCase();

  // Highlight points
  const showWesternHighlight = (cleanFrom.includes("dadar") && cleanTo.includes("andheri")) ||
                                (cleanFrom.includes("borivali") && cleanTo.includes("churchgate")) ||
                                (cleanFrom.includes("bandra") || cleanTo.includes("bandra")) ||
                                (cleanFrom.includes("andheri") || cleanTo.includes("andheri"));

  const showCentralHighlight = (cleanFrom.includes("dadar") && cleanTo.includes("thane")) ||
                               (cleanFrom.includes("cst") && cleanTo.includes("dadar")) ||
                               (cleanFrom.includes("kurla") || cleanTo.includes("kurla"));

  // Live subway/local networks
  const stations: StationNode[] = [
    { id: "churchgate", name: "Churchgate", x: 100, y: 360, lines: ["Western"], crowdLevel: "Super Crowd", avgDelay: "2 min" },
    { id: "cst", name: "CST Terminal", x: 180, y: 350, lines: ["Central", "Harbour"], crowdLevel: "Extremely Dense", avgDelay: "On-Time" },
    { id: "mumbai-central", name: "Mumbai Central", x: 100, y: 280, lines: ["Western"], crowdLevel: "Moderate", avgDelay: "1 min" },
    { id: "dadar", name: "Dadar Junction", x: 130, y: 200, lines: ["Western", "Central"], crowdLevel: "Super Crowd", avgDelay: "1 min" },
    { id: "kurla", name: "Kurla", x: 210, y: 170, lines: ["Central", "Harbour"], crowdLevel: "Extremely Dense", avgDelay: "3 min" },
    { id: "bandra", name: "Bandra", x: 100, y: 140, lines: ["Western"], crowdLevel: "Extremely Dense", avgDelay: "On-Time" },
    { id: "andheri", name: "Andheri", x: 100, y: 80, lines: ["Western"], crowdLevel: "Super Crowd", avgDelay: "4 min" },
    { id: "borivali", name: "Borivali", x: 100, y: 30, lines: ["Western"], crowdLevel: "Super Crowd", avgDelay: "On-Time" },
    { id: "thane", name: "Thane", x: 240, y: 40, lines: ["Central"], crowdLevel: "Extremely Dense", avgDelay: "2 min" }
  ];

  // Pick default station if none selected
  useEffect(() => {
    const defaultNode = stations.find(s => s.name.toLowerCase().includes("dadar")) || stations[0];
    setSelectedStation(defaultNode);
  }, []);

  return (
    <div className="bg-orange-50/30 rounded-[35px] border border-orange-100 p-6 md:p-8 flex flex-col gap-6">
      
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-black text-orange-600 tracking-widest font-mono">LIVE LOCAL TRANSIT PATHWAYS</span>
          <h3 className="text-xl font-display font-black text-slate-900 mt-0.5 flex items-center gap-1.5 leading-none">
            <Train className="w-5 h-5 text-orange-600" />
            Mumbai Local Commuter Radar
          </h3>
          <p className="text-neutral-500 text-xs mt-1 font-semibold">
            Track visual lines and critical inter-change nodes below.
          </p>
        </div>
        
        {/* Simple Legend */}
        <div className="flex gap-4 p-2.5 bg-white border border-orange-100/60 rounded-2xl text-[10px] font-mono tracking-wide font-bold">
          <div className="flex items-center gap-1.5 text-orange-600">
            <span className="w-3 h-1 bg-orange-500 rounded"></span>
            <span>Western Line</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-800">
            <span className="w-3 h-1 bg-neutral-600 rounded"></span>
            <span>Central Line</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-3 h-1 bg-neutral-300 rounded border border-neutral-200"></span>
            <span>Harbour Line</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: SVG Railway Map */}
        <div className="lg:col-span-7 bg-white border border-orange-100 rounded-3xl p-4 flex items-center justify-center min-h-[380px] relative overflow-hidden select-none">
          
          <svg className="w-full max-w-[320px] h-[360px]" viewBox="0 0 300 400">
            {/* Defs for gradients & glowing filters */}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* HARBOUR LINE tracks (CST -> Kurla) */}
            <path
              d="M 180,350 Q 210,260 210,170"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="4"
              strokeDasharray="4,4"
              className="transition-all duration-300"
            />

            {/* CENTRAL LINE tracks (CST -> Dadar -> Kurla -> Thane) */}
            <path
              d="M 180,350 Q 150,270 130,200 Q 180,180 210,170 Q 240,110 240,40"
              fill="none"
              stroke={showCentralHighlight ? "#ea580c" : "#4b5563"}
              strokeWidth={showCentralHighlight ? "5" : "3"}
              className={`${showCentralHighlight ? "animate-pulse" : ""} transition-all duration-300`}
            />

            {/* WESTERN LINE tracks (Churchgate -> Dadar -> Andheri -> Borivali) */}
            <path
              d="M 100,360 L 100,280 L 130,200 L 100,140 L 100,80 L 100,30"
              fill="none"
              stroke={showWesternHighlight ? "#ea580c" : "#f97316"}
              strokeWidth={showWesternHighlight ? "6" : "4"}
              className={`${showWesternHighlight ? "animate-pulse" : ""} transition-all duration-300`}
              filter={showWesternHighlight ? "url(#glow)" : ""}
            />

            {/* Pulse train highlight traveling on route */}
            {showWesternHighlight && (
              <circle r="6" fill="#ea580c" className="animate-ping">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path="M 100,280 L 130,200 L 100,140 L 100,80"
                />
              </circle>
            )}

            {showCentralHighlight && (
              <circle r="6" fill="#ea580c" className="animate-ping">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path="M 180,350 Q 150,270 130,200 Q 180,180 210,170"
                />
              </circle>
            )}

            {/* Station Nodes */}
            {stations.map((st) => {
              const isSelected = selectedStation?.id === st.id;
              
              // Highlight if matching route from or to query
              const isHighlightedNode = 
                st.name.toLowerCase().includes(cleanFrom) || 
                st.name.toLowerCase().includes(cleanTo) || 
                (st.name === "Dadar Junction" && (cleanFrom.includes("dadar") || cleanTo.includes("dadar")));

              return (
                <g 
                  key={st.id} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedStation(st)}
                >
                  {/* Outer circle halo */}
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r={isSelected ? 14 : isHighlightedNode ? 12 : 8}
                    fill={isHighlightedNode || isSelected ? "#ffedd5" : "white"}
                    stroke={isSelected ? "#ea580c" : isHighlightedNode ? "#f97316" : "#cbd5e1"}
                    strokeWidth={isSelected ? 4 : isHighlightedNode ? 3 : 2}
                    className="transition-all duration-300 group-hover:scale-125"
                  />
                  {/* Central Core */}
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r={isSelected ? 6 : isHighlightedNode ? 5 : 4}
                    fill={isSelected || isHighlightedNode ? "#ea580c" : "#64748b"}
                  />
                  {/* Text Label */}
                  <text
                    x={st.x + 15}
                    y={st.y + 4}
                    className={`font-sans font-black text-[10px] pointer-events-none transition-colors ${
                      isSelected 
                        ? "fill-orange-650 font-bold" 
                        : isHighlightedNode 
                        ? "fill-slate-900 font-bold" 
                        : "fill-slate-400 group-hover:fill-slate-700 font-semibold"
                    }`}
                  >
                    {st.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Prompt overlay banner */}
          <div className="absolute bottom-4 left-4 right-4 bg-orange-600 text-white rounded-2xl px-4 py-3 text-[11px] font-bold flex gap-2 items-center justify-between shadow-lg">
            <span className="flex items-center gap-1.5 shrink-0">
              <MapPin className="w-3.5 h-3.5 shrink-0 animate-bounce" />
              <span>Route: <strong>{routeFrom}</strong> to <strong>{routeTo}</strong></span>
            </span>
            <div className="bg-white/20 text-white px-2 py-0.5 rounded text-[9px] font-mono tracking-widest font-black uppercase">
              ACTIVE PATH
            </div>
          </div>
        </div>

        {/* Right Side: Node Insights */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          <div className="p-5 md:p-6 bg-white border border-orange-100 rounded-3xl h-full flex flex-col justify-between">
            {selectedStation ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-orange-50 pb-3">
                  <div>
                    <h4 className="font-display font-black text-slate-900 text-base">
                      {selectedStation.name}
                    </h4>
                    <div className="flex gap-1.5 mt-1">
                      {selectedStation.lines.map((ln) => (
                        <span 
                          key={ln} 
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                            ln === "Western" 
                              ? "bg-orange-50 text-orange-600 border-orange-200" 
                              : ln === "Central"
                              ? "bg-slate-100 text-slate-800 border-slate-200"
                              : "bg-neutral-100 text-neutral-500 border-neutral-200"
                          }`}
                        >
                          {ln} Corridor
                        </span>
                      ))}
                    </div>
                  </div>
                  <HelpCircle className="w-5 h-5 text-orange-355 select-none" />
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-semibold font-mono">CROWD STATUS</span>
                    <span className={`px-2.5 py-1.5 rounded-xl font-bold font-mono text-[10px] uppercase border ${
                      selectedStation.crowdLevel.includes("Super")
                        ? "bg-red-50 text-red-600 border-red-200"
                        : selectedStation.crowdLevel.includes("Dense")
                        ? "bg-amber-50 text-amber-600 border-amber-200"
                        : "bg-green-50 text-green-600 border-green-200"
                    }`}>
                      {selectedStation.crowdLevel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-semibold font-mono">AV. SIGNAL DELAYS</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {selectedStation.avgDelay}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-semibold font-mono">INTERACTION HUB</span>
                    <span className="font-bold text-orange-600 text-[11px] font-mono">
                      {selectedStation.name === "Dadar Junction" ? "Cross-overs ACTIVE" : "Terminals OPEN"}
                    </span>
                  </div>
                </div>

                <div className="bg-orange-50/50 p-4 border border-orange-100 rounded-2xl text-[11px] text-neutral-500 leading-normal font-semibold">
                  ℹ️ Click any station dot on the rail pathways map to retrieve historical crowd indicators and delay predictions immediately.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <Info className="w-8 h-8 text-orange-300 mb-2" />
                <p className="text-xs text-neutral-500 font-bold">No Station Selected</p>
                <p className="text-[10px] text-neutral-400 max-w-[150px] mt-1 pr-1">Tap a node to retrieve transit analysis details.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
