import Http from "../Http.js";

const FilesService = {
    getFile(iri) {
        return Http.get(iri);
    },
    deleteFile(iri) {
        return Http.delete(iri);
    },
};

export default FilesService;
