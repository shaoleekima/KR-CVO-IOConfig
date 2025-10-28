// TemplateManager - responsible for loading and processing templates
class TemplateManager {
    /**
     * Load template from server
     * @param {string} templatePath - Path to template file
     * @returns {Promise<string>} Template content
     */
    static async loadTemplate(templatePath) {
        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading template:', error);
            return null;
        }
    }

    /**
     * Replace placeholders in template with actual values
     * @param {string} template - Template content
     * @param {Object} replacements - Key-value pairs for replacement
     * @returns {string} Processed template
     */
    static replacePlaceholders(template, replacements) {
        let result = template;
        for (const [key, value] of Object.entries(replacements)) {
            const placeholder = `{{${key}}}`;
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            result = result.replace(regex, value || '');
        }
        return result;
    }

    /**
     * Load multiple templates in parallel
     * @param {Array<string>} templatePaths - Array of template paths
     * @returns {Promise<Array<string>>} Array of template contents
     */
    static async loadMultipleTemplates(templatePaths) {
        try {
            const templates = await Promise.all(
                templatePaths.map(path => this.loadTemplate(path))
            );
            return templates;
        } catch (error) {
            console.error('Error loading multiple templates:', error);
            return [];
        }
    }
}

// Attach to global BSW namespace
window.BSW = window.BSW || {};
window.BSW.TemplateManager = TemplateManager;
