# Mini Social Network

A modern, Docker-based social networking platform for small businesses with real-time features.

## 🚀 Features

- **Full Authentication**: Secure login, logout, and password reset flows.
- **User Profiles**: Dedicated profile pages with cover and profile pictures.
- **Real-Time Chat**: Instant messaging between users.
- **Online Status**: Live tracking of user online/offline status.
- **Post System**: Create, view, and manage posts.
- **Media Support**: Upload and display images and videos.
- **Background Tasks**: Asynchronous email sending and other background jobs.
- **Admin Dashboard**: Comprehensive admin interface for managing the platform.

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.2
- **API**: Django Rest Framework
- **Database**: MySQL 8.0
- **Channels**: Django Channels for WebSocket support
- **Tasks**: Celery with Redis
- **Security**: JWT Authentication

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx
- **Message Broker**: Redis

## 📦 Docker Setup

### Prerequisites
- Docker Desktop installed and running.

### Installation
1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd backend
    ```

2.  **Create Environment File**:
    Copy the example file and fill in your credentials:
    ```bash
    cp .env.example .env
    ```
    Edit `.env` with your database, email, and API keys.

3.  **Build and Start Services**:
    ```bash
    docker-compose up --build
    ```

4.  **Access the Application**:
    - **Frontend**: http://localhost:5173
    - **Backend API**: http://localhost/api/
    - **Admin**: http://localhost/admin/
    - **WebSocket**: ws://localhost/ws/online/

## ⚙️ Configuration

### Environment Variables
Ensure the following are set in your `.env` file:
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `DJANGO_SECRET_KEY` (Generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
- `WEATHER_API_KEY`
- `VITE_API_URL` (should be `http://localhost/api/`)
- `VITE_WS_URL` (should be `ws://localhost/ws/online/`)

## 📂 Project Structure

```
backend/
├── api/              # Django Rest Framework API
├── core/             # Core Django settings and ASGI config
├── manage.py         # Django management script
├── Dockerfile.backend
├── docker-compose.yml
├── .env              # Environment variables

frontend/
├── src/
│   ├── components/   # React components
│   ├── pages/        # Page components
│   ├── store/        # Redux store
│   ├── api/          # API service layer
│   └── ...
├── Dockerfile.frontend
├── vite.config.ts
└── package.json

nginx/              # Nginx configuration
```

## 🤝 Contributing
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
