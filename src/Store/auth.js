import {create} from 'zustand'
import {persist} from 'zustand/middleware'
//import {produce} from 'immer';
import createSelector from "../Utils/store.createSelector.js";
import AuthService from "../Services/Authentication/AuthService.js";

/** Returns true when the authenticated user is a tester (not a team member). */
export const isTester = (user) => user?.type?.toUpperCase() === 'TESTER';

export const useAuthStore = createSelector(create(persist((set, get) => ({
    user: null,
    jwt: null,
    isLoadingUser: false,

    clearUserData: () => set({user: null, jwt: null, isLoadingUser: false}),

    getUserData: async () => {
        // No JWT means nothing to fetch — avoid a pointless 401
        if (!get().jwt) return;

        set({isLoadingUser: true});
        try {
            const response = await AuthService.getSelfData();
            if (response?.data !== undefined) {
                set({user: response.data, isLoadingUser: false});
                return;
            }
            throw new Error('Invalid response');
        } catch (error) {
            set({isLoadingUser: false});
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                get().clearUserData();
            }
            throw error;
        }
    },

    generateCode: async (email) => {
        try {
            const response = await AuthService.getJWT(email, '', 'tester', 'code');
            if (response?.data?.logged === false && response?.data?.otp === true) {
                return;
            }
            throw new Error('Invalid response');
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    // first request a JWT then get user data
    requestLogin: async (email, password, mode = 'team', authMode = 'ldap') => {
        try {
            const response = await AuthService.getJWT(email, password, mode, authMode);
            if (response?.data?.jwt !== undefined) {
                set({jwt: response.data.jwt});
                await get().getUserData();
                return;
            }
            throw new Error('Invalid response');
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
}), {name: 'testgator-auth-storage'})));


export const getCurrentJWT = () => useAuthStore.getState().jwt;
export const getCurrentUserData = () => useAuthStore.getState().getUserData();
