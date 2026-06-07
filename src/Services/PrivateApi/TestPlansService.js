import Http from "../Http.js";

const TestPlansService = {
    getTestPlans(getParams = {}) {
        return Http.get('/api/test_plans', {
            params: {
                ...getParams,
            }
        });
    },
    getOne(id) {
        return Http.get('/api/test_plans/' + id);
    },
    updateTestPlan(id, data) {
        return Http.patch('/api/test_plans/' + id, data, {
            headers: {
                'Content-Type': 'application/merge-patch+json'
            }
        });
    },
    createTestPlan(data) {
        return Http.post('/api/test_plans', data);
    },
    addDemoAnswers(testingPlanIri, number = 10) {
        return Http.post('/api/demo/add_demo_answer', {testingPlanIri, number});
    },
}

export default TestPlansService;
