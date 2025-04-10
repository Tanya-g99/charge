<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import Calendar from 'primevue/calendar';
import MultiSelect from 'primevue/multiselect';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Table from 'components/PrimeTable2.vue';
import Chart from 'components/Chart.vue';
import Card from 'primevue/card';
import _ from "lodash";
import { Stations } from '@/lib/Stations';

const statusOptions = ref([
    { label: 'Активна', value: 1 },
    { label: 'Завершена', value: 2 },
    { label: 'Ошибка', value: 3 }
]);
const connectorOptions = ref([
    { label: 'Тип 1', value: 1 },
    { label: 'Тип 2', value: 2 },
    { label: 'Тип 3', value: 3 }
]);
const stationOptions = ref();

const selectedStatus = ref([]);
const selectedConnectors = ref([]);
const selectedStations = ref([]);
const period = ref([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date()
]);
const searchQuery = ref('');
const checkbox1 = ref(false);

const chartData = ref([]);
const chartDesc = ref({})

const sessions = ref([]);
const totalSessions = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const columns = ref([
    { field: 'station_id', title: 'Станция', sortable: true },
    { field: 'connector_id', title: 'Коннектор' },
    { field: 'period.from', title: 'Начало', sortable: true },
    { field: 'period.to', title: 'Окончание', sortable: true },
    { field: 'status', title: 'Статус', sortable: true },
    { field: 'consumption', title: 'Потребление (кВт·ч)', sortable: true }
]);

const fetchSessions = async () => {
    const response = await axios.post('api', {
        "command": 'get_sessions',
        "token": "5IyJPkWJa3ci50t8em4dEmCmoDHFSQVY",
        "connector_types": selectedConnectors.value,
        "period": {
            "from": period.value[0] ? period.value[0].toISOString().split('T')[0] : null,
            "to": period.value[1] ? period.value[1].toISOString().split('T')[0] : null
        },
        "status": selectedStatus.value,
        "stations": selectedStations.value,
        "page": currentPage.value,
        "max_elements": pageSize.value,
        "details": [{ "station": {} }]
    });

    if (response.data.response_code === 0) {
        sessions.value = response.data.sessions;
        totalSessions.value = response.data.total || 0;
        console.log(sessions.value)
        const sessionAnalysis = generateTestChartData();
        chartData.value = sessionAnalysis.days;
        chartDesc.value = _.pick(sessionAnalysis, ["session_count", "average_session_duration", "average_session_count", "average_session_consumption"]);

    } else {
        console.log(currentPage.value, pageSize.value)
        sessions.value = generateTestSessions(currentPage.value, pageSize.value);

        const sessionAnalysis = generateTestChartData();
        chartData.value = sessionAnalysis.days;
        chartDesc.value = _.pick(sessionAnalysis, ["session_count", "average_session_duration", "average_session_count", "average_session_consumption"]);
    }

};

const generateTestSessions = (page, size) => {
    const testSessions = [];
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    for (let i = startIndex + 1; i <= endIndex; i++) {
        testSessions.push({
            id: i,
            station: {
                id: i,
                latitude: 55.0 + (i * 0.1),
                longitude: 37.0 + (i * 0.1),
                status: i % 2,
                address: `Город ${i}, Улица ${i}`,
                description: `Описание станции ${i}`,
                connectors: [1, 2, 3],
                image_ids: [i, i + 1]
            },
            connector_id: (i % 3) + 1,
            period: {
                from: `2024-07-${String(i).padStart(2, '0')} 10:00:00`,
                to: `2024-07-${String(i).padStart(2, '0')} 12:00:00`
            },
            status: (i % 3) + 1,
            power: 20 + (i * 0.5),
            consumption: 10 + (i * 0.3)
        });
    }

    return testSessions;
};

function generateTestChartData(numDays = 30) {
    const response = {
        response_code: 0,
        days: [],
        session_count: 0,
        average_session_duration: "02:02:00",
        average_session_count: 4,
        average_session_consumption: 10.0
    };

    let totalSessions = 0;

    for (let i = 0; i < numDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toLocaleDateString("ru-RU");

        const sessionCount = Math.floor(Math.random() * 10) + 1;
        totalSessions += sessionCount;

        response.days.push({
            date: formattedDate,
            value: sessionCount
        });
    }

    response.session_count = totalSessions;

    return response;
}

watch([selectedStatus, selectedConnectors, selectedStations, period, currentPage], fetchSessions);

const onPageChange = (page, size) => {
    currentPage.value = page;
    pageSize.value = size;
    fetchSessions();
};

onMounted(async () => {
    stationOptions.value = (await Stations.get()).map(station => {
        return { label: station.id, value: station.id }
    });
    fetchSessions();
});
</script>

<template>
    <div class="session-analyzer">
        <!-- Фильтры -->
        <div class="filters">
            <div class="selects">
                <MultiSelect v-model="selectedStatus" autoOptionFocus="false" :options="statusOptions"
                    optionLabel="label" optionValue="value" placeholder="Статус" />
                <MultiSelect v-model="selectedConnectors" autoOptionFocus="false" :options="connectorOptions"
                    optionLabel="label" optionValue="value" placeholder="Тип коннектора" />
                <MultiSelect v-model="selectedStations" autoOptionFocus="false" :options="stationOptions"
                    optionLabel="label" optionValue="value" placeholder="Станция" />
                <Calendar v-model="period" selectionMode="range" placeholder="Выберите период" :manualInput="false"
                    showIcon />
            </div>

            <!-- Поиск и чекбоксы -->
            <div class="search-and-checkboxes">
                <InputText class="w-full" v-model="searchQuery" placeholder="Поиск..." />
            </div>
        </div>
        <div class="table-container">
            <Table :data="sessions" :columns="columns" :pageOptions="[5, 10, 20, 50]" :currentPage="currentPage"
                :pageSize="pageSize" :totalRecords="totalSessions" @pageChange="onPageChange" />
        </div>
        <p>Статистика:</p>
        <div class="chart-container">
            <Chart style="height: 100%;" :dataPoints="chartData" />

            <div v-if="Object.keys(chartDesc).length" class="cards-container">
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
    </div>


</template>

<style scoped>
.session-analyzer {
    display: grid;
    grid-template-rows: auto minmax(400px, 1fr) auto auto;
    gap: var(--page-large-gap);
    height: 100%;
    position: relative;


    .filters {
        display: flex;
        flex-direction: column;
        gap: var(--page-gap);
        width: fit-content;


        .selects,
        .search-and-checkboxes {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .search-and-checkboxes {
            justify-content: space-between;
        }

        .checkboxes {
            display: flex;
            gap: 10px;
            align-items: center;
        }
    }

    .table-container {
        height: 100%;
    }

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
}

@media (max-width: 768px) {
    .session-analyzer {

        .filters {
            width: 100%;

            .selects {
                flex-direction: column;
                align-items: stretch;
            }

        }

        .chart-container {
            grid-template-columns: 1fr;

        }

        .table-container {
            overflow-x: auto;
        }
    }
}
</style>
