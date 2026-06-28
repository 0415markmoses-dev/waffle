import {useQuery} from '@tanstack/react-query';
import PublicProfilesService from '../../Services/PrivateApi/PublicProfilesService.js';

export const usePublicProfile = (id) => useQuery({
    queryKey: ['public-profile', id],
    queryFn: () => PublicProfilesService.getProfile(id).then(r => r.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // profiles rarely change — cache 5 min
    retry: false,
});
