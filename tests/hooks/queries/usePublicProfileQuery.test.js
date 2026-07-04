import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

vi.mock('../../../src/Services/PrivateApi/PublicProfilesService.js', () => ({
    default: {
        getProfile: vi.fn(),
    },
}));

import PublicProfilesService from '../../../src/Services/PrivateApi/PublicProfilesService.js';
import {usePublicProfile} from '../../../src/Hooks/queries/usePublicProfileQuery.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('usePublicProfile', () => {
    it('is disabled when id is falsy', () => {
        const {result} = renderHook(() => usePublicProfile(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches profile when id is provided', async () => {
        const profile = {id: 'abc-123', name: 'Alice'};
        PublicProfilesService.getProfile.mockResolvedValueOnce({data: profile});
        const {result} = renderHook(() => usePublicProfile('abc-123'), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(profile);
        expect(PublicProfilesService.getProfile).toHaveBeenCalledWith('abc-123');
    });

    it('does not retry on failure', async () => {
        PublicProfilesService.getProfile.mockRejectedValueOnce(new Error('not found'));
        const {result} = renderHook(() => usePublicProfile('xyz'), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(PublicProfilesService.getProfile).toHaveBeenCalledTimes(1);
    });
});
