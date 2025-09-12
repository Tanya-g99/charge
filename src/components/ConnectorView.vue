<script setup>
import Card from 'primevue/card';
import { connectorStatusFormat } from '@/lib/EntityFormat';

const props = defineProps({
    data: {
        type: Array[Object],
        required: true
    },
    mode: {
        type: String,
        default: 'full',
        validator: v => ['mini', 'full'].includes(v)
    }
});

const fullFields = [
    { label: 'Тип: ', value: c => `${c.type?.name} (${c.type?.current_type})` },
    { label: 'Мощность: ', value: c => `${c.power} кВт` },
    { label: 'Статус: ', value: c => connectorStatusFormat(c.status), isHtml: true }
];

const miniFields = [
    { label: '', value: c => c.type?.name },
    { label: '', value: c => connectorStatusFormat(c.status), isHtml: true }
];
</script>

<template>
    <div class="connectors">
        <Card v-for="connector in data" class="connector-card">
            <template #content>
                <p v-if="mode === 'full'" class="title-3">
                    Коннектор {{ connector.id }}:
                </p>

                <template v-for="field in (mode === 'full' ? fullFields : miniFields)" :key="field.label">
                    <p>
                        <strong>{{ field.label }}</strong>
                        <span v-if="field.isHtml" v-html="field.value(connector)" />
                        <span v-else>{{ field.value(connector) }}</span>
                    </p>
                </template>
            </template>
        </Card>
    </div>
</template>

<style scoped lang="scss">
.connectors {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(v-bind("props.mode == 'mini' ? '150px' : '220px'"), 1fr));
    gap: v-bind("props.mode == 'mini' ? '8px' : '16px'");

    .connector-card {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
}
</style>
