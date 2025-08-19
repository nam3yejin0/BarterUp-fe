// barterup-fe/src/pages/PersonalDetail.tsx
import type { Component } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { createSignal, onMount, createResource } from "solid-js";
import { ApiService, handleApiError } from "../services/api";

const PersonalDetail: Component = () => {
  const navigate = useNavigate();
  
  // Form signals
  const [day, setDay] = createSignal("");
  const [month, setMonth] = createSignal("");
  const [year, setYear] = createSignal("");
  const [primarySkill, setPrimarySkill] = createSignal("");
  const [skillToLearn, setSkillToLearn] = createSignal("");
  const [bio, setBio] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  // Load skills from backend
  const [skillsData] = createResource(() => ApiService.getSkills());

  // Check if user has signup data
  onMount(() => {
    const signupData = sessionStorage.getItem('signupData');
    if (!signupData) {
      navigate('/signup'); // Redirect back if no signup data
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate fields
    if (!day() || !month() || !year() || !primarySkill() || !skillToLearn() || !bio()) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    // Validate skills are different
    if (primarySkill() === skillToLearn()) {
      setError("Primary skill and skill to learn must be different.");
      setLoading(false);
      return;
    }

    // Validate bio length
    if (bio().trim().length < 10) {
      setError("Bio must be at least 10 characters long.");
      setLoading(false);
      return;
    }

    if (bio().length > 1000) {
      setError("Bio must be less than 1000 characters.");
      setLoading(false);
      return;
    }

    // Validate date
    const dayNum = parseInt(day());
    const monthNum = parseInt(month());
    const yearNum = parseInt(year());

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) || 
        dayNum < 1 || dayNum > 31 || 
        monthNum < 1 || monthNum > 12 || 
        yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError("Please enter a valid date.");
      setLoading(false);
      return;
    }

    try {
      // Get signup data from session
      const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
      
      // Format date as DD/MM/YYYY for backend
      const dateOfBirth = `${day().padStart(2, '0')}/${month().padStart(2, '0')}/${year()}`;
      
      const completeProfileData = {
        email: signupData.email,
        password: signupData.password,
        profile: {
          date_of_birth: dateOfBirth,
          primary_skill: primarySkill(),
          skill_to_learn: skillToLearn(),
          bio: bio().trim(),
        }
      };

      const response = await ApiService.completeProfile(completeProfileData);
      
      if (response.status === 'success') {
        // Clear signup data from session
        sessionStorage.removeItem('signupData');
        
        // Store session/token if needed
        if (response.data.session) {
          sessionStorage.setItem('userSession', JSON.stringify(response.data.session));
        }
        
        // Check next_step dari response
        const nextStep = response.data.next_step;
        if (nextStep === 'upload_profile') {
          // Redirect to upload profile page
          navigate('/signup/upload');
        } else {
          // Fallback to dashboard if next_step is different
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
      <div class="font-poppins min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-16 bg-gradient-to-b from-[#004041] via-[#002929] to-black">
        <div class="w-full max-w-md bg-gradient-to-b from-[#00635F]/80 to-[#002929]/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 class="text-2xl font-bold text-white mb-1">Personal Detail</h2>
          <p class="text-gray-200 text-sm mb-6">
            A few details help us pair you with the best skill matches.
          </p>

          {error() && (
            <div class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p class="text-red-300 text-sm">{error()}</p>
            </div>
          )}

          <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Date of Birth */}
            <label class="text-gray-200 text-sm">Date of birth</label>
            <div class="flex gap-2">
              <input
                type="text"
                placeholder="DD"
                value={day()}
                onInput={e => setDay(e.currentTarget.value)}
                disabled={loading()}
                maxLength={2}
                class="flex-1 min-w-0 px-4 py-2 rounded-lg bg-[#000]/30 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50 disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="MM"
                value={month()}
                onInput={e => setMonth(e.currentTarget.value)}
                disabled={loading()}
                maxLength={2}
                class="flex-1 min-w-0 px-4 py-2 rounded-lg bg-[#000]/30 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50 disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="YYYY"
                value={year()}
                onInput={e => setYear(e.currentTarget.value)}
                disabled={loading()}
                maxLength={4}
                class="flex-1 min-w-0 px-4 py-2 rounded-lg bg-[#000]/30 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50 disabled:opacity-50"
              />
            </div>

            {/* Primary Skill */}
            <label class="text-gray-200 text-sm">Primary Skill</label>
            <select
              value={primarySkill()}
              onChange={e => setPrimarySkill(e.currentTarget.value)}
              disabled={loading()}
              class="w-full px-4 py-2 rounded-lg bg-[#000]/30 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50 disabled:opacity-50"
            >
              <option value="" disabled>
                Choose your top skill
              </option>
              {skillsData()?.data?.skills?.map((skill: string) => (
                <option value={skill}>{skill}</option>
              ))}
            </select>

            {/* Skill to Learn */}
            <label class="text-gray-200 text-sm">Skill you want to Learn</label>
            <select
              value={skillToLearn()}
              onChange={e => setSkillToLearn(e.currentTarget.value)}
              disabled={loading()}
              class="w-full px-4 py-2 rounded-lg bg-[#000]/30 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50 disabled:opacity-50"
            >
              <option value="" disabled>
                Choose a skill you'd like to learn
              </option>
              {skillsData()?.data?.skills?.map((skill: string) => (
                <option value={skill}>{skill}</option>
              ))}
            </select>

            {/* Bio */}
            <label class="text-gray-200 text-sm">
              Bio <span class="text-xs">({bio().length}/1000)</span>
            </label>
            <textarea
              placeholder="Write a brief intro (eg., your background, interests, and goals)"
              value={bio()}
              onInput={e => setBio(e.currentTarget.value)}
              disabled={loading()}
              maxLength={1000}
              class="w-full px-4 py-2 rounded-lg bg-[#000]/30 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50 h-24 resize-none disabled:opacity-50"
            />

            {/* Navigation Buttons */}
            <div class="flex justify-between mt-4">
              <A 
                href="/signup" 
                class="px-6 py-2 text-[#4CE0D2] border-2 border-[#4CE0D2] rounded-lg font-semibold hover:bg-[#4CE0D2]/10 transition"
              >
                Back
              </A>
              <button 
                type="submit" 
                disabled={loading()}
                class="px-6 py-2 rounded-lg bg-[#4CE0D2] text-black font-semibold hover:bg-[#36C9B9] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading() ? "Creating Profile..." : "Complete Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetail;