import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import PropTypes from "prop-types";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {nightOwl} from 'react-syntax-highlighter/dist/esm/styles/prism';
// table @see https://github.com/micromark/micromark-extension-gfm-table#css
// code @see https://github.com/react-syntax-highlighter/react-syntax-highlighter

const convertImgToMarkdown = (markdown) => {
    if (markdown === null || markdown === undefined) {
        return '';
    }
    return markdown.replace(
        /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi,
        (_, beforeSrc, src, afterSrc) => {
            // Extract optional width and height attributes
            const widthMatch = beforeSrc.match(/width=["'](\d+)["']/) || afterSrc.match(/width=["'](\d+)["']/);
            const heightMatch = beforeSrc.match(/height=["'](\d+)["']/) || afterSrc.match(/height=["'](\d+)["']/);

            const width = widthMatch ? `${widthMatch[1]}` : "";
            const height = heightMatch ? `${heightMatch[1]}` : "";

            // Construct alt text using width/height (if available)
            const altText = "image";
            const size = width && height ? `${width}x${height}` : "";

            if (size !== '') {
                src = `${src},size://${size}`;
            }

            return `![${altText}](${src})`;
        }
    );
}

export const MarkdownRenderer = ({markdown}) => {
    markdown = convertImgToMarkdown(markdown);
    return <div className="markdown-renderer">
        <Markdown
            components={{
                // the point is to handle the bad formatting of images in the editor that add html in markdown
                img({node, ...props}) {
                    // eslint-disable-next-line react/prop-types
                    if (props?.src?.includes(',size://')) {
                        // Safe to drop the `?.` here — the guard above already
                        // proved props.src exists (its .includes call ran).
                        const [src, size] = props.src.split(',size://');
                        const [width, height] = size.split('x');
                        return <img {...props} className="d-block img-fluid mx-auto" alt={props.alt} width={width}
                                    height={height} src={src}/>
                    }

                    return <img {...props} className="img-fluid" alt={props.alt}/>
                },
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
                            language={match[1]}
                            style={nightOwl}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code {...rest} className={className}>
                            {children}
                        </code>
                    )
                }
            }}
            remarkPlugins={[[remarkGfm, {}]]}
            rehypePlugins={[rehypeRaw]}>{markdown}</Markdown>
    </div>
}

MarkdownRenderer.propTypes = {
    markdown: PropTypes.string.isRequired
}
