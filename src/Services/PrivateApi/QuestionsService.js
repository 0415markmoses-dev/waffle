import Http from "../Http.js";

const QuestionsService = {
    getQuestions(getParams = {}) {
        return Http.get('/api/questions', {
            params: {
                ...getParams,
            }
        });
    },
    getOne(id) {
        return Http.get('/api/questions/' + id);
    },
    updateQuestion(id, data) {
        return Http.patch('/api/questions/' + id, data, {
            headers: {
                'Content-Type': 'application/merge-patch+json'
            }
        });
    },
    createQuestion(data) {
        return Http.post('/api/questions', data);
    },
    getQuestionStats(id) {
        return Http.get('/api/questions/' + id + '/stats');
    },
}

export default QuestionsService;
