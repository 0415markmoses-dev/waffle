import '@testing-library/jest-dom/vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {Login} from '../../src/Pages/Login.jsx';

const mockRequestLogin = vi.fn();

vi.mock('../../src/Store/auth.js', () => ({
    useAuthStore: () => ({
        user: null,
        isLoadingUser: false,
        requestLogin: mockRequestLogin,
    }),
}));

vi.mock('../../src/Services/Authentication/AuthService.js', () => ({
    default: {
        getAuthMode: vi.fn().mockResolvedValue({data: {mode: 'db'}}),
    },
}));

describe('Login', () => {
    beforeEach(() => {
        mockRequestLogin.mockReset();
    });

    it('shows the username/password sign-in form without a tester option or helper text', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
            expect(screen.getByLabelText('Password')).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', {name: /Login as Tester/i})).not.toBeInTheDocument();
        expect(screen.queryByText(/username and password to sign in/i)).not.toBeInTheDocument();
    });
});
