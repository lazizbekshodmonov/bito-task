<script setup lang="ts">
  import useLoginPage from "./useLoginPage";

  const { email, password, loading, handleLogin } = useLoginPage();
</script>

<template>
  <div
    class="min-h-screen flex items-center
      justify-center bg-white dark:bg-gray-950 p-4"
  >
    <div class="relative w-full max-w-md">
      <!-- Card -->
      <div
        class="bg-gray-50 dark:bg-gray-900
          border border-gray-200 dark:border-gray-800
          rounded-2xl p-8 shadow-2xl"
      >
        <!-- Header -->
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 mx-auto mb-4
              rounded-2xl bg-black dark:bg-white
              flex items-center justify-center"
          >
            <svg class="w-8 h-8 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M4 18v3h3v-3h10v3h3v-3h1a1 1 0
                  001-1V5a1 1 0 00-1-1H3a1 1 0
                  00-1 1v12a1 1 0 001 1h1zm2-6h12v5H6v-5z"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Sign in to your DSRS account</p>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
            <n-input
              v-model:value="email"
              placeholder="Enter your email"
              size="large"
              type="text"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Password</label>
            <n-input
              v-model:value="password"
              placeholder="Enter your password"
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
            Sign In
          </n-button>
        </form>

        <!-- Links -->
        <div class="mt-6 text-center space-y-2">
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            Don't have an account?
            <router-link
              to="/auth/register"
              class="text-black dark:text-white
                font-medium hover:underline"
            >
              Register
            </router-link>
          </p>
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            <router-link
              to="/auth/admin-login"
              class="text-gray-500 dark:text-gray-400
                hover:text-black dark:hover:text-white hover:underline"
            >
              Admin? Login here
            </router-link>
          </p>
        </div>

        <!-- Demo credentials -->
        <div class="mt-6 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Demo Credentials</p>
          <p class="text-xs text-gray-700 dark:text-gray-300 font-mono">admin@dsrs.uz / Admin@123!</p>
        </div>
      </div>
    </div>
  </div>
</template>
