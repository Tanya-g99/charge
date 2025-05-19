<script setup>
import { onMounted, ref, computed } from 'vue';
import PrimeTable from 'components/PrimeTable2.vue';
import { Stations } from 'lib/Stations';
import { useRouter } from 'vue-router';

const router = useRouter();
// Столбцы таблицы для станций
const columns = ref([
  { field: 'id', title: 'ID', sortable: true },
  { field: 'serial', title: 'Номер' },
  { field: 'address', title: 'Адрес' },
  { field: 'latitude', title: 'Широта' },
  { field: 'longitude', title: 'Долгота' },
  { field: 'status', title: 'Статус', sortable: true },
]);

const loading = ref(false);
const stations = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);

const fetchStations = async () => {
  loading.value = true;
  const response = await Stations.getByPage(currentPage.value, pageSize.value);
  console.log(response)
  stations.value = response.stations;
  totalRecords.value = response.total;
  loading.value = false;
}

// Обработчик изменения страницы и размера страницы
const handlePageChange = (page, size) => {
  currentPage.value = page;
  pageSize.value = size;

  fetchStations();
};

const rowClick = (station) => {
  console.log("Stt", station.id)
  router.push(`/stations/${station.id}`)
}

onMounted(fetchStations);
</script>

<template>
  <PrimeTable :loading="loading" class="table-h-full" :data="stations" :columns="columns" :currentPage="currentPage"
    :pageSize="pageSize" :totalRecords="totalRecords" export @pageChange="handlePageChange" @rowClick="rowClick" />
</template>