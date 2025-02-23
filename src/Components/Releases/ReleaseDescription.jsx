import PropTypes from "prop-types";
import {MarkdownRenderer} from "../UI/Markdown/MarkdownRenderer.jsx";

export const ReleaseDescription = ({description}) => {
    return <MarkdownRenderer markdown={description}/>
}

ReleaseDescription.propTypes = {
    description: PropTypes.string.isRequired
}
