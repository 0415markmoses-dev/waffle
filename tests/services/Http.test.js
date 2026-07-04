import {describe, it, expect, vi, afterEach} from 'vitest';
import AxiosMockAdapter from 'axios-mock-adapter';

// Mock the auth store to avoid circular dependency and zustand/localStorage issues
vi.mock('../../src/Store/auth.js', () => ({
    getCurrentJWT: vi.fn(() => null),
    getCurrentUserData: vi.fn(),
    useAuthStore: vi.fn(),
    isTester: vi.fn(),
}));

import Http from '../../src/Services/Http.js';
import {getCurrentJWT} from '../../src/Store/auth.js';

const mock = new AxiosMockAdapter(Http);

describe('Http', () => {
    afterEach(() => {
        mock.reset();
        vi.clearAllMocks();
    });

    describe('baseURL', () => {
        it('uses localhost baseURL when hostname is localhost', () => {
            // jsdom sets hostname to 'localhost' via the url option in vitest config
            expect(Http.defaults.baseURL).toBe('http://localhost');
        });
    });

    describe('PATCH interceptor', () => {
        it('sets Content-Type to application/merge-patch+json', async () => {
            let capturedHeaders;
            mock.onPatch('/api/test').reply(config => {
                capturedHeaders = config.headers;
                return [200, {}];
            });
            await Http.patch('/api/test', {foo: 'bar'});
            expect(capturedHeaders['Content-Type']).toBe('application/merge-patch+json');
        });
    });

    describe('POST interceptor', () => {
        it('keeps the axios default application/json when no explicit Content-Type is passed', async () => {
            // The Http instance is created with Content-Type: application/json as a
            // default header, so config.headers['Content-Type'] is always truthy —
            // the ld+json branch in the interceptor is never reached.
            let capturedHeaders;
            mock.onPost('/api/test').reply(config => {
                capturedHeaders = config.headers;
                return [201, {}];
            });
            await Http.post('/api/test', {foo: 'bar'});
            expect(capturedHeaders['Content-Type']).toBe('application/json');
        });

        it('honours an explicit Content-Type override (e.g. multipart/form-data)', async () => {
            let capturedHeaders;
            mock.onPost('/api/test').reply(config => {
                capturedHeaders = config.headers;
                return [201, {}];
            });
            await Http.post('/api/test', {}, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            expect(capturedHeaders['Content-Type']).toContain('multipart/form-data');
        });
    });

    describe('Authorization interceptor', () => {
        it('attaches Bearer token when JWT is present', async () => {
            getCurrentJWT.mockReturnValue('my-test-jwt');
            let capturedHeaders;
            mock.onGet('/api/test').reply(config => {
                capturedHeaders = config.headers;
                return [200, {}];
            });
            await Http.get('/api/test');
            expect(capturedHeaders['Authorization']).toBe('Bearer my-test-jwt');
        });

        it('does not add Authorization header when JWT is null', async () => {
            getCurrentJWT.mockReturnValue(null);
            let capturedHeaders;
            mock.onGet('/api/test').reply(config => {
                capturedHeaders = config.headers;
                return [200, {}];
            });
            await Http.get('/api/test');
            expect(capturedHeaders['Authorization']).toBeUndefined();
        });

        it('does not add Authorization header when JWT is empty string', async () => {
            getCurrentJWT.mockReturnValue('');
            let capturedHeaders;
            mock.onGet('/api/test').reply(config => {
                capturedHeaders = config.headers;
                return [200, {}];
            });
            await Http.get('/api/test');
            expect(capturedHeaders['Authorization']).toBeUndefined();
        });

        it('does not override an existing Authorization header', async () => {
            getCurrentJWT.mockReturnValue('new-jwt');
            let capturedHeaders;
            mock.onGet('/api/test').reply(config => {
                capturedHeaders = config.headers;
                return [200, {}];
            });
            await Http.get('/api/test', {
                headers: {Authorization: 'Bearer existing-token'},
            });
            expect(capturedHeaders['Authorization']).toBe('Bearer existing-token');
        });
    });
});
