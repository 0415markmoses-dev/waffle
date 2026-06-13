import {useRef, useState} from "react";
import {Button} from "../Buttons/Button.jsx";
import UploadService from "../../../Services/Upload/UploadService.js";

/**
 * Uploader
 *
 * Props:
 *   accepts    — string | null   MIME type filter. Default: no restriction.
 *   multiple   — bool            Allow picking multiple files at once. Default: true.
 *   onUploaded — (iri: string, meta: {url, filename, extension, size}) => void
 *                Called once per file after a successful upload.
 */
const Uploader = ({accepts = null, multiple = true, onUploaded}) => {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState([]);

    const handleFiles = async (files) => {
        if (!files?.length) return;
        setUploading(true);
        setErrors([]);

        const errs = [];

        for (const file of Array.from(files)) {
            try {
                const reqRes = await UploadService.getUploadRequest(file.name, file.size);
                const {jwt} = reqRes.data;

                const upRes = await UploadService.uploadFile(file, jwt);
                const data = upRes?.data ?? {};
                const iri = data['@id'] ?? null;

                if (!iri) {
                    errs.push(`${file.name}: unexpected server response`);
                    continue;
                }

                const ext = (data.filename ?? file.name).split('.').pop().toLowerCase();
                onUploaded?.(iri, {
                    url: data.url ?? null,
                    filename: file.name,
                    extension: ext,
                    size: file.size,
                });
            } catch (e) {
                const msg = e?.response?.data?.message ?? e?.message ?? 'upload failed';
                errs.push(`${file.name}: ${msg}`);
            }
        }

        setErrors(errs);
        setUploading(false);

        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                style={{display: 'none'}}
                accept={accepts ?? undefined}
                multiple={multiple}
                onChange={e => handleFiles(e.target.files)}
            />
            <Button
                type="primary"
                outline
                size="md"
                icon="lni-upload-1"
                loading={uploading}
                onClick={() => inputRef.current?.click()}
            >
                Upload file(s)
            </Button>
            {errors.length > 0 && (
                <div className="uploader-errors">
                    {errors.map((err, i) => (
                        <div key={i} className="uploader-error">{err}</div>
                    ))}
                </div>
            )}
        </>
    );
};

export default Uploader;
