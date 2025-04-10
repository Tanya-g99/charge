<script setup>
import { ref, onMounted } from 'vue'

const links = [
  {
    to: "/stations",
    name: "Stations Info"
  },
  {
    to: "/analytics",
    name: "Stations Analytics"
  }
]

const currentTheme = ref('')

onMounted(() => {
  const savedTheme = localStorage.getItem('colorScheme')

  if (savedTheme) {
    currentTheme.value = savedTheme
  } else {
    currentTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  if (currentTheme.value === 'dark')
    document.documentElement.classList.toggle('dark');
})

const toggleTheme = () => {
  if (currentTheme.value === 'light') {
    currentTheme.value = 'dark'
  } else {
    currentTheme.value = 'light'
  }

  localStorage.setItem('colorScheme', currentTheme.value)

  document.documentElement.classList.toggle('dark');;
}
</script>

<template>
  <header class="menu">
    <RouterLink class="router-link" v-for="link in links" :to="link.to">{{ link.name }}</RouterLink>
    <button @click="toggleTheme">
      <span v-if="currentTheme == 'light'" class="icon">🌙</span>
      <span v-if="currentTheme == 'dark'" class="icon">☀</span>
    </button>
  </header>
  <main class="main-layout">
    <RouterView />
  </main>
</template>

<style scoped lang="scss">
.menu {
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: centers;
  background-color: var(--color-menu-bg);
  height: var(--menu-height);
  z-index: 9999;


  .router-link {
    flex-grow: 1;
    text-align: center;
  }

  .router-link-active {
    font-weight: bold;
  }

  .router-link-exact-active {
    color: var(--color-menu-active);
  }

  button {
    background: none;
    margin-left: auto;
    color: var(--color-menu-active);
    border: none;
    padding: 0.5rem;
    cursor: pointer;

    justify-self: center;
    width: 2rem;
  }

  button:hover {
    color: var(--color-menu-hover);
  }
}

.main-layout {
  margin: 0 auto;
  height: 100%;
  min-height: min-content;
  padding: calc(var(--menu-height) + var(--page-padding)) var(--page-padding) var(--page-padding);
}
</style>