import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Cart.css";

const Cart = () => {
  // TODO: Implement the checkStatus function
  // If the user is already logged in, fetch the cart.
  // If not, redirect to the login page.
  useEffect(() => {
    const checkStatus = async () => {
      // Implement your logic to check if the user is logged in
      // If logged in, fetch the cart data, otherwise navigate to /login
    };
    checkStatus();
  }, []);

  // TODO: Manage cart state with useState
  // cart: Stores the items in the cart
  // totalPrice: Stores the total price of all cart items
  // error: Stores any error messages (if any)
  // message: Stores success or info messages
  

  // TODO: Implement the fetchCart function
  // This function should fetch the user's cart data and update the state variables
  const fetchCart = async () => {
    // Implement your logic to fetch the cart data
    // Use the API endpoint to get the user's cart
  };

  // TODO: Implement the updateQuantity function
  // This function should handle increasing or decreasing item quantities
  // based on user input. Make sure it doesn't exceed stock limits.
  const updateQuantity = async (productId, change, currentQuantity, stockQuantity) => {
    // Implement your logic for quantity update
    // Validate quantity bounds and update the cart via API
  };

  // TODO: Implement the removeFromCart function
  // This function should remove an item from the cart when the "Remove" button is clicked
  const removeFromCart = async (productId) => {
    // Implement your logic to remove an item from the cart
    // Use the appropriate API call to handle this
  };

  // TODO: Implement the handleCheckout function
  // This function should handle the checkout process and validate the address fields
  // If the user is ready to checkout, place the order and navigate to order confirmation
  const handleCheckout = async () => {
    // Implement your logic for checkout, validate address and place order
    // Make sure to clear the cart after successful checkout
  };

  // TODO: Implement the handlePinCodeChange function
  // This function should fetch the city and state based on pincode entered by the user
  const handlePinCodeChange = async (e) => {
    // Implement the logic to fetch city and state by pincode
    // Update the city and state fields accordingly
  };

  // TODO: Display error messages if any error occurs
  if (error) {
    return <div className="cart-error">{error}</div>;
  }

  return (
    <>
      <div className="cart-container">
        <h1>Your Cart</h1>

        {/* TODO: Display the success or info message */}
        {message && <div className="cart-message">{message}</div>}

        {/* TODO: Implement the cart table UI */}
        {/* If cart is empty, display an empty cart message */}
        {cart.length === 0 ? (
          <p className="empty-cart-message">Your cart is empty</p>
        ) : (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock Available</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* TODO: Render cart items dynamically */}
                {/* Use map() to render each cart item */}
                {cart.map((item) => (
                  <tr key={item.item_id}>
                    {/* TODO: Render product details here */}
                    {/* Display item name, price, stock, quantity, and total */}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TODO: Implement the address form */}
            {/* Allow users to input pincode, street, city, and state */}
            <form>
              {/* Implement address fields */}
            </form>

            {/* TODO: Display total price and the checkout button */}
            <div className="cart-total">
              {/* Display the total price */}
              <h3>Total: ${totalPrice}</h3>
              {/* Checkout button should be enabled only if there are items in the cart */}
              <button onClick={handleCheckout} disabled={cart.length === 0}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
