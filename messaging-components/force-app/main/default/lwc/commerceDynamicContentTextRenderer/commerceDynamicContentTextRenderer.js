import { api, LightningElement } from "lwc";

const MESSAGE_CONTENT_CLASS = "embedded-messaging-message-content";
const ENDUSER = "EndUser";
const AGENT = "Agent";
const CHATBOT = "Chatbot";
const PARTICIPANT_TYPES = [ENDUSER, AGENT, CHATBOT];

export default class CommerceDynamicContentTextRenderer extends LightningElement {
  @api configuration;

  _conversationEntry;
  @api
  set conversationEntry(value) {
    this._conversationEntry = value;
    this.processEntryPayload();
  }
  get conversationEntry() {
    return this._conversationEntry;
  }

  contentType = '';
  productData = [];
  entryPayload = {};
  staticText;
  
  processEntryPayload() {
    this.contentType = '';
    this.productData = [];
    this.entryPayload = {};
    this.staticText = undefined;
    this.parsedText = '';

    try {
      const rawPayload = this._conversationEntry?.entryPayload;

      try {
        this.entryPayload = JSON.parse(rawPayload);
      } catch {
        this.entryPayload = {
          abstractMessage: {
            staticContent: {
              text: rawPayload
            }
          }
        };
      }

      this.staticText = this.entryPayload?.abstractMessage?.staticContent;

      if (typeof this.staticText?.text === "string" && this.staticText?.text.includes("contentType")) {
        this.parsedText = JSON.parse(this.staticText.text);
      } else {
        this.parsedText = this.staticText?.text;
      }

      this.contentType = this.parsedText?.contentType || '';

      if (this.isProductRecommendations && this.parsedText?.products) {
        this.productData = this.parsedText.products;
      }
    } catch (error) {
      console.error('Failed to process entryPayload:', error);
    }
  }

  get sender() {
    return this._conversationEntry?.sender?.role;
  }

  get isProductRecommendations() {
    return this.contentType === 'productRecommendations';
  }

  handleAddToCart(event) {
    const product = event?.detail?.product?.name;
    if (product) {
      this.configuration.util.sendTextMessage(
        `Can you help me add ${product} in 'Cardinal Red & Black' and size 'S' to cart`
      );
    }
  }

  get generateMessageBubbleClassname() {
    if (this.isSupportedSender()) {
      return `${MESSAGE_CONTENT_CLASS} ${this.sender?.toLowerCase()}`;
    } else {
      throw new Error(`Unsupported participant type passed in: ${this.sender}`);
    }
  }

  isSupportedSender() {
    return PARTICIPANT_TYPES.includes(this.sender);
  }

  get textContent() {
    return this.parsedText;
  }
}
