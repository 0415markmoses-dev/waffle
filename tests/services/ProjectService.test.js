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
import ProjectService from '../../src/Services/PrivateApi/ProjectService.js';

describe('ProjectService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getProjects', () => {
        it('calls GET /api/projects with params', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await ProjectService.getProjects({page: 2});
            expect(Http.get).toHaveBeenCalledWith('/api/projects', {params: {page: 2}});
        });

        it('calls GET /api/projects with empty params by default', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await ProjectService.getProjects();
            expect(Http.get).toHaveBeenCalledWith('/api/projects', {params: {}});
        });
    });

    describe('getProject', () => {
        it('calls GET /api/projects/:id', async () => {
            Http.get.mockResolvedValue({data: {id: 3, name: 'My project'}});
            await ProjectService.getProject(3);
            expect(Http.get).toHaveBeenCalledWith('/api/projects/3');
        });
    });

    describe('updateProject', () => {
        it('calls PATCH /api/projects/:id with merge-patch header', async () => {
            Http.patch.mockResolvedValue({data: {}});
            await ProjectService.updateProject(3, {name: 'Renamed'});
            expect(Http.patch).toHaveBeenCalledWith(
                '/api/projects/3',
                {name: 'Renamed'},
                {headers: {'Content-Type': 'application/merge-patch+json'}},
            );
        });
    });

    describe('getStats', () => {
        it('calls GET /api/projects/:id/stats', async () => {
            Http.get.mockResolvedValue({data: {testersCount: 5}});
            await ProjectService.getStats(3);
            expect(Http.get).toHaveBeenCalledWith('/api/projects/3/stats');
        });
    });

    describe('uploadProjectPicture', () => {
        it('calls POST /api/projects/:id/project-picture with multipart header', async () => {
            const formData = new FormData();
            Http.post.mockResolvedValue({data: {projectPictureUrl: '/uploads/pic.png'}});
            await ProjectService.uploadProjectPicture(3, formData);
            expect(Http.post).toHaveBeenCalledWith(
                '/api/projects/3/project-picture',
                formData,
                {headers: {'Content-Type': 'multipart/form-data'}},
            );
        });
    });

    describe('deleteProjectPicture', () => {
        it('calls DELETE /api/projects/:id/project-picture', async () => {
            Http.delete.mockResolvedValue({data: {}});
            await ProjectService.deleteProjectPicture(3);
            expect(Http.delete).toHaveBeenCalledWith('/api/projects/3/project-picture');
        });
    });

    describe('uploadProjectBanner', () => {
        it('calls POST /api/projects/:id/project-banner with multipart header', async () => {
            const formData = new FormData();
            Http.post.mockResolvedValue({data: {projectBannerUrl: '/uploads/banner.png'}});
            await ProjectService.uploadProjectBanner(3, formData);
            expect(Http.post).toHaveBeenCalledWith(
                '/api/projects/3/project-banner',
                formData,
                {headers: {'Content-Type': 'multipart/form-data'}},
            );
        });
    });

    describe('deleteProjectBanner', () => {
        it('calls DELETE /api/projects/:id/project-banner', async () => {
            Http.delete.mockResolvedValue({data: {}});
            await ProjectService.deleteProjectBanner(3);
            expect(Http.delete).toHaveBeenCalledWith('/api/projects/3/project-banner');
        });
    });
});
