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

const invalidateTesterAnswer = (queryClient, questionField) => {
    if (!questionField) return;
    const iri = typeof questionField === 'string' ? questionField : questionField?.['@id'];
    if (iri) queryClient.invalidateQueries({queryKey: ['tester-answer', iri]});
};

export const useCreateAnswer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => AnswersService.createAnswer(data).then(r => r.data),
        onSuccess: (created) => {
            queryClient.invalidateQueries({queryKey: answerKeys.all});
            invalidateTesterAnswer(queryClient, created?.question);
        },
    });
};

export const useRecentProjectAnswers = (projectId) => {
    return useQuery({
        queryKey: answerKeys.list({project: projectId, recent: true}),
        queryFn: () => AnswersService.getAnswers({
            'question.testPlan.release.project': projectId,
            'order[created]': 'desc',
            itemsPerPage: 10,
            page: 1,
        }).then(r => r.data),
        enabled: !!projectId,
    });
};

const ACTIVITY_PAGE_SIZE = 10;

export const useAnswersByTester = (testerIri, projectId, page = 1) => {
    return useQuery({
        queryKey: answerKeys.list({tester: testerIri, project: projectId, page}),
        queryFn: () => AnswersService.getAnswers({
            tester: testerIri,
            'question.testPlan.release.project': projectId,
            'order[created]': 'desc',
            itemsPerPage: ACTIVITY_PAGE_SIZE,
            page,
        }).then(r => r.data),
        enabled: !!testerIri && !!projectId,
    });
};

export const useUpdateAnswer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => AnswersService.patchAnswer(id, data).then(r => r.data),
        onSuccess: (updated) => {
            queryClient.setQueryData(answerKeys.detail(String(updated.id)), updated);
            queryClient.invalidateQueries({queryKey: answerKeys.list});
            invalidateTesterAnswer(queryClient, updated?.question);
        },
    });
};
