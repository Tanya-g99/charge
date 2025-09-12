<script setup>
import { onMounted, ref, computed } from 'vue';
import PrimeTable from 'components/PrimeTable2.vue';
import Map from 'components/Map.vue';
import { Stations } from 'lib/Stations';
import { useRouter } from 'vue-router';
import { entity } from '@/lib/EntityMixin';
import { SelectButton } from 'primevue';
import { stationFormat } from '@/lib/EntityFormat';

const router = useRouter();
const viewMode = ref('table');
const optionsMode = [
  { label: 'Карта', value: 'map', icon: 'pi pi-map' },
  { label: 'Таблица', value: 'table', icon: 'pi pi-table' }
];

const loading = ref(false);
const stations = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);

const fetchStations = async () => {
  loading.value = true;
  const response = await Stations.getByPage({ page: currentPage.value, pageSize: pageSize.value, expand_connectors: true });
  stations.value = response.stations;
  totalRecords.value = response.total;
  loading.value = false;
}

const handlePageChange = (page, size) => {
  currentPage.value = page;
  pageSize.value = size;

  fetchStations();
};

const rowClick = (station) => {
  router.push(`/stations/${station.id}`)
}

onMounted(fetchStations);
</script>

<template>
  <!-- {{ stations }} -->
  <component :is="viewMode === 'table' ? PrimeTable : Map" :loading="loading" class="table-h-full" :data="stations"
    :columns="entity.stationsEntity" :currentPage="currentPage" :pageSize="pageSize" :totalRecords="totalRecords"
    enableExport showTooltip @pageChange="handlePageChange" @rowClick="rowClick" :tooltipFormatter="stationFormat">
    <template #top>
      <SelectButton v-model="viewMode" :options="optionsMode" optionLabel="label" optionValue="value"
        :optionIcon="option => option.icon" />
    </template>
  </component>
</template>