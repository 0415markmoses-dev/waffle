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
    createProject(data) {
        return Http.post('/api/projects', data);
    },
    updateProject(id, data) {
        return Http.patch(`/api/projects/${id}`, data, {
            headers: {'Content-Type': 'application/merge-patch+json'},
        });
    },
    getStats(id) {
        return Http.get(`/api/projects/${id}/stats`);
    },
    uploadProjectPicture(id, formData) {
        return Http.post(`/api/projects/${id}/project-picture`, formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        });
    },
    deleteProjectPicture(id) {
        return Http.delete(`/api/projects/${id}/project-picture`);
    },
    uploadProjectBanner(id, formData) {
        return Http.post(`/api/projects/${id}/project-banner`, formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        });
    },
    deleteProjectBanner(id) {
        return Http.delete(`/api/projects/${id}/project-banner`);
    },
}

export default ProjectService;
