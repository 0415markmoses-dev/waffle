import Http from "../Http.js";

const SearchService = {
    search(query, scope = [], projectId = undefined) {
        const params = {query};
        if (scope.length > 0) {
            params['scope'] = scope.join(',');
        }
        if (projectId !== undefined && projectId !== null) {
            params['projectId'] = projectId;
        }
        return Http.get('/api/search/query', {params});
    },
}

export default SearchService;
