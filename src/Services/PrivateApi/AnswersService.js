import Http from "../Http.js";

const AnswersService = {
    getAnswers(params = {}) {
        return Http.get('/api/answers', {params});
    },
    getAnswer(id) {
        return Http.get(`/api/answers/${id}`);
    },
    patchAnswer(id, data) {
        return Http.patch(`/api/answers/${id}`, data, {
            headers: {'Content-Type': 'application/merge-patch+json'},
        });
    },
};

export default AnswersService;
