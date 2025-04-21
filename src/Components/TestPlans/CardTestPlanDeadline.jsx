import {Card} from "../UI/Card/Card.jsx";
import {CardBody} from "../UI/Card/CardBody.jsx";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {EvolutionLine} from "./CardTestPlanDeadline/EvolutionLine.jsx";
import WorkingDaysService from "../../Services/PrivateApi/WorkingDaysService.js";

export const CardTestPlanDeadline = ({
                                         testPlan,
                                     }) => {
    const {t} = useTranslation();
    // get today with name of the "day + number" in the form of the locale : 3 Jun, 3 Juin
    const today = new Date();
    const options = {weekday: 'short', year: undefined, month: undefined, day: 'numeric'};
    const todayString = today.toLocaleDateString('fr-FR', options);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [remainingDays, setRemainingDays] = useState(0);
    const [totalDays, setTotalDays] = useState(0);
    const [state, setState] = useState('in_time');
    const currentDate = new Date();


    useEffect(() => {

        // setState('overdue') = testPlan?.dueDate !== undefined && testPlan.dueDate < currentDate;
        let overdue = false;
        if (testPlan?.dueDate !== undefined) {
            let endDate = new Date(testPlan?.dueDate);
            if (endDate < currentDate) {
                setState('overdue');
                overdue = true;
            } else {
                setState('in_time');
            }
        }
        const computeRemainingDays = async () => {
            try {
                let startDate = new Date(currentDate);
                let endDate = new Date(testPlan?.dueDate);
                if (overdue === true) {
                    startDate = new Date(testPlan?.dueDate);
                    endDate = new Date(currentDate);
                }
                let workingDays = await WorkingDaysService.getWorkingDayBetween(startDate, endDate)
                setRemainingDays(workingDays);
            } catch (error) {
                console.error(error);
            }

            try {
                let startDate = new Date(testPlan?.created);
                let endDate = new Date(testPlan?.dueDate);
                let workingDays = await WorkingDaysService.getWorkingDayBetween(startDate, endDate)
                setTotalDays(workingDays);
            } catch (error) {
                console.error(error);
            }
        }

        computeRemainingDays()
            .catch(err => {
                console.error(err);
            })

    }, [testPlan?.dueDate, lastUpdate]);


    console.log('render card')
    // make the component update itself
    useEffect(() => {
        let $timer = setInterval(() => {
            setLastUpdate(new Date());
        }, 2500);

        return () => {
            clearInterval($timer);
        }
    }, []);


    return <Card className="card-colored-purple">
        {(testPlan?.id === undefined || testPlan?.dueDate === undefined) && (
            <div className="p-3 h-100">
                <div className="text-center opacity-50">
                    <div className="h5">
                        {t('No test plan selected')}
                    </div>
                    <div className="text-muted">
                        {t('Select a test plan to see its deadline')}
                    </div>
                </div>
            </div>
        )}
        {testPlan?.id !== undefined && testPlan?.dueDate !== undefined && (
            <div className="p-3 h-100 d-flex gap-md flex-column justify-content-between">
                <div className="w-100 d-flex justify-content-between align-items-center pb-3">
                    <div className="left-items">
                        <div className="test-pill">
                        <span className="label heading">
                            {t('Test Plan Evolution')}
                        </span>
                        </div>
                    </div>
                    <div className="right-items heading opacity-50">
                        {todayString}
                    </div>
                </div>
                <div className="w-100 py-3">
                    <div className="test-plan-title h5 text-center m-0">
                        {testPlan?.name}
                    </div>
                    <div className="test-plan-subtitle heading text-center small opacity-50 m-0">
                        {t('Total days')} : {totalDays}
                    </div>
                </div>
                <div className="w-100 d-flex justify-content-between align-items-center gap-lg">
                    <div className="item-left flex-grow-1">
                        <EvolutionLine targetFinish={testPlan.dueDate} start={testPlan.created}
                                       current={currentDate}/>
                    </div>
                    <div className="item-right flex-grow-0 heading small pt-4">
                        {state === 'in_time' ? t('Remaining') : t('Overdue')} : {remainingDays}{t('days_short')}
                    </div>
                </div>
            </div>
        )}
    </Card>
}

CardTestPlanDeadline.propTypes = {
    testPlan: PropTypes.object,
}
