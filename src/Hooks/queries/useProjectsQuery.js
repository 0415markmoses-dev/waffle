import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import ProjectService from "../../Services/PrivateApi/ProjectService.js";

export const projectKeys = {
    all: ['projects'],
    list: (params) => ['projects', 'list', params],
    detail: (id) => ['projects', 'detail', id],
};

export const useProjects = (params = {}) => {
    return useQuery({
        queryKey: projectKeys.list(params),
        queryFn: () => ProjectService.getProjects(params).then(r => r.data),
    });
};

export const useProject = (id) => {
    return useQuery({
        queryKey: projectKeys.detail(id),
        queryFn: () => ProjectService.getProject(id).then(r => r.data),
        enabled: !!id,
    });
};

export const useInvalidateProjects = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({queryKey: projectKeys.all});
};
