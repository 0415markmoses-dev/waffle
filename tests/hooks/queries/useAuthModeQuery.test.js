import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

vi.mock('../../../src/Services/Authentication/AuthService.js', () => ({
    default: {
        getAuthMode: vi.fn(),
        getJWT: vi.fn(),
        getSelfData: vi.fn(),
    },
}));

import AuthService from '../../../src/Services/Authentication/AuthService.js';
import {useAuthMode} from '../../../src/Hooks/queries/useAuthModeQuery.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('useAuthMode', () => {
    it('fetches auth mode and returns data', async () => {
        AuthService.getAuthMode.mockResolvedValueOnce({data: {mode: 'ldap'}});
        const {result} = renderHook(() => useAuthMode(), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({mode: 'ldap'});
    });

    it('uses the auth-mode query key', async () => {
        AuthService.getAuthMode.mockResolvedValueOnce({data: {mode: 'local'}});
        const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
        const wrapper = ({children}) => createElement(QueryClientProvider, {client: qc}, children);
        const {result} = renderHook(() => useAuthMode(), {wrapper});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        const cached = qc.getQueryData(['auth-mode']);
        expect(cached).toEqual({mode: 'local'});
    });

    it('does not retry on failure', async () => {
        AuthService.getAuthMode.mockRejectedValueOnce(new Error('network error'));
        const {result} = renderHook(() => useAuthMode(), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isError).toBe(true));
        // Called only once (retry: false)
        expect(AuthService.getAuthMode).toHaveBeenCalledTimes(1);
    });
});
