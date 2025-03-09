import {create} from 'zustand'
import {persist} from 'zustand/middleware'
//import {produce} from 'immer';
import createSelector from "../utils/store.createSelector.js";
import AuthService from "../Services/Authentication/AuthService.js";


export const useAuthStore = createSelector(create(persist((set) => ({
    user: null,
    jwt: null,
    clearUserData: () => set({user: null, jwt: null}),
    getUserData: async () => {
        try {
            let response = await AuthService.getSelfData();
            if (response?.data !== undefined) {
                set({user: response.data});
                // load user data
                return;
            }
            throw new Error('Invalid response');
        } catch (error) {
            // if error response status is 401 clear user data
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                useAuthStore.getState().clearUserData();
            }
            throw error;
        }
    },
    generateCode: async (email) => {
        try {
            let response = await AuthService.getJWT(email, '', 'tester', 'code');
            if (response?.data?.logged === false && response?.data?.otp === true) {
                return;
            }
            throw new Error('Invalid response');
        } catch (error) {
            console.error(error)
            throw error;
        }
    },
    // first request a JWT then get user data
    requestLogin: async (email, password, mode = 'team', authMode = 'ldap') => {
        try {
            let response = await AuthService.getJWT(email, password, mode, authMode);
            if (response?.data?.jwt !== undefined) {
                set({jwt: response.data.jwt});
                // load user data
                await useAuthStore.getState().getUserData();
                return;
            }
            throw new Error('Invalid response');
        } catch (error) {
            console.error(error)
            throw error;
        }
    },
}), {name: 'testgator-auth-storage'})));


export const getCurrentJWT = () => {
    return useAuthStore.getState().jwt;
}


export const getCurrentUserData = () => {
    return useAuthStore.getState().getUserData();
}
