import Http from "../Http.js";

const AuthService = {
    getJWT: (email, password, mode = 'team', authMode = 'ldap') => {
        return Http.post('/api/auth/login', {
            username: email,
            password: password,
            authMode: authMode,
            mode: mode,
        });
    },
    getSelfData: () => {
        return Http.get('/api/auth/me');
    },
}

export default AuthService;
