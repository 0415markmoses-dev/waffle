import Http from "../Http.js";

const UsersService = {
    getUsers(params = {}) {
        return Http.get('/api/users', {params});
    },
    getUser(id) {
        return Http.get('/api/users/' + id);
    },
    createUser(data) {
        return Http.post('/api/users', data);
    },
    updateUser(id, data) {
        return Http.patch('/api/users/' + id, data, {
            headers: {'Content-Type': 'application/merge-patch+json'},
        });
    },
    deleteUser(id) {
        return Http.delete('/api/users/' + id);
    },
};

export default UsersService;
