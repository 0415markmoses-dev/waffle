import Http from "../Http.js";

const TestPlansService = {
    getTestPlans(getParams = {}) {
        return Http.get('/api/test_plans', {
            params: {
                ...getParams,
            }
        });
    }
}

export default TestPlansService;
