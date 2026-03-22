# Database and Models Explanation Guide

This guide explains the database structure, specifically focusing on the `server/src/models` directory. In a MongoDB/Mongoose setup, we don't have traditional SQL "tables"; instead, we have "Collections". The `models` folder contains the schemas that define the structure of the documents within these collections.

## Why Do We Have a `models` Folder?
The `models` folder acts as the blueprint for our database. Its roles include:
1. **Defining Structure**: It specifies what fields (like `title`, `author`, `userId`) a database entry should have and their data types (String, Number, Date).
2. **Validation**: It ensures that required fields are present and valid before saving to the database.
3. **Relationships**: It defines how different collections relate to each other (e.g., a `Review` belongs to a `User` and a `BookMaster`).
4. **Interaction**: It provides the interface (Mongoose models) used by the `controllers` to create, read, update, and delete records (CRUD operations).

---

## Detailed Breakdown of Database Files (Models)

Below is an explanation of each file inside the `server/src/models` folder and its role in the application:

### 1. `User.js`
- **Role**: Manages all user-related data.
- **Purpose**: Stores user authentication details (like email and hashed password), profile information (name, avatar), and account preferences. This is the core model that connects to almost every other user-specific action.

### 2. `BookMaster.js`
- **Role**: Acts as the central encyclopedia for books.
- **Purpose**: Instead of constantly fetching the same book data from external APIs (like Google Books or Open Library), we cache the book details (title, authors, cover image, rating) here. Other user-specific models (like Reviews, Favorites) reference books from this master collection.

### 3. `Activity.js`
- **Role**: Tracks user actions across the platform.
- **Purpose**: Stores events like "User A liked a book", "User B added a review", or "User C started reading". This is heavily used to generate activity feeds or timelines for users and their followers.

### 4. `AdminSettings.js`
- **Role**: Stores global application configurations.
- **Purpose**: A single-document collection used by site administrators to manage global state, such as explicitly setting which books should appear in the "Trending" section.

### 5. `DiscoverBook.js`
- **Role**: Powers the book discovery or recommendation feed.
- **Purpose**: Holds curated or algorithmically generated data about which books should be recommended to users to improve engagement.

### 6. `Favorite.js`
- **Role**: Manages the "Like" / "Favorite" feature.
- **Purpose**: A junction collection that simply links a `User` to a `BookMaster` document. When a user clicks the heart icon on a book, an entry is created here.

### 7. `SavedBook.js`
- **Role**: Powers the "Save for Later" or "Bookmark" functionality.
- **Purpose**: Allows users to save books they are interested in but might not want to categorize fully into a custom list yet.

### 8. `ReadingList.js`
- **Role**: Enables custom user book collections.
- **Purpose**: Stores lists created by users (e.g., "Summer Reads", "Sci-Fi Favorites"). It contains an array of book references and belongs to a specific user.

### 9. `ReadingProgress.js`
- **Role**: Tracks how far a user has read in a specific book.
- **Purpose**: Stores data like `currentPage`, `totalPages`, or percentage completed for a given book, allowing the user to pick up where they left off.

### 10. `ReadingSession.js`
- **Role**: Logs individual reading sittings.
- **Purpose**: Tracks granular data like "User read 50 pages of Book X on Tuesday for 45 minutes". This data is usually aggregated to show reading habits.

### 11. `ReadingStats.js`
- **Role**: Stores aggregated user statistics.
- **Purpose**: Holds high-level data derived from `ReadingSession` and `ReadingProgress`, such as "Total Books Read", "Total Pages Read", or "Current Reading Streak", which is often displayed on the user's profile dashboard.

### 12. `Review.js`
- **Role**: Handles user feedback and ratings.
- **Purpose**: Stores the text review, the star rating (e.g., 1 to 5), the associated user, and the targeted book.

### 13. `Note.js`
- **Role**: Allows users to write personal reflections.
- **Purpose**: Stores private or public notes/annotations a user makes about a specific book they are reading or have read.

---

## How It All Fits Together

1. Everything revolves around the **`User`** and the **`BookMaster`**.
2. When a user interacts with a book (reviews, favorites, reads), a new document is created in the respective collection (e.g., `Review`, `Favorite`, `ReadingProgress`) linking the **User ID** and the **Book ID**.
3. **Controllers** (in `server/src/controllers/`) use these models to perform operations, and the **Database Connection** (likely in `server/src/config/db.js`) is what connects these model schemas to your actual remote or local MongoDB instance.
