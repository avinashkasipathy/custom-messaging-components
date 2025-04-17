import { api, LightningElement } from "lwc";

const MESSAGE_CONTENT_CLASS = "embedded-messaging-message-content";
const ENDUSER = "EndUser";
const AGENT = "Agent";
const CHATBOT = "Chatbot";
const PARTICIPANT_TYPES = [ENDUSER, AGENT, CHATBOT];

export default class CommerceDynamicContentTextRenderer extends LightningElement {
  contentType = '';
  productData = [];

  /**
   * Deployment configuration data.
   * @type {Object}
   */
  @api configuration;

  /**
   * Conversation entry data.
   * @type {Object}
   */
  @api conversationEntry;

  /**
   * Returns the sender of this conversation entry.
   * @returns {string}
   */
  get sender() {
    return this.conversationEntry?.sender?.role;
  }

  connectedCallback() {
    this.processEntryPayload();
  }

  processEntryPayload() {
    try {
      const raw = this.conversationEntry?.entryPayload;
      const parsedPayload = typeof raw === 'string' ? JSON.parse(raw) : raw;

      const parsedResponseText = parsedPayload?.abstractMessage?.staticContent?.text || {};

      this.contentType = parsedResponseText.contentType || '';

      if (this.contentType === 'productRecommendations') {
        this.productData = parsedResponseText.products || [];
      }

      // Extend this with other content types here as needed
    } catch (error) {
      console.error('Failed to parse entryPayload:', error);
    }
  }

  get isProductRecommendations() {
    return this.contentType === 'productRecommendations';
  }

  handleAddToCart(event) {
    const product = event.detail.product;
    this.dispatchEvent(new CustomEvent('productaddedtocart', {
      detail: { product }
    }));
  }

  /**
   * Returns the class name of the message bubble.
   * @returns {string}
   */
  get generateMessageBubbleClassname() {
    if (this.isSupportedSender()) {
      return `${MESSAGE_CONTENT_CLASS} ${this.sender?.toLowerCase()}`;
    } else {
      throw new Error(`Unsupported participant type passed in: ${this.sender}`);
    }
  }

  /**
   * True if the sender is a supported participant type.
   * @returns {Boolean}
   */
  isSupportedSender() {
    return PARTICIPANT_TYPES.includes(this.sender);
  }
}
