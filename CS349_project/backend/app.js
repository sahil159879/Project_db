const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const port = 4000;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here
const pool = new Pool({
  user: 'project',
  host: 'localhost',
  database: 'rating_system',
  password: 'project',
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS: Give permission to localhost:3000 (ie our React app)
// to use this backend API
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session information
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

/////////////////////////////////////////////////////////////
// Authentication APIs
// Signup, Login, IsLoggedIn and Logout

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
   return res.status(400).json({message : "Unauthorized"});
  }
  next();
}

// TODO: Implement user signup logic
// return JSON object with the following fields: {username, email, password}
// use correct status codes and messages mentioned in the lab document
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  // console.log(username,email,password);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id',
      [username, email, hashedPassword]
    );

    req.session.userId = result.rows[0].user_id;

    // Instead of res.redirect(), send a JSON response
    res.status(200).json({ success: true, message: "User Registered Successfully" });

  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ message: "Error: Email is already registered" });
    } else {
      console.error(err);
      res.status(500).json({ message: "Error signing up" });
    }
  }
});



// TODO: Implement user signup logic
// return JSON object with the following fields: {email, password}
// use correct status codes and messages mentioned in the lab document
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // console.log(email,password);

  try {
    console.log("hii");
    const result = await pool.query("SELECT user_id, username, password_hash FROM users WHERE email = $1", [email]);
    // console.log(result);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (passwordMatch) {
        req.session.userId = user.user_id;
        req.session.username = user.username; // Store username in session
        return res.status(200).json({ message: "Login successful", username: user.username });
      } else {
        return res.status(400).json({ message: "Invaid credentials" });
      }
    } else {
      return res.status(400).json({ message: "Invaid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
});



// TODO: Implement API used to check if the client is currently logged in or not.
// use correct status codes and messages mentioned in the lab document
app.get("/isLoggedIn", async (req, res) => {
  if (!req.session.userId) {
    return res.status(400).json({ loggedIn: false });
  }

  try {
    const result = await pool.query(
      "SELECT username FROM users WHERE user_id = $1",
      [req.session.userId]
    );

    if (result.rows.length > 0) {
      res.status(200).json({message : "Logged in", loggedIn: true, username: result.rows[0].username });
    } else {
      res.status(400).json({message : "Not logged in", loggedIn: false });
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ loggedIn: false });
  }
});

// TODO: Implement API used to logout the user
// use correct status codes and messages mentioned in the lab document
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.clearCookie("connect.sid"); // Clear session cookie
    res.status(200).json({ message: "Logged out successfully" });
  });
});




////////////////////////////////////////////////////
// APIs for the products
// use correct status codes and messages mentioned in the lab document
// TODO: Fetch and display all products from the database
app.get("/list-movies", isAuthenticated, async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    let query = "SELECT * FROM Items WHERE category = 'movie'";
    const values = [];

    if (searchQuery) {
      query += " AND title ILIKE $1";
      values.push(`%${searchQuery}%`);
    }

    query += " ORDER BY item_id ASC";

    const result = await pool.query(query, values);
    // console.log("hii",result);
    res.status(200).json({
      message: "Movies fetched successfully",
      result: result.rows,
    });

  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ message: "Error listing movies" });
  }
});

app.get("/list-books", isAuthenticated, async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    let query = "SELECT * FROM Items WHERE category = 'book'";
    const values = [];

    if (searchQuery) {
      query += " AND title ILIKE $1";
      values.push(`%${searchQuery}%`);
    }

    query += " ORDER BY item_id ASC";

    const result = await pool.query(query, values);
    res.status(200).json({
      message: "Books fetched successfully",
      result: result.rows,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Error listing books" });
  }
});

app.get("/list-tvshows", isAuthenticated, async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    let query = "SELECT * FROM Items WHERE category = 'TV show'";
    const values = [];

    if (searchQuery) {
      query += " AND title ILIKE $1";
      values.push(`%${searchQuery}%`);
    }

    query += " ORDER BY item_id ASC";

    const result = await pool.query(query, values);
    res.status(200).json({
      message: "TV Shows fetched successfully",
      result: result.rows,
    });
  } catch (error) {
    console.error("Error fetching TV shows:", error);
    res.status(500).json({ message: "Error listing TV shows" });
  }
});

app.get("/api/items/:itemId", isAuthenticated, async (req, res) => {
  const { itemId } = req.params;

  try {
    // console.log(itemId);
    const result = await pool.query("SELECT * FROM Items WHERE item_id = $1", [itemId]);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]); // this should be JSON
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Error fetching item details:", error);
    res.status(500).json({ message: "Error fetching item details" });
  }
});


// POST /rate-item - Handle item rating
app.post('/rate-item', isAuthenticated, async (req, res) => {
  const { itemId, rating } = req.body;
  const userId = req.session.userId; // Assuming user is authenticated and user ID is stored in the session
  // console.log(itemId,rating , "dj");

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  try {
    // Check if the user already rated this item
    const existingRating = await pool.query(
      'SELECT * FROM UserRatings WHERE user_id = $1 AND item_id = $2',
      [userId, itemId]
    );

    if (existingRating.rows.length > 0) {
      // If user has already rated this item, update their rating
      await pool.query(
        'UPDATE UserRatings SET rating = $1, rated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND item_id = $3',
        [rating, userId, itemId]
      );
    } else {
      // If the user has not rated this item, insert their rating
      await pool.query(
        'INSERT INTO UserRatings (user_id, item_id, rating) VALUES ($1, $2, $3)',
        [userId, itemId, rating]
      );
    }

    // Update average rating in the Ratings table
    const ratingsResult = await pool.query(
      'SELECT AVG(rating) AS average_rating, COUNT(rating) AS num_reviews FROM UserRatings WHERE item_id = $1',
      [itemId]
    );

    const { average_rating, num_reviews } = ratingsResult.rows[0];

    // Update the Ratings table with new average and review count
    await pool.query(
      'UPDATE Ratings SET average_rating = $1, num_reviews = $2 WHERE item_id = $3',
      [average_rating, num_reviews, itemId]
    );

    res.status(200).json({ message: 'Rating submitted successfully!' });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/items/:itemId/average-rating - Fetch the average rating of a specific item
app.get('/api/items/:itemId/average-rating', isAuthenticated, async (req, res) => {
  const { itemId } = req.params;

  try {
    // Calculate average from UserRatings table
    const result = await pool.query(
      'SELECT AVG(rating) AS average_rating FROM UserRatings WHERE item_id = $1',
      [itemId]
    );

    const avg = result.rows[0].average_rating;

    if (avg !== null) {
      res.status(200).json({
        message: 'Average rating calculated successfully',
        averageRating: parseFloat(avg),
      });
    } else {
      res.status(404).json({ message: 'No ratings available for this item' });
    }
  } catch (error) {
    console.error('Error calculating average rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET /api/items/:itemId/user-rating - Fetch the logged-in user's rating for an item
app.get('/api/items/:itemId/user-rating', isAuthenticated, async (req, res) => {
  const { itemId } = req.params;
  const userId = req.session.userId;

  try {
    const result = await pool.query(
      'SELECT rating FROM UserRatings WHERE user_id = $1 AND item_id = $2',
      [userId, itemId]
    );

    if (result.rows.length > 0) {
      res.status(200).json({ userRating: result.rows[0].rating });
    } else {
      res.status(200).json({ userRating: null }); // Not rated yet
    }
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/add-review', isAuthenticated, async (req, res) => {
  const { itemId, reviewText } = req.body;
  const userId = req.session.userId;

  if (!reviewText || reviewText.trim() === '') {
    return res.status(400).json({ message: 'Review text cannot be empty.' });
  }

  try {
    await pool.query(
      'INSERT INTO UserReviews (user_id, item_id, review_text) VALUES ($1, $2, $3)',
      [userId, itemId, reviewText]
    );

    res.status(200).json({ message: 'Review submitted successfully!' });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/api/items/:itemId/reviews', isAuthenticated, async (req, res) => {
  const { itemId } = req.params;

  try {
    const result = await pool.query(
      `SELECT u.username, ur.review_text, ur.reviewed_at
       FROM UserReviews ur
       JOIN Users u ON ur.user_id = u.user_id
       WHERE ur.item_id = $1
       ORDER BY ur.reviewed_at DESC`,
      [itemId]
    );

    res.status(200).json({ reviews: result.rows });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});










// APIs for cart: add_to_cart, display-cart, remove-from-cart
// TODO: impliment add to cart API which will add the quantity of the product specified by the user to the cart
app.post("/add-to-cart", isAuthenticated, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.session.userId;

  try {
    // Get the available stock for the product
    const productResult = await pool.query(
      "SELECT * FROM products WHERE product_id = $1",
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invalid product ID" });
    }

    const availableStock = productResult.rows[0].stock_quantity;

    if (quantity > availableStock) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${productResult.rows[0].name}` });
    }

    // Check if product is already in cart
    const cartResult = await pool.query(
      "SELECT quantity FROM cart WHERE user_id = $1 AND item_id = $2",
      [userId, productId]
    );

    if (cartResult.rows.length > 0) {
      // Update quantity
      const newQuantity = cartResult.rows[0].quantity + quantity;
      if (newQuantity > availableStock) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${productResult.rows[0].name}` });
      }

      await pool.query(
        "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3",
        [newQuantity, userId, productId]
      );
    } else {
      // Insert new entry
      await pool.query(
        "INSERT INTO cart (user_id, item_id, quantity) VALUES ($1, $2, $3)",
        [userId, productId, quantity]
      );
    }

    res.status(200).json({ success: true, message: `Successfully added ${quantity} of ${productResult.rows[0].name} to your cart.` });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ success: false, message: "Error adding to cart" });
  }
});

// TODO: Implement display-cart API which will returns the products in the cart
app.get("/display-cart", isAuthenticated, async (req, res) => {
  const userId = req.session.userId;

  try {
    const result = await pool.query(
      `SELECT c.item_id AS product_id, p.name AS product_name, c.quantity, p.price, p.stock_quantity
       FROM cart c
       JOIN products p ON c.item_id = p.product_id
       WHERE c.user_id = $1
       ORDER BY p.product_id`,
      [userId]
    );

    res.status(200).json({message : "Cart fetched successfully.", cart: result.rows });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Error fetching cart" });
  }
});


// TODO: Implement remove-from-cart API which will remove the product from the cart
app.post("/remove-from-cart", isAuthenticated, async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId;

  try {
    await pool.query("DELETE FROM cart WHERE user_id = $1 AND item_id = $2", [userId, productId]);
    res.status(200).json({ message: "Item removed from your cart successfully" });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ message: "Error removing from cart" });
  }
});
// TODO: Implement update-cart API which will update the quantity of the product in the cart
app.post("/update-cart", isAuthenticated, async (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.session.userId;
  // console.log("check",product_id,quantity);
  try {
    const productResult = await pool.query(
      "SELECT stock_quantity,price FROM products WHERE product_id = $1",
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity > productResult.rows[0].stock_quantity) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock" });
    }

    await pool.query(
      "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3",
      [quantity, userId, product_id]
    );

    res.status(200).json({ message: "Cart updated successfully", success : true,price : productResult.rows[0].price });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ message: "Error updating cart" });
  }
});

// APIs for placing order and getting confirmation
// TODO: Implement place-order API, which updates the order,orderitems,cart,orderaddress tables
app.post("/place-order", isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const { pincode, street, city, state } = req.body;

  const client = await pool.connect(); // Begin transaction

  try {
    await client.query("BEGIN"); // Start transaction

    // Step 1: Retrieve user's cart items
    const cartItemsResult = await client.query(
      "SELECT c.item_id AS product_id, c.quantity, p.price, p.stock_quantity " +
      "FROM cart c JOIN products p ON c.item_id = p.product_id WHERE c.user_id = $1",
      [userId]
    );

    const cartItems = cartItemsResult.rows;

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Step 2: Check stock availability
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        await client.query("ROLLBACK"); // Rollback transaction if stock is insufficient
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ID ${item.product_id}`,
        });
      }
    }

    // Step 3: Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Step 4: Generate a new order_id manually (assuming sequential IDs)
    const orderIdResult = await client.query("SELECT COALESCE(MAX(order_id), 0) + 1 AS new_order_id FROM orders");
    const orderId = orderIdResult.rows[0].new_order_id;

    // Step 5: Insert order details into Orders table (explicitly inserting order_id)
    const date = new Date().toLocaleString();
    console.log(date);
    await client.query(
      "INSERT INTO orders (order_id, user_id, order_date, total_amount) VALUES ($1, $2, $3, $4)",
      [orderId, userId,date, totalAmount]
    );

    // Step 6: Insert each cart item into OrderItems table
    for (const item of cartItems) {
      await client.query(
        "INSERT INTO orderitems (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Step 7: Update product stock
      await client.query(
        "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2",
        [item.quantity, item.product_id]
      );
    }

    // Step 8: Insert address into OrderAddress table
    // Step 8: Insert address into OrderAddress table (Ensure pincode is valid)

    const cleanPincode = String(pincode).trim(); // Convert to string & trim spaces
    await client.query(
      "INSERT INTO orderaddress (order_id, pincode, street, city, state) VALUES ($1, $2, $3, $4, $5)",
      [orderId, cleanPincode, street, city, state]
    );


    // Step 9: Clear the cart
    await client.query("DELETE FROM cart WHERE user_id = $1", [userId]);

    // Commit the transaction
    req.session.orderId = orderId;
    await client.query("COMMIT");

    res.status(200).json({ success: true, message: "Order placed successfully", orderId });

  } catch (error) {
    await client.query("ROLLBACK"); // Rollback on error
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Error placing order" });
  } finally {
    client.release(); // Release the client back to the pool
  }
});



// API for order confirmation
// TODO: same as lab4
app.get("/order-confirmation", isAuthenticated, async (req, res) => {
  const orderId = req.session.orderId;


  try {
    // Fetch order details
    const orderDetailsQuery = await pool.query(
      `SELECT o.order_id, o.order_date, o.total_amount
       FROM Orders o 
       JOIN Users u ON o.user_id = u.user_id 
       WHERE o.order_id = $1`, 
      [orderId]
    );
    // console.log("hi");
    if (orderDetailsQuery.rows.length === 0) {
      return res.status(400).json({message : 'Order not found'});
    }
    // console.log("hi again");
    const orderItems = orderDetailsQuery.rows[0];

    // Log fetched order details
    // console.log("Fetched order details:", orderDetails);
    // console.log("Total Amount from DB:", orderDetails.total_amount);

    // console.log("hi returns");
    // Fetch order items
    const orderItemsQuery = await pool.query(
      `SELECT oi.product_id, p.name AS product_name, oi.quantity, oi.price, 
              (oi.quantity * oi.price) AS total_price 
       FROM OrderItems oi 
       JOIN Products p ON oi.product_id = p.product_id 
       WHERE oi.order_id = $1 
       ORDER BY oi.product_id`, 
      [orderId]
    );
    // console.log("death of hi");
    const order = orderItemsQuery.rows;
    
    // Log fetched order items
    // console.log("Fetched order items:", orderItems);

    res.status(200).json( {message: "Order fetch successfully", order, orderItems} );
  } catch (error) {
    // console.log("rise of hey");
    console.error("Error retrieving order details:", error);
    res.status(500).json({message : 'Error fetching order details'});
  }
});


////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});