import Http from '../Http.js';

const TesterTagsService = {
    getTags(params = {}) {
        return Http.get('/api/tester_tags', {params});
    },
    createTag(data) {
        return Http.post('/api/tester_tags', data);
    },
};

export default TesterTagsService;
