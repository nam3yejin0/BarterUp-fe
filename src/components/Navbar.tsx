// src/pages/Landing.tsx
import type { Component } from "solid-js";
import { initFlowbite } from 'flowbite';
import { A } from "@solidjs/router";
import { onMount } from 'solid-js';

const Navbar: Component = () => {
  onMount(() => {
    initFlowbite();
  });
  const profilePicture = localStorage.getItem("profilePicture");
  

  return (
    <div class="fixed w-full z-50 top-0 left-0">
      <nav class="bg-black/50 backdrop-blur-md">
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/dashboard" class="flex items-center space-x-3 rtl:space-x-reverse">
          <h1 class="text-3xl sm:text-4xl font-bold text-white">BarterUp</h1>
        </a>
        <div class="flex md:order-2">
          <A href="/post" class="flex flex-row items-center text-white hover:text-[#4CE0D2] pr-4 rounded-lg">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.212l-4 1 1-4L16.862 3.487z" />
          </svg>
          <span class="text-xs">Post</span>
        </A>
          
          <button data-collapse-toggle="navbar-search" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-black/30 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]  dark:text-gray-400 " aria-controls="navbar-search" aria-expanded="false">
              <span class="sr-only">Open main menu</span>
              <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
              </svg>
          </button>
          {/* ← NEW: Profile avatar right beside desktop search */}
          <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" type="button">
            {profilePicture && (
              <div class="flex items-center ms-4">
                <img
                  src={profilePicture}
                  alt="Profile"
                  class="w-8 h-8 rounded-full object-cover"
                />              
              </div>
            )}
          </button>

          <div id="dropdown" class="z-10 hidden bg-[#000]/30 divide-y divide-gray-100 rounded-lg shadow-sm w-44">
              <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                <li>
                  <a href="/profile" class="block px-4 py-2 hover:bg-black/30">Edit Profile</a>
                </li>
                {/* <li>
                  <a href="/analytics" class="block px-4 py-2 hover:bg-black/30">Analytics</a>
                </li>  */}
              </ul>
          </div>
            
        </div>
          <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-search">
            
            {/* Ini UL untuk nav links */}
            <ul class="flex flex-col md:flex-row md:p-0 mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-2 font-medium rounded-lg bg-transparent ">
              <li>
                <A href="/dashboard" class="text-white hover:text-[#4CE0D2] block py-2 px-3 rounded-md">
                  Home
                </A>
              </li>
              <li>
                <A href="/messages" class="text-white hover:text-[#4CE0D2] block py-2 px-3 rounded-md">
                  Contacts
                </A>
              </li>
            </ul>
          </div>
        </div>
      </nav>

    </div>
    
  );
};

export default Navbar;
