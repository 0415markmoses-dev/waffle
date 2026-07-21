import {
    BoldItalicUnderlineToggles,
    UndoRedo,
    codeBlockPlugin,
    codeMirrorPlugin,
    diffSourcePlugin,
    frontmatterPlugin,
    headingsPlugin,
    imagePlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    Separator,
    BlockTypeSelect,
    InsertCodeBlock,
    InsertImage,
    InsertTable,
    InsertThematicBreak, CreateLink, ListsToggle, DiffSourceToggleWrapper,

} from "@mdxeditor/editor";
import '@mdxeditor/editor/style.css'
import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import UploadService from "../../../../Services/Upload/UploadService.js";

// code blocks @see https://mdxeditor.dev/editor/docs/code-blocks
// bug with mal formatted code blocks, where language is not specified

export const MkEditorInstance = ({value, onChange, className = ''}) => {
    const [originalValue, setOriginalValue] = useState(value);
    useEffect(() => {
        setOriginalValue(value);
    }, [value])

    const handleUpload = async (image) => {
        try {
            // single-step upload (uses the standard app JWT via the Http interceptor)
            const response = await UploadService.uploadFile(image);
            // return the url of the uploaded file
            return response?.data?.url ?? null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    return <>
        <MDXEditor markdown={value}
                   onError={console.error}
                   onChange={onChange}
                   className={"form-control mdxeditor-form " + className}
                   plugins={[
                       toolbarPlugin({
                           toolbarClassName: 'my-classname',
                           toolbarContents: () => <>
                               <UndoRedo/>
                               <Separator/>
                               <BoldItalicUnderlineToggles/>
                               <ListsToggle/>
                               <BlockTypeSelect/>
                               <Separator/>
                               <CreateLink/>
                               <InsertImage/>
                               <InsertTable/>
                               <InsertCodeBlock/>
                               <Separator/>
                               <InsertThematicBreak/>
                               <DiffSourceToggleWrapper/>
                           </>
                       }),
                       listsPlugin(),
                       quotePlugin(),
                       headingsPlugin(),
                       linkPlugin(),
                       linkDialogPlugin(),
                       imagePlugin({
                           imageUploadHandler: handleUpload,
                       }),
                       tablePlugin(),
                       thematicBreakPlugin(),
                       frontmatterPlugin(),
                       codeBlockPlugin({defaultCodeBlockLanguage: 'js'}),
                       codeMirrorPlugin({
                           autoLoadLanguageSupport: true,
                           codeBlockLanguages: {
                               js: "JavaScript",
                               jsx: "JavaScript (React)",
                               ts: "TypeScript",
                               tsx: "TypeScript (React)",
                               html: "HTML",
                               css: "CSS",
                               scss: "SCSS",
                               less: "LESS",
                               json: "JSON",
                               yaml: "YAML",
                               xml: "XML",
                               csv: "CSV",
                               txt: "Text",
                               md: "Markdown",
                               markdown: "Markdown",
                               bash: "Bash",
                               sh: "Shell Script",
                               zsh: "Zsh",
                               powershell: "PowerShell",
                               python: "Python",
                               py: "Python",
                               java: "Java",
                               c: "C",
                               cpp: "C++",
                               h: "C Header",
                               cs: "C#",
                               go: "Go",
                               rs: "Rust",
                               swift: "Swift",
                               php: "PHP",
                               ruby: "Ruby",
                               rb: "Ruby",
                               perl: "Perl",
                               pl: "Perl",
                               lua: "Lua",
                               r: "R",
                               sql: "SQL",
                               graphql: "GraphQL",
                               dockerfile: "Dockerfile",
                               makefile: "Makefile",
                               ini: "INI",
                               toml: "TOML",
                               properties: "Properties",
                               diff: "Diff",
                               http: "HTTP",
                               nginx: "Nginx",
                               apache: "Apache",
                               asm: "Assembly",
                               nasm: "NASM",
                               vhdl: "VHDL",
                               verilog: "Verilog",
                               clojure: "Clojure",
                               clj: "Clojure",
                               fsharp: "F#",
                               fs: "F#",
                               lisp: "Lisp",
                               scheme: "Scheme",
                               tex: "LaTeX",
                               latex: "LaTeX",
                               matlab: "MATLAB",
                               octave: "Octave",
                               vb: "Visual Basic",
                               vbscript: "VBScript",
                               batch: "Batch",
                               cmd: "Command Prompt",
                               groovy: "Groovy",
                               pascal: "Pascal",
                               objectivec: "Objective-C",
                               objc: "Objective-C",
                               prolog: "Prolog",
                               dart: "Dart",
                               elm: "Elm",
                               jinja: "Jinja2",
                               restructuredtext: "reStructuredText",
                               ada: "Ada",
                               fortran: "Fortran",
                               cobol: "COBOL",
                               racket: "Racket",
                               sml: "Standard ML",
                               ocaml: "OCaml",
                               zig: "Zig",
                               kotlin: "Kotlin",
                               haskell: "Haskell",
                               hs: "Haskell",
                               scala: "Scala",
                               '': "Text"
                           }
                       }),
                       diffSourcePlugin(
                           {
                               diffMarkdown: originalValue,
                               viewMode: 'rich-text',
                           }
                       ),
                       markdownShortcutPlugin()
                   ]}/>
    </>
}

MkEditorInstance.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string
}
