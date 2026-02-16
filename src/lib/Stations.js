import axios from 'axios'
import { generateStations } from './mockData'

const TOKEN = "5IyJPkWJa3ci50t8em4dEmCmoDHFSQVY"

export const Stations = {
    /**
 * Получение станций постранично
 * @param {{ 
 *   page?: number, 
 *   pageSize?: number, 
 *   expand_connectors?: boolean,
 *   ids?: string[],
 *   address?: string,
 *   status?: string[],
 *   power_range?: { min?: number, max?: number },
 *   connector_types?: number[]
 * }} params
 * @returns {Promise<{ response_code: number, stations: Station[], total: number }>}
 */
    async getByPage({
        page = 1,
        pageSize = 10,
        expand_connectors = true,
        ids,
        address,
        status,
        power_range,
        connector_types
    }) {
        try {
            const request = {
                command: "get_stations",
                token: TOKEN,
                page,
                max_elements: pageSize,
                expand_connectors
            }

            if (ids && ids.length > 0) {
                request.ids = ids;
            }

            if (address) {
                request.address = address;
            }

            if (status && status.length > 0) {
                request.status = status;
            }

            if (power_range) {
                request.power_range = power_range;
            }

            if (connector_types && connector_types.length > 0) {
                request.connector_types = connector_types;
            }

            const response = await axios.post('/api/', request)

            console.log("Station getByPage REQUEST", request)
            console.log("Station getByPage RESPONSE", response.data)

            return response.data.response_code === 0
                ? response.data
                : generateStations(page, pageSize)
        } catch (err) {
            console.error("Error loading stations:", err)
            return generateStations(page, pageSize)
        }
    },

    async getById(stationIds = undefined, expand_connectors = false) {
        const request = {
            command: "get_stations",
            token: TOKEN,
            expand_connectors
        };

        if (stationIds !== undefined) {
            request.ids = Array.isArray(stationIds) ? stationIds : [stationIds];
        }

        console.log("Station get REQUEST", request)
        try {
            const response = await axios.post('/api/', request)

            if (response.data.response_code === 0) {
                console.log("Station get RESPONSE", response.data)
                return response.data;
            }
        } catch (err) {
            console.error("Error loading stations:", err, "Request:", request);
        }

        const ids = stationIds !== undefined
            ? (Array.isArray(stationIds) ? stationIds : [stationIds])
            : [];
        const fallbackStations = ids.length
            ? generateStations(1, ids.length)
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
        console.log("Station getImages\nstationId:", stationId, "imageIds:", imageIds)
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

        console.log('Station getImages RESPONSE', results)

        return results
            .filter((res) => res.data.response_code === '0')
            .map((res) => `data:image/png;base64,${res.data.image_data}`)
    },


}