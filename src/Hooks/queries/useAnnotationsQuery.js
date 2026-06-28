import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import AnnotationsService from '../../Services/PrivateApi/AnnotationsService.js';

export const annotationKeys = {
    all: ['tester_annotations'],
    byTester: (testerIri) => ['tester_annotations', 'tester', testerIri],
};

export const useAnnotations = (testerIri) => useQuery({
    queryKey: annotationKeys.byTester(testerIri),
    queryFn: () => AnnotationsService.getAnnotations({
        relateTo: testerIri,
        'order[created]': 'asc',
        itemsPerPage: 100,
    }).then(r => r.data?.['member'] ?? r.data?.['hydra:member'] ?? []),
    enabled: !!testerIri,
});

export const useCreateAnnotation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => AnnotationsService.createAnnotation(data).then(r => r.data),
        onSuccess: (_, vars) => qc.invalidateQueries({queryKey: annotationKeys.byTester(vars.relateTo)}),
    });
};

export const useUpdateAnnotation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => AnnotationsService.updateAnnotation(id, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({queryKey: annotationKeys.all}),
    });
};

export const useDeleteAnnotation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => AnnotationsService.deleteAnnotation(id),
        onSuccess: () => qc.invalidateQueries({queryKey: annotationKeys.all}),
    });
};
