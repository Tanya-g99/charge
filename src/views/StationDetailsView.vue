<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import Galleria from '@/components/Galleria.vue'
import Calendar from 'primevue/calendar'
import MultiSelect from 'primevue/multiselect'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

import Loading from 'components/Loading.vue'
import Table from 'components/PrimeTable2.vue'
import SessionsChart from 'components/SessionsChart.vue'

import { Sessions } from 'lib/Sessions'
import _ from 'lodash'
import { entity } from '@/lib/EntityMixin'
import { connectorStatusFormat, stationStatusFormat } from '@/lib/EntityFormat'
import { Stations } from '@/lib/Stations'

const route = useRoute()
const stationId = route.params.id
const token = '5IyJPkWJa3ci50t8em4dEmCmoDHFSQVY'

const loading = ref(true)

const isEditing = ref(false)
const editedStation = ref({
    latitude: null,
    longitude: null,
    address: '',
    description: ''
})
const startEditing = () => {
    if (!station.value) return
    isEditing.value = true
    editedStation.value = {
        latitude: station.value.latitude,
        longitude: station.value.longitude,
        address: station.value.address,
        description: station.value.description
    }
}
const saveStationDetails = async () => {
    const payload = {
        command: 'set_station_details',
        token,
        station_id: stationId,
        latitude: editedStation.value.latitude,
        longitude: editedStation.value.longitude,
        address: editedStation.value.address,
        description: editedStation.value.description
    }

    try {
        const res = await axios.post('/api/', payload);
        if (res.data.response_code === 0) {
            await fetchStationDetails();
            isEditing.value = false;
        } else {
            alert('Ошибка при сохранении данных станции.');
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
        alert('Ошибка сети при сохранении.');
    }
}

const period = ref([new Date(new Date().setMonth(new Date().getMonth() - 1)), new Date()])
const selectedStatus = ref([])
const selectedConnectors = ref([])
const statusOptions = ref([
    { label: 'Активна', value: 1 },
    { label: 'Завершена', value: 2 },
    { label: 'Ошибка', value: 3 }
]);
const connectorOptions = ref([
    { label: '1', value: 1 },
    { label: '2', value: 2 }
]);

const sessions = ref([]);
const currentPageSessions = ref(1);
const pageSizeSessions = ref(10);
const totalRecordsSessions = ref(0);
const chartData = ref([]);
const chartDesc = ref({});
const station = ref(null);
const imageList = ref([]);

const fetchStationDetails = async () => {
    await Stations.get(stationId).then((response) => {
        station.value = response.stations[0]
    });

    if (station.value?.image_ids?.length) {
        imageList.value = await Stations.getImages(stationId, station.value.image_ids);
    }
}

const fetchSessions = async () => {
    loading.value = true;

    Sessions.get({
        period: period.value,
        selectedStatus: selectedStatus.value?.slice(),
        selectedConnectors: selectedConnectors.value?.slice(),
        currentPage: currentPageSessions.value,
        pageSize: pageSizeSessions.value,
        stationIds: stationId,
    }).then(response => {
        if (response.response_code === 0) {
            sessions.value = response.sessions
            totalRecordsSessions.value = response.total || 0
        }
    }
    )


    Sessions.getAnalysis({
        period: period.value,
        stationsIds: stationId
    }).then(chartRes => {
        if (chartRes.response_code === 0) {
            chartData.value = chartRes.days.map((d) => ({ date: d.date, value: d.session_count }))
            chartDesc.value = _.pick(chartRes, [
                'session_count',
                'average_session_duration',
                'average_session_count',
                'average_session_consumption'
            ])
        }
    })

    loading.value = false
}

watch([currentPageSessions, pageSizeSessions, selectedStatus, selectedConnectors, () => period.value[1]], () => {
    if (period.value[1]) fetchSessions()
})

onMounted(async () => {
    await fetchStationDetails()
    await fetchSessions()
})
</script>

<template>
    <div class="station-details">
        <p class="title-1">
            Информация о станции
            <span class="title-1" style="color: var(--p-primary-900)">
                {{ station?.id || '-' }}
            </span>
        </p>
        <div class="station-info">
            <div class="info">
                <p><strong class="title-3">Номер: </strong> {{ station?.serial || '-' }}</p>

                <p>
                    <strong class="title-3">Адрес: </strong>
                    <template v-if="isEditing">
                        <InputText v-model="editedStation.address" />
                    </template>
                    <template v-else>
                        {{ station?.address || '-' }}
                    </template>
                </p>

                <p>
                    <strong class="title-3">Описание: </strong>
                    <template v-if="isEditing">
                        <Textarea v-model="editedStation.description" autoResize rows="3" class="w-full" />
                    </template>
                    <template v-else>
                        {{ station?.description || '-' }}
                    </template>
                </p>

                <p><strong class="title-3">Координаты: </strong><br>
                    <strong>Широта: </strong>
                    <template v-if="isEditing">
                        <InputText v-model="editedStation.latitude" type="number" />
                    </template>
                    <template v-else>
                        {{ station?.latitude || '-' }}
                    </template><br>

                    <strong>Долгота: </strong>
                    <template v-if="isEditing">
                        <InputText v-model="editedStation.longitude" type="number" />
                    </template>
                    <template v-else>
                        {{ station?.longitude || '-' }}
                    </template>
                </p>

                <p>
                    <strong class="title-3">Статус: </strong>
                    <span v-html="stationStatusFormat(station?.status) ?? '-'"></span>
                </p>


                <div v-if="station?.connectors?.length">
                    <div class="connectors">
                        <Card v-for="conn in station.connectors" :key="conn.id" class="connector-card">
                            <template #content>
                                <p class="title-3">Коннектор {{ conn.id }}:</p>
                                <p><strong>Тип:</strong> {{ conn.type.name }} ({{ conn.type.current_type }})</p>
                                <p><strong>Мощность:</strong> {{ conn.power }} кВт</p>
                                <p><strong>Статус: </strong>
                                    <span v-html="connectorStatusFormat(conn.status)"></span>
                                </p>
                            </template>
                        </Card>
                    </div>
                </div>
                <div v-else>
                    <p><strong>Коннекторы:</strong> —</p>
                </div>

                <div style="margin-top: 1rem;">
                    <Button v-if="!isEditing" @click="startEditing" label="Редактировать" icon="pi pi-pencil"
                        severity="primary" />
                    <div v-else class="flex align-items-center gap-2">
                        <Button @click="saveStationDetails" label="Сохранить" icon="pi pi-check" severity="success" />
                        <Button @click="isEditing = false" label="Отмена" icon="pi pi-times" severity="secondary" />
                    </div>
                </div>
            </div>

            <div class="image-wrapper">
                <Galleria :images="imageList"></Galleria>
            </div>
        </div>

        <p class="title-2">Информация о сессиях:</p>
        <div class="filters">
            <MultiSelect v-model="selectedStatus" :maxSelectedLabels="3" :options="statusOptions" optionLabel="label"
                optionValue="value" placeholder="Статус" />
            <MultiSelect v-model="selectedConnectors" :maxSelectedLabels="3" :options="connectorOptions"
                optionLabel="label" optionValue="value" placeholder="Коннектор" />
            <Calendar v-model="period" selectionMode="range" placeholder="Выберите период" :manualInput="false" showIcon
                :maxDate="new Date()" />
        </div>

        <div class="table-container">
            <Table :loading="loading" :data="sessions" :columns="entity.stationEntity"
                :totalRecords="totalRecordsSessions" :pageSize="pageSizeSessions" :currentPage="currentPageSessions" />
        </div>

        <div v-if="loading" style="height: 600px">
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