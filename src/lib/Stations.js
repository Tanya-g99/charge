import axios from 'axios';

// Генерация тестовых данных
function generateTestData(page = 1, max_elements = 10, total = 10) {
    const generateTestRecord = (id) => {
        return {
            id: `ipcharger${id.toString().padStart(4, '0')}`,
            latitude: 50 + (Math.random() * 5), // Random latitude around 50.0
            longitude: 123 + (Math.random() * 5), // Random longitude around 123.0
            status: Math.floor(Math.random() * 3), // Random status (0, 1, 2)
            name: `name_column-${id}`, // Переименовываем поле name
            address: `address_column-${id}`, // Переименовываем поле address
            description: `description_column-${id}`, // Переименовываем поле description
            connector_ids: [1, 2, 3]
        };
    };

    const startIndex = (page - 1) * max_elements;
    const endIndex = startIndex + max_elements;

    const testData = [];
    for (let i = startIndex + 1; i <= Math.min(endIndex, total); i++) {
        testData.push(generateTestRecord(i));
    }

    return testData;
}

export const Stations = {
    getByPage: async (page, pageSize) => {
        const response = await axios.post('api', {
            "command": "get_stations",
            "token": "5IyJPkWJa3ci50t8em4dEmCmoDHFSQVY",
            "page": page,
            "max_elements": pageSize,
        });

        if (response.data.response_code === 0) {
            return response.data;
        } else {
            console.log(response.data)
            return generateTestData(page, pageSize, 100);
        }
    },
    get: async () => {
        const response = await axios.post('api', {
            "command": "get_stations",
            "token": "5IyJPkWJa3ci50t8em4dEmCmoDHFSQVY",
        });

        if (response.data.response_code === 0) {
            return response.data.stations;
        } else {
            console.log(response.data)
            return generateTestData();
        }
    }
}