import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import ReleasesService from "../../Services/PrivateApi/ReleasesService.js";
import {PaginationSettings} from "../../Configs/PaginationSettings.js";

export const releaseKeys = {
    all: ['releases'],
    list: (params) => ['releases', 'list', params],
    detail: (id) => ['releases', 'detail', id],
    stats: (id) => ['releases', 'stats', id],
};

/** Fetches all pages and returns the flat member array */
const fetchAllReleases = async (params) => {
    const fetchPage = async (page, acc = []) => {
        const res = await ReleasesService.getReleases({
            ...params,
            page,
            itemsPerPage: PaginationSettings.ApiItemsPerPage,
        });
        const members = res.data['member'] ?? [];
        const total = res.data['totalItems'] ?? 0;
        const combined = [...acc, ...members];
        if (combined.length < total) return fetchPage(page + 1, combined);
        return combined;
    };
    return fetchPage(1);
};

export const useReleases = (params = {}) => {
    return useQuery({
        queryKey: releaseKeys.list(params),
        queryFn: () => fetchAllReleases(params),
        enabled: !!params.project,
    });
};

export const useRelease = (id) => {
    return useQuery({
        queryKey: releaseKeys.detail(id),
        queryFn: () => ReleasesService.getRelease(id).then(r => r.data),
        enabled: !!id,
    });
};

export const useReleaseStats = (id) => {
    return useQuery({
        queryKey: releaseKeys.stats(id),
        queryFn: () => ReleasesService.getReleaseStats(id).then(r => r.data),
        enabled: !!id,
    });
};

export const useCreateRelease = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => ReleasesService.createRelease(data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: releaseKeys.all}),
    });
};

export const useUpdateRelease = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => ReleasesService.updateRelease(id, data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: releaseKeys.all}),
    });
};
