# Chat App

This is a chat application with a Django backend and a Next.js frontend.

## Getting Started with Docker Compose

To run the application using Docker Compose, follow these steps:

1.  **Build and Run the Services:**

    Navigate to the root directory of the project (where `docker-compose.yml` is located) and run the following command:

    ```bash
    docker-compose up --build
    ```

    This command will:
    - Build the Docker images for both the backend and frontend services based on their respective `Dockerfile`s.
    - Start the backend service (Django) on `http://localhost:8000`.
    - Start the frontend service (Next.js) on `http://localhost:3000`.

2.  **Access the Application:**
    - Frontend: Open your web browser and go to `http://localhost:3000`
    - Backend API: The Django backend will be available at `http://localhost:8000`

## Stopping the Application

To stop the running services, press `Ctrl+C` in the terminal where `docker-compose up` is running. Then, to remove the containers and networks, run:

```bash
docker-compose down
```
