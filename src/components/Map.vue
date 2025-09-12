<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';


const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    loading: Boolean,

    latField: {
        type: [String, Function],
        default: 'latitude'
    },
    lngField: {
        type: [String, Function],
        default: 'longitude'
    },

    showTooltip: {
        type: Boolean,
        default: false
    },
    tooltipFormatter: {
        type: Function,
        default: (item) => item.name ?? 'Объект'
    },
    defaultCenter: {
        type: Array,
        default: () => [55.75, 37.61] // Москва по умолчанию
    },
    defaultZoom: {
        type: Number,
        default: 9
    }
});

const emit = defineEmits(['rowClick']);

const map = ref(null);
const mapContainer = ref(null);
let markersCluster = null;

async function initMap() {
    await nextTick();

    const container = mapContainer.value;
    if (!container || container.clientHeight < 50) {
        setTimeout(initMap, 100);
        return;
    }

    map.value = L.map(container).setView(props.defaultCenter, props.defaultZoom);

    map.value.attributionControl.setPrefix('')

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.value);

    await nextTick();
    map.value.invalidateSize();

    markersCluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnEveryZoom: true
    });
    map.value.addLayer(markersCluster);

    updateMarkers();
}

onMounted(() => {
    initMap();
});

watch(() => props.data, () => {
    // console.log(props.data)
    updateMarkers();
    console.log(props.data)
}, { deep: true });

function resolveField(item, field) {
    if (typeof field === 'function') return field(item);
    return item[field];
}

function updateMarkers() {
    console.log("updateMarkers")
    if (!map.value || !markersCluster) return;

    markersCluster.clearLayers();

    const points = [];

    props.data.forEach(elem => {
        const lat = resolveField(elem, props.latField);
        const lng = resolveField(elem, props.lngField);

        if (!lat || !lng) return;

        const marker = L.marker([lat, lng]);

        if (props.showTooltip) {
            console.log(elem)
            marker.bindTooltip(props.tooltipFormatter(elem), {
                permanent: false,
                direction: 'top'
            });
        }
        marker.on('click', () => emit('rowClick', elem));

        markersCluster.addLayer(marker);
        points.push([lat, lng]);
    });

    if (points.length) {
        const bounds = L.latLngBounds(points);
        map.value.fitBounds(bounds.pad(0.2), { maxZoom: 14 });
    } else {
        map.value.setView(props.defaultCenter, props.defaultZoom);
    }
}
</script>

<template>
    <div class="stations-map">
        <div class="map-top">
            <slot name="top" />
        </div>
        <div ref="mapContainer" class="map-container" />
    </div>
</template>

<style scoped>
.stations-map {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.map-top {
    margin-bottom: 1rem;
}

.map-container {
    flex-grow: 1;
    height: 100%;
    min-height: 400px;
}
</style>
