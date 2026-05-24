import { CommuteResult, DiscoverCard, NeighbourhoodResult } from "./types";

function cleanText(t: string): string {
  return t.replace(/\*\*+/g, "").trim();
}

/**
 * Parses the commute advisor output format:
 * DECISION: [Leave Now / Wait X mins / Take Bus]
 * WHY: [2 sentences max]
 * ALTERNATIVE: [one backup option]
 */
export function parseCommute(text: string): CommuteResult {
  const decisionMatch = text.match(/DECISION:\s*(.*?)(?=\n|$|WHY:|ALTERNATIVE:)/is);
  const whyMatch = text.match(/WHY:\s*(.*?)(?=\n|$|DECISION:|ALTERNATIVE:)/is);
  const alternativeMatch = text.match(/ALTERNATIVE:\s*(.*?)(?=\n|$|DECISION:|WHY:)/is);

  return {
    decision: cleanText(decisionMatch?.[1] || "Info unavailable"),
    why: cleanText(whyMatch?.[1] || "No search results returned for details."),
    alternative: cleanText(alternativeMatch?.[1] || "Board local from nearest platforms.")
  };
}

/**
 * Parses the discover agent response:
 * PLACE: [Name]
 * TYPE: [Cafe / Salon / Shop / Event]
 * WHAT'S NEW: [One sentence]
 * VIBE: [3 words max]
 */
export function parseDiscover(text: string): DiscoverCard[] {
  const blocks = text.split(/(?=PLACE:|\*\*PLACE:)/i);
  const cards: DiscoverCard[] = [];

  for (const block of blocks) {
    if (!block.trim()) continue;
    const nameMatch = block.match(/(?:PLACE|NAME):\s*(.*?)(?=\n|TYPE:|WHAT'S NEW:|VIBE:|$)/i);
    const typeMatch = block.match(/TYPE:\s*(.*?)(?=\n|PLACE:|WHAT'S NEW:|VIBE:|$)/i);
    const whatsNewMatch = block.match(/(?:WHAT'S NEW|WHATS NEW):\s*(.*?)(?=\n|PLACE:|TYPE:|VIBE:|$)/i);
    const vibeMatch = block.match(/VIBE:\s*(.*?)(?=\n|PLACE:|TYPE:|WHAT'S NEW:|$)/i);

    if (nameMatch) {
      cards.push({
        name: cleanText(nameMatch[1]),
        type: cleanText(typeMatch?.[1] || "Spot"),
        whatsNew: cleanText(whatsNewMatch?.[1] || "Worth exploring in this locality."),
        vibe: cleanText(vibeMatch?.[1] || "Chic, lively, neighborhood")
      });
    }
  }

  // If we parsed nothing, make a simple default or attempt to split manually
  if (cards.length === 0) {
    // Return empty list so we can show raw
    return [];
  }

  return cards;
}

/**
 * Parses the Neighbourhood assistant output:
 * TYPE: [Service / Activity / Alert]
 * MATCH 1: [Text]
 * MATCH 2: [Text]
 * WHATSAPP TEMPLATE: [Text]
 */
export function parseNeighbourhood(text: string): NeighbourhoodResult {
  const typeMatch = text.match(/TYPE:\s*(.*?)(?=\n|MATCH 1:|MATCH 2:|WHATSAPP TEMPLATE:|$)/i);
  const match1Match = text.match(/MATCH 1:\s*(.*?)(?=\n|MATCH 2:|MATCH 3:|WHATSAPP TEMPLATE:|$)/i);
  const match2Match = text.match(/MATCH 2:\s*(.*?)(?=\n|MATCH 1:|MATCH 3:|WHATSAPP TEMPLATE:|$)/i);
  const match3Match = text.match(/MATCH 3:\s*(.*?)(?=\n|MATCH 1:|MATCH 2:|WHATSAPP TEMPLATE:|$)/i);
  
  // Whatsapp template can span multiple lines, let's extract it safely
  const whatsappMatch = text.match(/(?:WHATSAPP TEMPLATE|WHATSAPP):\s*(.*)/is);

  return {
    type: cleanText(typeMatch?.[1] || "SERVICE"),
    match1: cleanText(match1Match?.[1] || "Contact nearest local service directory."),
    match2: cleanText(match2Match?.[1] || "Check local digital community groups."),
    match3: match3Match ? cleanText(match3Match[1]) : undefined,
    whatsappTemplate: cleanText(whatsappMatch?.[1] || "Looking for details in area.")
  };
}

/**
 * Resolves realistic, high-quality cover photo URLs from Unsplash curated for Mumbai hotspots.
 */
export function getPlaceImageUrl(name: string, type: string): string {
  const nameL = name.toLowerCase();
  const typeL = type.toLowerCase();

  if (nameL.includes("plural")) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("nico")) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("clearing house")) {
    return "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("subko")) {
    return "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("kala ghoda cafe")) {
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("blue tokai")) {
    return "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("croissant")) {
    return "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("slink")) {
    return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("born")) {
    return "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("white door")) {
    return "https://images.unsplash.com/photo-1519415510236-8a57900c2692?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("metanooya") || nameL.includes("biguine") || typeL.includes("salon")) {
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("nappa dori")) {
    return "https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("nicobar") || typeL.includes("boutique") || typeL.includes("shop")) {
    if (nameL.includes("book") || nameL.includes("waves") || nameL.includes("title")) {
      return "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80";
    }
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80";
  }
  if (nameL.includes("ncpa") || nameL.includes("concert") || nameL.includes("symphony")) {
    return "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80";
  }
  if (typeL.includes("event") || nameL.includes("festival")) {
    if (nameL.includes("market") || nameL.includes("farmer")) {
      return "https://images.unsplash.com/photo-1488459718432-36fb503223af?auto=format&fit=crop&w=600&q=80";
    }
    return "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80";
  }

  // Generic stunning high-contrast defaults
  if (typeL.includes("cafe")) {
    return "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80";
  }
  if (typeL.includes("restaurant") || typeL.includes("bistro")) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1529253123715-70f41e12aa40?auto=format&fit=crop&w=600&q=80";
}

