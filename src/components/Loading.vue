<script setup>
import ProgressSpinner from 'primevue/progressspinner';
</script>

<template>
    <div style="width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            z-index: 9999;">
        <ProgressSpinner strokeWidth="5" fill="transparent" animationDuration=".5s" />
    </div>
</template>

<style scoped></style>
