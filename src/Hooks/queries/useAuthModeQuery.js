import {useQuery} from '@tanstack/react-query';
import AuthService from '../../Services/Authentication/AuthService.js';

export const useAuthMode = () => useQuery({
    queryKey: ['auth-mode'],
    queryFn: () => AuthService.getAuthMode().then(r => r.data),
    staleTime: Infinity,
    retry: false,
});
