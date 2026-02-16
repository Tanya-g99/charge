<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

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

const currentPage = ref(1);
const pageSize = ref(10);

const sortColumn = ref(null); // Активное поле сортировки
const sortAscending = ref(true); // Направление сортировки
const originalData = ref([...props.data]); // Сохраняем исходные данные

// Количество страниц
const totalPages = computed(() => Math.ceil(props.data.length / pageSize.value));

// Обработанные данные с учетом сортировки и пагинации
const paginatedData = computed(() => {
    let sortableData = [...originalData.value];

    if (sortColumn.value) {
        sortableData.sort((a, b) => {
            const direction = sortAscending.value ? 1 : -1;
            const comparison = (a[sortColumn.value] > b[sortColumn.value]) ? 1 :
                (a[sortColumn.value] < b[sortColumn.value]) ? -1 :
                    0;
            return direction * comparison;
        });
    }

    const startIndex = (currentPage.value - 1) * pageSize.value;
    return sortableData.slice(startIndex, startIndex + pageSize.value);
});

// Функция сортировки
const sortByColumn = (columnName) => {
    const column = props.columns.find(col => col.name === columnName);

    if (!column || !column.sortable) return; // Проверяем, можно ли сортировать

    if (sortColumn.value !== columnName) { // Если новая колонка — обновляем сортировку
        sortColumn.value = columnName;
        sortAscending.value = true;
    } else {
        if (sortAscending.value) { // Если повторный клик — меняем порядок
            sortAscending.value = false;
        } else if (!sortAscending.value) { // Если второй повторный клик — сбрасываем сортировку
            sortColumn.value = null;
            sortAscending.value = true;
        }
    }
};

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

// Следим за изменением данных (например, если приходит новый массив)
watch(() => props.data, (newData) => {
    originalData.value = [...newData];
}, { deep: true });

watch(pageSize, () => {
    currentPage.value = 1; // Сброс на первую страницу при смене размера
});

const headerRow = ref(null);
const columnWidths = ref([]);

const calculateColumnWidths = () => {
    if (headerRow.value) {
        const cells = headerRow.value.querySelectorAll('th');
        columnWidths.value = Array.from(cells).map(cell => cell.offsetWidth);
    }
};

const getColumnStyle = (index) => {
    return { width: columnWidths.value[index] + 'px' };
};

onMounted(() => {
    nextTick(() => {
        calculateColumnWidths();
    });
});
</script>

<template>
    <div class="table">
        <div class="table__top">
            <button @click="exportToCSV" class="btn">
                <font-awesome-icon icon="download" class="icon" />
                <p>Export to CSV</p>
            </button>
        </div>



        <div class="table__wrapper">
            <table class="table__table">
                <thead>
                    <tr ref="headerRow" class="table__header-row">
                        <th v-for="(column, index) in columns" :key="index" @click="sortByColumn(column.name)"
                            :class="{ 'table__header-cell--sortable': column.sortable }" :style="getColumnStyle(index)">
                            <span>{{ column.title }}</span>
                            <font-awesome-icon v-if="column.sortable" :icon="sortAscending ? 'arrow-down' : 'arrow-up'"
                                class="table__sort-icon"
                                :class="{ 'table__sort-icon--faded': sortColumn !== column.name }" />
                        </th>
                    </tr>
                </thead>

                <!-- Тело таблицы с прокруткой -->
                <tbody>
                    <tr v-for="(row, index) in paginatedData" :key="index">
                        <td v-for="(column, colIndex) in props.columns" :key="colIndex"
                            :style="getColumnStyle(colIndex)">
                            {{ row[column.name] }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Пагинация -->
        <div class="table__pagination">

            <!-- Выбор количества отображаемых элементов -->
            <div class="table__page-size-selector">
                <label for="pageSize">
                    Элементов на странице:
                </label>
                <select v-model="pageSize" id="pageSize">
                    <option v-for="option in props.pageOptions" :key="option" :value="option">
                        {{ option }}
                    </option>
                </select>
            </div>

            <div class="table__pagination-controls">
                <!-- Кнопки для переключения страниц -->
                <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1">
                    <font-awesome-icon icon="chevron-left" class="chevron-icon" />
                </button>
                <span>Page {{ currentPage }} / {{ totalPages }}</span>
                <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage === totalPages">
                    <font-awesome-icon icon="chevron-right" class="chevron-icon" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.table {

    /* Скрыть скроллбар */
    ::-webkit-scrollbar,
    ::-webkit-scrollbar {
        width: 0px;
        height: 0px;
    }

    scrollbar-width: none;

    display: flex;
    gap: 1rem;
    flex-direction: column;
    height: 100%;
    padding: 16px;

    &__top {
        display: flex;
        justify-content: flex-end;
    }

    &__wrapper {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: auto;
        border-bottom: none;
        border-right: none;
    }

    &__table {
        width: 100%;
        background: var(--color-table-bg);
        color: var(--color-text);
        border-collapse: collapse;

        th,
        td {
            padding: 12px;
            border: 1px solid var(--color-table-border);
            white-space: nowrap;
        }

        th {
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s ease;
        }

        tbody tr:nth-child(even) {
            background-color: var(--color-table-row);
        }

        tbody tr:hover {
            background-color: var(--color-table-hover);
        }
    }

    &__header-cell {
        &--sortable {
            cursor: pointer;

            &:hover {
                background-color: var(--color-table-header-hover);
            }
        }
    }

    &__header-row {
        position: sticky;
        top: 0;
        background-color: var(--color-table-bg);
        z-index: 10;
        width: 100%;
        color: var(--color-text-primary);

        th,
        td {
            background: var(--color-table-header);
            border-top: none;
        }

        span {
            font-weight: bold;
        }
    }

    &__sort-icon {
        margin-left: 8px;
        transition: transform 0.3s ease;

        &--faded {
            opacity: 0.5;
        }
    }

    &__pagination {
        display: flex;
        justify-content: end;
        gap: 16px;
        padding: 0 16px;
    }

    &__page-size-selector {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: var(--color-text-muted);
        gap: 2px;

        select {
            padding: 2px;
            border: 1px solid var(--color-border);
            background: var(--color-bg);
            color: var(--color-text);
            cursor: pointer;
            transition: background 0.2s ease;

            option {
                background: var(--color-card-bg);
            }

            option:checked,
            option:hover {
                background: var(--color-primary);
                color: var(--color-text-primary);
            }
        }
    }

    &__pagination-controls {
        display: flex;
        align-items: center;
        gap: 8px;

        span {
            font-size: 14px;
            font-weight: 500;
            color: var(--color-text);
        }

        button {
            padding: 6px 10px;
            border: none;
            border-radius: 6px;
            background: var(--color-button);
            color: var(--color-button-text);
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.1s ease;

            &:hover {
                background: var(--color-button-hover);
            }

            &:active {
                transform: scale(0.95);
            }

            &:disabled {
                background: var(--color-button-disabled);
                cursor: not-allowed;
            }
        }
    }
}
</style>
