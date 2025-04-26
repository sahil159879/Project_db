DROP TABLE IF EXISTS ItemGenres, Watchlist, Suggestions, Recommendations, Friends, Reviews, Ratings, Items, Genres, Users CASCADE;

-- Users Table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Genres Table
CREATE TABLE Genres (
    genre_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Items Table
CREATE TABLE Items (
    item_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('movie', 'TV show', 'book')),
    description TEXT,
    release_date DATE,
    author_creator VARCHAR(255),
    image_url VARCHAR(255)    -- For image path/URL
);

-- Ratings Table (aggregated per item)
CREATE TABLE Ratings (
    item_id INT PRIMARY KEY,
    average_rating DECIMAL(3,2) CHECK (average_rating BETWEEN 0 AND 5) DEFAULT 0,
    num_reviews INT DEFAULT 0,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
);


-- Reviews Table
CREATE TABLE UserRatings (
    user_id INT,
    item_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
);


CREATE TABLE UserReviews (
    review_id SERIAL PRIMARY KEY,
    user_id INT,
    item_id INT,
    review_text TEXT,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
);


-- ItemGenres Table
CREATE TABLE ItemGenres (
    item_id INT,
    genre_id INT,
    PRIMARY KEY (item_id, genre_id),
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id) ON DELETE CASCADE
);

-- Watchlist Table
CREATE TABLE Watchlist (
    user_id INT,
    item_id INT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
);

-- Friends Table
CREATE TABLE Friends (
    user_id_1 INT,
    user_id_2 INT,
    status VARCHAR(20) CHECK (status IN ('Pending', 'Accepted', 'Blocked')) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id_1, user_id_2),
    CHECK (user_id_1 <> user_id_2),
    FOREIGN KEY (user_id_1) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id_2) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Suggestions Table
CREATE TABLE Suggestions (
    suggestion_id SERIAL PRIMARY KEY,
    user_id INT,
    item_title VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- Recommendations Table
CREATE TABLE Recommendations (
    recommendation_id SERIAL PRIMARY KEY,
    user_id INT,
    recommended_item_id INT,
    reason TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recommended_item_id) REFERENCES Items(item_id) ON DELETE CASCADE
);
