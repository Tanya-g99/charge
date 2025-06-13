import axios from 'axios';

const TOKEN = "5IyJPkWJa3ci50t8em4dEmCmoDHFSQVY";

function generateTestSessions(page = 1, size = 10, total = 100) {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const sessions = [];

    for (let i = startIndex + 1; i <= Math.min(endIndex, total); i++) {
        sessions.push({
            id: i,
            station_id: 'TestStation',
            station: {
                id: 'Станция',
                latitude: 55.0 + (i * 0.1),
                longitude: 37.0 + (i * 0.1),
                status: i % 2,
                address: `Город ${i}, Улица ${i}`,
                description: `Описание станции ${i}`,
                connectors: [1, 2, 3],
                image_ids: [i, i + 1]
            },
            connector_id: (i % 3) + 1,
            period: {
                from: `2024-07-${String(i).padStart(2, '0')} 10:00:00`,
                to: `2024-07-${String(i).padStart(2, '0')} 12:00:00`
            },
            status: (i % 3) + 1,
            power: 20 + (i * 0.5),
            consumption: 10 + (i * 0.3)
        });
    }

    return {
        response_code: 0,
        sessions,
        total
    };
}

function generateTestChartData(numDays = 30) {
    const days = [];
    let total = 0;

    for (let i = 0; i < numDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toLocaleDateString("ru-RU");

        const sessionCount = Math.floor(Math.random() * 10) + 1;
        total += sessionCount;

        days.push({
            date: formattedDate,
            value: sessionCount
        });
    }

    return {
        response_code: 0,
        days,
        session_count: total,
        average_session_duration: "02:02:00",
        average_session_count: 4,
        average_session_consumption: 10.0
    };
}

export const Sessions = {
    get: async ({ period, selectedStatus, selectedConnectors, currentPage, pageSize, search, stationIds }) => {
        const request = {
            command: 'get_sessions',
            token: TOKEN,
            connector_types: selectedConnectors,
            status: selectedStatus,
            period: {
                from: period?.[0]?.toLocaleDateString('en-CA') || null,
                to: period?.[1]?.toLocaleDateString('en-CA') || null
            },
            page: currentPage,
            max_elements: pageSize,
            station_address: search,
            station_ids: stationIds
        };

        try {
            const response = await axios.post('api', request);
            if (response.data.response_code === 0) {
                return response.data;
            } else {
                console.warn("Sessions API error:", response);
                return generateTestSessions(currentPage, pageSize, 100);
            }
        } catch (err) {
            console.error("Sessions API failed:", err);
            return generateTestSessions(currentPage, pageSize, 100);
        }
    },

    getAnalysis: async ({ period, station_ids }) => {
        const request = {
            command: 'get_session_analysis',
            token: TOKEN,
            period: {
                from: period?.[0]?.toLocaleDateString('en-CA') || null,
                to: period?.[1]?.toLocaleDateString('en-CA') || null
            },
            station_ids: station_ids
        };

        try {
            const response = await axios.post('api', request);
            console.log("SEND sessions", request)
            if (response.data.response_code === 0) {
                console.log("OK sessions", response.data)
                return response.data;
            } else {
                console.warn("Session analysis error:", response.data);
                return generateTestChartData();
            }
        } catch (err) {
            console.error("Session analysis failed:", err);
            return generateTestChartData();
        }
    }
};
