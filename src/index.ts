//! I have created All logic in the same file, 
//! I could have modularized this code by creating Interface, Model and Stub folder as well.
//! In below code Shop Owner can easily enable or disable offer by just modifying pricingRules.

class Checkout {
  private pricingRules: Array<PricingRule>;
  private cartItems: Array<CartItem> = []
  private stockItems: Array<Item> = [
    {
      SKU: "ipd",
      name: "Super iPad",
      price: 549.99,
    },
    {
      SKU: "mbp",
      name: "MacBook Pro",
      price: 1399.99,
    },
    {
      SKU: "atv",
      name: "Apple TV",
      price: 109.50,
    },
    {
      SKU: "vga",
      name: "VGA adapter",
      price: 30.00,
    },
  ];

  constructor(rules: Array<PricingRule>) {
    this.pricingRules = rules;
  }

  public scan(itemId: string): void {
    const existingItemIndex = this.cartItems.findIndex(item => item.SKU === itemId)

    if (existingItemIndex >= 0) {
      this.cartItems[existingItemIndex].quantity += 1;
      return;
    }

    const stockItem = this.stockItems.find(item => item.SKU === itemId);

    if (!stockItem) {
      console.log('Item not found in the stock')
      return;
    }

    this.cartItems.push({ ...stockItem, quantity: 1 })  
  };

  public total(): number {
    let total = this.cartItems.reduce((acc, cartItem) => {
      let itemTotal;
      const itemOffer = this.pricingRules.find(offer => (cartItem.SKU === offer.SKU && offer.isOfferActive ));

      switch (itemOffer?.type) {
        case "FREE_ITEM" :
          const discountAmount = Math.floor(cartItem.quantity / (itemOffer.minQuantity + 1)) * cartItem.price;
          itemTotal = (cartItem.quantity * cartItem.price ) - discountAmount;
          break;

        case "SPECIAL_PRICE" :
            const specialPrice = itemOffer.specialPrice ?? cartItem.price;
            const price = (cartItem.quantity < itemOffer.minQuantity) ? cartItem.price : specialPrice;
            itemTotal = cartItem.quantity * price;
          break;

        default: 
          itemTotal = cartItem.quantity * cartItem.price;
      }

      return acc + itemTotal;
    }, 0)

    return total
  }
}

interface CartItem extends Item {
  quantity: number,
}

interface Item {
  SKU: string,
  name: string,
  price: number,
}

interface PricingRule {
  SKU: string,
  title: string,
  type: string,
  isOfferActive: boolean,
  minQuantity: number,
  freeQuantity?: number,
  specialPrice?: number,
}

const pricingRules: Array<PricingRule> = [
  {
    SKU: "atv",
    title: "Buy 2 get 1 Free", //! What if customers buy 4 Should we have to give them 2 Free?
    type: "FREE_ITEM",
    minQuantity: 2,
    freeQuantity: 1,
    isOfferActive: true,
  },
  {
    SKU: "ipd",
    title: `Buy 4 or More @ Special price`,
    type: "SPECIAL_PRICE",
    minQuantity: 4,
    specialPrice: 499.99,
    isOfferActive: true,
  },
]

const checkout1 = new Checkout(pricingRules);
checkout1.scan("atv");
checkout1.scan("atv");
checkout1.scan("atv");
checkout1.scan("vga");
console.log('Total expected: $249.00');
console.log('Total: $' + checkout1.total());

const checkout2 = new Checkout(pricingRules);
checkout2.scan("atv");
checkout2.scan("ipd");
checkout2.scan("ipd");
checkout2.scan("atv");
checkout2.scan("ipd");
checkout2.scan("ipd");
checkout2.scan("ipd");
console.log('Total expected: $2718.95');
console.log('Total: $' + checkout2.total());