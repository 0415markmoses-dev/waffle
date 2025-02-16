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
    }
}

export default ProjectService;
