import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

vi.mock('../../../src/Services/PrivateApi/UsersService.js', () => ({
    default: {
        getUsers: vi.fn(),
        createUser: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
    },
}));

import UsersService from '../../../src/Services/PrivateApi/UsersService.js';
import {
    userKeys,
    useUsers,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
} from '../../../src/Hooks/queries/useUsersQuery.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('userKeys', () => {
    it('list key includes params', () => {
        expect(userKeys.list({role: 'admin'})).toEqual(['users', 'list', {role: 'admin'}]);
    });
    it('detail key includes id', () => {
        expect(userKeys.detail(1)).toEqual(['users', 'detail', 1]);
    });
});

describe('useUsers', () => {
    it('fetches users (always enabled)', async () => {
        UsersService.getUsers.mockResolvedValueOnce({data: {member: [{id: 1}]}});
        const {result} = renderHook(() => useUsers(), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(UsersService.getUsers).toHaveBeenCalledWith({});
    });

    it('passes params to getUsers', async () => {
        UsersService.getUsers.mockResolvedValueOnce({data: {member: []}});
        const {result} = renderHook(() => useUsers({search: 'alice'}), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(UsersService.getUsers).toHaveBeenCalledWith({search: 'alice'});
    });
});

describe('useCreateUser', () => {
    it('calls createUser', async () => {
        UsersService.createUser.mockResolvedValueOnce({data: {id: 5}});
        const {result} = renderHook(() => useCreateUser(), {wrapper: makeWrapper()});
        const data = await result.current.mutateAsync({email: 'new@example.com'});
        expect(data).toEqual({id: 5});
    });
});

describe('useUpdateUser', () => {
    it('calls updateUser with id and data', async () => {
        UsersService.updateUser.mockResolvedValueOnce({data: {id: 3}});
        const {result} = renderHook(() => useUpdateUser(), {wrapper: makeWrapper()});
        await result.current.mutateAsync({id: 3, data: {name: 'Charlie'}});
        expect(UsersService.updateUser).toHaveBeenCalledWith(3, {name: 'Charlie'});
    });
});

describe('useDeleteUser', () => {
    it('calls deleteUser with id', async () => {
        UsersService.deleteUser.mockResolvedValueOnce({});
        const {result} = renderHook(() => useDeleteUser(), {wrapper: makeWrapper()});
        await result.current.mutateAsync(3);
        expect(UsersService.deleteUser).toHaveBeenCalledWith(3);
    });
});
