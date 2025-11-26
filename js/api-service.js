/**
 * Albion API Service - Handles all API calls to Albion Online
 */
class AlbionAPIService {
    constructor() {
        this.baseURL = 'https://gameinfo.albiononline.com/api/gameinfo';
        this.proxies = [
            'https://corsproxy.io/?',
            'https://api.allorigins.win/raw?url=',
            'https://proxy.cors.sh/'
        ];
        this.currentProxyIndex = 0;
        this.renderURL = 'https://render.albiononline.com/v1/item';
        this.lastEventId = 0;
        this.timeout = 15000; // 15 seconds timeout
    }

    /**
     * Get current proxy URL
     */
    get proxyURL() {
        return this.proxies[this.currentProxyIndex];
    }

    /**
     * Switch to next proxy
     */
    switchProxy() {
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
        console.log(`Switching to proxy: ${this.proxyURL}`);
    }

    /**
     * Fetch with timeout
     */
    async fetchWithTimeout(url, options = {}, timeoutMs = this.timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    /**
     * Fetch with automatic proxy retry
     */
    async fetchWithRetry(apiUrl, maxRetries = 2) {
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const proxyUrl = this.proxyURL + encodeURIComponent(apiUrl);
                console.log(`Attempt ${i + 1}/${maxRetries} using proxy: ${this.proxyURL}`);

                const response = await this.fetchWithTimeout(proxyUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${i + 1} failed:`, error.message);

                // Switch proxy for next attempt
                if (i < maxRetries - 1) {
                    this.switchProxy();
                    // Wait a bit before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        throw lastError;
    }

    /**
     * Get item image URL from Albion render service
     * @param {string} itemType - Item type identifier
     * @param {number} quality - Item quality (0-5)
     * @param {number} count - Item count
     * @param {number} size - Image size in px (default 80)
     * @returns {string} Image URL
     */
    getItemImageURL(itemType, quality = 0, count = 1, size = 80) {
        return `${this.renderURL}/${itemType}.png?quality=${quality}&count=${count}&size=${size}`;
    }

    /**
     * Fetch kill events from Albion API
     * @param {number} limit - Number of events to fetch (max 51)
     * @param {number} offset - Offset for pagination (max 1000)
     * @returns {Promise<Array>} Array of kill events
     */
    async fetchEvents(limit = 51, offset = 0) {
        try {
            const apiUrl = `${this.baseURL}/events?limit=${limit}&offset=${offset}`;
            const proxyUrl = this.proxyURL + encodeURIComponent(apiUrl);

            const response = await fetch(proxyUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const events = await response.json();
            return events;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }

    /**
     * Search for a guild by name
     * @param {string} guildName - Guild name to search
     * @returns {Promise<Object>} Guild data with Id, Name, AllianceId, AllianceName, MemberCount, etc.
     */
    async searchGuild(guildName) {
        try {
            const apiUrl = `${this.baseURL}/search?q=${encodeURIComponent(guildName)}`;
            console.log(`Searching for guild: ${guildName}`);

            const results = await this.fetchWithRetry(apiUrl, 3);

            // Return guilds only
            return results.guilds || [];
        } catch (error) {
            console.error('Error searching guild:', error);
            throw error;
        }
    }

    /**
     * Get guild info by ID
     * @param {string} guildId - Guild ID
     * @returns {Promise<Object>} Guild data
     */
    async getGuildInfo(guildId) {
        try {
            const apiUrl = `${this.baseURL}/guilds/${guildId}`;
            const proxyUrl = this.proxyURL + encodeURIComponent(apiUrl);

            console.log(`Fetching guild info: ${guildId}`);

            const response = await fetch(proxyUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching guild info:', error);
            throw error;
        }
    }

    /**
     * Fetch kill events for a specific guild
     * @param {string} guildId - Guild ID
     * @param {number} limit - Number of events to fetch (max 51)
     * @param {number} offset - Offset for pagination (max 1000)
     * @returns {Promise<Array>} Array of guild kill events
     */
    async fetchGuildEvents(guildId, limit = 51, offset = 0) {
        try {
            const apiUrl = `${this.baseURL}/events?limit=${limit}&offset=${offset}&guildId=${guildId}`;
            const proxyUrl = this.proxyURL + encodeURIComponent(apiUrl);

            console.log(`Fetching guild events: limit=${limit}, offset=${offset}`);

            const response = await fetch(proxyUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const events = await response.json();
            return events;
        } catch (error) {
            console.error('Error fetching guild events:', error);
            throw error;
        }
    }

    /**
     * Fetch top kills for a guild
     * @param {string} guildId - Guild ID
     * @param {string} range - Time range (day | week | month)
     * @param {number} limit - Number of kills to fetch (max 9999)
     * @param {number} offset - Offset for pagination
     * @returns {Promise<Array>} Array of top guild kills
     */
    async fetchGuildTopKills(guildId, range = 'week', limit = 100, offset = 0) {
        try {
            const apiUrl = `${this.baseURL}/guilds/${guildId}/top?range=${range}&limit=${limit}&offset=${offset}&region=Total`;
            const proxyUrl = this.proxyURL + encodeURIComponent(apiUrl);

            console.log(`Fetching guild top kills: range=${range}, limit=${limit}`);

            const response = await fetch(proxyUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const kills = await response.json();
            return kills;
        } catch (error) {
            console.error('Error fetching guild top kills:', error);
            throw error;
        }
    }

    /**
     * Filter kills by activity participants
     * @param {Array} events - All events from API
     * @param {Array} participantNames - Array of participant names in the activity
     * @param {boolean} includeAll - If true, include all kills regardless of lastEventId (for initial load)
     * @returns {Array} Filtered kill events
     */
    filterActivityKills(events, participantNames, includeAll = false) {
        if (!participantNames || participantNames.length === 0) {
            console.warn('No participants provided for filtering');
            return [];
        }

        console.log('Filtering kills for participants:', participantNames, includeAll ? '(INITIAL LOAD - ALL KILLS)' : '(new kills only)');

        return events.filter(event => {
            // Skip already processed events (unless this is initial load)
            if (!includeAll && event.EventId <= this.lastEventId) return false;

            // Check if killer is one of the activity participants
            const killerIsParticipant = event.Killer && participantNames.includes(event.Killer.Name);

            // Check if any event participant is in the activity
            const hasActivityParticipant = event.Participants && event.Participants.some(p =>
                participantNames.includes(p.Name)
            );

            return killerIsParticipant || hasActivityParticipant;
        });
    }

    /**
     * Filter kills by guild name (backward compatibility)
     * @param {Array} events - All events from API
     * @param {Array} guildMembers - Array of guild member objects
     * @param {boolean} includeAll - If true, include all kills regardless of lastEventId (for initial load)
     * @returns {Array} Filtered kill events
     */
    filterGuildKills(events, guildMembers, includeAll = false) {
        // Extract names from guild members
        const memberNames = guildMembers.map(m => m.name);
        return this.filterActivityKills(events, memberNames, includeAll);
    }

    /**
     * Filter ALL kills from guild members (regardless of activity or date)
     * @param {Array} events - All events from API
     * @param {Array} allGuildMembers - All guild members
     * @param {Array} activityParticipantNames - Names of participants in current activity (to exclude)
     * @returns {Array} Filtered kill events from guild members not in activity
     */
    filterOtherGuildKills(events, allGuildMembers, activityParticipantNames = []) {
        const allMemberNames = allGuildMembers.map(m => m.name);

        console.log('Filtering ALL guild kills (excluding activity participants)...');

        return events.filter(event => {
            // Check if killer is a guild member
            const killerIsGuildMember = event.Killer && allMemberNames.includes(event.Killer.Name);

            // Check if any guild member participated
            const hasGuildParticipant = event.Participants && event.Participants.some(p =>
                allMemberNames.includes(p.Name)
            );

            // Must have guild involvement
            if (!killerIsGuildMember && !hasGuildParticipant) {
                return false;
            }

            // If no activity participants provided, include all guild kills
            if (activityParticipantNames.length === 0) {
                return true;
            }

            // Exclude kills where killer is in the activity
            const killerInActivity = event.Killer && activityParticipantNames.includes(event.Killer.Name);

            // Exclude kills where all participants are in the activity
            const allParticipantsInActivity = event.Participants && event.Participants.every(p =>
                activityParticipantNames.includes(p.Name)
            );

            // Include if killer is NOT in activity OR if there are participants not in activity
            return !killerInActivity || !allParticipantsInActivity;
        });
    }

    /**
     * Extract loot from kill event
     * Note: Albion API structure:
     * - Victim.Equipment: Items equipped (what they HAD in equipment slots)
     * - Victim.Inventory: Items in inventory (what they HAD in bags)
     * The API shows the full victim inventory, not what actually dropped.
     * We assume all items are "detected" and user manually confirms what was real loot.
     *
     * @param {Object} killEvent - Kill event from API
     * @returns {Object} Processed kill data with full victim inventory
     */
    extractLootFromKill(killEvent) {
        const victimInventory = [];
        const equipment = killEvent.Victim.Equipment;

        // Extract VICTIM'S FULL INVENTORY (everything they had)
        // Equipment items
        Object.keys(equipment).forEach(slot => {
            if (equipment[slot] && equipment[slot].Type) {
                victimInventory.push({
                    type: equipment[slot].Type,
                    count: equipment[slot].Count || 1,
                    quality: equipment[slot].Quality || 0,
                    slot: slot
                });
            }
        });

        // Inventory items
        if (killEvent.Victim.Inventory) {
            killEvent.Victim.Inventory.forEach((item, index) => {
                if (item && item.Type) {
                    victimInventory.push({
                        type: item.Type,
                        count: item.Count || 1,
                        quality: item.Quality || 0,
                        slot: `inventory_${index}`
                    });
                }
            });
        }

        // IMPORTANT: The Albion API shows the victim's full inventory.
        // It does NOT tell us what actually dropped vs what was destroyed.
        // For the tracker to work properly:
        // - victimInventory = everything the victim had
        // - lootDetected = same as victimInventory (shown to user for confirmation)
        // - User manually confirms what was REAL loot via the UI
        // - Only confirmed loot counts toward activity totals

        return {
            eventId: killEvent.EventId,
            battleId: killEvent.BattleId,
            timestamp: killEvent.TimeStamp,
            killer: {
                id: killEvent.Killer.Id,
                name: killEvent.Killer.Name,
                guildName: killEvent.Killer.GuildName,
                killFame: killEvent.Killer.KillFame,
                averageItemPower: killEvent.Killer.AverageItemPower
            },
            victim: {
                id: killEvent.Victim.Id,
                name: killEvent.Victim.Name,
                guildName: killEvent.Victim.GuildName,
                deathFame: killEvent.Victim.DeathFame,
                averageItemPower: killEvent.Victim.AverageItemPower
            },
            participants: killEvent.Participants.map(p => ({
                id: p.Id,
                name: p.Name,
                damageDone: p.DamageDone || 0,
                healingDone: p.SupportHealingDone || 0
            })),
            victimInventory: victimInventory,      // Everything the victim had (full inventory)
            lootDetected: victimInventory,         // For backward compatibility - same as full inventory
            lootConfirmed: [],                     // User confirms what ACTUALLY dropped (real loot)
            status: 'pending'
        };
    }

    /**
     * Update last processed event ID
     * @param {number} eventId - Event ID to set
     */
    updateLastEventId(eventId) {
        this.lastEventId = eventId;
    }

    /**
     * Search for guilds by name
     * @param {string} searchTerm - Guild name to search
     * @returns {Promise<Array>} Array of guilds matching the search
     */
    async searchGuild(searchTerm) {
        try {
            const apiUrl = `${this.baseURL}/search?q=${encodeURIComponent(searchTerm)}`;
            const proxyUrl = this.proxyURL + encodeURIComponent(apiUrl);

            const response = await fetch(proxyUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.guilds || [];
        } catch (error) {
            console.error('Error searching guild:', error);
            throw error;
        }
    }

    /**
     * Get guild members by guild ID
     * @param {string} guildId - Guild ID
     * @returns {Promise<Array>} Array of guild members
     */
    async getGuildMembers(guildId) {
        try {
            const apiUrl = `${this.baseURL}/guilds/${guildId}/members`;
            const proxyUrl = this.proxyURL + encodeURIComponent(apiUrl);

            const response = await fetch(proxyUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const members = await response.json();
            return members.map(member => ({
                id: member.Id,
                name: member.Name,
                guildId: member.GuildId,
                guildName: member.GuildName,
                allianceId: member.AllianceId,
                killFame: member.LifetimeStatistics?.PvE?.Total || 0,
                deathFame: member.DeathFame || 0,
                firstSeen: new Date().toISOString(),
                totalKills: 0,
                totalAssists: 0,
                totalDeaths: 0
            }));
        } catch (error) {
            console.error('Error fetching guild members:', error);
            throw error;
        }
    }

    /**
     * Get guild information by ID
     * @param {string} guildId - Guild ID
     * @returns {Promise<Object>} Guild information
     */
    async getGuildInfo(guildId) {
        try {
            const apiUrl = `${this.baseURL}/guilds/${guildId}`;
            const proxyUrl = this.proxyURL + encodeURIComponent(apiUrl);

            const response = await fetch(proxyUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching guild info:', error);
            throw error;
        }
    }
}
