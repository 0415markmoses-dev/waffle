import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

vi.mock('../../../src/Services/PrivateApi/FilesService.js', () => ({
    default: {
        getFile: vi.fn(),
    },
}));

import FilesService from '../../../src/Services/PrivateApi/FilesService.js';
import {fileKeys, useFiles} from '../../../src/Hooks/queries/useFilesQuery.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('fileKeys', () => {
    it('detail key includes iri', () => {
        expect(fileKeys.detail('/api/files/1')).toEqual(['file', '/api/files/1']);
    });
});

describe('useFiles', () => {
    it('returns empty array of results for empty iris list', () => {
        const {result} = renderHook(() => useFiles([]), {wrapper: makeWrapper()});
        expect(result.current).toHaveLength(0);
    });

    it('fetches one file per IRI', async () => {
        FilesService.getFile.mockResolvedValue({data: {id: 1, url: 'http://example.com/a.png'}});
        const {result} = renderHook(() => useFiles(['/api/files/1', '/api/files/2']), {
            wrapper: makeWrapper(),
        });
        await waitFor(() => result.current.every(r => r.isSuccess));
        expect(FilesService.getFile).toHaveBeenCalledTimes(2);
        expect(FilesService.getFile).toHaveBeenCalledWith('/api/files/1');
        expect(FilesService.getFile).toHaveBeenCalledWith('/api/files/2');
    });

    it('returns one result entry per IRI', async () => {
        FilesService.getFile.mockResolvedValue({data: {id: 9}});
        const {result} = renderHook(() => useFiles(['/api/files/9']), {wrapper: makeWrapper()});
        expect(result.current).toHaveLength(1);
    });
});
