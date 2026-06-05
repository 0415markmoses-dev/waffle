import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import TestersService from "../../Services/PrivateApi/TestersService.js";
import {PaginationSettings} from "../../Configs/PaginationSettings.js";

export const testerKeys = {
    all: ['testers'],
    list: (params) => ['testers', 'list', params],
    detail: (id) => ['testers', 'detail', id],
};

const fetchAllTesters = async (params) => {
    const fetchPage = async (page, acc = []) => {
        const res = await TestersService.getTesters({
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

export const useTesters = (params = {}) => {
    return useQuery({
        queryKey: testerKeys.list(params),
        queryFn: () => fetchAllTesters(params),
        enabled: !!params.project,
    });
};

export const useTester = (id) => {
    return useQuery({
        queryKey: testerKeys.detail(id),
        queryFn: () => TestersService.getTester(id).then(r => r.data),
        enabled: !!id,
    });
};

export const useCreateTester = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => TestersService.createTester(data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: testerKeys.all}),
    });
};

export const useUpdateTester = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => TestersService.updateTester(id, data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: testerKeys.all}),
    });
};
