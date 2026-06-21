import {useTranslation} from "react-i18next";
import {Card} from "../UI/Card/Card.jsx";
import {CardBody} from "../UI/Card/CardBody.jsx";
import {CardHeader} from "../UI/Card/CardHeader.jsx";

// ── AboutTestGator ────────────────────────────────────────────────────────────

export const AboutTestGator = () => {
    const {t} = useTranslation();

    const FEATURES = [
        {icon: 'lni-rocket-5', title: t('about.feature_plan_title'), desc: t('about.feature_plan_desc')},
        {icon: 'lni-user-multiple-4', title: t('about.feature_testers_title'), desc: t('about.feature_testers_desc')},
        {icon: 'lni-comment-1', title: t('about.feature_answers_title'), desc: t('about.feature_answers_desc')},
        {icon: 'lni-bar-chart-4', title: t('about.feature_results_title'), desc: t('about.feature_results_desc')},
    ];

    const WHY = [
        {icon: 'lni-bolt-2', title: t('about.why_chaos_title'), desc: t('about.why_chaos_desc')},
        {icon: 'lni-emoji-smile', title: t('about.why_feedback_title'), desc: t('about.why_feedback_desc')},
        {icon: 'lni-eye', title: t('about.why_quality_title'), desc: t('about.why_quality_desc')},
    ];

    const INFO_ROWS = [
        {icon: 'lni-info', label: t('about.info_version'), value: '0.0.1'},
        {icon: 'lni-check-circle-1', label: t('about.info_license'), value: 'GNU AGPL v3.0'},
        {icon: 'lni-globe-1', label: t('about.info_languages'), value: t('about.info_languages_value')},
        {icon: 'lni-github', label: t('about.info_repository'), value: 'GitHub', link: '#', external: true},
        {icon: 'lni-book-1', label: t('about.info_docs'), value: t('about.info_docs_value'), link: '#', external: true},
    ];

    return (
        <div className="atg-root">

            {/* ── Top bar ── */}
            <div className="atg-topbar">
                <div>
                    <h1 className="atg-title">{t('about.title')}</h1>
                    <p className="atg-subtitle">{t('about.subtitle')}</p>
                </div>
            </div>

            {/* ── Hero card (custom — copy of td-hero, independent classes) ── */}
            <div className="atg-hero">
                <div className="atg-hero-body">
                    <h2 className="atg-hero-title">{t('about.hero_title')}</h2>
                    <p className="atg-hero-desc">{t('about.hero_desc')}</p>
                    <div className="atg-hero-tags">
                        <span className="atg-hero-tag"><i
                            className="font-icon lni lni-clipboard"/>{t('about.tag_plans')}</span>
                        <span className="atg-hero-tag"><i
                            className="font-icon lni lni-git"/>{t('about.tag_releases')}</span>
                        <span className="atg-hero-tag"><i
                            className="font-icon lni lni-comment-1"/>{t('about.tag_feedback')}</span>
                        <span className="atg-hero-tag"><i
                            className="font-icon lni lni-code-1"/>{t('about.tag_opensource')}</span>
                    </div>
                </div>
                <div className="atg-hero-image">
                    <img src="/assets/fighting_bugs.png" alt=""/>
                </div>
            </div>

            {/* ── Feature cards ── */}
            <div className="atg-features">
                {FEATURES.map(f => (
                    <Card key={f.title}>
                        <CardBody>
                            <div className="atg-feature-inner">
                                <div className="atg-feature-icon">
                                    <i className={`font-icon lni ${f.icon}`}/>
                                </div>
                                <div>
                                    <div className="atg-feature-title">{f.title}</div>
                                    <div className="atg-feature-desc">{f.desc}</div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* ── Why + Product info ── */}
            <div className="atg-mid-row">

                {/* Why TestGator exists */}
                <Card>
                    <CardHeader title={t('about.why_title')}/>
                    <CardBody>
                        <div className="atg-why-grid">
                            {WHY.map(w => (
                                <div key={w.title} className="atg-why-card">
                                    <div className="atg-why-icon">
                                        <i className={`font-icon lni ${w.icon}`}/>
                                    </div>
                                    <div className="atg-why-title">{w.title}</div>
                                    <div className="atg-why-desc">{w.desc}</div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Product information */}
                <Card>
                    <CardHeader title={t('about.info_title')}/>
                    <CardBody>
                        <div className="atg-info-rows">
                            {INFO_ROWS.map(row => (
                                <div key={row.label} className="atg-info-row">
                                    <div className="atg-info-left">
                                        <i className={`font-icon lni ${row.icon}`}/>
                                        <span>{row.label}</span>
                                    </div>
                                    <div className="atg-info-value">
                                        {row.link ? (
                                            <a href={row.link} className="atg-info-link"
                                               {...(row.external ? {
                                                   target: '_blank',
                                                   rel: 'noopener noreferrer'
                                               } : {})}>
                                                {row.value}
                                                {row.external &&
                                                    <i className="font-icon lni lni-link-2-angular-right"/>}
                                            </a>
                                        ) : row.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

            </div>

            {/* ── Bottom help card (custom — independent classes) ── */}
            <div className="atg-help-card">
                <div className="atg-help-gator">
                    <img src="/assets/customer_support_mage.png" alt=""/>
                </div>
                <div className="atg-help-body">
                    <h3 className="atg-help-title">{t('about.help_title')}</h3>
                    <p className="atg-help-desc">{t('about.help_desc')}</p>
                </div>
                <div className="atg-help-actions">
                    <a href="#" className="atg-help-btn atg-help-btn--primary">
                        <i className="font-icon lni lni-book-1"/>
                        {t('about.help_read_docs')}
                    </a>
                    <a href="#" className="atg-help-btn atg-help-btn--secondary">
                        <i className="font-icon lni lni-bug-1"/>
                        {t('about.help_report')}
                    </a>
                </div>
            </div>

        </div>
    );
};
