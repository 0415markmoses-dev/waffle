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
import es from "./Translations/es.js";
import de from "./Translations/de.js";
import it from "./Translations/it.js";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {Toaster} from "react-hot-toast";

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
        supportedLngs: ['en', 'fr', 'es', 'de', 'it'],
        resources: {
            en: en,
            fr: fr,
            es: es,
            de: de,
            it: it,
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
            <Toaster position="bottom-left" toastOptions={{duration: 5000}}/>
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    </StrictMode>,
)
