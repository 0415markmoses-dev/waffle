import Http from "../Http.js";

const SearchService = {
    search(query, scope = []) {
        const params = {query};
        if (scope.length > 0) {
            params['scope'] = scope.join(',');
        }
        return Http.get('/api/search/query', {params});
    },
}

export default SearchService;
