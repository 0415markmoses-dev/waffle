export const Footer = () => {
    return <footer className="footer-container">
        <div className="d-flex justify-content-between align-items-center">
            <div className="footer-left">
                <span className="opacity-25">TestGator 2025-{new Date().getFullYear()} © arkdevuk</span>
            </div>
            <div className="footer-right">
                <a target="_blank" rel="noopener"
                   href="https://github.com/arkdevuk/testgator_client/">Github</a>
                <a target="_blank" rel="noopener"
                   href="https://github.com/arkdevuk/testgator">Documentation</a>
                <a target="_blank" rel="noopener"
                   href="https://github.com/arkdevuk/testgator/issues">Issues</a>
                <a target="_blank" rel="noopener"
                   href="https://github.com/arkdevuk/testgator_client/blob/main/LICENSE?raw=true">License</a>
            </div>
        </div>
    </footer>
}
