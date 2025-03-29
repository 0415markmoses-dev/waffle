import Http from "../Http.js";

const UploadService = {
    getUploadRequest: (
        filename,
        filesize,
    ) => {
        return Http.post('/api/uploads/request', {
            filename: filename,
            size: filesize,
        });
    },
    uploadFile(file, jwt) {
        let formData = new FormData();
        formData.append('file', file);
        return Http.post('/public/apx/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${jwt}`
            }
        });
    }
}

export default UploadService;
