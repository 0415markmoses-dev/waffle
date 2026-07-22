import {useState} from "react";
import PropTypes from "prop-types";
import {FormGroup} from "../UI/Form/FormGroup.jsx";
import {TextInput} from "../UI/Form/Inputs/TextInput.jsx";
import {useTranslation} from "react-i18next";
import {useDebounce} from "use-debounce";
import {Button} from "../UI/Buttons/Button.jsx";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {TestPlanDisplayCard} from "./TestPlanDisplayCard.jsx";
import {useTestPlan, useTestPlans} from "../../Hooks/queries/useTestPlansQuery.js";

export const TestPlanSelector = ({
                                     value, onChange = () => {
    }
                                 }) => {
    const {currentProjectId} = useProjectStore();
    const {t} = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [finalQuery] = useDebounce(searchQuery, 420);

    // Load the currently selected test plan by id
    const selectedId = value?.id ?? (typeof value === 'string' ? value : undefined);
    const {data: loadedValue} = useTestPlan(selectedId);

    // Search results (only when query is long enough)
    const {data: searchResults = []} = useTestPlans({
        page: 1,
        size: 10,
        name: finalQuery,
        'release.project': currentProjectId ? `/api/projects/${currentProjectId}` : undefined,
    });
    const queryResults = finalQuery.length >= 3 ? (searchResults ?? []) : [];

    const displayValue = value?.name ? value : loadedValue;

    return (
        <div className="test-plan-selector-addEditorWrapper">
            {displayValue?.name ? (
                <>
                    <TestPlanDisplayCard testPlan={displayValue}/>
                    <div className="w-100 mt-2 d-flex justify-content-center">
                        <Button type="link" size="sm" onClick={() => onChange(undefined)}>
                            {t('Edit')}
                        </Button>
                    </div>
                </>
            ) : (
                <div className="test-plan-selector">
                    <FormGroup>
                        <TextInput
                            value={searchQuery}
                            onChange={value => setSearchQuery(value)}
                            placeholder={t("Search for a testing plan")}
                        />
                        <div className="w-100 mt-2 card shadow-none p-2">
                            {queryResults.length === 0 && (
                                <div className="text-muted text-center">{t("No results found")}</div>
                            )}
                            {queryResults.length >= 1 && (
                                <div className="w-100 test-plans-listing">
                                    {queryResults.map((item, index) => (
                                        <div key={index}
                                             className="test-plan-item p-2 d-flex justify-content-between align-items-center">
                                            <div className="test-plan-item-name">
                                                <span>{item.release?.name}</span> / <span>{item.name}</span>
                                            </div>
                                            <div className="test-plan-item-actions">
                                                <Button outline onClick={() => onChange(item)} type="primary" size="sm">
                                                    {t('Select')}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FormGroup>
                </div>
            )}
        </div>
    );
};

TestPlanSelector.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onChange: PropTypes.func,
};
