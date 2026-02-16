export {
    stationStatusFormat,
    stationFormat,
    connectorStatusFormat,
    connectorFormat,
}

function stationStatusFormat(stationStatus) {
    switch (stationStatus) {
        case "Online": return "<span style='color: var(--color-success)'>Свободна</span>";
        case 2: return "<span style='color: var(--color-text-muted)'>Занята</span>";
        case "Offline": return "<span style='color: var(--color-error)'>Выведена из эксплутации</span>";
        default: return stationStatus;
    }
}

function stationFormat(station) {
    return `
            <p>
                <strong class="title-3">Станция ${station?.serial || '-'}</strong> 
            </p>

            <p>
                <strong class="title-3">Адрес: </strong> 
                ${station?.address || '-'}
            </p>

            <p>
                <strong class="title-3">Описание: </strong>
                ${station?.description || '-'}
            </p>

            <p>
                <strong class="title-3">Статус: </strong>
                ${stationStatusFormat(station?.status) ?? '-'}
            </p>`;
}

function connectorStatusFormat(connectorStatus) {
    switch (connectorStatus) {
        case "Available": return "<span style='color: var(--color-success)'>Свободен</span>";
        case "Charging": return "<span style='color: var(--color-text-muted)'>Занят</span>";
        case "Preparing": return "<span style='color: var(--color-info)'>Забронирован</span>";
        case "Failing": return "<span style='color: var(--color-error)'>Неисправен</span>";
        default: return `${connectorStatus}`;
    }
}

function connectorFormat(connector) {
    console.log(connector);
}