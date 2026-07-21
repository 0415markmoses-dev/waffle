import {useEffect, useRef, useState} from "react";

// ── UA fallback detection (used when userAgentData is unavailable) ─────────────

const detectOSFromUA = (ua) => {
    // Note: macOS always reports 10_15_7 in UA since Big Sur — don't trust the version
    if (/Windows NT 10\.0/.test(ua)) return {name: 'Windows', version: '10/11'};
    if (/Windows NT 6\.3/.test(ua)) return {name: 'Windows', version: '8.1'};
    if (/Windows NT 6\.2/.test(ua)) return {name: 'Windows', version: '8'};
    if (/Windows NT 6\.1/.test(ua)) return {name: 'Windows', version: '7'};
    if (/Windows/.test(ua)) return {name: 'Windows', version: null};
    if (/Mac OS X/.test(ua)) return {name: 'macOS', version: null}; // version unreliable
    if (/iPhone|iPad|iPod/.test(ua)) {
        const v = ua.match(/OS ([\d_]+)/);
        return {name: 'iOS', version: v ? v[1].replace(/_/g, '.') : null};
    }
    const androidMatch = ua.match(/Android ([\d.]+)/);
    if (androidMatch) return {name: 'Android', version: androidMatch[1]};
    if (/CrOS/.test(ua)) return {name: 'ChromeOS', version: null};
    if (/Linux/.test(ua)) return {name: 'Linux', version: null};
    return {name: 'Unknown OS', version: null};
};

const detectBrowserFromUA = (ua) => {
    const edgeMatch = ua.match(/Edg\/([\d.]+)/);
    if (edgeMatch) return {name: 'Edge', version: edgeMatch[1].split('.')[0]};

    const chromeMatch = ua.match(/Chrome\/([\d.]+)/);
    if (chromeMatch && !/Chromium/.test(ua)) return {name: 'Chrome', version: chromeMatch[1].split('.')[0]};

    const firefoxMatch = ua.match(/Firefox\/([\d.]+)/);
    if (firefoxMatch) return {name: 'Firefox', version: firefoxMatch[1].split('.')[0]};

    const safariMatch = ua.match(/Version\/([\d.]+).*Safari/);
    if (safariMatch) return {name: 'Safari', version: safariMatch[1].split('.')[0]};

    const chromiumMatch = ua.match(/Chromium\/([\d.]+)/);
    if (chromiumMatch) return {name: 'Chromium', version: chromiumMatch[1].split('.')[0]};

    const ieMatch = ua.match(/MSIE ([\d.]+)/) ?? ua.match(/Trident.*rv:([\d.]+)/);
    if (ieMatch) return {name: 'IE', version: ieMatch[1].split('.')[0]};

    return {name: 'Unknown Browser', version: null};
};

// ── High-entropy Client Hints (Chromium only, async) ─────────────────────────

const getHighEntropyInfo = async () => {
    if (!navigator.userAgentData?.getHighEntropyValues) return null;
    try {
        const hints = await navigator.userAgentData.getHighEntropyValues([
            'platform',
            'platformVersion',
            'uaFullVersion',
        ]);
        return hints;
    } catch {
        return null;
    }
};

// ── Initial sync detection (UA) ───────────────────────────────────────────────

const getInitialInfo = () => {
    const ua = navigator.userAgent;
    const os = detectOSFromUA(ua);
    const browser = detectBrowserFromUA(ua);
    const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    const resolution = `${window.screen.width}×${window.screen.height}`;
    return {os, browser, hasTouch, resolution};
};

// ── Component ─────────────────────────────────────────────────────────────────

const SystemInfoChips = ({t, onceFinished}) => {
    const [{os, browser, hasTouch, resolution}] = useState(getInitialInfo);
    const [enhancedOS, setEnhancedOS] = useState(null);
    const [enhancedBrowser, setEnhancedBrowser] = useState(null);
    const calledRef = useRef(false);

    useEffect(() => {
        getHighEntropyInfo().then(hints => {
            let finalOS = os;
            let finalBrowser = browser;

            if (hints?.platform) {
                finalOS = {name: hints.platform, version: hints.platformVersion || null};
                setEnhancedOS(finalOS);
            }
            if (hints?.uaFullVersion) {
                finalBrowser = {name: browser.name, version: hints.uaFullVersion.split('.')[0]};
                setEnhancedBrowser(finalBrowser);
            }

            if (!calledRef.current) {
                calledRef.current = true;
                onceFinished?.({
                    os: finalOS.name,
                    os_version: finalOS.version ?? null,
                    browser: finalBrowser.name,
                    browser_version: finalBrowser.version ?? null,
                    touch_capability: hasTouch,
                    screen_resolution: resolution,
                });
            }
        });
    }, [os, browser, hasTouch, resolution, onceFinished]);

    const displayOS = enhancedOS ?? os;
    const displayBrowser = enhancedBrowser ?? browser;

    const chips = [
        {
            icon: 'lni-monitor',
            label: displayOS.version ? `${displayOS.name} ${displayOS.version}` : displayOS.name,
        },
        {
            icon: 'lni-globe-1',
            label: displayBrowser.version ? `${displayBrowser.name} ${displayBrowser.version}` : displayBrowser.name,
        },
        {
            icon: hasTouch ? 'lni-hand-stop' : 'lni-mouse-2',
            label: hasTouch ? 'Touch' : 'No touch',
        },
        {
            icon: 'lni-expand-square-4',
            label: resolution,
        },
    ];

    return (
        <div className="tpd-drawer-section">
            <div className="tpd-drawer-section-title">
                <i className="font-icon lni lni-laptop-2" style={{marginRight: '.375rem'}}/>
                {t('System info')}
            </div>
            <div className="tpd-sysinfo-chips">
                {chips.map((chip, i) => (
                    <span key={i} className="tpd-sysinfo-chip">
                        <i className={`font-icon lni ${chip.icon}`}/>
                        {chip.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default SystemInfoChips;
