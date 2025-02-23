import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PropTypes from "prop-types";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {nightOwl} from 'react-syntax-highlighter/dist/esm/styles/prism';

// table @see https://github.com/micromark/micromark-extension-gfm-table#css
// code @see https://github.com/react-syntax-highlighter/react-syntax-highlighter

export const MarkdownRenderer = ({markdown}) => {
    return <div className="markdown-renderer">
        <Markdown
            components={{
                code(props) {
                    // eslint-disable-next-line react/prop-types
                    const {children, className, node, ...rest} = props
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                        <SyntaxHighlighter
                            showLineNumbers={true}
                            useInlineStyles={true}
                            {...rest}
                            PreTag="div"
                            lineProps={{style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}}
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                            style={nightOwl}
                        />
                    ) : (
                        <code {...rest} className={className}>
                            {children}
                        </code>
                    )
                }
            }}
            remarkPlugins={[[remarkGfm, {}]]}>{markdown}</Markdown>
    </div>
}

MarkdownRenderer.propTypes = {
    markdown: PropTypes.string.isRequired
}
