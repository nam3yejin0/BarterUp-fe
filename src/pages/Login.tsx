import type { Component } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { ApiService, handleApiError } from "../services/api";

const Login: Component = () => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate fields
    if (!email() || !password()) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const loginData = {
        email: email().trim().toLowerCase(),
        password: password(),
      };

      const response = await ApiService.login(loginData);
      
      if (response.status === 'success') {
        // Store session data
        if (response.data.session) {
          sessionStorage.setItem('userSession', JSON.stringify(response.data.session));
        }

        // Check next step from backend response
        if (response.data.next_step === 'complete_profile') {
          // User needs to complete profile
          sessionStorage.setItem('signupData', JSON.stringify(loginData));
          navigate('/signup/personal');
        } else if (response.data.next_step === 'dashboard') {
          // User has complete profile, go to dashboard
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="overflow-x-hidden">
    <div class="font-poppins h-screen  flex flex-col justify-center items-center bg-gradient-to-b from-[#004041] via-[#002929] to-black px-4 ">
    <h1 class="text-4xl text-white sm:text-6xl font-extrabold text-center mb-4">BarterUp</h1>
    <div class="relative z-10 max-w-sm mx-auto bg-gradient-to-b from-[#00635F]/80 to-[#002929]/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
      {/* Judul */}
      <h2 class="text-2xl font-bold text-white ">Welcome Back</h2>
      <p class="text-gray-200 mb-6 text-m">
        Sign in to reconnect and keep swapping skills.
      </p>
      {error() && (
        <div class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p class="text-red-300 text-sm">{error()}</p>
        </div>
      )}     

      {/* Form */}
          <form class="flex flex-col gap-4" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email address"
              value={email()}
              onInput={e => setEmail(e.currentTarget.value)}
              disabled={loading()}
              class="w-full px-4 py-2 rounded-lg bg-[#000000]/30 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50 transition disabled:opacity-50"
            />

            <input
              type="password"
              placeholder="Password"
              value={password()}
              onInput={e => setPassword(e.currentTarget.value)}
              disabled={loading()}
              class="w-full px-4 py-2 rounded-lg bg-[#000000]/30 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50 transition disabled:opacity-50"
            />

            <button 
              type="submit" 
              disabled={loading()}
              class="w-full mt-4 py-2 rounded-lg bg-[#4CE0D2] text-black font-semibold hover:bg-[#36C9B9] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading() ? "Signing In..." : "Log In"}
            </button>
          </form>

          {/* Link ke signup */}
          <p class="mt-4 text-center text-gray-200 text-sm">
            Don't have an account?{" "}
            <A href="/signup" class="text-[#4CE0D2] hover:underline">
              Sign Up
            </A>
          </p>
    </div>
  </div>
  </div> 

  );
};

export default Login;
