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
import TestersService from '../../src/Services/PrivateApi/TestersService.js';

describe('TestersService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getTesters', () => {
        it('calls GET /api/testers with params', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await TestersService.getTesters({project: '/api/projects/1'});
            expect(Http.get).toHaveBeenCalledWith('/api/testers', {
                params: {project: '/api/projects/1'},
            });
        });

        it('calls GET /api/testers with empty params by default', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await TestersService.getTesters();
            expect(Http.get).toHaveBeenCalledWith('/api/testers', {params: {}});
        });
    });

    describe('createTester', () => {
        it('calls POST /api/testers with data', async () => {
            const payload = {email: 'tester@test.com', project: '/api/projects/1'};
            Http.post.mockResolvedValue({data: {id: 'uuid-1', ...payload}});
            await TestersService.createTester(payload);
            expect(Http.post).toHaveBeenCalledWith('/api/testers', payload);
        });
    });

    describe('getTester', () => {
        it('calls GET /api/testers/:id', async () => {
            Http.get.mockResolvedValue({data: {id: 'uuid-1', email: 'tester@test.com'}});
            await TestersService.getTester('uuid-1');
            expect(Http.get).toHaveBeenCalledWith('/api/testers/uuid-1');
        });
    });

    describe('updateTester', () => {
        it('calls PATCH /api/testers/:id with merge-patch header', async () => {
            Http.patch.mockResolvedValue({data: {}});
            await TestersService.updateTester('uuid-1', {testersEnrolled: []});
            expect(Http.patch).toHaveBeenCalledWith(
                '/api/testers/uuid-1',
                {testersEnrolled: []},
                {headers: {'Content-Type': 'application/merge-patch+json'}},
            );
        });
    });

    describe('getTesterStats', () => {
        it('calls GET /api/testers/:id', async () => {
            Http.get.mockResolvedValue({data: {id: 'uuid-1'}});
            await TestersService.getTesterStats('uuid-1');
            expect(Http.get).toHaveBeenCalledWith('/api/testers/uuid-1');
        });
    });

    describe('updateNickname', () => {
        it('calls POST /api/testers/:id/nickname with nickname payload', async () => {
            Http.post.mockResolvedValue({data: {}});
            await TestersService.updateNickname('uuid-1', 'Tester McTest');
            expect(Http.post).toHaveBeenCalledWith('/api/testers/uuid-1/nickname', {
                nickname: 'Tester McTest',
            });
        });
    });

    describe('setProfilePicture', () => {
        it('calls POST /api/testers/:id/profile-picture with url payload', async () => {
            Http.post.mockResolvedValue({data: {}});
            await TestersService.setProfilePicture('uuid-1', '/uploads/pic.png');
            expect(Http.post).toHaveBeenCalledWith('/api/testers/uuid-1/profile-picture', {
                url: '/uploads/pic.png',
            });
        });
    });

    describe('deleteProfilePicture', () => {
        it('calls DELETE /api/users/:id/profile-picture', async () => {
            Http.delete.mockResolvedValue({data: {}});
            await TestersService.deleteProfilePicture('uuid-1');
            expect(Http.delete).toHaveBeenCalledWith('/api/users/uuid-1/profile-picture');
        });
    });
});
