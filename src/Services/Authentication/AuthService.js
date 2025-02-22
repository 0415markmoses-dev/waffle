import Http from "../Http.js";

const AuthService = {
    getJWT: (email, password) => {
        return Http.post('/api/auth/login', {
            username: email,
            password: password,
            authMode: 'ldap',
        });
    },
    getSelfData: () => {
        return Http.get('/api/auth/me');
    },
}

export default AuthService;
