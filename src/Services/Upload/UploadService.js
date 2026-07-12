import Http from "../Http.js";

const UploadService = {
    // Single-step upload: the file is posted directly with the standard app JWT
    // (added automatically by the Http request interceptor). The previous
    // /api/uploads/request pre-flight step has been removed on the backend.
    uploadFile(file) {
        let formData = new FormData();
        formData.append('file', file);
        return Http.post('/public/apx/upload', formData, {
            // Set explicitly so the interceptor does not force application/ld+json.
            // The browser fills in the multipart boundary.
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    }
}

export default UploadService;
