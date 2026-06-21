import Http from "../Http.js";

const ProjectService = {
    getProjects(getParams = {}) {
        return Http.get('/api/projects', {
            params: {
                ...getParams,
            }
        });
    },
    getProject(projectId) {
        return Http.get(`/api/projects/${projectId}`);
    },
    updateProject(id, data) {
        return Http.patch(`/api/projects/${id}`, data, {
            headers: {'Content-Type': 'application/merge-patch+json'},
        });
    },
    getStats(id) {
        return Http.get(`/api/projects/${id}/stats`);
    },
}

export default ProjectService;
