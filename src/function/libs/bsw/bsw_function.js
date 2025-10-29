// bsw_function.js - aggregator for mission-specific BSW utilities
// This file keeps the original global `window.BSW` available while the
// implementation has been split into multiple files named by mission.

/* eslint-disable no-console */
(function () {
    // Ensure global namespace exists
    window.BSW = window.BSW || {};

    // List of mission files (relative to this script location)
    const missionFiles = [
        'template_manager.js',
        'config_validator.js',
        'file_downloader.js',
        'storage_manager.js',
        'dom_utils.js',
        'autosar_utils.js',
        'status_manager.js'
    ];

    // If all mission classes are already present, do nothing
    const allPresent = missionFiles.every(fname => {
        const key = fname.replace(/\.js$/, '').split('_').map((s, i) => i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s).join('');
        // Map file base to expected BSW property names used above
        const map = {
            template_manager: 'TemplateManager',
            config_validator: 'ConfigValidator',
            file_downloader: 'FileDownloader',
            storage_manager: 'StorageManager',
            dom_utils: 'DOMUtils',
            autosar_utils: 'AutosarUtils',
            status_manager: 'StatusManager'
        };
        const base = fname.replace(/\.js$/, '');
        return !!window.BSW[ map[base] ];
    });

    if (allPresent) return;

    // Dynamically insert script tags to load the mission files located in the same folder
    function getScriptBasePath() {
        // Attempt to derive base path from current script tag
        try {
            const scripts = document.getElementsByTagName('script');
            const current = scripts[scripts.length - 1];
            const src = current && current.src ? current.src : '';
            if (!src) return './';
            return src.replace(/[^\/]*$/, '');
        } catch (e) {
            return './';
        }
    }

    const basePath = getScriptBasePath();

    missionFiles.forEach(fileName => {
        const fullPath = basePath + fileName;
        // Skip if already loaded (by checking known BSW keys)
        const base = fileName.replace(/\.js$/, '');
        const map = {
            template_manager: 'TemplateManager',
            config_validator: 'ConfigValidator',
            file_downloader: 'FileDownloader',
            storage_manager: 'StorageManager',
            dom_utils: 'DOMUtils',
            autosar_utils: 'AutosarUtils',
            status_manager: 'StatusManager'
        };
        if (window.BSW[map[base]]) return;

        const script = document.createElement('script');
        script.src = fullPath;
        script.async = false; // preserve execution order
        script.onload = () => console.log(`BSW: loaded ${fileName}`);
        script.onerror = () => console.warn(`BSW: failed to load ${fullPath}`);
        document.head.appendChild(script);
    });

    // Provide minimal stubs if a consumer uses BSW immediately before files load
    const stubs = {
        TemplateManager: {},
        ConfigValidator: {},
        FileDownloader: {},
        StorageManager: {},
        DOMUtils: {},
        AutosarUtils: {},
        StatusManager: {}
    };

    Object.keys(stubs).forEach(k => {
        if (!window.BSW[k]) {
            window.BSW[k] = stubs[k];
        }
    });

})();
