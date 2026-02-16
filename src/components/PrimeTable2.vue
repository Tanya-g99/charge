<script setup>
import { ref, computed, watch, useSlots } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';
import { get } from 'lodash';

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
    enableExport: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['pageChange', "rowClick"]);
const slots = useSlots();

const hasTopSlot = computed(() => !!slots.top);

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
    const rows = props.data.map(row => props.columns.map(col =>
        (col.format ?? ((v) => v))(row[col.field]))
    );

    let csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "data.csv";
    link.click();

    URL.revokeObjectURL(url);
};

const onRowClick = (event) => {
    const rowData = event.data;
    console.log("row click", rowData);
    emit('rowClick', rowData);
};

</script>

<template>
    <div class="table">
        <div v-if="hasTopSlot || enableExport" class="table__top">
            <slot name="top"></slot>
            <Button v-if="enableExport" icon="pi pi-download" label="Export to CSV" @click="dt.exportCSV($event)" />
        </div>

        <DataTable ref="dt" :value="data" :loading="loading" :sortField="sortColumn" :sortOrder="sortAscending ? 1 : -1"
            removableSort scrollable scrollHeight="100%" stripedRows class="p-datatable-striped p-datatable-gridlines"
            @row-click="onRowClick">

            <Column v-for="col in props.columns" :key="col.field" :field="col.field" :header="col.title"
                :sortable="col.sortable">
                <template #body="slotProps">
                    <component v-if="col.view" :is="col.view" :data="get(slotProps.data, col.field)" mode="mini">
                    </component>
                    <div v-else v-html="(col.format ?? ((v) => v))(get(slotProps.data, col.field))"></div>
                </template>
            </Column>

            <template #empty>
                <div class="table__data-empty">
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
.table {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: var(--page-gap);

    &__top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--page-gap);
        width: 100%;
        flex-shrink: 0;
    }

    &__data-empty {
        text-align: center;
    }

    :deep(.p-datatable) {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }

    :deep(.p-datatable-wrapper) {
        flex: 1;
        min-height: 0;
        overflow: auto;
    }
}
</style>
