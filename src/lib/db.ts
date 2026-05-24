export interface User {
  id: string;
  username: string;
  email: string;
  locality: string;
  avatarUrl: string;
  bio?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  category: "trains" | "society" | "general" | "local";
  body: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  upvotes: number;
  upvotedBy: string[]; // User IDs
  comments: Comment[];
  createdAt: string;
}

export interface ActivitySquad {
  id: string;
  title: string;
  locality: string;
  activity: string;
  description: string;
  maxPeople: number;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  participants: string[]; // User IDs
  createdAt: string;
}

export interface CustomStore {
  id: string;
  name: string;
  locality: string;
  type: string;
  whatsNew: string;
  vibe: string;
  imageUrl: string;
  submittedBy: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

// Default pre-populated records for instant rich display and social realism
const PRESET_USERS: User[] = [
  {
    id: "aarav_mumbai",
    username: "Aarav Mehta",
    email: "aarav@mumbai.com",
    locality: "Bandra West",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    bio: "Cafe hopper and amateur footballer. Catch me at Carter Road on Sunday mornings!",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "riya_sen",
    username: "Riya Sen",
    email: "riya@colaba.com",
    locality: "Kala Ghoda",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    bio: "Heritage walk enthusiast & architecture designer. Western line daily commuter.",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rahul_ghosh",
    username: "Rahul Ghosh",
    email: "rahul@subways.com",
    locality: "Andheri West",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    bio: "Train enthusiast, active tech geek. Helping commuters dodge blocks since 2024.",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const PRESET_POSTS: CommunityPost[] = [
  {
    id: "post1",
    title: "⚠️ Central Line Mega Block update for coming Sunday",
    category: "trains",
    body: "Heads up! There is a planned 5-hour mega block between CST Terminal and Kurla on the slow corridor. Expect local transits to run 15 mins late. Fast locals diverted via Central mainline. Avoid taking slow rakes if headed for examinations!",
    authorId: "rahul_ghosh",
    authorName: "Rahul Ghosh",
    authorAvatar: PRESET_USERS[2].avatarUrl,
    upvotes: 24,
    upvotedBy: ["aarav_mumbai"],
    comments: [
      {
        id: "c1",
        authorId: "riya_sen",
        authorName: "Riya Sen",
        authorAvatar: PRESET_USERS[1].avatarUrl,
        text: "Thanks for this! Saving me a major rush on Sunday. Will schedule a Cab early instead.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "post2",
    title: "Bandra Carter Road Promenade Society meeting on waste cleanup",
    category: "society",
    body: "We are gathering at the Amphitheatre this Saturday 5 PM to raise issues with building garbage dumping near the sea-shore. We need cooperative representatives from coastal societies to join hands.",
    authorId: "aarav_mumbai",
    authorName: "Aarav Mehta",
    authorAvatar: PRESET_USERS[0].avatarUrl,
    upvotes: 18,
    upvotedBy: ["riya_sen", "rahul_ghosh"],
    comments: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const PRESET_SQUADS: ActivitySquad[] = [
  {
    id: "sq1",
    title: "⚽ Evening Football Match (6v6 Turf Co-op)",
    locality: "Bandra West",
    activity: "Sports & Games",
    description: "Looking for 5-6 friendly heads to join us at the Kick turf near St. Andrew's, Bandra! Ground is pre-booked, cost shared equally (about ₹150 per person). All skill levels welcomed, we are aiming to pass/casual run.",
    maxPeople: 6,
    hostId: "aarav_mumbai",
    hostName: "Aarav Mehta",
    hostAvatar: PRESET_USERS[0].avatarUrl,
    participants: ["aarav_mumbai", "rahul_ghosh"],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sq2",
    title: "☕ Kala Ghoda Art & Cafe Crawl Walkthrough",
    locality: "Kala Ghoda",
    activity: "Cafe Hopping & Art",
    description: "Let's explore some hidden galleries (Jehangir & local street booths) then sit down at Kala Ghoda Cafe or Subko for cold brews and discussions. Looking for 3-4 fellow creatives!",
    maxPeople: 5,
    hostId: "riya_sen",
    hostName: "Riya Sen",
    hostAvatar: PRESET_USERS[1].avatarUrl,
    participants: ["riya_sen"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const PRESET_STORES: CustomStore[] = [
  {
    id: "st1",
    name: "Cinnamon & Sage Bakery",
    locality: "Bandra West",
    type: "Cafe",
    whatsNew: "Newly launched boutique boulangerie on Pali Hill offering amazing direct-from-oven pistachio croissants & custom single-origin roast drip cups.",
    vibe: "Cozy, warm, floral",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    submittedBy: "Aarav Mehta",
    createdAt: new Date().toISOString(),
    likes: 12,
    likedBy: ["riya_sen"]
  },
  {
    id: "st2",
    name: "The Retro Vinyl Taproom",
    locality: "Bandra West",
    type: "Shop",
    whatsNew: "A retro vinyl records showroom and vintage tape-deck player repair shop that just popped up behind Shirley Rajan Road.",
    vibe: "Nostalgic, retro, mono",
    imageUrl: "https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=600&q=80",
    submittedBy: "Riya Sen",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 19,
    likedBy: ["aarav_mumbai"]
  }
];

// Database utility class wrapping LocalStorage key storage safely
class LocalMumbaiDB {
  private isBrowser = typeof window !== "undefined";

  private get<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) return defaultValue;
    const item = localStorage.getItem(`mumbai_mitra_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  }

  private set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    localStorage.setItem(`mumbai_mitra_${key}`, JSON.stringify(value));
  }

  // --- Auth Section ---
  public getUsers(): User[] {
    return this.get<User[]>("users", PRESET_USERS);
  }

  public registerUser(username: string, email: string, locality: string, avatarUrl?: string, bio?: string): User {
    const users = this.getUsers();
    
    // Check if already exists
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error("This email is already registered with an active profile.");
    }

    const defaultAvatarUrl = avatarUrl || `https://images.unsplash.com/photo-${[
      "1535713875002-d1d0cf377fde",
      "1494790108377-be9c29b29330",
      "1570295999919-56ceb5ecca61",
      "1507003211169-0a1dd7228f2d",
      "1438761681033-6461ffad8d80"
    ][Math.floor(Math.random() * 5)]}?auto=format&fit=crop&w=150&q=80`;

    const newUser: User = {
      id: "u_" + Math.random().toString(36).substr(2, 9),
      username,
      email,
      locality,
      avatarUrl: defaultAvatarUrl,
      bio: bio || "Happy Mumbai Suburban Commuter!",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.set("users", users);
    
    // Set current active user immediately on registration
    this.setCurrentUser(newUser);
    return newUser;
  }

  public loginUser(email: string): User {
    const users = this.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      throw new Error("Profile not found. Please Sign Up to register your Mumbai Mitra account first!");
    }
    this.setCurrentUser(found);
    return found;
  }

  public getCurrentUser(): User | null {
    // If none logged in, default to Aarv Mehta for smooth non-blocking out-of-box premium testing
    return this.get<User | null>("current_user", PRESET_USERS[0]);
  }

  public setCurrentUser(user: User | null): void {
    this.set("current_user", user);
    if (user) {
      // Ensure the user is registered in the list of profiles
      const users = this.getUsers();
      if (!users.some(u => u.id === user.id)) {
        users.push(user);
        this.set("users", users);
      }
    }
  }

  public logoutUser(): void {
    this.set("current_user", null);
  }

  // --- Community Section ---
  public getCommunityPosts(): CommunityPost[] {
    return this.get<CommunityPost[]>("community_posts", PRESET_POSTS);
  }

  public addCommunityPost(title: string, category: CommunityPost["category"], body: string): CommunityPost {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Please log in or sign up to post updates on the community board.");

    const posts = this.getCommunityPosts();
    const newPost: CommunityPost = {
      id: "p_" + Math.random().toString(36).substr(2, 9),
      title,
      category,
      body,
      authorId: user.id,
      authorName: user.username,
      authorAvatar: user.avatarUrl,
      upvotes: 0,
      upvotedBy: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    this.set("community_posts", posts);
    return newPost;
  }

  public upvotePost(id: string): CommunityPost {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Authenticate to upvote this issue.");

    const posts = this.getCommunityPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Post not found");

    const post = posts[index];
    const upvotedIdx = post.upvotedBy.indexOf(user.id);

    if (upvotedIdx === -1) {
      post.upvotedBy.push(user.id);
      post.upvotes += 1;
    } else {
      post.upvotedBy.splice(upvotedIdx, 1);
      post.upvotes -= 1;
    }

    posts[index] = post;
    this.set("community_posts", posts);
    return post;
  }

  public addCommentToPost(postId: string, text: string): Comment {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Please login to post comments.");

    const posts = this.getCommunityPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) throw new Error("Post not found");

    const newComment: Comment = {
      id: "c_" + Math.random().toString(36).substr(2, 9),
      authorId: user.id,
      authorName: user.username,
      authorAvatar: user.avatarUrl,
      text,
      createdAt: new Date().toISOString()
    };

    posts[index].comments.push(newComment);
    this.set("community_posts", posts);
    return newComment;
  }

  // --- Squad Activities Section ---
  public getActivitySquads(): ActivitySquad[] {
    return this.get<ActivitySquad[]>("activity_squads", PRESET_SQUADS);
  }

  public addActivitySquad(title: string, locality: string, activity: string, description: string, maxPeople: number): ActivitySquad {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Please log in or sign up to create local gather circles.");

    const squads = this.getActivitySquads();
    const newSquad: ActivitySquad = {
      id: "sq_" + Math.random().toString(36).substr(2, 9),
      title,
      locality,
      activity,
      description,
      maxPeople,
      hostId: user.id,
      hostName: user.username,
      hostAvatar: user.avatarUrl,
      participants: [user.id], // Host is first participant
      createdAt: new Date().toISOString()
    };

    squads.unshift(newSquad);
    this.set("activity_squads", squads);
    return newSquad;
  }

  public joinActivitySquad(id: string): ActivitySquad {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Please log in or sign up to connect with this locality squad.");

    const squads = this.getActivitySquads();
    const index = squads.findIndex(sq => sq.id === id);
    if (index === -1) throw new Error("Squad not found.");

    const squad = squads[index];
    if (squad.participants.includes(user.id)) {
      throw new Error("You have already joined this activity squad!");
    }

    if (squad.participants.length >= squad.maxPeople) {
      throw new Error("This locality squad has reached its coordination limit (already has 5-6 participants).");
    }

    squad.participants.push(user.id);
    squads[index] = squad;
    this.set("activity_squads", squads);
    return squad;
  }

  public leaveActivitySquad(id: string): ActivitySquad {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Not logged in");

    const squads = this.getActivitySquads();
    const index = squads.findIndex(sq => sq.id === id);
    if (index === -1) throw new Error("Squad not found");

    const squad = squads[index];
    squad.participants = squad.participants.filter(pid => pid !== user?.id);
    squads[index] = squad;
    this.set("activity_squads", squads);
    return squad;
  }

  // --- Discover Stores Submissions ---
  public getCustomStores(): CustomStore[] {
    return this.get<CustomStore[]>("custom_stores", PRESET_STORES);
  }

  public addCustomStore(name: string, locality: string, type: string, whatsNew: string, vibe: string): CustomStore {
    const user = this.getCurrentUser();
    const username = user ? user.username : "Local Guide";

    const stores = this.getCustomStores();
    
    // Pick Unsplash image aligned with local type
    const typeL = type.toLowerCase();
    let image = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80";
    if (typeL.includes("cafe") || typeL.includes("coffee")) {
      image = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80";
    } else if (typeL.includes("salon") || typeL.includes("hair")) {
      image = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80";
    } else if (typeL.includes("restaurant") || typeL.includes("food") || typeL.includes("bistro")) {
      image = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80";
    }

    const newStore: CustomStore = {
      id: "st_" + Math.random().toString(36).substr(2, 9),
      name,
      locality,
      type,
      whatsNew,
      vibe,
      imageUrl: image,
      submittedBy: username,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };

    stores.unshift(newStore);
    this.set("custom_stores", stores);
    return newStore;
  }

  public likeCustomStore(id: string): CustomStore {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Please logging in to support submissions!");

    const stores = this.getCustomStores();
    const idx = stores.findIndex(s => s.id === id);
    if (idx === -1) throw new Error("Store not found");

    const store = stores[idx];
    const likedIdx = store.likedBy.indexOf(user.id);
    if (likedIdx === -1) {
      store.likedBy.push(user.id);
      store.likes += 1;
    } else {
      store.likedBy.splice(likedIdx, 1);
      store.likes -= 1;
    }
    stores[idx] = store;
    this.set("custom_stores", stores);
    return store;
  }
}

export const dbInstance = new LocalMumbaiDB();
