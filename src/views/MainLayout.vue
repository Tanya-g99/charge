<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const links = [
  {
    to: "/stations",
    name: "Станции"
  },
  {
    to: "/analytics",
    name: "Аналитика сессий"
  }
]

const currentTheme = ref('')

const updateTheme = (event) => {
  if (event.key === "colorScheme" && currentTheme.value != event.newValue) {
    if (currentTheme.value != event.newValue) {
      document.documentElement.classList.toggle('dark');
      currentTheme.value = event.newValue;
    }
  }
}

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';

  document.documentElement.classList.toggle('dark');
  localStorage.setItem('colorScheme', currentTheme.value)
}

onMounted(() => {
  // сохраненная тема в localStorage
  const savedTheme = localStorage.getItem('colorScheme')

  currentTheme.value = savedTheme ? savedTheme :
    // системные предпочтения
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';


  if (currentTheme.value === 'dark')
    document.documentElement.classList.toggle('dark');

  window.addEventListener('storage', updateTheme);
})


onUnmounted(() => {
  window.removeEventListener("storage", updateTheme);
})
</script>


<template>
  <header class="menu">
    <RouterLink class="menu__router-link" v-for="link in links" :key="link.to" :to="link.to">{{ link.name }}
    </RouterLink>

    <label class="menu__theme-toggle">
      <input type="checkbox" class="menu__toggle-input" readonly @click="toggleTheme" />
      <span class="menu__toggle-slider">
        <span class="menu__icon" :class="{ 'menu__icon--move-right': currentTheme === 'dark' }">
          <i v-if="currentTheme === 'light'" class="pi pi-sun"></i>
          <i v-else class="pi pi-moon"></i>
        </span>
      </span>
    </label>

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

  &__router-link {
    flex-grow: 1;
    text-align: center;

    &.router-link-active {
      font-weight: bold;
    }

    &.router-link-exact-active {
      color: var(--color-menu-active);
    }
  }

  &__theme-toggle {
    position: relative;
    display: inline-block;
    width: 3rem;
    height: 1.6rem;
    margin-top: 0.2rem;
    margin-right: 1rem;
    justify-self: center;
  }

  &__toggle-input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  &__toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-card-bg);
    border: 1px solid var(--color-border);
    border-radius: 0.8rem;
    cursor: pointer;
    transition: background-color 0.3s, border-color 0.3s;

    &:hover {
      border-color: var(--color-border-hover);
    }
  }

  &__icon {
    position: absolute;
    top: 0.05rem;
    left: 0.05rem;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    background-color: var(--color-menu-bg);
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
    transition: left 0.3s ease;

    i {
      font-size: 0.7rem;
    }

    &--move-right {
      left: 1.5rem;
    }
  }
}

.main-layout {
  margin: 0 auto;
  height: 100%;
  min-height: min-content;
  padding: calc(var(--menu-height) + var(--page-padding)) var(--page-padding) var(--page-padding);
}
</style>