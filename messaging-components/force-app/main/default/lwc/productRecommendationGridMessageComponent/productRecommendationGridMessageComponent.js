import { LightningElement, api } from 'lwc';

export default class ProductRecommendationGridMessageComponent extends LightningElement {
    @api products = [];

    handleAddToCart(event) {
        const index = event.target.dataset.index;
        const product = this.products[index];

        if (product) {
            this.dispatchEvent(new CustomEvent('addtocart', {
                detail: { product }
            }));
        }
    }
}
