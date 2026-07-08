export const LoadingUtils = {
    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // If it's a table body (tbody), we need a row
        if (container.tagName.toLowerCase() === 'tbody') {
            const cols = container.closest('table').querySelectorAll('th').length || 5;
            container.innerHTML = `
                <tr class="loading-state">
                    <td colspan="${cols}" style="text-align: center; padding: 2rem;">
                        <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid rgba(0,0,0,0.1); border-radius: 50%; border-top-color: var(--primary, #2563eb); animation: spin 1s ease-in-out infinite;"></div>
                        <div style="margin-top: 10px; color: var(--text-light, #6b7280);">Loading data...</div>
                        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
                    </td>
                </tr>
            `;
        } else {
            // Standard div container
            container.innerHTML = `
                <div class="loading-state" style="text-align: center; padding: 3rem; width: 100%;">
                    <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(0,0,0,0.1); border-radius: 50%; border-top-color: var(--primary, #2563eb); animation: spin 1s ease-in-out infinite;"></div>
                    <div style="margin-top: 10px; color: var(--text-light, #6b7280);">Loading...</div>
                </div>
            `;
        }
    },

    showEmptyState(containerId, message = 'No data available') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (container.tagName.toLowerCase() === 'tbody') {
            const cols = container.closest('table').querySelectorAll('th').length || 5;
            container.innerHTML = `
                <tr class="empty-state">
                    <td colspan="${cols}" style="text-align: center; padding: 2rem; color: var(--text-light, #6b7280);">
                        ${message}
                    </td>
                </tr>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; border: 1px solid #ddd; border-radius: 12px; background: #fff;">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📭</div>
                    <h3 style="color: var(--primary-navy, #12254a); font-size: 1.5rem; margin-bottom: 1rem;">${message}</h3>
                </div>
            `;
        }
    }
};
