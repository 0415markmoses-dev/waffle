import {addEditorWrapper$} from "@mdxeditor/editor";
import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {FormGroup} from "../UI/Form/FormGroup.jsx";
import {FormGroupLabel} from "../UI/Form/FormGroupLabel.jsx";
import {TextInput} from "../UI/Form/Inputs/TextInput.jsx";
import {useTranslation} from "react-i18next";
import {useDebounce} from "use-debounce";
import TestPlansService from "../../Services/PrivateApi/TestPlansService.js";
import {Button} from "../UI/Buttons/Button.jsx";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {TestPlanDisplayCard} from "./TestPlanDisplayCard.jsx";

export const TestPlanSelector = ({
                                     value,
                                     onChange = () => {
                                     }
                                 }) => {
    const {currentProject} = useProjectStore();
    const {t} = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [finalQuery] = useDebounce(searchQuery, 420);
    const [queryResults, setQueryResults] = useState([]);
    const [loadedValue, setLoadedValue] = useState(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoadedValue(undefined);
        if (value === undefined || value === null) {
            return;
        }

        let id = value;
        if (value['@id'] !== undefined) {
            id = value['id'];
        }
        console.log('selected value', id);
        setLoading(true);
        TestPlansService.getOne(id)
            .then(response => {
                console.log('response', response.data);
                setLoadedValue(response.data);
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
            })
        ;
    }, [value]);

    useEffect(() => {
        // run query on finalQuery
        if (finalQuery === '' || finalQuery.length < 3) {
            setQueryResults([]);
            return;
        }
        TestPlansService.getTestPlans({
            page: 1,
            size: 10,
            name: finalQuery,
            'release.project': currentProject['@id'],
        })
            .then(response => {
                console.log('response', response.data);
                setQueryResults(response?.data?.member);
            })
            .catch(error => {
                console.log(error);
            })
    }, [finalQuery]);
    console.log('innerValue', value);

    const handleSelect = (item) => {
        onChange(item);
    }
    const handleChange = (value) => {
        onChange(value);
    }
    return <div className="test-plan-selector-addEditorWrapper">
        {(value !== undefined && value !== null && value?.name !== undefined) && (
            <>
                <TestPlanDisplayCard testPlan={value}/>
                <div className="w-100 mt-2 d-flex justify-content-center">
                    <Button type="link" size="sm"
                            onClick={() => {
                                handleChange(undefined);
                            }}>{t('Edit')}</Button>

                </div>
            </>
        )}
        {(value === undefined || value === null) && (
            <div className="test-plan-selector">
                <FormGroup>
                    <TextInput value={searchQuery} onChange={value => setSearchQuery(value)}
                               placeholder={t("Search for a testing plan")}/>
                    <div className="w-100 mt-2 card shadow-none p-2">
                        {queryResults.length === 0 && (
                            <div className="text-muted text-center">
                                {t("No results found")}
                            </div>
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
                                            <Button outline
                                                    onClick={() => {
                                                        handleSelect(item);
                                                    }}
                                                    type="primary" size="sm">{t('Select')}</Button>
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
}

TestPlanSelector.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,
}
