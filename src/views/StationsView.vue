<script setup>
import axios from 'axios';
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

// Состояние для хранения станций
const stations = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(100);

// Обработчик изменения страницы и размера страницы
const handlePageChange = async (page, size) => {
  currentPage.value = page;
  pageSize.value = size;
  stations.value = await Stations.getByPage(currentPage.value, pageSize.value, totalRecords.value);
};

onMounted(async () => {
  stations.value = await Stations.getByPage(currentPage.value, pageSize.value, totalRecords.value);
  console.log(stations.value)
});
</script>

<template>
  <PrimeTable class="table-h-full" :data="stations" :columns="columns" :currentPage="currentPage" :pageSize="pageSize"
    :totalRecords="totalRecords" :pageOptions="[5, 10, 20, 50]" @pageChange="handlePageChange" export />
</template>
