/**
 * Other Kills Application - Handles display of guild kills not in current activity
 */
class OtherKillsApp {
    constructor() {
        this.apiService = new AlbionAPIService();
        this.uiManager = new UIManager();
        this.config = null;
        this.currentActivity = null;
        this.otherKills = [];
        this.offset = 0;
        this.hasMore = true;
        this.pollInterval = null;
        this.isLoading = false;

        this.init();
    }

    async init() {
        console.log('Initializing Other Kills App...');

        // Load configuration
        const savedConfig = StorageManager.load(StorageManager.KEYS.CONFIG);
        if (!savedConfig) {
            this.uiManager.showToast('No se encontró configuración del gremio. Por favor configura el gremio primero.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        this.config = new GuildConfig(savedConfig);

        // Load current activity
        const savedActivity = StorageManager.load(StorageManager.KEYS.CURRENT_ACTIVITY);
        if (savedActivity) {
            this.currentActivity = new Activity(savedActivity);
        }

        // Load kills
        await this.loadOtherGuildKills();

        // Start polling
        this.startPolling();

        console.log('Other Kills App initialized');
    }

    async loadOtherGuildKills() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            console.log(`Loading other guild kills (offset: ${this.offset})...`);

            // Get guild events
            const guildEvents = await this.apiService.fetchGuildEvents(
                this.config.guildId,
                51,
                this.offset
            );

            console.log(`Received ${guildEvents.length} guild events`);

            // Get active participant names
            const activeParticipantNames = this.currentActivity
                ? this.currentActivity.participants.map(p => p.name)
                : [];

            // Filter kills from non-activity members
            const otherKills = this.apiService.filterOtherGuildKills(
                guildEvents,
                this.config.members,
                activeParticipantNames
            );

            console.log(`Filtered to ${otherKills.length} other guild kills`);

            // Process kills
            const processedKills = otherKills.map(killEvent =>
                this.apiService.extractLootFromKill(killEvent)
            );

            // Add to existing kills (for pagination)
            if (this.offset === 0) {
                this.otherKills = processedKills;
            } else {
                this.otherKills = [...this.otherKills, ...processedKills];
            }

            // Check if there are more kills to load
            this.hasMore = guildEvents.length === 51;

            // Update UI
            this.updateUI();

            // Update last update time
            this.updateLastUpdateTime();

        } catch (error) {
            console.error('Error loading other guild kills:', error);
            this.uiManager.showToast('Error al cargar kills del gremio', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async loadMoreKills() {
        if (!this.hasMore || this.isLoading) return;

        this.offset += 51;
        await this.loadOtherGuildKills();
    }

    async refreshKills() {
        this.offset = 0;
        this.hasMore = true;
        await this.loadOtherGuildKills();
        this.uiManager.showToast('Kills actualizadas', 'success');
    }

    updateUI() {
        const container = document.getElementById('otherGuildKillsList');
        const countElement = document.getElementById('otherGuildKillsCount');

        if (!container || !countElement) return;

        countElement.textContent = this.otherKills.length;

        if (this.otherKills.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-text">No hay kills del gremio disponibles</div>
                    <div class="empty-state-subtext">Las kills de miembros del gremio aparecerán aquí</div>
                </div>
            `;
        } else {
            // Sort kills by date (most recent first)
            const sortedKills = [...this.otherKills].sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );

            let html = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px; margin-bottom: 16px;">
                    ${sortedKills.map(kill => {
                const date = new Date(kill.timestamp);
                const utcDate = date.toISOString().split('T')[0];
                const utcTime = date.toISOString().split('T')[1].substring(0, 8);

                // Get top 6 loot items for preview
                const topLoot = kill.lootDetected.slice(0, 6);

                return `
                            <div class="kill-item" style="cursor: pointer;" onclick="otherKillsApp.showKillDetail(${kill.eventId})">
                                <!-- Date Header -->
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
                                    <div style="font-size: 12px; color: var(--text-secondary);">
                                        📅 ${utcDate} &nbsp;|&nbsp; 🕐 ${utcTime} UTC
                                    </div>
                                    <div class="kill-status" style="background: rgba(128, 128, 128, 0.2); color: #a0a0a0; font-size: 11px; padding: 3px 8px;">
                                        GREMIO
                                    </div>
                                </div>

                                <!-- Kill Info -->
                                <div style="margin-bottom: 12px;">
                                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
                                        <span style="color: #00d9ff;">${kill.killer.name}</span>
                                        <span style="color: var(--accent-primary); margin: 0 6px;">→</span>
                                        <span style="color: #ff4757;">${kill.victim.name}</span>
                                    </div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">
                                        💀 Fame: ${kill.victim.deathFame.toLocaleString()} |
                                        👥 ${kill.participants.length} participantes
                                    </div>
                                </div>

                                <!-- Loot Preview Grid -->
                                ${topLoot.length > 0 ? `
                                    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; margin-bottom: 12px;">
                                        ${topLoot.map(item => `
                                            <div style="position: relative; background: rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 4px; aspect-ratio: 1;">
                                                <img src="${this.apiService.getItemImageURL(item.type, item.quality, item.count, 60)}"
                                                     alt="${item.type}"
                                                     style="width: 100%; height: 100%; object-fit: contain;"
                                                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23333%22 width=%22100%%22 height=%22100%%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2210%22>?</text></svg>'">
                                                ${item.count > 1 ? `
                                                    <div style="position: absolute; bottom: 2px; right: 2px; background: rgba(0, 0, 0, 0.8); color: white; font-size: 10px; padding: 1px 4px; border-radius: 3px; font-weight: 600;">
                                                        ${item.count}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div style="text-align: center; padding: 16px; color: var(--text-secondary); font-size: 12px;">
                                        Sin loot
                                    </div>
                                `}

                                <!-- Total Items Badge -->
                                <div style="text-align: center; font-size: 11px; color: var(--text-secondary);">
                                    ${kill.lootDetected.length > 6 ? `+${kill.lootDetected.length - 6} items más` : `${kill.lootDetected.length} items total`}
                                </div>
                            </div>
                        `;
            }).join('')}
                </div>
            `;

            // Add "Load More" button if there are more kills available
            if (this.hasMore) {
                html += `
                    <div style="text-align: center; margin-top: 16px;">
                        <button class="btn btn-primary" onclick="otherKillsApp.loadMoreKills()" style="width: 100%;" ${this.isLoading ? 'disabled' : ''}>
                            ${this.isLoading ? '⏳ Cargando...' : '📥 Cargar Más Kills'}
                        </button>
                    </div>
                `;
            } else {
                html += `
                    <div style="text-align: center; margin-top: 16px; padding: 12px; color: var(--text-secondary); font-size: 14px;">
                        No hay más kills disponibles
                    </div>
                `;
            }

            container.innerHTML = html;
        }
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es-ES');
        document.getElementById('lastUpdate').textContent = timeStr;
    }

    showKillDetail(eventId) {
        const kill = this.otherKills.find(k => k.eventId === eventId);
        if (!kill) return;

        // Use UIManager to show kill detail
        // We need to adapt the UIManager.showKillDetail method or reuse the logic
        // Since UIManager.showKillDetail expects a kill object and a source, we can use that.
        // However, UIManager.showKillDetail renders to 'killDetailContent' which is what we want.

        // But wait, UIManager.showKillDetail renders the content AND we need to show the modal.
        // Let's check UIManager.showKillDetail again.

        this.uiManager.showKillDetail(kill, 'other');
        this.uiManager.showModal('killDetailModal');
    }

    closeModal(modalId) {
        this.uiManager.closeModal(modalId);
    }

    startPolling() {
        // Poll every 30 seconds
        this.pollInterval = setInterval(async () => {
            console.log('Polling for new kills...');
            this.offset = 0;
            this.hasMore = true;
            await this.loadOtherGuildKills();
        }, 30000);
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
}

// Initialize app when DOM is ready
let otherKillsApp;
document.addEventListener('DOMContentLoaded', () => {
    otherKillsApp = new OtherKillsApp();
    window.app = otherKillsApp; // For UIManager compatibility
});
