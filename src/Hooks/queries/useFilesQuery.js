import {useQueries} from "@tanstack/react-query";
import FilesService from "../../Services/PrivateApi/FilesService.js";

export const fileKeys = {
    detail: (iri) => ['file', iri],
};

export const useFiles = (iris = []) => {
    return useQueries({
        queries: iris.map(iri => ({
            queryKey: fileKeys.detail(iri),
            queryFn: () => FilesService.getFile(iri).then(r => r.data),
            enabled: !!iri,
            staleTime: 5 * 60_000,
        })),
    });
};
