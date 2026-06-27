import { SESSION_BEHAVIOR_SEPARATOR, SESSION_KEYS, WEB_PIXEL_EVENTS } from '../constants'

interface BehaviorTrackerConfig {
  shopDomain: string
  proxyPath: string
  timeout?: number
}

/** Handles behavior tracking and server communication */
export class BehaviorTracker {
  private readonly config: Required<BehaviorTrackerConfig>
  private readonly storage: Storage
  private isProcessing: boolean = false

  constructor(storage: Storage, config: BehaviorTrackerConfig) {
    this.storage = storage
    this.config = {
      timeout: 5000,
      ...config,
    }
  }

  /** Sends accumulated behaviors to server with retry logic */
  public async syncBehaviors() {
    const behaviors = this.storage.getItem(SESSION_KEYS.BEHAVIORS) || ''
    if (!behaviors) return true

    try {
      await this.sendToServer(behaviors)
      return true
    } catch (error) {
      console.error('Failed to sync behaviors:', error)
      return false
    }
  }

  /** Records a new behavior event */
  public recordBehavior(behaviorData: string): void {
    const stored = this.storage.getItem(SESSION_KEYS.BEHAVIORS)
    const behaviors = stored ? stored.split(SESSION_BEHAVIOR_SEPARATOR) : []
    behaviors.push(behaviorData)

    this.storage.setItem(SESSION_KEYS.BEHAVIORS, behaviors.join(SESSION_BEHAVIOR_SEPARATOR))
  }

  /** Clears recorded behaviors */
  public clearBehaviors(): void {
    this.storage.removeItem(SESSION_KEYS.BEHAVIORS)
  }

  private async sendToServer(behaviors: string): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true
    const { shopDomain, proxyPath } = this.config
    const endpoint = `${proxyPath}/behavior`

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: shopDomain,
          listBehavior: behaviors,
          public: true,
          type: WEB_PIXEL_EVENTS.UPDATE_USER_BEHAVIOR,
        }),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      this.clearBehaviors()
    } finally {
      this.isProcessing = false
    }
  }
}
