import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import QuestionsService from "../../Services/PrivateApi/QuestionsService.js";
import {PaginationSettings} from "../../Configs/PaginationSettings.js";

export const questionKeys = {
    all: ['questions'],
    list: (params) => ['questions', 'list', params],
    detail: (id) => ['questions', 'detail', id],
};

const fetchAllQuestions = async (params) => {
    const fetchPage = async (page, acc = []) => {
        const res = await QuestionsService.getQuestions({
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

export const useQuestions = (params = {}) => {
    return useQuery({
        queryKey: questionKeys.list(params),
        queryFn: () => fetchAllQuestions(params),
        enabled: !!params.testPlan || !!params['testPlan.release'],
    });
};

export const useQuestion = (id) => {
    return useQuery({
        queryKey: questionKeys.detail(id),
        queryFn: () => QuestionsService.getOne(id).then(r => r.data),
        enabled: !!id,
    });
};

export const useCreateQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => QuestionsService.createQuestion(data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: questionKeys.all}),
    });
};

export const useUpdateQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => QuestionsService.updateQuestion(id, data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: questionKeys.all}),
    });
};
