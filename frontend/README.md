# Vue Dashboard Starter Template

Modern Vue 3 dashboard template with TypeScript, UnoCSS, Naive UI, file-based routing, role-based middleware, Pinia, and TanStack Query.

## Features

- ⚡️ **Vue 3** - Composition API & `<script setup>`
- 🎨 **UnoCSS** - Instant on-demand atomic CSS
- 🎭 **Naive UI** - Beautiful Vue 3 component library
- 📦 **TypeScript** - Type safety
- 🗂️ **File-based Routing** - Auto-generated routes from `pages/` folder
- 🔒 **Role-based Middleware** - Authentication & authorization
- 🏪 **Pinia** - State management
- 🔄 **TanStack Query** - Powerful data fetching & caching
- 🎯 **Auto Import** - Components & composables auto-imported
- 🌙 **Dark Mode** - Built-in theme switching

## Project Structure

```
src/
├── components/         # Reusable components
│   └── DashboardLayout.vue
├── composables/        # Composable functions (auto-imported)
│   └── useUsers.ts
├── middleware/         # Route middlewares
│   ├── auth.ts
│   ├── guest.ts
│   └── role.ts
├── pages/             # File-based routes
│   ├── index.vue      # Dashboard (/)
│   ├── login.vue      # Login (/login)
│   ├── users.vue      # Users (/users)
│   └── 403.vue        # Forbidden (/403)
├── router/            # Router configuration
│   ├── index.ts
│   └── middleware.ts
├── stores/            # Pinia stores (auto-imported)
│   └── auth.ts
├── types/             # TypeScript types
│   └── index.ts
├── utils/             # Utilities
│   ├── axios.ts
│   └── query-client.ts
├── App.vue
└── main.ts
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

## Usage

### Adding New Pages

Create a new `.vue` file in `src/pages/`:

```vue
<!-- src/pages/products.vue -->
<route lang="yaml">
meta:
  middleware: ['auth']
  title: Products
</route>

<script setup lang="ts">
import DashboardLayout from '@/components/dashboard.vue'
</script>

<template>
  <DashboardLayout>
    <h1>Products Page</h1>
  </DashboardLayout>
</template>
```

### Adding Middleware

Pages can use multiple middlewares:

```vue
<route lang="yaml">
meta:
  middleware: ['auth', 'role']
  roles: ['admin', 'manager']
</route>
```

### Using TanStack Query

Create a composable:

```typescript
// src/composables/useProducts.ts
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get('/products')
      return response.data
    },
  })
}
```

Use in component:

```vue
<script setup lang="ts">
const { data: products, isLoading } = useProducts()
</script>
```

### Using Pinia Store

```typescript
// src/stores/cart.ts
export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  
  function addItem(item) {
    items.value.push(item)
  }
  
  return { items, addItem }
})
```

## Authentication

Default login credentials (demo):

- Email: `admin@example.com`
- Password: `password123`

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
VITE_API_URL=http://localhost:3000/axios
VITE_APP_TITLE=Dashboard Starter
```

## License

MIT