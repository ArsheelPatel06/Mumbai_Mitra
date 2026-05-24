export type TabId = "commute" | "discover" | "squads" | "community" | "neighbourhood";

export interface CommuteResult {
  decision: string;
  why: string;
  alternative: string;
}

export interface DiscoverCard {
  name: string;
  type: string;
  whatsNew: string;
  vibe: string;
}

export interface NeighbourhoodResult {
  type: string;
  match1: string;
  match2: string;
  match3?: string;
  whatsappTemplate: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface AdvisorResponse {
  text: string;
  sources: GroundingSource[];
}
