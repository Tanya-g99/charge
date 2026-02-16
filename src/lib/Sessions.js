import axios from 'axios'
import { generateSessions, generateSessionsAnalysis } from './mockData'

const TOKEN = "5IyJPkWJa3ci50t8em4dEmCmoDHFSQVY"

export const Sessions = {
    /**
     * Получение списка сессий с пагинацией и фильтрами
     * @param {Object} params
     * @param {Array<Date>} params.period
     * @param {Array} params.selectedStatus
     * @param {Array} params.selectedConnectors
     * @param {Number} params.currentPage
     * @param {Number} params.pageSize
     * @param {String} params.search
     * @param {Array} params.stationIds
     */
    async get({ period, selectedStatus = undefined, selectedConnectors = undefined, currentPage = 1, pageSize = 10, search = undefined, stationIds = undefined }) {
        stationIds = Array.isArray(stationIds) ? stationIds : [stationIds];
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
        }

        try {
            console.log("Sessions get REQUEST", request)
            const response = await axios.post('/api/', request)
            console.log("Sessions get RESPONSE", request)

            if (response.data.response_code === 0) {
                return response.data
            } else {
                console.error("Sessions API returned error:", response, "Request", request)
                return generateSessions(currentPage, pageSize)
            }
        } catch (err) {
            console.error("Sessions API failed:", err, "Request", request)
            return generateSessions(currentPage, pageSize)
        }
    },

    /**
     * Получение аналитики сессий (графики и статистика)
     * @param {Object} params
     * @param {Array<Date>} params.period
     * @param {Array} params.stationIds
     */
    async getAnalysis({ period, stationIds }) {
        stationIds = Array.isArray(stationIds) ? stationIds : [stationIds];

        const request = {
            command: 'get_session_analysis',
            token: TOKEN,
            period: {
                from: period?.[0]?.toLocaleDateString('en-CA') || null,
                to: period?.[1]?.toLocaleDateString('en-CA') || null
            },
            station_ids: stationIds
        }

        try {
            console.log("Sessions getAnalysis REQUEST", request)
            const response = await axios.post('/api/', request)
            console.log("Sessions getAnalysis RESPONSE", request)

            if (response.data.response_code === 0) {
                return response.data
            } else {
                console.error("Session analysis API returned error:", response.data, "Request", request)
                return generateSessionsAnalysis()
            }
        } catch (err) {
            console.error("Session analysis API failed:", err, "Request", request)
            return generateSessionsAnalysis()
        }
    }
}
