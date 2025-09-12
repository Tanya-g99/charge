<script setup>
import { computed } from 'vue';
import Chart from 'components/Chart.vue';
import Card from 'primevue/card';

const props = defineProps({
    chartData: {
        type: Array,
        required: true
    },
    chartDesc: {
        type: Object,
        required: true
    }
});

const hasChartDesc = computed(() => Object.keys(props.chartDesc).length > 0);
</script>

<template>
    <div class="chart-container" v-if="chartData.length > 0 && hasChartDesc">
        <Chart style="height: 100%;" :dataPoints="chartData" />

        <div v-if="hasChartDesc" class="cards-container">
            <Card class="info-card">
                <template #header>Общее число сессий:</template>
                <template #content>
                    <p>{{ chartDesc.session_count }}</p> шт.
                </template>
            </Card>
            <Card class="info-card">
                <template #header>Средняя длительность:</template>
                <template #content>
                    <p>{{ chartDesc.average_session_duration }}</p> часов
                </template>
            </Card>
            <Card class="info-card">
                <template #header>Среднее число сессий:</template>
                <template #content>
                    <p>{{ chartDesc.average_session_count }}</p> шт.
                </template>
            </Card>
            <Card class="info-card">
                <template #header>Среднее потребление:</template>
                <template #content>
                    <p>{{ chartDesc.average_session_consumption }}</p> кВт·ч
                </template>
            </Card>
        </div>
    </div>
    <div v-else class="no-data">
        Нет данных для отображения графика и аналитики
    </div>
</template>

<style scoped lang="scss">
.chart-container {
    display: grid;
    grid-template-columns: 2fr 1fr;

    .cards-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        padding: 16px;

        .info-card {
            padding: var(--card-large-padding);
            border-radius: var(--cadr-large-radius);
            text-align: center;

            p {
                font-weight: bold;
            }

            @media (min-width: 768px) {
                p {
                    font-size: 2rem;
                }
            }
        }
    }
}

.no-data {
    padding: 2rem;
    text-align: center;
    font-size: 1.25rem;
    color: var(--p-surface-500);
}


@media (max-width: 768px) {
    .chart-container {
        grid-template-columns: 1fr;
    }
}
</style>
