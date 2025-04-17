import { api, LightningElement } from "lwc";

const MESSAGE_CONTENT_CLASS = "embedded-messaging-message-content";
const ENDUSER = "EndUser";
const AGENT = "Agent";
const CHATBOT = "Chatbot";
const PARTICIPANT_TYPES = [ENDUSER, AGENT, CHATBOT];

export default class CommerceDynamicContentTextRenderer extends LightningElement {
  @api configuration;
  @api conversationEntry;

  contentType = '';
  productData = [];
  entryPayload = {};

  connectedCallback() {
    try {
      this.entryPayload = JSON.parse(this.conversationEntry?.entryPayload || '{}');
      this.staticText = this.entryPayload?.abstractMessage?.staticContent?.text;

      const parsedText = typeof this.staticText?.text === 'string'
        ? JSON.parse(this.staticText.text)
        : this.staticText?.text;

      // Extract contentType
      this.contentType = parsedText?.contentType || '';

      // Extract product data if applicable
      if (
        this.isProductRecommendations &&
        this.parsedText?.products
      ) {
        this.productData = this.parsedText?.products;
      }
    } catch (error) {
      console.error('Failed to parse entryPayload:', error);
    }
  }

  get sender() {
    return this.conversationEntry?.sender?.role;
  }

  get isProductRecommendations() {
    return this.contentType === 'productRecommendations';
  }

  handleAddToCart(event) {
    const product = event.detail.product.name;
    this.configuration.util.sendTextMessage(`Can you help me add ${product} to cart`);
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
    try {
      const staticContent = this.entryPayload?.abstractMessage?.staticContent;

      if (staticContent?.text) {
        const text = staticContent.text;

        return text.replace( // innerText or textContent
          /(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?/g,
          function(imgUrl) {
              // Only switch out to specific shortened urls if the agent is the user.
              if(this.sender === AGENT) {
                  // If the url is a specific link, then return a custom shortened link.
                  if(imgUrl === "https://www.test.com/specificLink" || imgUrl === "https://www.test.com/anotherSpecificLink") {
                      return `<a target="_blank" href="${imgUrl}">View Link</a>`;
                  }
                  // Otherwise just shorten to a generic link "View Article".
                  return `<a target="_blank" href="${imgUrl}">View Article</a>`;
              }
              return imgUrl;
          }.bind(this)
        );
      }

      return '';
    } catch (e) {
      console.error('Error building textContent:', e);
      return '';
    }
  }
}
