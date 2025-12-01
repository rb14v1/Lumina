# Lumina - Enterprise AI Prompt Library

A full-stack web application designed to curate, manage, version, and distribute high-quality AI prompts across organizations. The platform leverages Django REST Framework for robust backend operations and features a modern, responsive interface built with React and Vite.

## Features

-  **Role-Based Authentication**: Secure token-based login system with distinct User and Admin roles
-  **Dynamic Prompt Library**: Browse, search, and filter approved prompts by category, task type, and output format
-  **Advanced Filtering**: Multi-dimensional filtering with React Select components for precise prompt discovery
-  **Bookmark System**: Save frequently-used prompts for quick access and reuse
-  **Community Voting**: Upvote and downvote prompts to help rank quality and relevance
-  **Prompt Submission**: Users can submit new prompts through a structured, validated form
-  **Personal Dashboard**: Track all your prompts with status indicators (Approved, Pending, Rejected)
-  **Version Control**: Create new versions, revert to previous iterations, and track complete revision history
-  **Admin Moderation**: Dedicated dashboard for reviewing, approving, rejecting, and editing submissions
-  **Real-Time Updates**: Instant visibility of approved prompts across the platform
-  **Fully Responsive**: Clean and modern UI that works smoothly on all devices

---

## Tech Stack

The project is divided into two main parts: a Django backend and a React frontend.

| Component | Technology                                                                               |
| :-------- | :--------------------------------------------------------------------------------------- |
| **Backend Framework** | Python 3.10, Django, Django REST Framework | RESTful API development and business logic |
| **Frontend Framework** | React.js 18.x, Vite 5.x | Lightning-fast UI with Hot Module Replacement |
| **Styling** | Tailwind CSS 3.x | Utility-first responsive design system |
| **Database** | PostgreSQL 14+ / SQLite3 | ACID-compliant relational database storage |
| **Authentication** | JWT (JSON Web Tokens) | Secure token-based authentication |
| **State Management** | React Context API, React Hooks | Global and component-level state |
| **HTTP Client** | Axios | API communication with interceptors |
| **UI Components** | React Select, Lucide Icons | Enhanced form controls and iconography |
| **Build Tool** | Vite | Fast builds and optimized production bundles |
| **Version Control** | Git, GitLab | Source code management and collaboration |

---

## Project Structure
```
prompt_Library/
└─ prompt-library/
   ├─ backend/
   │  ├─ api/
   │  │  ├─ __init__.py
   │  │  ├─ admin.py
   │  │  ├─ apps.py
   │  │  ├─ models.py
   │  │  ├─ serializers.py
   │  │  ├─ tests.py
   │  │  ├─ urls.py
   │  │  └─ views.py
   │  ├─ prompt_library/
   │  │  ├─ __init__.py
   │  │  ├─ asgi.py
   │  │  ├─ settings.py
   │  │  ├─ urls.py
   │  │  └─ wsgi.py
   │  ├─ .env
   │  ├─ .gitignore
   │  ├─ manage.py
   │  └─ requirements.txt
   ├─ frontend/
   │  ├─ public/
   │  │  └─ vite.svg
   │  ├─ src/
   │  │  ├─ api/
   │  │  │  └─ axios.js
   │  │  ├─ assets/
   │  │  │  ├─ logo.png
   │  │  │  ├─ lumina.png
   │  │  │  ├─ ProfileIcon.png
   │  │  │  ├─ react.svg
   │  │  │  ├─ v1_logo.png
   │  │  │  └─ version1.png
   │  │  ├─ components/
   │  │  │  ├─ Feedback.jsx
   │  │  │  ├─ FilterBar.jsx
   │  │  │  ├─ Footer.jsx
   │  │  │  ├─ Header.jsx
   │  │  │  ├─ HistoryModal.jsx
   │  │  │  ├─ PromptCard.jsx
   │  │  │  └─ PromptCardDash.jsx
   │  │  ├─ context/
   │  │  │  └─ AuthContext.jsx
   │  │  ├─ pages/
   │  │  │  ├─ AddPromptPage.jsx
   │  │  │  ├─ Auth.jsx
   │  │  │  ├─ Dashboard.jsx
   │  │  │  └─ HomePage.jsx
   │  │  ├─ App.jsx
   │  │  ├─ index.css
   │  │  └─ main.jsx
   │  ├─ .gitignore
   │  ├─ eslint.config.js
   │  ├─ index.html
   │  ├─ package-lock.json
   │  ├─ package.json
   │  ├─ README.md
   │  ├─ tailwind.config.js
   │  └─ vite.config.js
   └─ .gitignore
```

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

-  **Python** (3.10 or newer - ideal=3.12)
-  **Node.js** and **npm** (v18+ recommended)
-  **PostgreSQL** (v14+ for production) or SQLite3 (for development)

### Backend Setup (Django)

1. **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2. **Create and activate a virtual environment:**
    ```bash
    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3. **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```

4. **Configure Environment Variables:**
    Create a file named `.env` in the `backend/` directory and add your configuration:
    ```env
    # backend/.env
    DB_NAME=your_database_name
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_HOST=your_database_host
    DB_PORT=your_database_port
    ```

5. **Apply database migrations:**
    ```bash
    python manage.py migrate
    ```

6. **Create a superuser (admin account):**
    ```bash
    python manage.py createsuperuser
    ```

7. **Run the Django development server:**
    ```bash
    python manage.py runserver
    ```

The backend API will now be running at 'http://127.0.0.1:8000'.

### Frontend Setup (React)

1. **Open a new terminal and navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2. **Install the required npm packages:**
    ```bash
    npm install
    ```

3. **Run the React development server:**
    ```bash
    npm run dev
    ```

The frontend application will now be running at 'http://localhost:5173'.

---

## How to Use

1. **Login and Authentication**
   - Open your web browser and navigate to http://localhost:5173
   - Log in with your user credentials on the Auth page
   - Admins will be redirected to the Dashboard, while regular users will see the Home Page

2. **Browse and Discover Prompts**
   - The Home Page displays all approved prompts in a responsive grid layout
   - Use the search bar to find prompts by keywords
   - Apply advanced filters by Category, Task Type, and Output Format
   - Click the bookmark icon to save prompts for quick access
   - Use upvote/downvote buttons to rank prompt quality

3. **Submit a New Prompt**
   - Click the "Create Prompt" button in the navigation bar
   - Fill in the form with Title, Description, Task Type, Output Format, Category, Intended Use, and Guidance
   - Click "Submit" to send your prompt for admin review
   - Track your submission status in "My Dashboard" (Pending, Approved, or Rejected)

4. **Manage Your Prompts (Personal Dashboard)**
   - Navigate to "My Dashboard" to view all your submitted prompts
   - See prompts organized by status: Approved, Pending, and Rejected
   - Click "View History" to see version timeline and revert to previous versions
   - Edit pending prompts before admin approval

5. **Admin Moderation (Admin Only)**
   - Access the Admin Dashboard after logging in with admin credentials
   - Toggle between "Pending" and "Approved" tabs to review submissions
   - Click any prompt to open the detailed review modal
   - Choose to Approve, Reject, or Edit prompts
   - All approved prompts become instantly visible to all users
