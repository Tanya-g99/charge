<script setup>
import { ref, watch, onMounted } from 'vue';
import Calendar from 'primevue/calendar';
import MultiSelect from 'primevue/multiselect';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Button from 'primevue/button';
import _ from "lodash";

import { Stations } from 'lib/Stations';
import { Sessions } from 'lib/Sessions';
import Loading from 'components/Loading.vue';
import Table from 'components/PrimeTable2.vue';
import SessionsChart from 'components/SessionsChart.vue';
import { entity } from '@/lib/EntityMixin';

const loading = ref(true);
const statusOptions = ref([
    { label: 'Активна', value: 1 },
    { label: 'Завершена', value: 2 },
    { label: 'Ошибка', value: 3 }
]);
const connectorOptions = ref([
    { label: '1', value: 1 },
    { label: '2', value: 2 },
]);
const stationOptions = ref();

const selectedStatus = ref([]);
const selectedConnectors = ref([]);
const selectedStations = ref([]);
const period = ref([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date()
]);
const addressSearch = ref('');
const search = ref('');

const chartData = ref([]);
const chartDesc = ref({})

const sessions = ref([]);
const totalSessions = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const fetchSessions = async () => {
    loading.value = true;

    const sessionData = await Sessions.get({
        period: period.value,
        stationIds: selectedStations.value?.slice(),
        selectedStatus: selectedStatus.value?.slice(),
        selectedConnectors: selectedConnectors.value?.slice(),
        currentPage: currentPage.value,
        pageSize: pageSize.value,
        search: search.value
    });

    sessions.value = sessionData.sessions;
    totalSessions.value = sessionData.total || 0;

    const chartRes = await Sessions.getAnalysis({
        period: period.value,
        station_ids: selectedStations.value,
    });

    chartData.value = chartRes.days.map(item => ({ ...item, value: item.session_count || item.value }));
    chartDesc.value = _.pick(chartRes, [
        "session_count",
        "average_session_duration",
        "average_session_count",
        "average_session_consumption"
    ]);

    loading.value = false;
};

watch([selectedStatus, selectedConnectors, selectedStations, addressSearch, () => period.value[1], currentPage], () => {
    if (period.value[1] != null) fetchSessions();
});

const onPageChange = (page, size) => {
    currentPage.value = page;
    pageSize.value = size;
    fetchSessions();
};

onMounted(async () => {
    await Stations.getById().then(response => {
        stationOptions.value = response.stations.map(station => {
            return { label: station.id, value: station.id }
        })
    });
    fetchSessions();
});
</script>

<template>
    <div class="session-analyzer">
        <div class="session-analyzer__filters">
            <div class="session-analyzer__selects">
                <MultiSelect v-model="selectedStatus" :maxSelectedLabels="3" :autoOptionFocus="false"
                    :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Статус" />
                <MultiSelect v-model="selectedConnectors" :maxSelectedLabels="3" :autoOptionFocus="false"
                    :options="connectorOptions" optionLabel="label" optionValue="value" placeholder="Коннектор" />
                <MultiSelect v-model="selectedStations" :maxSelectedLabels="3" :autoOptionFocus="false"
                    :options="stationOptions" optionLabel="label" optionValue="value" placeholder="Станция" />
                <Calendar v-model="period" selectionMode="range" placeholder="Выберите период" :manualInput="false"
                    showIcon :maxDate="new Date()" />
            </div>

            <div class="session-analyzer__search-and-checkboxes">
                <InputGroup>
                    <InputText class="w-full" v-model="search" placeholder="Поиск по адресу зарядной станции..."
                        @keyup.enter="addressSearch = search" />
                    <InputGroupAddon>
                        <Button icon="pi pi-search" severity="secondary" @click="addressSearch = search" />
                    </InputGroupAddon>
                </InputGroup>
            </div>
        </div>
        <div class="session-analyzer__table-container">
            <Table enableExport :loading="loading" :data="sessions" :columns="entity.analyticsEntity"
                :currentPage="currentPage" :pageSize="pageSize" :totalRecords="totalSessions"
                @pageChange="onPageChange" />
        </div>
        <div>
            <p class="title-1">Статистика:</p>
            <div v-if="loading" style="height: 600px;">
                <Loading />
            </div>

            <SessionsChart class="" v-else :chartData="chartData" :chartDesc="chartDesc" />
        </div>

    </div>


</template>

<style scoped lang="scss">
.session-analyzer {
    display: grid;
    grid-template-rows: auto minmax(400px, 1fr) auto;
    gap: var(--page-large-gap);
    height: 100%;
    position: relative;

    &__filters {
        display: flex;
        flex-direction: column;
        gap: var(--page-gap);
        width: fit-content;
    }

    &__selects,
    &__search-and-checkboxes {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    &__search-and-checkboxes {
        justify-content: space-between;
    }

    &__checkboxes {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    &__table-container {
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }

    &__chart-container {
        display: grid;
        grid-template-columns: 2fr 1fr;
    }

    &__cards-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        padding: 16px;
    }

    &__info-card {
        padding: var(--card-large-padding);
        border-radius: var(--cadr-large-radius);
        text-align: center;

        p {
            font-weight: bold;

            @media (min-width: 768px) {
                font-size: 2rem;
            }
        }
    }

    @media (max-width: 768px) {
        &__filters {
            width: 100%;
        }

        &__selects {
            flex-direction: column;
            align-items: stretch;
        }

        &__chart-container {
            grid-template-columns: 1fr;
        }

        &__table-container {
            overflow-x: auto;
        }
    }
}
</style>
