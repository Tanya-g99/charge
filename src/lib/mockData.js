const STATION_TOTAL = 50
const SESSION_TOTAL = 200
const MAX_CONNECTORS = 4
const STATION_LAT_RANGE = [50, 55]
const STATION_LNG_RANGE = [123, 128]
const CONNECTOR_POWER_RANGE = [20, 100]
const SESSION_POWER_RANGE = [10, 50]
const SESSION_CONSUMPTION_RANGE = [5, 20]
const SESSION_ANALYSIS_DAYS = 30

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function randomStatus() {
    const statuses = ["Available", "Charging", "Preparing", "Failing"]
    return statuses[randomInt(0, statuses.length - 1)]
}

function createConnector(id) {
    return {
        id: `connector_${id}`,
        type: {
            name: `type_${id}`,
            current_type: `type_${randomInt(1, 3)}`
        },
        power: randomInt(...CONNECTOR_POWER_RANGE),
        status: randomStatus()
    }
}

function createStation(id) {
    return {
        id: `station${id.toString().padStart(4, '0')}`,
        serial: `serial${id}`,
        latitude: randomFloat(...STATION_LAT_RANGE, 6),
        longitude: randomFloat(...STATION_LNG_RANGE, 6),
        status: randomInt(0, 2),
        name: `Station-${id}`,
        address: `Address-${id}`,
        description: `Description for station ${id}`,
        connectors: Array.from(
            { length: randomInt(1, MAX_CONNECTORS) },
            (_, i) => createConnector(id * 10 + i)
        )
    }
}

function createSession(id) {
    const date = new Date()
    date.setDate(date.getDate() - id)

    return {
        id,
        station_id: `station_${randomInt(1, STATION_TOTAL)}`,
        station: createStation(randomInt(1, STATION_TOTAL)),
        connector_id: randomInt(1, MAX_CONNECTORS),
        period: {
            from: new Date(date.setHours(10, 0, 0)).toISOString(),
            to: new Date(date.setHours(12, 0, 0)).toISOString()
        },
        status: randomInt(1, 3),
        power: randomInt(...SESSION_POWER_RANGE),
        consumption: randomFloat(...SESSION_CONSUMPTION_RANGE)
    }
}

export function generateStations(page = 1, pageSize = 10, total = STATION_TOTAL) {
    const startIndex = (page - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, total)

    const stations = []
    for (let i = startIndex + 1; i <= endIndex; i++) {
        stations.push(createStation(i))
    }

    return {
        response_code: 0,
        stations,
        total
    }
}

export function generateSessions(page = 1, pageSize = 10, total = SESSION_TOTAL) {
    const startIndex = (page - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, total)

    const sessions = []
    for (let i = startIndex + 1; i <= endIndex; i++) {
        sessions.push(createSession(i))
    }

    return {
        response_code: 0,
        sessions,
        total
    }
}

export function generateSessionsAnalysis(daysCount = SESSION_ANALYSIS_DAYS) {
    const days = []
    let total = 0

    for (let i = 0; i < daysCount; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        const count = randomInt(1, 15)
        total += count

        days.push({
            date: date.toLocaleDateString("ru-RU"),
            value: count
        })
    }

    return {
        response_code: 0,
        days,
        session_count: total,
        average_session_duration: "02:15:00",
        average_session_count: Math.round(total / daysCount),
        average_session_consumption: randomFloat(...SESSION_CONSUMPTION_RANGE)
    }
}
