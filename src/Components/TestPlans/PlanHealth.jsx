import PropTypes from "prop-types";
import {usePlanHealth} from "../../Hooks/queries/useQuestionsQuery.js";
import {HealthDisplay} from "../Health/HealthDisplay.jsx";

export const PlanHealth = ({testPlan}) => {
    const {isLoading, pass, passWithBugs, failed, blocked, pending} = usePlanHealth(testPlan);

    return (
        <HealthDisplay
            pass={pass}
            passWithBugs={passWithBugs}
            failed={failed}
            blocked={blocked}
            pending={pending}
            isLoading={isLoading}
        />
    );
};

PlanHealth.propTypes = {
    testPlan: PropTypes.object.isRequired,
};
