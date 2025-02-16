import PropTypes from "prop-types";
import classNames from "classnames";
import TestingPlanDateDisplay from "./TestingPlanDateDisplay.jsx";

export const TestPlanDisplayCard = ({
                                        testPlan,
                                        fullWidth = false,
                                        active = false,
                                        disabled = false,
                                        interactive = false,
                                        isCard = true,
                                        ...props
                                    }) => {

    const cardClasses = classNames(
        "project-card test-plan-card",
        {
            "w-100": fullWidth,
            "card": isCard,
            "card-active border-primary": active,
            "cursor-pointer": interactive,
            "opacity-25": disabled,
        }
    );

    const bodyClasses = classNames(
        {
            "card-body d-flex gap-md": isCard,
        }
    );

    let imgSrc = "/assets/testing_open.jpg";
    if (testPlan.state === 'archived') {
        imgSrc = "/assets/testing_archived.jpg";
    }

    const stateBadge = classNames(
        'badge heading',
        {
            "bg-light text-muted": testPlan.state === 'archived',
            "bg-primary": testPlan.state === 'published',
            "bg-dark": testPlan.state === 'draft',
        }
    );

    return <div {...props} className={cardClasses}>
        <div className={bodyClasses}>
            <div className="gap-lg d-flex align-items-center flex-row">
                <div className="flex-grow-0 test-plan-date">
                    <TestingPlanDateDisplay dueDate={testPlan.dueDate}/>
                </div>
                <div className="flex-grow-0 test-plan-illustration">
                    <img className="w-100" src={imgSrc} alt=""/>
                </div>
                <div
                    className="flex-grow-1 test-plan-content d-flex flex-column gap-sm">
                    <div className="test-plan-status small d-flex gap-sm">
                        <div className={stateBadge}>{testPlan.state}</div>
                        <div className="badge heading bg-light text-muted">Release : {testPlan.release.name}</div>
                        <div className="badge heading bg-info">
                            {testPlan.totalQuestions >= 1 ? (
                                <>
                                    {testPlan.totalQuestions} Cases
                                </>
                            ) : (
                                <>
                                    {testPlan.totalQuestions} Case
                                </>
                            )}
                        </div>
                        <div className="badge heading bg-light text-muted">
                            {testPlan.totalTestersEnrolled >= 1 ? (
                                <>
                                    {testPlan.totalTestersEnrolled} Testers
                                </>
                            ) : (
                                <>
                                    {testPlan.totalTestersEnrolled} Tester
                                </>
                            )}
                        </div>

                    </div>
                    <div className="test-plan-name heading">
                        {testPlan.name}
                    </div>
                    <div className="test-plan-description small text-muted">
                        {testPlan.description}
                    </div>
                </div>
            </div>
        </div>
    </div>
}

TestPlanDisplayCard.propTypes = {
    testPlan: PropTypes.object.isRequired,
    fullWidth: PropTypes.bool,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    interactive: PropTypes.bool,
    isCard: PropTypes.bool,
}
