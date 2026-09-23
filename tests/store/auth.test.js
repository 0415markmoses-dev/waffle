import {beforeEach, describe, expect, it} from 'vitest';
import {useAuthStore} from '../../src/Store/auth.js';

describe('useAuthStore demo admin login', () => {
    beforeEach(() => {
        useAuthStore.setState({
            user: null,
            jwt: null,
            isLoadingUser: false,
        });
    });

    it('allows the ForestLuau admin account with the highest role', async () => {
        await useAuthStore.getState().requestLogin('ForestLuau', 'Shadow0804!', 'team', 'db');

        expect(useAuthStore.getState().jwt).toBe('dev-admin-jwt');
        expect(useAuthStore.getState().user).toMatchObject({
            username: 'ForestLuau',
            roles: ['ROLE_ADMIN'],
        });
    });
});
