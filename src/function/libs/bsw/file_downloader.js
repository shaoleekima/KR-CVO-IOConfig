// FileDownloader - utilities to download files and generate filenames
class FileDownloader {
    /**
     * Generate filename with output folder prefix for downloads
     * @param {string} baseFilename - The base filename without path
     * @returns {string} Filename prefixed with output/
     */
    static generateOutputFilename(baseFilename) {
        // For browser downloads, we can't directly control the folder, but we can suggest it
        // The user will see "output/" prefix in the download name, suggesting they save to output folder
        return `output/${baseFilename}`;
    }

    /**
     * Download content as file
     * @param {string} content - File content
     * @param {string} fileName - File name
     * @param {string} mimeType - MIME type (default: text/plain)
     */
    static downloadFile(content, fileName, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        // Apply output folder prefix to all downloads
        downloadLink.download = this.generateOutputFilename(fileName);
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Generate timestamped filename
     * @param {string} baseName - Base name without extension
     * @param {string} extension - File extension (with dot)
     * @returns {string} Timestamped filename
     */
    static generateTimestampedFileName(baseName, extension) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        return `${baseName}_${timestamp}${extension}`;
    }

    /**
     * Download AUTOSAR XML file
     * @param {string} xmlContent - XML content
     * @param {string|number} identifier - Pin number or identifier
     * @param {string} signalName - Signal name (optional)
     */
    static downloadAutosarFile(xmlContent, identifier, signalName = '') {
        let fileName;
        
        if (identifier === 'AllPins') {
            fileName = this.generateTimestampedFileName('rba_IoSigDio_EcucValues_AllPins', '.arxml');
        } else {
            const name = signalName || `Pin${identifier}`;
            fileName = `rba_IoSigDio_EcucValues_${name}_TLE7244.arxml`;
        }
        
        this.downloadFile(xmlContent, fileName, 'application/xml');
    }
}

window.BSW = window.BSW || {};
window.BSW.FileDownloader = FileDownloader;
