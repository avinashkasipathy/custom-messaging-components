import { LightningElement, api } from "lwc";
import { dispatchMessagingEvent, assignMessagingEventHandler, MESSAGING_EVENT } from "lightningsnapin/eventStore";

export default class CommerceHeader extends LightningElement {

    headerText = '';

  /**
  * Deployment configuration data.
  * @type {Object}
  */
  @api configuration = {};

  /**
  * The status of the conversation. Valid values:
  * - NOT_STARTED
  * - OPEN
  * - CLOSED
  * @type {ConversationStatus}
  */
  @api conversationStatus;

  /**
  * Handle minimize button click.
  */
  onMinimizeButtonClick() {
      dispatchMessagingEvent(MESSAGING_EVENT.MINIMIZE_BUTTON_CLICK, {});
  }

  connectedCallback() {
      assignMessagingEventHandler(MESSAGING_EVENT.PARTICIPANT_JOINED, (data) => {
          console.log(`Participant joined`);
      });

      assignMessagingEventHandler(MESSAGING_EVENT.PARTICIPANT_LEFT, (data) => {
          console.log(`Participant left`);
      });

      assignMessagingEventHandler(MESSAGING_EVENT.UPDATE_HEADER_TEXT, (data) => {
            this.headerText = data?.text || '';
      });
  }
}