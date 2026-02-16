<script setup>
import { onMounted, ref, watch } from 'vue';
import PrimeTable from 'components/PrimeTable2.vue';
import Map from 'components/Map.vue';
import MultiSelect from 'primevue/multiselect';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Button from 'primevue/button';
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

const statusOptions = ref([
  { label: 'Работает', value: 'Online' },
  { label: 'Не работает', value: 'Offline' },
  { label: 'Занята', value: 'Occupied' }
]);

const connectorOptions = ref([
  { label: '1', value: 1 },
  { label: '2', value: 2 },
]);

const selectedStatus = ref([]);
const selectedConnectors = ref([]);
const addressSearch = ref('');
const search = ref('');

const fetchStations = async () => {
  loading.value = true;
  const response = await Stations.getByPage({
    page: currentPage.value,
    pageSize: pageSize.value,
    expand_connectors: true,
    address: addressSearch.value || undefined,
    status: selectedStatus.value?.length > 0 ? selectedStatus.value : undefined,
    connector_types: selectedConnectors.value?.length > 0 ? selectedConnectors.value : undefined
  });
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

// Сбрасываем на первую страницу при изменении фильтров
watch([selectedStatus, selectedConnectors, addressSearch], () => {
  currentPage.value = 1;
  fetchStations();
});

onMounted(() => {
  fetchStations();
});
</script>

<template>
  <div class="stations-view">
    <div class="stations-view__filters">
      <div class="stations-view__selects">
        <MultiSelect v-model="selectedStatus" :maxSelectedLabels="3" :autoOptionFocus="false" :options="statusOptions"
          optionLabel="label" optionValue="value" placeholder="Статус" />
        <MultiSelect v-model="selectedConnectors" :maxSelectedLabels="3" :autoOptionFocus="false"
          :options="connectorOptions" optionLabel="label" optionValue="value" placeholder="Коннектор" />
      </div>

      <div class="stations-view__search">
        <InputGroup>
          <InputText class="w-full" v-model="search" placeholder="Поиск по адресу..."
            @keyup.enter="addressSearch = search" />
          <InputGroupAddon>
            <Button icon="pi pi-search" severity="secondary" @click="addressSearch = search" />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>

    <component :is="viewMode === 'table' ? PrimeTable : Map" :loading="loading" class="stations-view__table"
      :data="stations" :columns="entity.stationsEntity" :currentPage="currentPage" :pageSize="pageSize"
      :totalRecords="totalRecords" enableExport showTooltip @pageChange="handlePageChange" @rowClick="rowClick"
      :tooltipFormatter="stationFormat">
      <template #top>
        <SelectButton v-model="viewMode" :options="optionsMode" optionLabel="label" optionValue="value"
          :optionIcon="option => option.icon" />
      </template>
    </component>
  </div>
</template>

<style scoped lang="scss">
.stations-view {
  display: flex;
  flex-direction: column;
  gap: var(--page-gap);
  height: 100%;

  &__filters {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    width: fit-content;
  }

  &__selects {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__search {
    display: flex;
    align-items: center;
    min-width: 200px;
  }

  &__table {
    flex: 1;
    min-height: 0;
  }

  @media (max-width: 768px) {
    &__filters {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
    }

    &__search {
      min-width: unset;
    }

    &__selects {
      flex-direction: column;
      align-items: stretch;
    }
  }
}
</style>