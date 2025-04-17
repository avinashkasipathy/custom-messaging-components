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

  // connectedCallback() {
  //   this.processEntryPayload();
  // }

  // processEntryPayload() {
  //   try {
  //     const raw = this.conversationEntry?.entryPayload;
  //     const parsedPayload = typeof raw === 'string' ? JSON.parse(raw) : raw;

  //     const parsedResponseText = parsedPayload?.abstractMessage?.staticContent?.text || {};

  //     this.contentType = parsedResponseText.contentType || '';

  //     if (this.contentType === 'productRecommendations') {
  //       this.productData = parsedResponseText.products || [];
  //     }

  //     // Extend this with other content types here as needed
  //   } catch (error) {
  //     console.error('Failed to parse entryPayload:', error);
  //   }
  // }

  get isProductRecommendations() {
    return this.contentType === 'productRecommendations';
  }

  handleAddToCart(event) {
    const product = event.detail.product.name;
    this.configuration.util.sendTextMessage(`Can you help me add ${product} to cart`);
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

    /**
   * Returns the text content of the conversation entry.
   * @returns {string}
   */
    get textContent() {
        try {
            const entryPayload = JSON.parse(this.conversationEntry.entryPayload);
            if (entryPayload.abstractMessage && entryPayload.abstractMessage.staticContent) {
                const text = entryPayload.abstractMessage.staticContent.text;
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
            return "";
        } catch (e) {
            console.error(e);
        }
    }
}
