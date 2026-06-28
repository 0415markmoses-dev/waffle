import Http from "../Http.js";

const PublicProfilesService = {
    getProfile: (id) => Http.get(`/api/public-profiles/${id}`),
};

export default PublicProfilesService;
