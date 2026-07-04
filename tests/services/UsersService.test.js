import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock('../../src/Services/Http.js', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

import Http from '../../src/Services/Http.js';
import UsersService from '../../src/Services/PrivateApi/UsersService.js';

describe('UsersService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getUsers', () => {
        it('calls GET /api/users with params', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await UsersService.getUsers({page: 1});
            expect(Http.get).toHaveBeenCalledWith('/api/users', {params: {page: 1}});
        });

        it('calls GET /api/users with empty params by default', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await UsersService.getUsers();
            expect(Http.get).toHaveBeenCalledWith('/api/users', {params: {}});
        });
    });

    describe('getUser', () => {
        it('calls GET /api/users/:id', async () => {
            Http.get.mockResolvedValue({data: {id: 42, email: 'user@test.com'}});
            await UsersService.getUser(42);
            expect(Http.get).toHaveBeenCalledWith('/api/users/42');
        });
    });

    describe('createUser', () => {
        it('calls POST /api/users with data', async () => {
            const payload = {email: 'new@test.com', plainPassword: 'secret', roles: ['ROLE_USER']};
            Http.post.mockResolvedValue({data: {id: 99, ...payload}});
            await UsersService.createUser(payload);
            expect(Http.post).toHaveBeenCalledWith('/api/users', payload);
        });
    });

    describe('updateUser', () => {
        it('calls PATCH /api/users/:id with merge-patch header', async () => {
            Http.patch.mockResolvedValue({data: {}});
            await UsersService.updateUser(42, {email: 'updated@test.com'});
            expect(Http.patch).toHaveBeenCalledWith(
                '/api/users/42',
                {email: 'updated@test.com'},
                {headers: {'Content-Type': 'application/merge-patch+json'}},
            );
        });
    });

    describe('deleteUser', () => {
        it('calls DELETE /api/users/:id', async () => {
            Http.delete.mockResolvedValue({data: {}});
            await UsersService.deleteUser(42);
            expect(Http.delete).toHaveBeenCalledWith('/api/users/42');
        });
    });
});
