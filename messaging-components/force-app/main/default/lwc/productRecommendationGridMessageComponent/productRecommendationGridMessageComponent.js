import { LightningElement, api } from 'lwc';

export default class ProductRecommendationGridMessageComponent extends LightningElement {
    @api products = [];

    handleAddToCart(event) {
        const productId = event.target.dataset.id;
        const product = this.products.find(p => p.id === productId);
        this.dispatchEvent(new CustomEvent('addtocart', { detail: { product } }));
    }
}