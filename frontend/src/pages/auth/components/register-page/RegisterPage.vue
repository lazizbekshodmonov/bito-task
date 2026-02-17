<script setup lang="ts">
  import useRegisterPage from "./useRegisterPage";

  const { name, email, password, loading, passwordValid, handleRegister } = useRegisterPage();
</script>

<template>
  <div
    class="min-h-screen flex items-center
      justify-center bg-white dark:bg-gray-950 p-4"
  >
    <div class="relative w-full max-w-md">
      <div
        class="bg-gray-50 dark:bg-gray-900
          border border-gray-200 dark:border-gray-800
          rounded-2xl p-8 shadow-2xl"
      >
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 mx-auto mb-4
              rounded-2xl bg-black dark:bg-white
              flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-white dark:text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
              <circle cx="9" cy="7" r="4" />
              <line
                x1="19"
                y1="8"
                x2="19"
                y2="14"
              />
              <line
                x1="22"
                y1="11"
                x2="16"
                y2="11"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Join the DSRS platform</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleRegister">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
            <n-input v-model:value="name" placeholder="Enter your name" size="large" />
          </div>

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
              placeholder="Create a password"
              size="large"
              type="password"
              show-password-on="click"
            />
            <div class="mt-2 grid grid-cols-2 gap-1 text-xs">
              <span
                :class="password.length >= 8
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-600'"
              >
                8+ characters
              </span>
              <span
                :class="/[A-Z]/.test(password)
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-600'"
              >
                Uppercase
              </span>
              <span
                :class="/[a-z]/.test(password)
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-600'"
              >
                Lowercase
              </span>
              <span
                :class="/[0-9]/.test(password)
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-600'"
              >
                Digit
              </span>
              <span
                :class="
                  /[!@#$%^&*(),.?&quot;:{}|<>]/.test(password)
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-600'
                "
              >
                Special char
              </span>
            </div>
          </div>

          <n-button
            type="primary"
            block
            size="large"
            :loading="loading"
            :disabled="!name || !email || !passwordValid"
            attr-type="submit"
            class="!mt-6"
          >
            Create Account
          </n-button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            Already have an account?
            <router-link
              to="/auth/login"
              class="text-black dark:text-white
                font-medium hover:underline"
            >
              Sign In
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
