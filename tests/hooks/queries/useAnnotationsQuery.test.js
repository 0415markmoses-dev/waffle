import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

vi.mock('../../../src/Services/PrivateApi/AnnotationsService.js', () => ({
    default: {
        getAnnotations: vi.fn(),
        createAnnotation: vi.fn(),
        updateAnnotation: vi.fn(),
        deleteAnnotation: vi.fn(),
    },
}));

import AnnotationsService from '../../../src/Services/PrivateApi/AnnotationsService.js';
import {
    annotationKeys,
    useAnnotations,
    useCreateAnnotation,
    useUpdateAnnotation,
    useDeleteAnnotation,
} from '../../../src/Hooks/queries/useAnnotationsQuery.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('annotationKeys', () => {
    it('all key is stable', () => {
        expect(annotationKeys.all).toEqual(['tester_annotations']);
    });
    it('byTester key includes iri', () => {
        expect(annotationKeys.byTester('/api/testers/1')).toEqual([
            'tester_annotations', 'tester', '/api/testers/1',
        ]);
    });
});

describe('useAnnotations', () => {
    it('is disabled when testerIri is falsy', () => {
        const {result} = renderHook(() => useAnnotations(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches annotations when testerIri is provided', async () => {
        const items = [{id: 1, text: 'note'}];
        AnnotationsService.getAnnotations.mockResolvedValueOnce({
            data: {member: items},
        });
        const {result} = renderHook(() => useAnnotations('/api/testers/1'), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(items);
        expect(AnnotationsService.getAnnotations).toHaveBeenCalledWith(
            expect.objectContaining({relateTo: '/api/testers/1'})
        );
    });

    it('falls back to hydra:member key', async () => {
        AnnotationsService.getAnnotations.mockResolvedValueOnce({
            data: {'hydra:member': [{id: 2}]},
        });
        const {result} = renderHook(() => useAnnotations('/api/testers/2'), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([{id: 2}]);
    });
});

describe('useCreateAnnotation', () => {
    it('calls createAnnotation and returns data', async () => {
        AnnotationsService.createAnnotation.mockResolvedValueOnce({data: {id: 10}});
        const {result} = renderHook(() => useCreateAnnotation(), {wrapper: makeWrapper()});
        await result.current.mutateAsync({relateTo: '/api/testers/1', text: 'hi'});
        expect(AnnotationsService.createAnnotation).toHaveBeenCalledWith(
            expect.objectContaining({text: 'hi'})
        );
    });
});

describe('useUpdateAnnotation', () => {
    it('calls updateAnnotation with id and data', async () => {
        AnnotationsService.updateAnnotation.mockResolvedValueOnce({data: {id: 10}});
        const {result} = renderHook(() => useUpdateAnnotation(), {wrapper: makeWrapper()});
        await result.current.mutateAsync({id: 10, data: {text: 'updated'}});
        expect(AnnotationsService.updateAnnotation).toHaveBeenCalledWith(10, {text: 'updated'});
    });
});

describe('useDeleteAnnotation', () => {
    it('calls deleteAnnotation with id', async () => {
        AnnotationsService.deleteAnnotation.mockResolvedValueOnce({});
        const {result} = renderHook(() => useDeleteAnnotation(), {wrapper: makeWrapper()});
        await result.current.mutateAsync(10);
        expect(AnnotationsService.deleteAnnotation).toHaveBeenCalledWith(10);
    });
});
