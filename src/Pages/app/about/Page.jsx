import {PageContentWrapper} from "../../../Components/Navigation/PageContentWrapper.jsx";
import {PageElementWrapper} from "../../../Components/Navigation/PageElementWrapper.jsx";
import {AboutTestGator} from "../../../Components/About/AboutTestGator.jsx";

export const Page = () => {
    return (
        <PageContentWrapper>
            <PageElementWrapper>
                <AboutTestGator/>
            </PageElementWrapper>
        </PageContentWrapper>
    );
};
