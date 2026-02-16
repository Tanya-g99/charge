import { stationStatusFormat, connectorFormat } from "./EntityFormat";
import ConnectorView from "@/components/ConnectorView.vue";

export const entity = {
    stationsEntity: [
        { field: 'id', title: 'ID', sortable: true },
        { field: 'serial', title: 'Номер' },
        { field: 'connectors', title: 'Коннекторы', view: ConnectorView, exportFormat: connectorFormat },
        { field: 'address', title: 'Адрес' },
        { field: 'latitude', title: 'Широта' },
        { field: 'longitude', title: 'Долгота' },
        { field: 'status', title: 'Статус', sortable: true, format: stationStatusFormat, exportFormat: stationStatusFormat },
    ],

    stationEntity: [
        { field: 'connector_id', title: 'Коннектор' },
        { field: 'period.from', title: 'Начало' },
        { field: 'period.to', title: 'Окончание' },
        { field: 'status', title: 'Статус' },
        { field: 'consumption', title: 'Потребление (кВт·ч)' },
    ],

    analyticsEntity: [
        { field: 'station_id', title: 'Станция', sortable: true },
        { field: 'connector_id', title: 'Коннектор', sortable: true },
        { field: 'period.from', title: 'Начало', sortable: true },
        { field: 'period.to', title: 'Окончание', sortable: true },
        { field: 'status', title: 'Статус', sortable: true, },
        { field: 'consumption', title: 'Потребление (кВт·ч)', sortable: true },
    ],

};
