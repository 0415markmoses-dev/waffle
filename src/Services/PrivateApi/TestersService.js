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
    setProfilePicture(id, url) {
        return Http.post(`/api/testers/${id}/profile-picture`, {url});
    },
    deleteProfilePicture(id) {
        return Http.delete(`/api/users/${id}/profile-picture`);
    },
    deleteTester(id) {
        return Http.delete('/api/testers/' + id);
    },
}

export default TestersService;
