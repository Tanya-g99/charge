<script setup>
import { onMounted, ref, computed } from 'vue';
import PrimeTable from 'components/PrimeTable2.vue';
import { Stations } from '@/lib/Stations';

// Столбцы таблицы для станций
const columns = ref([
  { field: 'id', title: 'ID', sortable: true },
  { field: 'serial', title: 'Номер' },
  { field: 'address', title: 'Адрес' },
  { field: 'latitude', title: 'Широта' },
  { field: 'longitude', title: 'Долгота' },
  { field: 'status', title: 'Статус', sortable: true },
]);

const stations = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);

// Обработчик изменения страницы и размера страницы
const handlePageChange = async (page, size) => {
  currentPage.value = page;
  pageSize.value = size;

  const response = await Stations.getByPage(currentPage.value, pageSize.value);
  stations.value = response.stations;
  totalRecords.value = response.total;
};

onMounted(async () => {
  const response = await Stations.getByPage(currentPage.value, pageSize.value);
  console.log(response)
  stations.value = response.stations;
  totalRecords.value = response.total;
});
</script>

<template>
  <PrimeTable class="table-h-full" :data="stations" :columns="columns" :currentPage="currentPage" :pageSize="pageSize"
    :totalRecords="totalRecords" @pageChange="handlePageChange" export />
</template>
