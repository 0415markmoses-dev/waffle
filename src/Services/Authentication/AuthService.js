import Http from "../Http.js";

const AuthService = {
    getAuthMode: () => {
        return Http.get('/api/auth/mode');
    },
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
    changePasswordSelf: (plainPassword) => {
        return Http.post('/api/auth/me/change-password', {plainPassword});
    },
    uploadProfilePicture: (userId, formData) => {
        return Http.post(`/api/users/${userId}/profile-picture`, formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        });
    },
    deleteProfilePicture: (userId) => {
        return Http.delete(`/api/users/${userId}/profile-picture`);
    },
}

export default AuthService;
