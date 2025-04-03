<script setup>
import { ref, computed, watch, defineEmits } from 'vue';
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
    },
    pageSize: {
        type: Number,
        default: 10
    },
    currentPage: {
        type: Number,
        default: 1
    },
    totalRecords: {
        type: Number,
        default: 0
    },
    export: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['pageChange']);

const sortColumn = ref(null);
const sortAscending = ref(true);
const pageSize = ref(props.pageSize);

const onPageChange = (event) => {
    const newPage = event.page + 1;
    const newPageSize = event.rows;

    emit('pageChange', newPage, newPageSize);
};

const exportToCSV = () => {
    const headers = props.columns.map(col => col.title);
    const rows = props.data.map(row => props.columns.map(col => row[col.field]));

    console.log(rows)

    let csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "data.csv";
    link.click();

    URL.revokeObjectURL(url);
};
</script>

<template>
    <div class="table-container">
        <div class="table-top">
            <Button v-if="export" icon="pi pi-download" label="Export to CSV" @click="exportToCSV" />
        </div>

        <DataTable :value="data" :sortField="sortColumn" :sortOrder="sortAscending ? 1 : -1" removableSort
            :rowsPerPageOptions="props.pageOptions" scrollable scrollHeight="100%" paginator :rows="pageSize"
            stripedRows
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{currentPage} / {totalPages}" class="p-datatable-striped p-datatable-gridlines"
            :totalRecords="props.totalRecords" @page="onPageChange">

            <Column v-for="col in props.columns" :key="col.field" :field="col.field" :header="col.title"
                :sortable="col.sortable">
            </Column>
        </DataTable>
    </div>
</template>

<style lang="scss" scoped>
.table-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;


    .table-top {
        display: flex;
        justify-content: flex-end;
    }
}
</style>
