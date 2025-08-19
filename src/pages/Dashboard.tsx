// src/pages/Dashboard.tsx
import type { Component } from "solid-js";
import Navbar from '../components/Navbar';
import { createSignal, For, onMount, Show } from "solid-js";
import { contacts, setContacts, followed, setFollowed } from "../components/contacts";
import { ApiService, type EnhancedPostResponse } from "../services/api";
import { API_BASE_URL } from "../services/api";

// import image assets
import W1 from '../assets/W1.jpg';
import W2 from '../assets/W2.jpg';
import Male1 from "../assets/male1.jpg";

const Dashboard: Component = () => {
  const [query, setQuery] = createSignal("");
  const [loadingPosts, setLoadingPosts] = createSignal(false);
  const [postsError, setPostsError] = createSignal<string | null>(null);
  const [, setCurrentUser] = createSignal<any>(null);
  
  // Enhanced post structure with better typing
  const [posts, setPosts] = createSignal<EnhancedPostResponse[]>([]);

  // Seed posts for demo - Fixed avatar handling
  const seedPosts: EnhancedPostResponse[] = [
    {
      id: "seed-1",
      user_id: "demo-user-1",
      content: `Senang sekali memperkenalkan BarterUp ke komunitas lokal! 🎉
        Kami percaya setiap orang memiliki keahlian unik yang bisa dibagikan.
        Di BarterUp kamu dapat menukar skill memasak, berbahasa asing, hingga coding.
        Baik kamu ingin belajar memasak resep tradisional maupun menguasai teknik debugging,
        semuanya bisa bertukar secara langsung dengan tetangga atau teman baru.
        Yuk, mulai perjalanan belajarmu dengan cara yang lebih dekat, terjangkau, dan sosial!`,
      author_name: "Rina Suryani",
      author_avatar: W1, // This is already the imported image
      author_role: "Digital Art",
      author_primary_skill: "Digital Art",
      is_own_post: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "seed-2", 
      user_id: "demo-user-2",
      content: `Halo teman BarterUp! Aku sedang mendalami bahasa Spanyol 🇪🇸 dan ingin bantu kalian desain konten visual.
        Ayo bergabung untuk sesi tukar skill: aku ajarkan dasar-dasar tipografi dan layout,
        kamu bisa ajari aku percakapan sehari-hari dalam bahasa Spanyol.
        Kita bisa atur jadwal mingguan secara offline atau virtual sesuai kenyamanan.
        Tingkatkan kreativitas dan kemampuan bahasa secara bersamaan! 📚✨`,
      author_name: "Agus Yuni",
      author_avatar: Male1, // This is already the imported image
      author_role: "Graphic Design",
      author_primary_skill: "Graphic Design",
      is_own_post: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "seed-3",
      user_id: "demo-user-3", 
      content: `Apakah kamu tertarik belajar dasar JavaScript untuk membangun website interaktif? 🚀
        Gabung sesi coding virtual gratis setiap Sabtu jam 10:00 WIB.
        Kita akan mulai dari dasar: variabel, fungsi, hingga manipulasi DOM sederhana.
        Sempurna untuk pemula yang baru kenal programming atau yang ingin refresh kembali konsep.
        Jangan lewatkan kesempatan ini untuk mengasah skill coding-mu dengan komunitas lokal BarterUp!`,
      author_name: "Dewi Kusuma",
      author_avatar: W2, // This is already the imported image
      author_role: "Web Development",
      author_primary_skill: "Web Development",
      is_own_post: false,
      created_at: new Date().toISOString(),
    },
  ];

  const [openComments, setOpenComments] = createSignal<Record<string, boolean>>({});
  const [newComment, setNewComment] = createSignal<Record<string, string>>({});

  // Get current user session
  const getCurrentUser = () => {
    try {
      const userSession = sessionStorage.getItem('userSession');
      if (userSession) {
        const session = JSON.parse(userSession);
        return session;
      }
    } catch (error) {
      console.error('Error getting user session:', error);
    }
    return null;
  };

  const handleFollow = (postData: EnhancedPostResponse) => {
    // Don't allow following yourself
    if (postData.is_own_post) {
      console.log("Can't follow yourself");
      return;
    }

    const f = new Set(followed());
    const authorName = postData.author_name;
    const authorAvatar = postData.author_avatar || W1; // fallback avatar
    
    if (f.has(authorName)) {
      f.delete(authorName);
      setContacts(contacts().filter(c => c.name !== authorName));
    } else {
      f.add(authorName);
      setContacts([{ name: authorName, avatar: authorAvatar }, ...contacts()]);
    }
    setFollowed(f);
  };

  const toggleComments = (postId: string) => {
    setOpenComments({
      ...openComments(),
      [postId]: !openComments()[postId],
    });
  };

  const handleAddComment = (postId: string) => {
    const commentText = newComment()[postId]?.trim();
    if (!commentText) return;
    
    setPosts(
      posts().map(p => {
        if (p.id === postId) {
          // Since we don't have comments in EnhancedPostResponse, we'll simulate it
          const updatedPost = { ...p };
          // You might want to add a comments field to EnhancedPostResponse
          console.log(`Adding comment to post ${postId}: ${commentText}`);
          return updatedPost;
        }
        return p;
      })
    );
    setNewComment({ ...newComment(), [postId]: '' });
    if (!openComments()[postId]) toggleComments(postId);
  };

  const filteredPosts = () =>
    posts().filter(
      (p) =>
        p.author_name.toLowerCase().includes(query().toLowerCase()) ||
        (p.content && p.content.toLowerCase().includes(query().toLowerCase())) ||
        (p.author_primary_skill && p.author_primary_skill.toLowerCase().includes(query().toLowerCase()))
    );

  // Also update the loadPosts function to ensure proper avatar handling
  const loadPosts = async () => {
    setLoadingPosts(true);
    setPostsError(null);
    
    try {
      console.log("=== LOADING POSTS FROM API ===");
      const resp = await ApiService.getPosts();
      console.log("API Response:", resp);
      
      const data = resp.data ?? [];
      console.log("Posts data:", data);
      
      // Get current user info for comparison
      const currentUserInfo = getCurrentUser();
      
      // Process backend posts with proper avatar handling
      const backendPosts = (Array.isArray(data) ? data : []).map((p: EnhancedPostResponse) => {
        console.log("Processing backend post:", p);
        
        // Handle avatar URL conversion for backend posts only
        let processedAvatar = p.author_avatar;
        if (processedAvatar && typeof processedAvatar === 'string' && !processedAvatar.startsWith('http')) {
          processedAvatar = processedAvatar.startsWith('/') 
            ? `${API_BASE_URL.replace(/\/$/, "")}${processedAvatar}`
            : processedAvatar;
        }
        
        return {
          ...p,
          // Ensure we have fallback values
          author_name: p.author_name || (p.is_own_post ? 'You' : 'Anonymous User'),
          author_avatar: processedAvatar || (p.is_own_post && currentUserInfo?.profile?.profile_picture_url ? currentUserInfo.profile.profile_picture_url : W1),
          author_role: p.author_primary_skill || 'User',
          content: p.content || 'No content',
        };
      });

      console.log("Processed backend posts:", backendPosts);
      
      // Combine backend posts with seed posts (backend posts first)
      setPosts([...backendPosts, ...seedPosts]);
      
    } catch (err: any) {
      console.error('Load posts failed:', err);
      setPostsError('Gagal memuat posts dari server. Menggunakan data demo.');
      // Use seed posts as fallback
      setPosts(seedPosts);
    } finally {
      setLoadingPosts(false);
    }
  };

  const getDisplayAvatar = (post: EnhancedPostResponse) => {
    // For own posts, try to get avatar from multiple sources with proper URL handling
    if (post.is_own_post) {
      const user = getCurrentUser();
      
      // Priority 1: User session profile picture (convert relative to absolute if needed)
      if (user?.profile?.profile_picture_url) {
        const avatarUrl = user.profile.profile_picture_url;
        if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
          return avatarUrl;
        } else {
          // Convert relative URL to absolute (same logic as Profile component)
          return `${API_BASE_URL.replace(/\/$/, "")}${avatarUrl}`;
        }
      }
      
      // Priority 2: localStorage profile picture (fallback from Profile component)
      const localAvatar = localStorage.getItem("profilePicture");
      if (localAvatar) {
        // Check if it's a relative URL that needs to be converted to absolute
        if (localAvatar.startsWith('/') && !localAvatar.startsWith('http')) {
          return `${API_BASE_URL.replace(/\/$/, "")}${localAvatar}`;
        }
        return localAvatar;
      }
    }
    
    // For other users' posts, check if avatar is already an imported image (like seed posts)
    if (post.author_avatar) {
      // If it's already a processed image (from import), return as is
      if (typeof post.author_avatar === 'string') {
        // Check if it's a blob URL (from imported images) or data URL
        if (post.author_avatar.startsWith('blob:') || 
            post.author_avatar.startsWith('data:') ||
            post.author_avatar.startsWith('/_astro/') || // Vite/Astro processed images
            post.author_avatar.startsWith('/src/') ||    // Direct imports
            post.author_avatar.startsWith('/assets/')) { // Asset imports
          return post.author_avatar;
        }
        
        // Handle HTTP/HTTPS URLs
        if (post.author_avatar.startsWith('http://') || post.author_avatar.startsWith('https://')) {
          return post.author_avatar;
        } 
        
        // Handle relative URLs from backend
        if (post.author_avatar.startsWith('/')) {
          return `${API_BASE_URL.replace(/\/$/, "")}${post.author_avatar}`;
        }
      }
      
      // If it's not a string (could be imported image object), return as is
      return post.author_avatar;
    }
    
    // Default avatars based on primary skill
    if (post.author_primary_skill?.toLowerCase().includes('art')) return W1;
    if (post.author_primary_skill?.toLowerCase().includes('design')) return Male1;  
    if (post.author_primary_skill?.toLowerCase().includes('programming') || 
        post.author_primary_skill?.toLowerCase().includes('web development')) return W2;
    return W1; // default fallback
  };

  const getDisplayRole = (post: EnhancedPostResponse) => {
    return post.author_primary_skill || 'User';
  };

  onMount(() => {
    // Get current user info
    const user = getCurrentUser();
    setCurrentUser(user);
    console.log("Current user:", user);
    
    // Load posts
    loadPosts();
  });

  return (
    <div class="overflow-x-hidden">
      <Navbar />
      <div class="pt-20 h-screen flex flex-col">
        <div class="flex-1 overflow-y-auto px-4">
          <div class="lg:max-w-6xl mx-auto">
            {/* Search Bar */}
            <div class="sticky top-0 z-20">
              <input
                type="text"
                class="w-full backdrop-blur-md p-3 rounded-lg bg-gray-100 dark:bg-black/60 text-gray-900 dark:text-gray-200"
                placeholder="Search posts..."
                value={query()}
                onInput={(e) => setQuery(e.currentTarget.value)}
              />
            </div>

            <div class="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 pt-6">
              {/* Feed Section */}
              <div class="flex-1 space-y-6">
                <Show when={loadingPosts()}>
                  <div class="text-gray-300">Loading posts...</div>
                </Show>

                <Show when={postsError()}>
                  <div class="text-red-300 p-4 bg-red-900/20 rounded-lg">
                    {postsError()}
                  </div>
                </Show>

                <Show when={!loadingPosts() && filteredPosts().length === 0}>
                  <p class="text-gray-400">No posts found.</p>
                </Show>

                <For each={filteredPosts()}>
                  {(post) => (
                    <div class="bg-[#004041] text-white rounded-lg shadow-sm overflow-hidden">
                      {/* Header */}
                      <div class="p-4 flex justify-between items-center">
                        <div class="flex items-center space-x-3">
                          <img
                            class="w-12 h-12 rounded-full object-cover"
                            src={getDisplayAvatar(post)}
                            alt={post.author_name}
                            onError={(e) => {
                              console.log(`Avatar failed to load for ${post.author_name}:`, post.author_avatar);
                              e.currentTarget.src = W1; // Fallback to default avatar
                            }}
                          />
                          <div>
                            <p class="font-semibold">
                              {post.is_own_post ? "You" : post.author_name}
                            </p>
                            <p class="text-xs text-gray-200">
                              {getDisplayRole(post)}
                            </p>
                          </div>
                        </div>
                        <div class="flex space-x-3">
                          <Show when={!post.is_own_post}>
                            <button
                              class="text-sm px-2 py-1 border rounded-xl hover:bg-white hover:text-black transition-colors"
                              onClick={() => handleFollow(post)}
                            >
                              {followed().has(post.author_name) ? 'Unfollow' : 'Follow'}
                            </button>
                          </Show>
                          <Show when={post.is_own_post}>
                            <span class="text-sm px-2 py-1 text-gray-400 italic">
                              Your post
                            </span>
                          </Show>
                          <button 
                            class="text-gray-200 hover:text-white transition-colors" 
                            onClick={() => toggleComments(post.id)}
                          >
                            💬 0 {/* We don't have comments count yet */}
                          </button>
                        </div>  
                      </div>

                      {/* Content */}
                      <div class="px-4 pb-4 whitespace-pre-line">{post.content}</div>

                      {/* Comments Section */}
                      {openComments()[post.id] && (
                        <div class="px-4 pb-4 border-t border-gray-600">
                          <div class="text-gray-400 text-sm py-2">
                            Comments feature coming soon...
                          </div>
                          <div class="mt-2 flex">
                            <input
                              type="text"
                              class="flex-1 p-2 rounded-l bg-gray-700 text-white border focus:border-[#4CE0D2] outline-none"
                              value={newComment()[post.id] || ''}
                              placeholder="Add a comment..."
                              onInput={e => setNewComment({ 
                                ...newComment(), 
                                [post.id]: e.currentTarget.value 
                              })}
                            />
                            <button
                              class="px-4 bg-[#4CE0D2] rounded-r hover:bg-[#5ba5a5] transition-colors text-black"
                              onClick={() => handleAddComment(post.id)}
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </For>
              </div>

              {/* Sidebar */}
              <aside class="hidden lg:block lg:w-80 space-y-4 z-15">
                <div class="sticky top-18 pt-4 bg-[#004041] text-white rounded-lg shadow p-4">
                  <h2 class="font-semibold mb-3">Following</h2>
                  <Show when={contacts().length === 0}>
                    <p class="text-gray-400 text-sm">
                      No contacts yet. Follow someone to see them here!
                    </p>
                  </Show>
                  <For each={contacts()}>
                    {c => (
                      <a href="/messages" class="flex items-center space-x-3 mb-3 hover:bg-[#015f5f] p-2 rounded transition-colors">
                        <img class="w-10 h-10 rounded-full object-cover" src={c.avatar} alt={c.name} />
                        <p class="text-sm font-medium">{c.name}</p>
                      </a>
                    )}
                  </For>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;