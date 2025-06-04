<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Galleria from '@/components/Galleria.vue';
import Calendar from 'primevue/calendar';
import MultiSelect from 'primevue/multiselect';
import Card from 'primevue/card';

import Loading from 'components/Loading.vue';
import Table from 'components/PrimeTable2.vue';
import SessionsChart from 'components/SessionsChart.vue';

import { Sessions } from 'lib/Sessions';
import _ from 'lodash';

const route = useRoute();
const stationId = route.params.id;
const token = "5IyJPkWJa3ci50t8em4dEmCmoDHFSQVY";

const loading = ref(true);
const period = ref([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date()
]);
const selectedStatus = ref([]);
const selectedConnectors = ref([]);

const sessions = ref([]);
const totalSessions = ref(0);
const chartData = ref([]);
const chartDesc = ref({});
const station = ref(null);
const imageList = ref([]);

const columns = ref([
    { field: 'connector_id', title: 'Коннектор' },
    { field: 'period.from', title: 'Начало' },
    { field: 'period.to', title: 'Окончание' },
    { field: 'status', title: 'Статус' },
    { field: 'consumption', title: 'Потребление (Вт·ч)' }
]);

const statusOptions = ref([
    { label: 'Активна', value: 1 },
    { label: 'Завершена', value: 2 },
    { label: 'Ошибка', value: 3 }
]);
const connectorOptions = ref([
    { label: '1', value: 1 },
    { label: '2', value: 2 },
]);

const fetchStationDetails = async () => {
    const res = await axios.post('/api', {
        command: 'get_stations',
        token,
        ids: [stationId],
        expand_connectors: true
    });
    if (res.data.response_code === 0) {
        station.value = res.data.stations[0] || null;
        console.log(station.value)

        if (station.value?.image_ids?.length) {
            const promises = station.value.image_ids.map(image_id =>
                axios.post('/api', {
                    command: 'get_station_image',
                    token,
                    station_id: stationId,
                    image_id
                })
            );
            const results = await Promise.all(promises);
            console.log("PHOTO", results)
            imageList.value = results
                .filter(res => res.data.response_code === "0")
                .map(res => `data:image/png;base64,${res.data.image_data}`);
        }
    }
};

const fetchSessions = async () => {
    loading.value = true;
    const request = {
        command: 'get_sessions',
        token,
        connector_types: selectedConnectors.value,
        status: selectedStatus.value,
        period: {
            from: period.value[0]?.toLocaleDateString('en-CA'),
            to: period.value[1]?.toLocaleDateString('en-CA')
        },
        stations: [stationId]
    };
    const response = await axios.post('/api', request);
    if (response.data.response_code === 0) {
        sessions.value = response.data.sessions;
        totalSessions.value = response.data.total || 0;
    }

    const chartRes = await axios.post('/api', {
        command: 'get_session_analysis',
        token,
        period: request.period
    });
    if (chartRes.data.response_code === 0) {
        const analysis = chartRes.data;
        chartData.value = analysis.days.map(d => ({ date: d.date, value: d.session_count }));
        chartDesc.value = _.pick(analysis, [
            'session_count',
            'average_session_duration',
            'average_session_count',
            'average_session_consumption'
        ]);
    }
    loading.value = false;
};

watch([selectedStatus, selectedConnectors, () => period.value[1]], () => {
    if (period.value[1]) fetchSessions();
});

onMounted(async () => {
    await fetchStationDetails();
    await fetchSessions();
});
</script>

<template>
    <div class="station-details">

        <p class="title-1">Информация о станции
            <span class="title-1" style="color: var(--p-primary-900);">
                {{ station?.id || '-' }}
            </span>
        </p>
        <div class="station-info">
            <div class="info">
                <p><strong class="title-3">Номер:</strong> {{ station?.serial || '-' }}</p>
                <p><strong class="title-3">Адрес:</strong> {{ station?.address || '-' }}</p>
                <p><strong class="title-3">Описание:</strong> {{ station?.description || '-' }}</p>
                <p><strong class="title-3">Координаты:</strong><br>
                    <strong>Широта:</strong> {{ station?.latitude || '-' }}<br>
                    <strong>Долгота:</strong> {{ station?.longitude || '-' }}
                </p>
                <p><strong class="title-3">Статус:</strong> {{ station?.status || '-' }}</p>

                <div v-if="station?.connectors?.length">
                    <div class="connectors">
                        <Card v-for="conn in station.connectors" :key="conn.id" class="connector-card">
                            <template #content>
                                <p class="title-3">Коннектор {{ conn.id }}:</p>
                                <p><strong>Тип:</strong> {{ conn.type.name }} ({{ conn.type.current_type }})</p>
                                <p><strong>Мощность:</strong> {{ conn.power }} кВт</p>
                                <p><strong>Статус:</strong> {{ conn.status }}</p>
                            </template>
                        </Card>
                    </div>
                </div>
                <div v-else>
                    <p><strong>Коннекторы:</strong> —</p>
                </div>
            </div>

            <div class="image-wrapper">
                <Galleria :images="imageList"></Galleria>
            </div>
        </div>

        <p class="title-2">Информация о сессиях:</p>
        <div class="filters">
            <MultiSelect v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value"
                placeholder="Статус" />
            <MultiSelect v-model="selectedConnectors" :options="connectorOptions" optionLabel="label"
                optionValue="value" placeholder="Коннектор" />
            <Calendar v-model="period" selectionMode="range" placeholder="Выберите период" :manualInput="false" showIcon
                :maxDate="new Date()" />
        </div>

        <div class="table-container">
            <Table :loading="loading" :data="sessions" :columns="columns" />
        </div>

        <div v-if="loading" style="height: 600px;">
            <Loading />
        </div>
        <SessionsChart v-else :chartData="chartData" :chartDesc="chartDesc" />

    </div>

</template>

<style scoped>
.station-details {
    display: flex;
    flex-direction: column;
    gap: var(--page-large-gap);


    .station-info {
        display: grid;
        grid-template-columns: 2fr 3fr;
        gap: var(--page-large-gap);
        align-items: stretch;
        min-height: 300px;

        @media (max-width: 768px) {
            display: flex;
            flex-direction: column-reverse;
        }

        .info {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            p {
                margin: 0.25rem 0;
            }

            .connectors {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 16px;

                .connector-card {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }
            }
        }

        .image-wrapper {
            height: 600px;
            width: 100%;
            min-height: 300px;

            @media (max-width: 768px) {
                height: 300px;
            }
        }
    }

    .filters {
        display: flex;
        gap: 12px;
        align-items: center;

        @media (max-width: 768px) {
            flex-direction: column;
            align-items: stretch;
        }

    }
}
</style>
