<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
    images: { type: Array, required: true },
    height: { type: String, default: '100%' },
    autoPlay: { type: Boolean, default: true },
    interval: { type: Number, default: 10000 }
});

const currentIndex = ref(0);
let timer = null;
const isAnimating = ref(false);

const safeSlideChange = (changeFn) => {
    if (isAnimating.value) return;

    isAnimating.value = true;
    changeFn();
    restartAutoPlay();

    setTimeout(() => {
        isAnimating.value = false;
    }, 600);
};

const nextSlide = () => {
    safeSlideChange(() => {
        currentIndex.value = (currentIndex.value + 1) % props.images.length
    });
};

const prevSlide = () => {
    safeSlideChange(() => {
        currentIndex.value =
            (currentIndex.value - 1 + props.images.length) % props.images.length;
    });
};

const goToSlide = (index) => {
    safeSlideChange(() => {
        currentIndex.value = index;
    });
};

const startAutoPlay = () => {
    if (props.autoPlay) {
        stopAutoPlay();
        timer = setInterval(nextSlide, props.interval);
    }
};

const stopAutoPlay = () => {
    if (timer) clearInterval(timer);
};

const restartAutoPlay = () => {
    stopAutoPlay();
    startAutoPlay();
};

const manyImages = () => props.images.length > 1;


const touchStartX = ref(0);
const touchEndX = ref(0);

const handleTouchStart = (e) => {
    touchStartX.value = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e) => {
    touchEndX.value = e.changedTouches[0].screenX;
    handleSwipeGesture();
};

const handleSwipeGesture = () => {
    const diff = touchStartX.value - touchEndX.value;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) nextSlide();
    else prevSlide();
};

onMounted(() => {
    startAutoPlay();
});

onBeforeUnmount(() => {
    stopAutoPlay();
});

watch(() => props.autoPlay, (newVal) => {
    if (newVal) startAutoPlay();
    else stopAutoPlay();
});
</script>

<template>
    <div v-if="images.length" class="slider" :style="{ height: height }" @touchstart="handleTouchStart"
        @touchend="handleTouchEnd">
        <div class="slider-wrapper" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
            <div v-for="(img, index) in images" :key="index" class="slide">
                <img :src="img" class="slide-image" />
            </div>
        </div>

        <i v-if="manyImages" class="nav-button left pi pi-chevron-left" @click="prevSlide" />
        <i v-if="manyImages" class="nav-button right pi pi-chevron-right" @click="nextSlide" />

        <div v-if="manyImages" class="dots">
            <span v-for="(img, index) in images" :key="index" :class="{ active: currentIndex === index }"
                @click="goToSlide(index)" />
        </div>
    </div>
    <div v-else class="no-image">
        Нет изображения
    </div>
</template>

<style scoped>
.slider {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: var(--cadr-large-radius);


    .slider-wrapper {
        display: flex;
        transition: transform 0.6s ease;
        width: 100%;
        height: 100%;

        .slide {
            min-width: 100%;
            height: 100%;
            background: var(--color-slider-bg);
        }

        .slide-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
    }

    .nav-button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        padding: var(--button-padding);
        cursor: pointer;
        font-size: 20px;
        border-radius: 50%;
        user-select: none;
    }

    .nav-button.left {
        left: 10px;
    }

    .nav-button.right {
        right: 10px;
    }

    .dots {
        position: absolute;
        bottom: 12px;
        width: 100%;
        text-align: center;
    }

    .dots span {
        display: inline-block;
        width: 10px;
        height: 10px;
        margin: 0 4px;
        background: var(--p-surface-400);
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .dots span.active {
        background: var(--p-surface-600);
    }

}

.no-image {
    width: 100%;
    height: 100%;
    font-size: 14px;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-slider-bg);
    text-align: center;
    padding: 8px;
    border-radius: 12px;
}
</style>