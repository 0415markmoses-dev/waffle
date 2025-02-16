import Http from "../Http.js";

const ReleasesService = {
    getReleases(getParams = {}) {
        return Http.get('/api/releases', {
            params: {
                ...getParams,
            }
        });
    },
    getRelease(id) {
        return Http.get('/api/releases/' + id);
    }
}

export default ReleasesService;
