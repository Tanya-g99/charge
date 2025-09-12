import axios from 'axios'
import { generateStations } from './mockData'

const TOKEN = "5IyJPkWJa3ci50t8em4dEmCmoDHFSQVY"

export const Stations = {
    /**
 * Получение станций постранично
 * @param {{ page?: number, pageSize?: number, expand_connectors?: boolean }} params
 * @returns {Promise<{ response_code: number, stations: Station[], total: number }>}
 */
    async getByPage({ page = 1, pageSize = 10, expand_connectors = true }) {
        try {
            const request = {

                command: "get_stations",
                token: TOKEN,
                page,
                max_elements: pageSize,
                expand_connectors
            }
            const response = await axios.post('/api/', request)

            console.log("REQUEST", request)
            console.log("RESPONSE", response.data)

            return response.data.response_code === 0
                ? response.data
                : generateStations(page, pageSize)
        } catch (err) {
            console.error("Error loading stations:", err)
            return generateStations(page, pageSize)
        }
    },

    /**
     * Получение станций по id
     * @param {string[] | string} [ids]
     * @returns {Promise<Station[]>}
     */
    async get(ids = []) {
        const stationIds = Array.isArray(ids) ? ids : [ids];
        const request = {
            command: "get_stations",
            token: TOKEN,
            stationIds
        };
        console.log("REQUEST", request)
        try {
            const response = await axios.post('/api/', request)

            if (response.data.response_code === 0) {
                console.log("RESPONSE", response.data)
                return response.data;
            }
        } catch (err) {
            console.error("Error loading stations:", err, "Request:", request);
        }

        const fallbackStations = stationIds.length
            ? generateStations(1, stationIds.length)
            : generateStations()

        return fallbackStations
    },

    /**
   * Получение изображений станции
   * @param {string} stationId
   * @param {number[]} imageIds
   * @returns {Promise<string[]>} base64 изображения
   */
    async getImages(stationId, imageIds = []) {
        console.log("POST get images", stationId, imageIds)
        if (!imageIds.length) return []

        const promises = imageIds.map((image_id) =>
            axios.post('/api/', {
                command: 'get_station_image',
                token: TOKEN,
                station_id: stationId,
                image_id
            })
        )

        const results = await Promise.all(promises)

        console.log('PHOTO', results)

        return results
            .filter((res) => res.data.response_code === '0')
            .map((res) => `data:image/png;base64,${res.data.image_data}`)
    },


}