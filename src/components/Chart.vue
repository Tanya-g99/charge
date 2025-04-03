<script setup>
import { ref, watch } from 'vue';
import Chart from 'primevue/chart';

const props = defineProps({
    dataPoints: {
        type: Array,
        required: true
    }
});

const chartData = ref({
    labels: [],
    datasets: []
});

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        x: {
            ticks: {
                autoSkip: true,
                maxTicksLimit: 10
            }
        },
        y: {
            title: {
                display: true,
                text: "Количество сессий"
            },
            beginAtZero: true
        }
    }
});

const updateChartData = () => {
    chartData.value = {
        labels: props.dataPoints.map(point => point.date),
        datasets: [
            {
                label: 'Сессий',
                data: props.dataPoints.map(point => point.value),
                borderColor: 'rgba(21, 81, 150, 1)',
                backgroundColor: 'rgba(21, 81, 150, 0.3)',
                fill: true,
                tension: 0.4
            }
        ]
    };
};

watch(() => props.dataPoints, updateChartData, { immediate: true });

</script>

<template>
    <Chart type="line" :data="chartData" :options="chartOptions" />
</template>

<style scoped></style>
