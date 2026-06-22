import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import UsersService from '../../Services/PrivateApi/UsersService.js';

export const userKeys = {
    all: ['users'],
    list: (params) => ['users', 'list', params],
    detail: (id) => ['users', 'detail', id],
};

export const useUsers = (params = {}) => {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: () => UsersService.getUsers(params).then(r => r.data),
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => UsersService.createUser(data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: userKeys.all}),
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => UsersService.updateUser(id, data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: userKeys.all}),
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => UsersService.deleteUser(id),
        onSuccess: () => queryClient.invalidateQueries({queryKey: userKeys.all}),
    });
};
