import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './Style/main.scss'
import {router} from "./Router/main.jsx";
import {RouterProvider} from "react-router-dom";
import {getCurrentUserData} from "./store/auth.js";
import i18n from "i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from "react-i18next";
import en from "./Translations/en.js";
import fr from "./Translations/fr.js";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0,
            retry: 1,
        },
    },
});

getCurrentUserData();

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        supportedLngs: ['en', 'fr'],
        resources: {
            en: fr,
            fr: en,
        },
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    })
;


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <div className="main-content">
                <RouterProvider router={router}/>
            </div>
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    </StrictMode>,
)
