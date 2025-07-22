import './assets/main.scss'

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css';

import { createApp } from 'vue'
// import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)


// app.use(createPinia())
const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: 'rgb(123, 176, 237)',
            100: 'rgb(114, 171, 235)',
            200: 'rgb(96, 160, 233)',
            300: 'rgb(78, 149, 230)',
            400: 'rgb(60, 138, 228)',
            500: 'rgb(43, 128, 225)',
            600: 'rgb(30, 117, 217))',
            700: 'rgb(28, 108, 199)',
            800: 'rgb(25, 98, 181)',
            900: 'rgb(23, 88, 163)',
            950: 'rgb(21, 81, 150)'
        },
        colorScheme: {
            light: {
                surface: {
                    0: 'rgb(255, 255, 255)',
                    50: '{zinc.50}',
                    100: '{zinc.100}',
                    200: '{zinc.200}',
                    300: '{zinc.300}',
                    400: '{zinc.400}',
                    500: '{zinc.500}',
                    600: '{zinc.600}',
                    700: '{zinc.700}',
                    800: '{zinc.800}',
                    900: '{zinc.900}',
                    950: '{zinc.950}'
                }
            },
            dark: {
                surface: {
                    0: 'rgb(255, 255, 255)',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: '{slate.700}',
                    800: '{slate.800}',
                    900: '{slate.900}',
                    950: '{slate.950}'
                }
            }
        }
    }
});
app.use(router)
    .use(PrimeVue, {
        theme: {
            preset: MyPreset,
            options: {
                cssLayer: {
                    name: 'primevue',
                    order: 'primevue, base'
                },
                darkModeSelector: '.dark'
            },

        }
    })
    // .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')
