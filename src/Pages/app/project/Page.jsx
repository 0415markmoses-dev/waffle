import {PageContentWrapper} from "../../../Components/Navigation/PageContentWrapper.jsx";
import {Button} from "../../../Components/UI/Buttons/Button.jsx";
import {PageTitle} from "../../../Components/Navigation/PageTitle.jsx";

export const Page = () => {
    return <>
        <PageContentWrapper>
            <PageTitle title="Project">
                <Button icon="lni-sliders-horizontal-square-2"
                        type="light" size="sm">Petit button</Button>
                <Button type="light" size="sm">Petit button</Button>
            </PageTitle>

        </PageContentWrapper>
    </>
}
