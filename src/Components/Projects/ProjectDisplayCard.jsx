import PropTypes from "prop-types";
import classNames from "classnames";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const ProjectDisplayCard = ({
                                       project,
                                       fullWidth = false,
                                       active = false,
                                       interractive = false,
                                       ...props
                                   }) => {

    const cardClasses = classNames(
        "project-card",
        "card",
        {
            "w-100": fullWidth,
            "card-active border-primary": active,
            "cursor-pointer": interractive,
        }
    );

    return <div {...props} className={cardClasses}>
        <div className="card-body d-flex gap-md">
            <div className="project-meta flex-grow-0 d-flex justify-content-end align-items-center">
                <div className="project-picture-wrapper">
                    <img src="/assets/gator_avatar.png" alt=""/>
                </div>
            </div>
            <div className="project-info w-75">
                <h5 className="card-title">{project.name}</h5>
                <div className="text-muted small markdown-renderer">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description ?? ''}</ReactMarkdown>
                </div>
            </div>
            <div className="project-meta w-25 d-flex justify-content-center align-items-end flex-column gap-md">
                <div className="badge bg-info heading super-small">
                    {project.totalReleases >= 1 ? (
                        <>
                            {project.totalReleases} Releases
                        </>
                    ) : (
                        <>
                            {project.totalReleases} Release
                        </>
                    )}
                </div>
                <div className="badge bg-light text-muted heading super-small">
                    {project.totalTesters >= 1 ? (
                        <>
                            {project.totalTesters} Testers
                        </>
                    ) : (
                        <>
                            {project.totalTesters} Tester
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
}

ProjectDisplayCard.propTypes = {
    project: PropTypes.object.isRequired,
    fullWidth: PropTypes.bool,
    active: PropTypes.bool,
    interractive: PropTypes.bool,
}
