import {Card} from "../UI/Card/Card.jsx";
import {CardBody} from "../UI/Card/CardBody.jsx";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {EvolutionLine} from "./CardTestPlanDeadline/EvolutionLine.jsx";
import WorkingDaysService from "../../Services/PrivateApi/WorkingDaysService.js";

export const CardTestPlanDeadline = ({testPlan}) => {
    const {t} = useTranslation();

    const today = new Date();
    const todayString = today.toLocaleDateString('fr-FR', {weekday: 'short', day: 'numeric'});

    const [remainingDays, setRemainingDays] = useState(0);
    const [elapsedDays, setElapsedDays] = useState(0);
    const [totalDays, setTotalDays] = useState(0);
    const [isOverdue, setIsOverdue] = useState(false);

    useEffect(() => {
        if (!testPlan?.dueDate || !testPlan?.created) return;

        const start = new Date(testPlan.created);
        const end = new Date(testPlan.dueDate);
        const now = new Date();
        const overdue = now > end;
        setIsOverdue(overdue);

        (async () => {
            try {
                const total = await WorkingDaysService.getWorkingDayBetween(start, end);
                setTotalDays(total);
            } catch (e) {
                console.error(e);
            }

            try {
                if (overdue) {
                    const late = await WorkingDaysService.getWorkingDayBetween(end, now);
                    setRemainingDays(late);
                    setElapsedDays(await WorkingDaysService.getWorkingDayBetween(start, end));
                } else {
                    const remaining = await WorkingDaysService.getWorkingDayBetween(now, end);
                    const elapsed = await WorkingDaysService.getWorkingDayBetween(start, now);
                    setRemainingDays(remaining);
                    setElapsedDays(elapsed);
                }
            } catch (e) {
                console.error(e);
            }
        })();
    }, [testPlan?.dueDate, testPlan?.created]);

    const pct = totalDays > 0 ? Math.min(100, Math.round((elapsedDays / totalDays) * 100)) : 0;

    if (!testPlan?.id || !testPlan?.dueDate) {
        return (
            <Card>
                <CardBody>
                    <div className="text-center opacity-50 py-4">
                        <div className="h5">{t('No due date set')}</div>
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className="ctpd-card">
            <CardBody>
                <div className="ctpd-body">

                    {/* ── Header ── */}
                    <div className="ctpd-header">
                        <div className="ctpd-header-left">
                            <div className="ctpd-pill">
                                {t('Test Plan Evolution').toUpperCase()}
                            </div>
                    </div>
                        <div className="ctpd-date">{todayString}</div>
                </div>

                    {/* ── Title ── */}
                    <div className="ctpd-title-block">
                        <div className="ctpd-plan-name">{testPlan.name}</div>
                        <div className="ctpd-plan-sub">{t('Total days')} : {totalDays}</div>
                    </div>

                    {/* ── Progress ── */}
                    <div className="ctpd-progress-block">
                        <div className="ctpd-progress-row">
                            <span className="ctpd-progress-label">{t('Global progression')}</span>
                            <div className="ctpd-progress-meta">
                                <span className="ctpd-days-ratio">{elapsedDays} / {totalDays} {t('days')}</span>
                            </div>
                        </div>
                        <EvolutionLine
                            start={testPlan.created}
                            targetFinish={testPlan.dueDate}
                            current={today}
                            isOverdue={isOverdue}
                        />
                    </div>

                    {/* ── Footer ── */}
                    <div className="ctpd-footer">
                        <i className="font-icon lni lni-alarm-1"/>
                        <span>
                        {isOverdue ? t('Overdue') : t('Remaining')} : {remainingDays} {t('days')}
                    </span>
                </div>

            </div>
            </CardBody>
        </Card>
    );
};

CardTestPlanDeadline.propTypes = {
    testPlan: PropTypes.object,
};
