// src/pages/Messages.tsx
import type { Component } from "solid-js";
import { createSignal, For, Show } from "solid-js";
import { contacts } from "../components/contacts";
import type { Contact } from "../components/contacts"; // sesuaikan path
import Navbar from '../components/Navbar';


export type Message = { id: number; from: "me" | "them"; text: string };


const Messages: Component = () => {
  
  // state untuk kontak terpilih
  const [selectedContact, setSelectedContact] = createSignal<Contact | null>(null);
  // 1. State untuk menyimpan semua pesan per kontak
  // state untuk menyimpan pesan per kontak
  const [messages, setMessages] = createSignal<Record<string, Message[]>>( 
    contacts().reduce((acc, c) => {
      acc[c.name] = [
        { id: 1, from: "them", text: `Hi, aku ${c.name}!` }
      ];
      return acc;
    }, {} as Record<string, Message[]>)
  );

  // 2. State untuk input teks per kontak
  const [drafts, setDrafts] = createSignal<Record<string, string>>({});

  // handler kirim pesan
  const handleSend = () => {
    const contact = selectedContact();
    if (!contact) return;
    const key = contact.name;
    const text = drafts()[key]?.trim();
    if (!text) return;
    setMessages({
      ...messages(),
      [key]: [...messages()[key], { id: Date.now(), from: "me", text }]
    });
    setDrafts({ ...drafts(), [key]: "" });
  };
  return (
    <div class="overflow-x-hidden">
      <Navbar />
      {/* Container dua-kolom */}
      <div class="pt-18 h-screen flex">
        {/* Sidebar kontak */}
        <aside class="w-screen md:w-64 h-screen md:h-auto bg-[#004041] text-white shadow p-4 flex-shrink-0" classList={{ "hidden": selectedContact() !== null, "md:block": true }}>
          <h1 class="font-semibold mb-3">Contacts</h1>
          <ul>
            <For each={contacts()}>
              {(contact) => (
                <li
                  onClick={() =>
                    // jika kontak sama, tutup chat; 
                    // jika berbeda, buka chat kontak baru
                    selectedContact()?.name === contact.name
                      ? setSelectedContact(null)
                      : setSelectedContact(contact)
                  }
                  class="flex items-center space-x-3 mb-3 p-2 rounded hover:bg-[#015f5f] transition cursor-pointer"
                  classList={{ "bg-[#016767]": selectedContact()?.name === contact.name }}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <span class="text-sm">{contact.name}</span>
                </li>
              )}
            </For>


          </ul>
        </aside>

        {/* Chat panel */}
        <main class="flex-1 flex-col bg-[#002727] md:flex hidden" classList={{ "hidden": selectedContact() === null, "md:flex": true }}>
          <Show
            when={selectedContact()}
            fallback={
              <div class="flex-1 flex items-center justify-center text-gray-500">
                Pilih kontak untuk memulai chat
              </div>
            }
          >
            {(getContact) => {
              const contact = getContact();
              const key = contact.name;
            
              return (
                <>
                
                  {/* Header */}
                  <header class="flex items-center px-6 py-4 border-b border-[#004041] bg-[#002727] sticky top-0 z-10">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      class="w-10 h-10 rounded-full mr-3"
                    />
                    <h2 class="text-lg font-semibold text-white">{contact.name}</h2>
                    <button
                    onClick={() => setSelectedContact(null)}
                    class="ml-auto text-white"
                    >
                      ←
                    </button>
                  </header>

                  {/* Body: tampilkan semua pesan */}
                  <div class="flex-1 p-6 overflow-y-auto space-y-4">
                    <For each={messages()[key]}>
                      {(msg) => (
                        <div
                          classList={{
                            "self-start bg-gray-200 text-gray-800": msg.from === "them",
                            "self-end bg-[#004041] text-white ml-auto": msg.from === "me",
                          }}
                          class="p-3 rounded-lg max-w-xs"
                        >
                          {msg.text}
                        </div>
                      )}
                    </For>
                  </div>

                  {/* Footer: input & tombol kirim */}
                  <footer class="p-4 border-t border-[#004041] bg-[#002727] sticky bottom-0">
                    <div class="flex">
                      <input
                        type="text"
                        placeholder="Message..."
                        value={drafts()[key] || ""}
                        onInput={(e) =>
                          setDrafts({ ...drafts(), [key]: e.currentTarget.value })
                        }
                        class="flex-1 border-none rounded-l px-4 py-2 focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      />
                      <button
                        onClick={handleSend}
                        class="bg-[#004041] text-white px-4 rounded-r hover:bg-[#016767] transition"
                      >
                        Send
                      </button>
                    </div>
                  </footer>
                </>
              );
            }}
          </Show>
        </main>
      </div>
    </div>
  );
};

export default Messages;
