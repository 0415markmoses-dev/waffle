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
    updateRelease(id, data) {
        return Http.patch('/api/releases/' + id, data, {
            headers: {
                'Content-Type': 'application/merge-patch+json'
            }
        });
    },
    getReleaseStats(id) {
        return Http.get('/api/release_stats/' + id);
    }
}

export default ReleasesService;
