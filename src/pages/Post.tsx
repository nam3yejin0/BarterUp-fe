// src/pages/Post.tsx
import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import { ApiService, handleApiError } from "../services/api";

interface Props {
  onPostCreated?: (post: any) => void;
}

const PostModal: Component<Props> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [content, setContent] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  const openModal = () => {
    setError(null);
    setSuccess(null);
    setContent("");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setLoading(false);
    setError(null);
    setSuccess(null);
  };

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
      const created = await ApiService.createPost({ content: text });
      setSuccess("Post berhasil dibuat.");
      // Beri tahu parent
      props.onPostCreated?.(created.data ?? created);
      setContent("");
      setTimeout(() => closeModal(), 600);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating New Post Button */}
      <button
        class="fixed bottom-8 right-8 z-50 bg-[#4CE0D2] hover:brightness-95 text-black p-4 rounded-full shadow-lg flex items-center justify-center"
        aria-label="Create post"
        onClick={openModal}
      >
        ✏️
      </button>

      {/* Modal */}
      <Show when={open()}>
        <div class="fixed inset-0 z-40 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/60" onClick={closeModal} />

          <form
            class="relative z-50 w-11/12 max-w-2xl bg-[#003935] text-white rounded-xl shadow-lg p-6"
            onSubmit={(e) => handleSubmit(e)}
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold">Buat Postingan</h3>
              <button type="button" class="text-gray-300 hover:text-white" onClick={closeModal}>
                ✕
              </button>
            </div>

            <textarea
              value={content()}
              onInput={(e) => setContent(e.currentTarget.value)}
              placeholder="Tulis sesuatu... (maks ~2000 karakter)"
              maxlength={2000}
              class="w-full min-h-[140px] p-3 rounded-md bg-[#014a47] text-white resize-y focus:outline-none"
            />

            <div class="mt-3 flex items-center justify-between">
              <div class="text-sm text-gray-300">
                <Show when={error()}>
                  <div class="text-red-300">{error()}</div>
                </Show>
                <Show when={success()}>
                  <div class="text-green-300">{success()}</div>
                </Show>
              </div>

              <div class="flex items-center space-x-2">
                <button
                  type="button"
                  class="px-3 py-2 rounded-md border hover:bg-white/10"
                  onClick={() => {
                    setContent("");
                    setError(null);
                  }}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  class="px-4 py-2 rounded-md bg-[#4CE0D2] text-black font-medium disabled:opacity-60"
                  disabled={loading()}
                >
                  {loading() ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Show>
    </>
  );
};

export default PostModal;
