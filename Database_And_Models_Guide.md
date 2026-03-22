# Simple Guide to Our Database and Models

Think of our database like a giant digital filing cabinet where we store all our app's information. In this project, we use MongoDB. Instead of using tables (like inside an Excel sheet), MongoDB uses **"Collections"** (which are like folders) and **"Documents"** (which are like individual files inside those folders). 

The `models` folder is where we keep our **"blueprints"** or **"templates"**. These blueprints tell the database exactly what information is allowed to be saved. For example, a User blueprint might say: "Every user MUST have a name and an email."

Here is a simple, easy-to-understand explanation of every database file (model) in our app:

### 1. `User.js` (The People)
- **What it is:** The template for all users who sign up.
- **What it stores:** Things like their name, email, profile picture, and their secret password.

### 2. `BookMaster.js` (The Library)
- **What it is:** Our main library of all the books in the system.
- **What it stores:** Information about a book, like its title, the author's name, the cover picture, and how many pages it has. We store it here so we don't have to fetch it from the internet every single time.

### 3. `Activity.js` (The Notification Center)
- **What it is:** A tracker for what people are doing.
- **What it stores:** It keeps a record of events, like "John liked a book" or "Sarah wrote a review." This helps us show a feed of what everyone is up to to their friends.

### 4. `AdminSettings.js` (The Settings Panel)
- **What it is:** Special settings that only the boss (admin) can change.
- **What it stores:** Things like which books should show up in the "Trending" section on the homepage.

### 5. `DiscoverBook.js` (The Recommendations)
- **What it is:** A list of books we think people will like.
- **What it stores:** Books that are chosen to be shown in the "Discover" section to help users find new things to read.

### 6. `Favorite.js` (The Likes)
- **What it is:** A record of books that users have clicked the "heart" or "like" button on.
- **What it stores:** It just links a User to a Book. It basically says, "User A loves Book B."

### 7. `SavedBook.js` (The Bookmark)
- **What it is:** Books that users want to read later.
- **What it stores:** Similar to favorites, it links a User and a Book, meaning "User A has bookmarked Book B for later."

### 8. `ReadingList.js` (The Custom Folders)
- **What it is:** Lists of books created by users.
- **What it stores:** A user can make a list called "My Summer Reads" and put 5 books inside it. This file saves that list name and those 5 books.

### 9. `ReadingProgress.js` (The Bookmark within a Book)
- **What it is:** A tracker of how far a user has read.
- **What it stores:** It remembers that "User A is currently on Page 150 out of 300 in Book B", so they can pick up right where they left off.

### 10. `ReadingSession.js` (The Timer)
- **What it is:** A log of each time a user sits down to read.
- **What it stores:** Details like, "Today, the user read for 30 minutes in one sitting."

### 11. `ReadingStats.js` (The Scoreboard)
- **What it is:** The overall score or statistics for a user.
- **What it stores:** The sum of everything the user has done, like "Total books finished: 10" or "Total pages read: 2500".

### 12. `Review.js` (The Opinions)
- **What it is:** The feedback users leave for books.
- **What it stores:** The star rating (e.g., 4 out of 5 stars) and the text they wrote (e.g., "This book was amazing!").

### 13. `Note.js` (The Margin Scribbles)
- **What it is:** Private or public notes a user writes.
- **What it stores:** Thoughts the user types about a specific book while they are reading it, just like writing in the margins of a real book.

---

### How They All Work Together
Imagine **User.js** and **BookMaster.js** are the two main characters. Almost every other file just exists to connect them. For example:
- A user wants to review a book? We write a **Review** that points to the User and to the Book.
- A user favorites a book? We create a **Favorite** that points to the User and to the Book. 

This makes our database neat, organized, and very easy to manage without storing duplicated information!
