<script setup lang="ts">
  import useAdminLoginPage from "./useAdminLoginPage";

  const { email, password, loading, handleLogin } = useAdminLoginPage();
</script>

<template>
  <div
    class="min-h-screen flex items-center
      justify-center bg-gray-950 p-4"
  >
    <div class="relative w-full max-w-md">
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 mx-auto mb-4
              rounded-2xl bg-gray-800
              flex items-center
              justify-center"
          >
            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
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
            type="primary"
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
