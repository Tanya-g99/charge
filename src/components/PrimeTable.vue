<script setup>
import { ref, computed, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

// Пропсы
const props = defineProps({
    columns: {
        type: Array,
        required: true
    },
    data: {
        type: Array,
        required: true
    },
    pageOptions: {
        type: Array,
        default: () => [5, 10, 20, 50]
    }
});

// Сортировка
const sortColumn = ref(null);
const sortAscending = ref(true);
const pageSize = ref(10);
const originalData = ref([...props.data]);

// Обновление данных при изменении props
watch(() => props.data, (newData) => {
    originalData.value = [...newData];
}, { deep: true });

// Обработанные данные (с учетом сортировки)
const paginatedData = computed(() => {
    let sortableData = [...originalData.value];

    if (sortColumn.value) {
        sortableData.sort((a, b) => {
            const direction = sortAscending.value ? 1 : -1;
            return direction * (a[sortColumn.value] > b[sortColumn.value] ? 1 : -1);
        });
    }
    return sortableData;
});

// Экспорт в CSV
const exportToCSV = () => {
    const headers = props.columns.map(col => col.title);
    const rows = props.data.map(row => props.columns.map(col => row[col.name]));

    let csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "data.csv";
    link.click();

    URL.revokeObjectURL(url); // Освобождаем ресурсы
};
</script>

<template>
    <div class="table-container">
        <div class="table-top">
            <Button icon="pi pi-download" label="Export to CSV" class="p-button-sm p-button-primary"
                @click="exportToCSV" />
        </div>

        <DataTable :value="paginatedData" :rows="pageSize" :rowsPerPageOptions="pageOptions" :sortField="sortColumn"
            :sortOrder="sortAscending ? 1 : -1" scrollable scrollHeight="100%" paginator stripedRows
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{currentPage} / {totalPages}" class="p-datatable-striped p-datatable-gridlines"
            @rowSelect="console.log">

            <Column v-for="col in columns" :key="col.name" :field="col.name" :header="col.title"
                :sortable="col.sortable">
            </Column>
        </DataTable>
    </div>
</template>


<style lang="scss" scoped>
.table-container {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.table-top {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.table-container .p-datatable-table,
.p-datatable-table-container {
    height: 100% !important;
}

.p-datatable {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100% !important;
}

.table-container .p-datatable-scrollable-table {
    height: 100% !important;
    display: flex;
    overflow: auto;
}


.p-datatable-gridlines .p-datatable-paginator-bottom {
    display: flex;
    justify-content: end;
}
</style>