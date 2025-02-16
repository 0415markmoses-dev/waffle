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
    },
    getReleaseStats(id) {
        return Http.get('/apx/stats/releases/' + id);
    }
}

export default ReleasesService;
