import Http from "../Http.js";

const TestersService = {
    getTesters(getParams = {}) {
        return Http.get('/api/testers', {
            params: {
                ...getParams,
            }
        });
    },
    createTester(data) {
        return Http.post('/api/testers', data);
    },
    getTester(id) {
        return Http.get('/api/testers/' + id);
    },
    updateTester(id, data) {
        return Http.patch('/api/testers/' + id, data, {
            headers: {
                'Content-Type': 'application/merge-patch+json'
            }
        });
    },
    getTesterStats(id) {
        return Http.get('/api/testers/' + id);
    },
    updateNickname(id, nickname) {
        return Http.post(`/api/testers/${id}/nickname`, {nickname});
    },
}

export default TestersService;
