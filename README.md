
# 📚 Bookverse

> **Ideally organized.** Your modern social library for tracking reading progress, discovering new books, and connecting with a community of readers.

![Bookverse Banner](https://via.placeholder.com/1200x400?text=Bookverse+Preview)

## 🚀 Overview

**Bookverse** is a full-stack **MERN** application designed to reimagine the social reading experience. It combines powerful book tracking features (similar to StoryGraph) with community interaction (like Goodreads), all wrapped in a clean, modern "Libra" design system.

Whether you're tracking your yearly reading challenge, searching for your next favorite read via our smart recommendation engine, or discussing plot twists with friends, Bookverse handles it all with style and speed.

## ✨ Key Features

- **📖 Smart Library Management**: Organize books into "Currently Reading", "Want to Read", and "Completed" shelves.
- **📊 Reading Stats & Insights**: Visualize your reading habits with interactive charts (Genres, Pacing, formats).
- **🎯 Yearly Reading Challenges**: Set goals and track your progress throughout the year.
- **🔍 Powerful Search**: Instant search powered by OpenLibrary & Google Books APIs.
- **💡 Personalized Recommendations**: Get suggestions based on your reading history and favorite genres.
- **🌍 Community Feed**: See what your friends are reading, rating, and reviewing in real-time.
- **🔐 Secure Authentication**: JWT-based auth system with secure password hashing.
- **📱 Responsive Design**: Fully responsive UI built with Tailwind CSS for seamless mobile and desktop experience.

## 🛠️ Tech Stack

### Frontend (Client)
- **React 19** - Component-based UI library.
- **Vite** - Blazing fast build tool.
- **Tailwind CSS 4** - Utility-first styling with a custom "Libra" design system.
- **Zustand** - Lightweight global state management.
- **TanStack Query** - Efficient server state management and caching.
- **React Router 7** - Client-side routing.
- **Framer Motion** - Smooth UI animations.
- **Recharts** - Data visualization for reading stats.
- **Lucide React** - Beautiful, consistent iconography.

### Backend (Server)
- **Node.js & Express** - Robust REST API architecture.
- **MongoDB & Mongoose** - NoSQL database for flexible data modeling.
- **JSON Web Tokens (JWT)** - Stateless authentication.
- **Bcrypt.js** - Password security.
- **Joi & Zod** - Runtime schema validation.

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
- [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/bookverse.git
    cd bookverse
    ```

2.  **Install Dependencies**
    
    *Server:*
    ```bash
    cd server
    npm install
    ```
    
    *Client:*
    ```bash
    cd ../client
    npm install
    ```

3.  **Environment Configuration**
    
    Create a `.env` file in the `server/` directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/bookverse
    JWT_SECRET=your_super_secret_key_here
    ```

4.  **Run the Application**

    *Open two terminals:*

    *Terminal 1 (Server):*
    ```bash
    cd server
    npm start
    ```

    *Terminal 2 (Client):*
    ```bash
    cd client
    npm run dev
    ```

    The client will typically run at `http://localhost:5173`.

## 📡 API Documentation

### Auth
- `POST /api/auth/register` - Create a new account.
- `POST /api/auth/login` - Authenticate user & get token.

### Books & Shelves
- `GET /api/books/search?q=query` - Search for books.
- `GET /api/books/:id` - Get book details.
- `POST /api/books/save` - Add book to library.
- `GET /api/lists/my` - Get user's reading lists.

### Social & Reviews
- `POST /api/reviews/add` - Post a review.
- `GET /api/activity/global` - Get global community feed.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the ISC License.

---

> **Bookverse** — Connecting readers, one page at a time.
