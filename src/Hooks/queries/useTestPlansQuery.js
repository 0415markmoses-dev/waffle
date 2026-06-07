import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import TestPlansService from "../../Services/PrivateApi/TestPlansService.js";
import {PaginationSettings} from "../../Configs/PaginationSettings.js";

export const testPlanKeys = {
    all: ['testPlans'],
    list: (params) => ['testPlans', 'list', params],
    detail: (id) => ['testPlans', 'detail', id],
};

const fetchAllTestPlans = async (params) => {
    const fetchPage = async (page, acc = []) => {
        const res = await TestPlansService.getTestPlans({
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

export const useTestPlans = (params = {}) => {
    return useQuery({
        queryKey: testPlanKeys.list(params),
        queryFn: () => fetchAllTestPlans(params),
        enabled: !!params.project || !!params.release,
    });
};

/** Single-page fetch — use when you need a fixed number of results (e.g. dashboard). */
export const useTestPlansPage = (params = {}) => {
    return useQuery({
        queryKey: testPlanKeys.list(params),
        queryFn: () => TestPlansService.getTestPlans(params).then(r => r.data['member'] ?? []),
        enabled: !!params['release.project'] || !!params.release,
    });
};

export const useTestPlan = (id) => {
    return useQuery({
        queryKey: testPlanKeys.detail(id),
        queryFn: () => TestPlansService.getOne(id).then(r => r.data),
        enabled: !!id,
    });
};

export const useCreateTestPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => TestPlansService.createTestPlan(data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: testPlanKeys.all}),
    });
};

export const useUpdateTestPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => TestPlansService.updateTestPlan(id, data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: testPlanKeys.all}),
    });
};

export const useAddDemoAnswers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
                         testingPlanIri,
                         number
                     }) => TestPlansService.addDemoAnswers(testingPlanIri, number).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: testPlanKeys.all}),
    });
};
