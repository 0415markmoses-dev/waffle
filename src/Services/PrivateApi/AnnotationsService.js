import Http from "../Http.js";

const AnnotationsService = {
    getAnnotations(params = {}) {
        return Http.get('/api/tester_annotations', {params});
    },
    createAnnotation(data) {
        return Http.post('/api/tester_annotations', data);
    },
    updateAnnotation(id, data) {
        return Http.patch('/api/tester_annotations/' + id, data, {
            headers: {'Content-Type': 'application/merge-patch+json'},
        });
    },
    deleteAnnotation(id) {
        return Http.delete('/api/tester_annotations/' + id);
    },
};

export default AnnotationsService;
