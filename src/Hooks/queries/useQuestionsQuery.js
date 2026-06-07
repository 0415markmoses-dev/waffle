import {useMutation, useQueries, useQuery, useQueryClient} from "@tanstack/react-query";
import QuestionsService from "../../Services/PrivateApi/QuestionsService.js";
import {PaginationSettings} from "../../Configs/PaginationSettings.js";

export const questionKeys = {
    all: ['questions'],
    list: (params) => ['questions', 'list', params],
    detail: (id) => ['questions', 'detail', id],
    stats: (id) => ['questions', 'stats', id],
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
        enabled: !!params.plan || !!params.testPlan || !!params['testPlan.release'],
    });
};

export const useQuestion = (id) => {
    return useQuery({
        queryKey: questionKeys.detail(id),
        queryFn: () => QuestionsService.getOne(id).then(r => r.data),
        enabled: !!id,
    });
};

export const useQuestionStats = (id) => {
    return useQuery({
        queryKey: questionKeys.stats(id),
        queryFn: () => QuestionsService.getQuestionStats(id).then(r => r.data),
        enabled: !!id,
    });
};

/**
 * Fetches stats for every question in a test plan in parallel, then aggregates.
 * testPlan.questions = array of IRI strings like "/api/questions/6"
 */
export const usePlanHealth = (testPlan) => {
    const iris = testPlan?.questions ?? [];
    const ids = iris.map(iri => iri.split('/').pop());

    const results = useQueries({
        queries: ids.map(id => ({
            queryKey: questionKeys.stats(id),
            queryFn: () => QuestionsService.getQuestionStats(id).then(r => r.data),
            enabled: !!id,
        })),
    });

    const isLoading = results.some(r => r.isLoading);
    const aggregated = results.reduce(
        (acc, r) => {
            const d = r.data ?? {};
            acc.pass += d.test_pass ?? 0;
            acc.passWithBugs += d.test_pass_with_bugs ?? 0;
            acc.failed += d.test_failed ?? 0;
            acc.blocked += d.test_blocked ?? 0;
            acc.pending += d.test_pending ?? 0;
            return acc;
        },
        {pass: 0, passWithBugs: 0, failed: 0, blocked: 0, pending: 0}
    );

    aggregated.total = aggregated.pass + aggregated.passWithBugs + aggregated.failed + aggregated.blocked + aggregated.pending;

    const allAnswers = results.flatMap(r => r.data?.answers ?? []);

    return {isLoading, ...aggregated, allAnswers};
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
