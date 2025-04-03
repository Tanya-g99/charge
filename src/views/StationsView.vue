<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import PrimeTable from 'components/PrimeTable2.vue';

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

// Генерация тестовых данных
function generateTestData(page = 1, max_elements = 10) {
  const generateTestRecord = (id) => {
    return {
      id: `ipcharger${id.toString().padStart(4, '0')}`,
      latitude: 50 + (Math.random() * 5), // Random latitude around 50.0
      longitude: 123 + (Math.random() * 5), // Random longitude around 123.0
      status: Math.floor(Math.random() * 3), // Random status (0, 1, 2)
      name: `name_column-${id}`, // Переименовываем поле name
      address: `address_column-${id}`, // Переименовываем поле address
      description: `description_column-${id}`, // Переименовываем поле description
      connector_ids: [1, 2, 3]
    };
  };

  const startIndex = (page - 1) * max_elements;
  const endIndex = startIndex + max_elements;

  const testData = [];
  for (let i = startIndex + 1; i <= Math.min(endIndex, totalRecords.value); i++) {
    testData.push(generateTestRecord(i));
  }

  return testData;
}

// Функция получения данных станций
const getStations = async () => {
  const response = await axios.post('api', {
    "command": "get_stations",
    "token": "5IyJPkWJa3ci50t8em4dEmCmoDHFSQVY",
    "page": currentPage.value,
    "max_elements": pageSize.value,
  });

  if (response.data.response_code === 0) {
    stations.value = response.data.stations;
  } else {
    console.log(response.data)
    stations.value = generateTestData(currentPage.value, pageSize.value);
  }

};

// Обработчик изменения страницы и размера страницы
const handlePageChange = (page, size) => {
  currentPage.value = page;
  pageSize.value = size;
  getStations();
};

onMounted(() => {
  getStations();
});
</script>

<template>
  <PrimeTable :data="stations" :columns="columns" :currentPage="currentPage" :pageSize="pageSize"
    :totalRecords="totalRecords" :pageOptions="[5, 10, 20, 50]" @pageChange="handlePageChange" export />
</template>
