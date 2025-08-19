// src/pages/PostPage.tsx
import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import Navbar from "../components/Navbar";
import { ApiService, handleApiError } from "../services/api";
import { useNavigate } from "@solidjs/router";

const PostPage: Component = () => {
  const [content, setContent] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  const nav = useNavigate();

  const handleSubmit = async (e?: Event) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    
    const text = content().trim();
    if (!text) {
      setError("Isi postingan tidak boleh kosong.");
      return;
    }

    setLoading(true);
    try {
      // Actually call the API to create the post
      console.log("Creating post with content:", text);
      
      const response = await ApiService.createPost({
        content: text,
        image_url: null // Add image support later if needed
      });
      
      console.log("Post created successfully:", response);
      setSuccess("Post berhasil dibuat!");
      setContent("");
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => nav("/dashboard"), 1500);
      
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-b from-[#042a29] to-black text-white">
      <Navbar />
      <main class="pt-20 px-4 max-w-3xl mx-auto">
        <h2 class="text-2xl font-semibold mb-4">Create a Post</h2>

        <form class="bg-[#003935] p-6 rounded-lg shadow-md" onSubmit={(e) => handleSubmit(e)}>
          <label class="block mb-2 text-sm text-gray-200">Your post</label>
          <textarea
            value={content()}
            onInput={(e) => setContent(e.currentTarget.value)}
            placeholder="Tulis sesuatu..."
            maxlength={2000}
            class="w-full min-h-[220px] p-3 rounded-md bg-[#014a47] text-white resize-y focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]"
          />

          <div class="mt-2 text-xs text-gray-400 text-right">
            {content().length}/2000 characters
          </div>

          <div class="mt-4 flex items-center justify-between">
            <div class="text-sm">
              <Show when={error()}>
                <div class="text-red-300 bg-red-900/20 p-2 rounded">{error()}</div>
              </Show>
              <Show when={success()}>
                <div class="text-green-300 bg-green-900/20 p-2 rounded">{success()}</div>
              </Show>
            </div>

            <div class="flex items-center space-x-2">
              <button
                type="button"
                class="px-3 py-2 rounded-md border border-gray-600 hover:bg-white/10 transition-colors"
                onClick={() => { 
                  setContent(""); 
                  setError(null); 
                  setSuccess(null);
                }}
                disabled={loading()}
              >
                Reset
              </button>

              <button
                type="submit"
                class="px-4 py-2 rounded-md bg-[#4CE0D2] text-black font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#5ba5a5] transition-colors"
                disabled={loading() || !content().trim()}
              >
                {loading() ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>

      </main>
    </div>
  );
};

export default PostPage;