import axios from 'axios';

const TOKEN = "5IyJPkWJa3ci50t8em4dEmCmoDHFSQVY";

// Генерация тестовых данных
function generateTestData(page = 1, max_elements = 10, total = 100) {
    const generateTestRecord = (id) => ({
        id: `ipcharger${id.toString().padStart(4, '0')}`,
        latitude: 50 + Math.random() * 5,
        longitude: 123 + Math.random() * 5,
        status: Math.floor(Math.random() * 3),
        name: `name_column-${id}`,
        address: `address_column-${id}`,
        description: `description_column-${id}`,
        connector_ids: [1, 2, 3]
    });

    const startIndex = (page - 1) * max_elements;
    const endIndex = startIndex + max_elements;

    const stations = [];
    for (let i = startIndex + 1; i <= Math.min(endIndex, total); i++) {
        stations.push(generateTestRecord(i));
    }

    return {
        response_code: 0,
        stations,
        total
    };
}

export const Stations = {
    getByPage: async (page, pageSize) => {
        try {
            const response = await axios.post('api/', {
                command: "get_stations",
                token: TOKEN,
                page,
                max_elements: pageSize,
            });

            return response.data.response_code === 0
                ? response.data
                : generateTestData(page, pageSize);
        } catch (e) {
            console.error("Error loading stations:", e);
            return generateTestData(page, pageSize);
        }
    },

    get: async () => {
        try {
            const response = await axios.post('api/', {
                command: "get_stations",
                token: TOKEN,
            });

            return response.data.response_code === 0
                ? response.data.stations
                : generateTestData().stations;
        } catch (e) {
            console.error("Error loading all stations:", e);
            return generateTestData().stations;
        }
    }
};
