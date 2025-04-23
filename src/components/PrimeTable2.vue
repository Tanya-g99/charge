<script setup>
import { ref, computed, watch, defineEmits } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';
import Loading from '@/components/Loading.vue';

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
        default: () => [5, 10, 20, 40]
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
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['pageChange']);

const dt = ref()
const sortColumn = ref(null);
const sortAscending = ref(true);
const pageSize = ref(props.pageSize);

const onPageChange = (event) => {
    let newPage = event.page + 1;
    const newPageSize = event.rows;
    if (props.pageSize != newPageSize) {
        newPage = 1;
    }
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
        <div v-if="export" class="table-top">
            <Button v-if="export" icon="pi pi-download" label="Export to CSV" @click="dt.exportCSV($event)" />
        </div>

        <DataTable ref="dt" :value="data" :loading="loading" :sortField="sortColumn" :sortOrder="sortAscending ? 1 : -1"
            removableSort scrollable scrollHeight="100%" stripedRows class="p-datatable-striped p-datatable-gridlines">

            <Column v-for="col in props.columns" :key="col.field" :field="col.field" :header="col.title"
                :sortable="col.sortable">
            </Column>

            <template #empty>
                <div class="data-empty">
                    Нет данных для отображения
                </div>
            </template>
            <template #footer>
                <Paginator :rows="pageSize" :totalRecords="props.totalRecords" :rowsPerPageOptions="props.pageOptions"
                    @page="onPageChange"
                    template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{currentPage} / {totalPages}" />
            </template>
        </DataTable>


    </div>
</template>

<style lang="scss" scoped>
.table-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--page-gap);


    .table-top {
        display: flex;
        justify-content: flex-end;
        gap: var(--page-gap);
    }

    .data-empty {
        text-align: center;
    }
}
</style>
