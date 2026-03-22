# Bookverse - All Features Explanation (A - Z)

This document breaks down every single feature built into the Bookverse application, explaining what it is and how it works.

---

## 🔐 1. Authentication & Security Features

### A. User Registration (Signup)
* **What it is:** New users can create an account.
* **How it works:** The user provides a Name, Email, Username, and Password. The backend checks if the email or username is already taken. If not, it saves the user to the database and issues a secure "JWT" (JSON Web Token) so they are logged in immediately.

### B. Secure Login (JWT Authentication)
* **What it is:** Returning users can log in securely.
* **How it works:** The user enters their email and password. The backend verifies the credentials. If correct, it sends back a JWT token. The frontend saves this token and "attaches" it to every future private action (like leaving a review) to prove the user's identity.

### C. Role-Based Access
* **What it is:** The system knows if a user is a normal "USER" or an "ADMIN".
* **How it works:** Depending on the role assigned in the database, users get access to different parts of the platform (e.g., only Admins can access the Admin Dashboard).

---

## 📚 2. Core Book Features

### D. Book Discovery & Search
* **What it is:** The ability to search for any book in the world.
* **How it works:** Users type a query into the search bar. The frontend calls the backend API, which queries the database (or external sources like Google Books/Open Library wrapper) to fetch book titles, authors, and cover images.

### E. Book Details Page
* **What it is:** A dedicated page for a single book.
* **How it works:** Clicking on a book shows its full information: Description, Page Count, Genres, and the community's Average Rating. It also displays all user reviews left for that specific book.

### F. Dynamic Homepage (Trending & Top Rated)
* **What it is:** The homepage automatically updates to show the most popular books.
* **How it works (The Aggregation Engine):** 
  * **Trending Books:** The backend quietly tracks every time someone clicks or searches a book (saving it to the `Activity` database). It counts which books have the most views and pushes them to the *"Trending"* section.
  * **Top Rated:** The backend mathematically averages out the 1-5 star ratings from all users and pushes books with an average of 4.0+ to the *"Top Rated"* section.

### G. Free To Read / Classic Books Section
* **What it is:** A dedicated section on the homepage for Public Domain or Classic books.
* **How it works:** The backend queries the `BookMaster` database for books marked specifically with `isClassic: true`.

---

## 🏃 3. Progress Tracking & Statistics Features

### H. Reading Session Logging
* **What it is:** Users can log exactly how much they read in one sitting.
* **How it works:** A user inputs "I started on page 20, and ended on page 50". The backend calculates that 30 pages were read, saves this session to the `ReadingSession` table, and associates it with that exact book and user.

### I. Real-Time Reading Stats
* **What it is:** A personal dashboard showing reading habits.
* **How it works:** The backend analyzes all of a user's past Reading Sessions and generates statistics like *Total Books Read*, *Total Pages Read*, and *Average Pages Per Session*. This is displayed on the user's Dashboard using charts (via Recharts).

---

## 💬 4. Social & Community Features

### J. Reviews & Ratings
* **What it is:** Users can leave a text review and a star rating out of 5 for any book.
* **How it works:** The review text and the 1-5 number are sent to the backend and saved in the `Review` collection. These reviews are then displayed on the Book Details page, and the overall rating average is recalculated in real-time.

### K. Recently Reviewed Feed
* **What it is:** A live feed showing what other people in the community are reviewing right now.
* **How it works:** The homepage backend grabs the 20 most recent entries in the `Review` database, attaches the user's name and avatar to it, and displays it on the front page.

### L. Favorites & Saved Books (Wishlist)
* **What it is:** Users can heart a book to save it for later.
* **How it works:** Clicking the "Heart" button sends a request to the backend. The backend creates a record in the `Favorite` or `SavedBook` collection linking the User ID to the Book ID. The user can then view all their saved books on their "My Books" or "Favorites" page.

### M. Custom Reading Lists
* **What it is:** Users can organize their books into custom lists (e.g., "Currently Reading", "To Read", "Abandoned").
* **How it works:** Managed through the `ReadingList` collection, users can move items between lists to keep their physical or digital library organized.

---

## 📝 5. Personalization Features

### N. Private Notes
* **What it is:** Users can write private thoughts or study notes on specific books.
* **How it works:** Saved in the `Note` collection. Unlike reviews which are public, notes are tied specifically to the User ID and are only visible to the person who wrote them. Perfect for students.

### O. User Profile Management
* **What it is:** A page where users can update their bio, location, and avatar.
* **How it works:** Users can edit their details, including selecting their `favoriteGenres` (e.g., Fantasy, Sci-Fi). This data is updated directly in the `User` collection.

### P. AI/Algorithmic Recommendations
* **What it is:** The system suggests new books the user might like.
* **How it works:** Using the `recommendationController`, the backend looks at the user's `favoriteGenres` and their past `Activity` (what books they viewed recently), and cross-references this with the `BookMaster` database to find similar books.

---

## ⚙️ 6. System & Admin Features

### Q. Admin Dashboard
* **What it is:** A special hidden control panel for platform owners.
* **How it works:** When a user with the `ADMIN` role logs in, they gain access to a special route. From here, they can view platform-wide statistics, manage users, or tweak global site settings saved in the `AdminSettings` collection.

### R. User Banning system
* **What it is:** Admins can ban bad actors.
* **How it works:** The `User` model contains an `isBanned` boolean flag. If an admin sets this to `true`, the `authController` will block that user from logging in or making API requests, keeping the community safe from spam.
