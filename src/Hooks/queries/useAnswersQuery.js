import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import AnswersService from "../../Services/PrivateApi/AnswersService.js";

export const answerKeys = {
    all: ['answers'],
    list: (params) => ['answers', 'list', params],
    detail: (id) => ['answers', 'detail', id],
};

export const useAnswers = (params = {}) => {
    return useQuery({
        queryKey: answerKeys.list(params),
        queryFn: () => AnswersService.getAnswers(params).then(r => r.data),
        enabled: !!params.question,
    });
};

export const useAnswer = (id) => {
    return useQuery({
        queryKey: answerKeys.detail(id),
        queryFn: () => AnswersService.getAnswer(id).then(r => r.data),
        enabled: !!id,
    });
};

export const useUpdateAnswer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => AnswersService.patchAnswer(id, data).then(r => r.data),
        onSuccess: (updated) => {
            // Update the detail cache directly with the API response
            queryClient.setQueryData(answerKeys.detail(String(updated.id)), updated);
            // Invalidate lists so counts/states refresh
            queryClient.invalidateQueries({queryKey: answerKeys.list});
        },
    });
};
