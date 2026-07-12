import {useTranslation} from "react-i18next";

export const Loader = () => {
    const {t} = useTranslation();

    return <div className="loader-wrapper">
        <div className="loader-avatar" role="status">
            <svg className="spinner-ring" viewBox="0 0 100 100" aria-hidden="true">
                <circle className="spinner-arc spinner-arc--1" cx="50" cy="50" r="45"/>
                <circle className="spinner-arc spinner-arc--2" cx="50" cy="50" r="45"/>
                <circle className="spinner-arc spinner-arc--3" cx="50" cy="50" r="45"/>
                <circle className="spinner-arc spinner-arc--4" cx="50" cy="50" r="45"/>
            </svg>
            <div className="gator-head">
                <img src="/assets/gator_head_only.png" alt=""/>
            </div>
        </div>
        <span className="loader-label fw-medium">{t('Loading…')}</span>
    </div>
}
