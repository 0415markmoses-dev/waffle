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
import AuthService from '../../src/Services/Authentication/AuthService.js';

describe('AuthService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getAuthMode', () => {
        it('calls GET /api/auth/mode', async () => {
            Http.get.mockResolvedValue({data: {mode: 'ldap'}});
            await AuthService.getAuthMode();
            expect(Http.get).toHaveBeenCalledWith('/api/auth/mode');
        });

        it('returns the response', async () => {
            Http.get.mockResolvedValue({data: {mode: 'code'}});
            const result = await AuthService.getAuthMode();
            expect(result.data.mode).toBe('code');
        });
    });

    describe('getJWT', () => {
        it('calls POST /api/auth/login with all fields', async () => {
            Http.post.mockResolvedValue({data: {jwt: 'token'}});
            await AuthService.getJWT('user@test.com', 'pass', 'team', 'ldap');
            expect(Http.post).toHaveBeenCalledWith('/api/auth/login', {
                username: 'user@test.com',
                password: 'pass',
                authMode: 'ldap',
                mode: 'team',
            });
        });

        it('defaults mode to "team" and authMode to "ldap"', async () => {
            Http.post.mockResolvedValue({data: {jwt: 'token'}});
            await AuthService.getJWT('user@test.com', 'pass');
            expect(Http.post).toHaveBeenCalledWith('/api/auth/login', {
                username: 'user@test.com',
                password: 'pass',
                authMode: 'ldap',
                mode: 'team',
            });
        });
    });

    describe('getSelfData', () => {
        it('calls GET /api/auth/me', async () => {
            Http.get.mockResolvedValue({data: {id: 1, email: 'me@test.com'}});
            await AuthService.getSelfData();
            expect(Http.get).toHaveBeenCalledWith('/api/auth/me');
        });
    });

    describe('changePasswordSelf', () => {
        it('calls POST /api/auth/me/change-password with plainPassword', async () => {
            Http.post.mockResolvedValue({data: {}});
            await AuthService.changePasswordSelf('newSecret');
            expect(Http.post).toHaveBeenCalledWith('/api/auth/me/change-password', {
                plainPassword: 'newSecret',
            });
        });
    });

    describe('uploadProfilePicture', () => {
        it('calls POST with multipart/form-data header', async () => {
            const formData = new FormData();
            Http.post.mockResolvedValue({data: {url: '/uploads/pic.jpg'}});
            await AuthService.uploadProfilePicture(42, formData);
            expect(Http.post).toHaveBeenCalledWith(
                '/api/users/42/profile-picture',
                formData,
                {headers: {'Content-Type': 'multipart/form-data'}},
            );
        });
    });

    describe('deleteProfilePicture', () => {
        it('calls DELETE /api/users/:id/profile-picture', async () => {
            Http.delete.mockResolvedValue({data: {}});
            await AuthService.deleteProfilePicture(42);
            expect(Http.delete).toHaveBeenCalledWith('/api/users/42/profile-picture');
        });
    });
});
