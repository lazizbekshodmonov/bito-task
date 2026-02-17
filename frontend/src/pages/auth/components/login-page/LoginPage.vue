<script setup lang="ts">
  import useLoginPage from "./useLoginPage";

  const { email, password, loading, handleLogin } = useLoginPage();
</script>

<template>
  <div
    class="min-h-screen flex items-center
      justify-center bg-linear-to-br
      from-blue-600 via-purple-600
      to-indigo-700 p-4"
  >
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-10">
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
      <!-- Glass card -->
      <div class="glass rounded-2xl p-8 shadow-2xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 mx-auto mb-4
              rounded-2xl bg-white/20 backdrop-blur
              flex items-center justify-center"
          >
            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M4 18v3h3v-3h10v3h3v-3h1a1 1 0
                  001-1V5a1 1 0 00-1-1H3a1 1 0
                  00-1 1v12a1 1 0 001 1h1zm2-6h12v5H6v-5z"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Welcome Back</h1>
          <p class="text-white/70 mt-1">Sign in to your DSRS account</p>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-sm font-medium text-white/80 mb-1">Email</label>
            <n-input
              v-model:value="email"
              placeholder="Enter your email"
              size="large"
              type="text"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-white/80 mb-1">Password</label>
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
          <p class="text-white/60 text-sm">
            Don't have an account?
            <router-link to="/auth/register" class="text-white font-medium hover:underline">
              Register
            </router-link>
          </p>
          <p class="text-white/60 text-sm">
            <router-link
              to="/auth/admin-login"
              class="text-white/80
                hover:text-white hover:underline"
            >
              Admin? Login here
            </router-link>
          </p>
        </div>

        <!-- Demo credentials -->
        <div class="mt-6 p-3 rounded-lg bg-white/10 text-center">
          <p class="text-xs text-white/50 mb-1">Demo Credentials</p>
          <p class="text-xs text-white/70 font-mono">admin@dsrs.uz / Admin@123!</p>
        </div>
      </div>
    </div>
  </div>
</template>
