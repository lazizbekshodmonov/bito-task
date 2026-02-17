<script setup lang="ts">
  import useAdminLoginPage from "./useAdminLoginPage";

  const { email, password, loading, handleLogin } = useAdminLoginPage();
</script>

<template>
  <div
    class="min-h-screen flex items-center
      justify-center bg-linear-to-br
      from-gray-900 via-slate-800
      to-gray-900 p-4"
  >
    <div class="absolute inset-0 opacity-5">
      <div
        class="absolute inset-0"
        style="background-image:
          radial-gradient(
            circle at 1px 1px, white 1px,
            transparent 0);
          background-size: 40px 40px"
      ></div>
    </div>

    <div class="relative w-full max-w-md">
      <div class="glass rounded-2xl p-8 shadow-2xl border border-white/10">
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 mx-auto mb-4
              rounded-2xl bg-amber-500/20
              backdrop-blur flex items-center
              justify-center"
          >
            <svg class="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 1L3 5v6c0 5.55 3.84 10.74
                  9 12 5.16-1.26 9-6.45
                  9-12V5l-9-4zm0 10.99h7c-.53
                  4.12-3.28 7.79-7
                  8.94V12H5V6.3l7-3.11v8.8z"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Admin Portal</h1>
          <p class="text-white/50 mt-1">Restricted access - administrators only</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-sm font-medium text-white/70 mb-1">Email</label>
            <n-input
              v-model:value="email"
              placeholder="Admin email"
              size="large"
              type="text"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-white/70 mb-1">Password</label>
            <n-input
              v-model:value="password"
              placeholder="Admin password"
              size="large"
              type="password"
              show-password-on="click"
              @keyup.enter="handleLogin"
            />
          </div>

          <n-button
            type="warning"
            block
            size="large"
            :loading="loading"
            :disabled="!email || !password"
            attr-type="submit"
            class="mt-6!"
          >
            Sign In as Admin
          </n-button>
        </form>

        <div class="mt-6 text-center">
          <router-link
            to="/auth/login"
            class="text-white/50 text-sm
              hover:text-white/80 hover:underline"
          >
            Back to user login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
