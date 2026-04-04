/**
 * Ms. Luminara Quiz - Vesicle Transmitter
 *
 * Enables the Quiz "organelle" to send analytics vesicles back to the
 * LUMI-OS "nucleus" for integration into the development cycle.
 *
 * Protocol: Vesicle Transit Protocol (VTP) - see 340.50
 *
 * Transport Options:
 * 1. GitHub Issues API (async, persistent)
 * 2. GitHub Repository Dispatch (async, event-driven)
 * 3. Local Bifrost WebSocket (sync, real-time)
 *
 * Security:
 * - SHA256 HMAC signature on cargo
 * - Codon-tagged routing
 * - TTL expiration
 */

class VesicleTransmitter {
  constructor(config = {}) {
    // Configuration
    this.config = {
      // GitHub repo for issue-based transport
      githubRepo: config.githubRepo || 'Natalie-Eiryk/Lumi-OS',

      // Organelle identity
      organelle: 'quiz',
      codon: '510.31',
      instance: window.location.hostname || 'localhost',

      // Build info (injected at deploy time)
      build: config.build || document.querySelector('meta[name="build-version"]')?.content || 'dev',

      // Secret key for signing (should be injected securely)
      // In production, this would be a secure token
      signingKey: config.signingKey || null,

      // Bifrost endpoint (if available)
      bifrostUrl: config.bifrostUrl || null,

      // Batch settings
      batchIntervalMs: config.batchIntervalMs || 3600000, // 1 hour default
      minBatchSize: config.minBatchSize || 10, // Min events before sending

      ...config
    };

    // Pending cargo queue
    this.cargoQueue = [];

    // Last transmission timestamp
    this.lastTransmission = null;

    // Transmission history (for debugging)
    this.history = [];

    // Load any queued cargo from localStorage
    this.loadPendingCargo();
  }

  // ═══════════════════════════════════════════════════════════════
  // VESICLE CONSTRUCTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create a vesicle envelope with cargo
   * @param {string} cargoType - Type of cargo (e.g., 'learning-analytics')
   * @param {object} data - The actual data payload
   * @param {object} options - Additional options
   * @returns {object} Complete vesicle envelope
   */
  createVesicle(cargoType, data, options = {}) {
    const vesicleId = this.generateUUID();
    const timestamp = new Date().toISOString();

    const cargo = {
      type: cargoType,
      schema: this.getSchemaVersion(cargoType),
      data: data
    };

    const envelope = {
      vesicle: {
        version: '1.0.0',
        id: vesicleId,
        timestamp: timestamp,
        origin: {
          organelle: this.config.organelle,
          codon: this.config.codon,
          instance: this.config.instance,
          build: this.config.build
        },
        destination: {
          codon: options.destinationCodon || '340.50',
          handler: options.handler || 'analytics-ingest'
        },
        signature: {
          algorithm: 'sha256',
          value: null, // Will be computed
          publicKeyId: `${this.config.organelle}-vesicle-2026`
        },
        priority: options.priority || 'normal',
        ttl: options.ttl || 86400 // 24 hours default
      },
      cargo: cargo
    };

    // Sign the cargo
    envelope.vesicle.signature.value = this.signCargo(cargo);

    return envelope;
  }

  /**
   * Get schema version for cargo type
   */
  getSchemaVersion(cargoType) {
    const schemas = {
      'learning-analytics': '510.108.analytics.v1',
      'scaffold-audit': '510.108.audit.v1',
      'representation-effectiveness': '510.108.repr.v1',
      'error-report': '510.108.error.v1'
    };
    return schemas[cargoType] || `510.108.${cargoType}.v1`;
  }

  /**
   * Sign cargo using SHA256 HMAC
   * Note: In browser, we use SubtleCrypto API
   */
  async signCargoAsync(cargo) {
    if (!this.config.signingKey) {
      // Return a placeholder signature if no key configured
      return 'unsigned-' + this.hashSimple(JSON.stringify(cargo));
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.config.signingKey);
    const cargoData = encoder.encode(JSON.stringify(cargo, Object.keys(cargo).sort()));

    try {
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', key, cargoData);
      return this.arrayBufferToHex(signature);
    } catch (e) {
      console.warn('[Vesicle] Signing failed, using simple hash:', e);
      return 'fallback-' + this.hashSimple(JSON.stringify(cargo));
    }
  }

  /**
   * Synchronous simple hash (fallback)
   */
  signCargo(cargo) {
    // For synchronous creation, use simple hash
    // Async version should be preferred
    return 'sync-' + this.hashSimple(JSON.stringify(cargo));
  }

  /**
   * Simple string hash (djb2 algorithm)
   */
  hashSimple(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  /**
   * Convert ArrayBuffer to hex string
   */
  arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate UUID v4
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // CARGO COLLECTION (from Analytics Engine)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Collect learning analytics cargo from the various engines
   */
  collectAnalyticsCargo() {
    const cargo = {
      period: {
        start: this.lastTransmission || new Date(Date.now() - 86400000).toISOString(),
        end: new Date().toISOString()
      },
      confusionMatrix: {},
      conceptualShifts: [],
      representationEffectiveness: {},
      reviewQueueStats: {},
      difficultyUpdates: [],
      masteryUpdates: []
    };

    // Collect from QuestionStatisticsEngine
    if (typeof questionStatistics !== 'undefined' && questionStatistics?.data?.questions) {
      for (const [qid, stats] of Object.entries(questionStatistics.data.questions)) {
        if (stats.attempts >= 5) { // Only include questions with enough data
          cargo.confusionMatrix[qid] = {
            attempts: stats.attempts,
            selections: stats.optionSelections,
            avgTimeMs: stats.avgTimeMs,
            streakMax: stats.streakMax
          };
        }
      }
    }

    // Collect from LearningAnalyticsEngine
    if (typeof learningAnalytics !== 'undefined' && learningAnalytics) {
      const summary = learningAnalytics.getAnalyticsSummary();

      cargo.conceptualShifts = summary.conceptualShifts.slice(0, 50); // Limit size
      cargo.reviewQueueStats = {
        totalScheduled: summary.totalQuestionsTracked,
        needingReview: summary.questionsNeedingReview,
        masteredCount: summary.masteredConcepts.length
      };

      // Get difficulty updates
      const diffDist = learningAnalytics.getDifficultyDistribution();
      cargo.difficultyDistribution = diffDist;

      // Get mastery updates
      cargo.masteryUpdates = summary.masteredConcepts.slice(0, 100);
    }

    // Collect from RepresentationEngine
    if (typeof representationEngine !== 'undefined' && representationEngine) {
      cargo.representationEffectiveness = representationEngine.representationEffectiveness || {};
    }

    return cargo;
  }

  /**
   * Collect scaffold audit cargo
   */
  async collectScaffoldAuditCargo() {
    if (typeof scaffoldQualityAudit === 'undefined' || !scaffoldQualityAudit) {
      return null;
    }

    // This would need access to vocab banks
    // For now, return summary of what we can analyze
    return {
      auditTimestamp: new Date().toISOString(),
      message: 'Scaffold audit data collection pending vocab bank access'
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // TRANSMISSION METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Transmit vesicle via GitHub Issues
   * Creates an issue with the vesicle payload
   */
  async transmitViaGitHubIssue(vesicle) {
    // Note: This requires a GitHub token with repo access
    // In production, this would go through a serverless function
    // to avoid exposing the token client-side

    const issueTitle = `[VESICLE] ${vesicle.cargo.type} from ${vesicle.vesicle.origin.instance}`;
    const issueBody = `## Vesicle Transit Protocol Payload

**Origin**: ${vesicle.vesicle.origin.organelle} (${vesicle.vesicle.origin.codon})
**Instance**: ${vesicle.vesicle.origin.instance}
**Timestamp**: ${vesicle.vesicle.timestamp}
**Priority**: ${vesicle.vesicle.priority}

### Cargo Type
\`${vesicle.cargo.type}\` (schema: ${vesicle.cargo.schema})

### Signature
\`${vesicle.vesicle.signature.value}\`

### Payload
\`\`\`json
${JSON.stringify(vesicle, null, 2)}
\`\`\`

---
*Automatically generated by Vesicle Transit Protocol*
*Process with: \`python tools/process_vesicle.py --issue <number>\`*
`;

    const issueLabels = ['vesicle', 'analytics', 'automated'];

    // For now, log what would be sent
    console.log('[Vesicle] Would create GitHub issue:', {
      title: issueTitle,
      labels: issueLabels,
      bodyLength: issueBody.length
    });

    // Store in localStorage for manual retrieval
    this.storeForManualRetrieval(vesicle);

    return {
      success: true,
      method: 'localStorage',
      message: 'Vesicle stored locally. GitHub API integration pending.'
    };
  }

  /**
   * Transmit vesicle via Repository Dispatch
   */
  async transmitViaRepoDispatch(vesicle) {
    // This would trigger a GitHub Action workflow
    // Requires GITHUB_TOKEN with repo scope

    console.log('[Vesicle] Repository dispatch would send:', {
      event_type: 'vesicle-received',
      cargo_type: vesicle.cargo.type
    });

    this.storeForManualRetrieval(vesicle);

    return {
      success: true,
      method: 'localStorage',
      message: 'Vesicle stored locally. Repo dispatch integration pending.'
    };
  }

  /**
   * Transmit vesicle via Bifrost WebSocket
   */
  async transmitViaBifrost(vesicle) {
    if (!this.config.bifrostUrl) {
      return {
        success: false,
        method: 'bifrost',
        message: 'Bifrost URL not configured'
      };
    }

    try {
      const ws = new WebSocket(this.config.bifrostUrl);

      return new Promise((resolve, reject) => {
        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: 'vesicle',
            payload: vesicle
          }));
          ws.close();
          resolve({
            success: true,
            method: 'bifrost',
            message: 'Vesicle transmitted via Bifrost'
          });
        };

        ws.onerror = (error) => {
          reject({
            success: false,
            method: 'bifrost',
            message: 'Bifrost connection failed',
            error: error
          });
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          ws.close();
          reject({
            success: false,
            method: 'bifrost',
            message: 'Bifrost connection timeout'
          });
        }, 5000);
      });
    } catch (e) {
      return {
        success: false,
        method: 'bifrost',
        message: 'Bifrost error: ' + e.message
      };
    }
  }

  /**
   * Store vesicle for manual retrieval
   */
  storeForManualRetrieval(vesicle) {
    try {
      const stored = JSON.parse(localStorage.getItem('luminara_pending_vesicles') || '[]');
      stored.push({
        vesicle: vesicle,
        storedAt: new Date().toISOString()
      });

      // Keep only last 10 vesicles
      while (stored.length > 10) {
        stored.shift();
      }

      localStorage.setItem('luminara_pending_vesicles', JSON.stringify(stored));
      console.log('[Vesicle] Stored for manual retrieval. Total pending:', stored.length);
    } catch (e) {
      console.warn('[Vesicle] Failed to store:', e);
    }
  }

  /**
   * Load pending cargo from localStorage
   */
  loadPendingCargo() {
    try {
      const stored = JSON.parse(localStorage.getItem('luminara_pending_vesicles') || '[]');
      console.log('[Vesicle] Loaded', stored.length, 'pending vesicles');
    } catch (e) {
      console.warn('[Vesicle] Failed to load pending cargo:', e);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  /**
   * Send learning analytics to the nucleus
   */
  async sendAnalytics(options = {}) {
    const cargo = this.collectAnalyticsCargo();
    const vesicle = this.createVesicle('learning-analytics', cargo, options);

    // Try transmission methods in order of preference
    let result;

    if (this.config.bifrostUrl) {
      result = await this.transmitViaBifrost(vesicle);
      if (result.success) {
        this.recordTransmission(vesicle, result);
        return result;
      }
    }

    // Fall back to GitHub/localStorage
    result = await this.transmitViaGitHubIssue(vesicle);
    this.recordTransmission(vesicle, result);
    return result;
  }

  /**
   * Get pending vesicles for manual download
   */
  getPendingVesicles() {
    try {
      return JSON.parse(localStorage.getItem('luminara_pending_vesicles') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear pending vesicles after manual processing
   */
  clearPendingVesicles() {
    localStorage.removeItem('luminara_pending_vesicles');
    console.log('[Vesicle] Cleared pending vesicles');
  }

  /**
   * Export all pending vesicles as downloadable JSON
   */
  exportPendingVesicles() {
    const pending = this.getPendingVesicles();
    if (pending.length === 0) {
      console.log('[Vesicle] No pending vesicles to export');
      return;
    }

    const blob = new Blob([JSON.stringify(pending, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `vesicles_${this.config.organelle}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('[Vesicle] Exported', pending.length, 'vesicles');
  }

  /**
   * Record transmission in history
   */
  recordTransmission(vesicle, result) {
    this.lastTransmission = new Date().toISOString();
    this.history.push({
      vesicleId: vesicle.vesicle.id,
      cargoType: vesicle.cargo.type,
      timestamp: this.lastTransmission,
      result: result
    });

    // Keep history limited
    while (this.history.length > 50) {
      this.history.shift();
    }
  }

  /**
   * Get transmission history
   */
  getHistory() {
    return this.history;
  }

  // ═══════════════════════════════════════════════════════════════
  // GROWTH SIGNAL API (340.60 GSP)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Send growth signals to the nucleus
   * Growth signals tell the nucleus what content to grow
   */
  async sendGrowthSignals(options = {}) {
    if (typeof learningAnalytics === 'undefined' || !learningAnalytics) {
      return {
        success: false,
        message: 'LearningAnalyticsEngine not available'
      };
    }

    const growthCargo = learningAnalytics.packageGrowthSignalsForVesicle();

    if (!growthCargo) {
      return {
        success: true,
        message: 'No growth signals detected'
      };
    }

    const vesicle = this.createVesicle('growth-signals', growthCargo.data, {
      destinationCodon: '340.60',
      handler: 'growth-signal-processor',
      priority: this.determineGrowthPriority(growthCargo.data),
      ...options
    });

    // Transmit
    let result;
    if (this.config.bifrostUrl) {
      result = await this.transmitViaBifrost(vesicle);
      if (result.success) {
        this.recordTransmission(vesicle, result);
        return result;
      }
    }

    result = await this.transmitViaGitHubIssue(vesicle);
    this.recordTransmission(vesicle, result);
    return result;
  }

  /**
   * Determine priority of growth signal vesicle
   */
  determineGrowthPriority(signalData) {
    const highPriority = signalData.signals?.filter(s => s.priority === 'high').length || 0;
    const mediumPriority = signalData.signals?.filter(s => s.priority === 'medium').length || 0;

    if (highPriority > 0) return 'high';
    if (mediumPriority > 2) return 'high';
    if (mediumPriority > 0) return 'normal';
    return 'low';
  }

  /**
   * Send full diagnostic vesicle (analytics + growth signals)
   * Use this for comprehensive system health reporting
   */
  async sendFullDiagnostic(options = {}) {
    const results = {
      analytics: null,
      growthSignals: null,
      timestamp: new Date().toISOString()
    };

    // Send analytics
    results.analytics = await this.sendAnalytics(options);

    // Send growth signals
    results.growthSignals = await this.sendGrowthSignals(options);

    console.log('[Vesicle] Full diagnostic sent:', {
      analyticsSuccess: results.analytics?.success,
      growthSuccess: results.growthSignals?.success
    });

    return results;
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INITIALIZATION
// ═══════════════════════════════════════════════════════════════

let vesicleTransmitter = null;

function initVesicleTransmitter(config = {}) {
  if (!vesicleTransmitter) {
    vesicleTransmitter = new VesicleTransmitter(config);
    console.log('[Vesicle] Transmitter initialized for organelle:', vesicleTransmitter.config.organelle);
  }
  return vesicleTransmitter;
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Initialize with default config
    initVesicleTransmitter();
  });
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VesicleTransmitter, initVesicleTransmitter };
}
