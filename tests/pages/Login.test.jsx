import '@testing-library/jest-dom/vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {Login} from '../../src/Pages/Login.jsx';

const mockRequestLogin = vi.fn();
const mockGenerateCode = vi.fn();

vi.mock('../../src/Store/auth.js', () => ({
    useAuthStore: () => ({
        user: null,
        isLoadingUser: false,
        requestLogin: mockRequestLogin,
        generateCode: mockGenerateCode,
    }),
    isTester: (user) => user?.type?.toUpperCase() === 'TESTER',
}));

vi.mock('../../src/Services/Authentication/AuthService.js', () => ({
    default: {
        getAuthMode: vi.fn().mockResolvedValue({data: {mode: 'db'}}),
    },
}));

describe('Login', () => {
    beforeEach(() => {
        mockRequestLogin.mockReset();
        mockGenerateCode.mockReset();
    });

    it('asks for a username and password instead of an email for team login', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByRole('button', {name: /Login as Team Member/i})).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', {name: /Login as Team Member/i}));

        await waitFor(() => {
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
        });

        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.queryByText('Email')).not.toBeInTheDocument();
    });
});
