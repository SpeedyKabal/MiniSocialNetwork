# MiniSocialNetwork
a simple Social Network that can be run in a small business

1. Environment Variables
Before running the app, you must create two .env files:

a. Base Folder (.env)
Create a .env file in the root directory with the following variables:

DJANGO_SECRET_CODE=your_secret_key

DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_ROOT_PASSWORD=your_db_root_password
DB_HOST=localhost
DB_PORT=3306

EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_HOST_USER=your_email_user
EMAIL_HOST_PASSWORD=your_email_password
EMAIL_USE_TLS=True

DOMAIN=http://127.0.0.1:8000

WEATHER_API_KEY=your_weather_api_key_from_open_weather_map


b. Frontend Folder (.env)
Create a .env file inside the frontend folder with:

VITE_API_URL=http://127.0.0.1:8000/ 
VITE_WS_URL=ws://127.0.0.1:8000/ws/online/
VITE_CHAT_WS_URL=ws://127.0.0.1:8000/ws/chat/


2. Backend Setup

a. Create a Python virtual environment:

python3 -m venv hsnenv
source hsnenv/bin/activate

b. Install backend dependencies:

pip install -r backend/requirements.txt

3. Frontend Setup

Navigate to the frontend directory and install packages using either npm or bun:

* Using npm:

cd frontend
npm install

* Or using bun:

cd frontend
bun install

4. Running the App

python backend/manage.py runserver

npm run dev or bun run dev