const express = require('express');
const router = express.Router();

// Cart Checkout Route
router.post('/checkout', (req, res) => {
    const cart = req.body.cart;
    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: 'Cart is empty!' });
    }

    // Just a confirmation message for now
    res.status(200).json({ message: 'Order placed successfully!', cart });
});

module.exports = router;
