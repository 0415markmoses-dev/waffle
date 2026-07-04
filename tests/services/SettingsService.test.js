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
import SettingsService from '../../src/Services/PrivateApi/SettingsService.js';

describe('SettingsService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getSettings', () => {
        it('calls GET /api/settings with params', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await SettingsService.getSettings({page: 1});
            expect(Http.get).toHaveBeenCalledWith('/api/settings', {params: {page: 1}});
        });

        it('calls GET /api/settings with empty params by default', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await SettingsService.getSettings();
            expect(Http.get).toHaveBeenCalledWith('/api/settings', {params: {}});
        });
    });

    describe('getSetting', () => {
        it('calls GET /api/settings/:id', async () => {
            Http.get.mockResolvedValue({data: {id: 'theme', value: 'dark'}});
            await SettingsService.getSetting('theme');
            expect(Http.get).toHaveBeenCalledWith('/api/settings/theme');
        });
    });

    describe('createSetting', () => {
        it('calls POST /api/settings with data', async () => {
            const payload = {key: 'theme', value: 'dark'};
            Http.post.mockResolvedValue({data: {id: 1, ...payload}});
            await SettingsService.createSetting(payload);
            expect(Http.post).toHaveBeenCalledWith('/api/settings', payload);
        });
    });

    describe('updateSetting', () => {
        it('calls PATCH /api/settings/:id with data', async () => {
            Http.patch.mockResolvedValue({data: {}});
            await SettingsService.updateSetting('theme', {value: 'light'});
            expect(Http.patch).toHaveBeenCalledWith('/api/settings/theme', {value: 'light'});
        });
    });

    describe('deleteSetting', () => {
        it('calls DELETE /api/settings/:id', async () => {
            Http.delete.mockResolvedValue({data: {}});
            await SettingsService.deleteSetting('theme');
            expect(Http.delete).toHaveBeenCalledWith('/api/settings/theme');
        });
    });
});
