import Http from "../Http.js";

const AuthService = {
    getJWT: (email, password) => {
        return Http.post('/apx/login', {
            username: email,
            password: password,
            authMode: 'ldap',
        });
    },
    getSelfData: () => {
        return Http.get('/apx/me');
    },
}

export default AuthService;
