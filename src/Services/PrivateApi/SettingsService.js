import Http from "../Http.js";

const SettingsService = {
    getSettings(params = {}) {
        return Http.get('/api/settings', {params});
    },
    getSetting(id) {
        return Http.get(`/api/settings/${id}`);
    },
    createSetting(data) {
        return Http.post('/api/settings', data);
    },
    updateSetting(id, data) {
        return Http.patch(`/api/settings/${id}`, data);
    },
    deleteSetting(id) {
        return Http.delete(`/api/settings/${id}`);
    },
}

export default SettingsService;
