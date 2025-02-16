import Http from "../Http.js";

const ReleasesService = {
    getReleases(getParams = {}) {
        return Http.get('/api/releases', {
            params: {
                ...getParams,
            }
        });
    }
}

export default ReleasesService;
