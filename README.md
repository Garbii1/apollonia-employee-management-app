# Apollonia Dental - Employee Management App (Foundation)

A foundational CRUD (Create, Read, Update, Delete) web application for managing employees and departments at Apollonia Dental Practice. This project serves as the initial step towards a more comprehensive employee and customer relationship management system. Built with Node.js, Express, MongoDB, and containerized using Docker.

## Project Scenario

Apollonia Dental Practice requires a digital solution to manage its staff and departments effectively. This application provides the basic functionality to list, add, edit, and delete employee and department records.

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose ODM
*   **Frontend:** HTML, CSS, Vanilla JavaScript
*   **Containerization:** Docker, Docker Compose
*   **API:** RESTful API

## Features

*   **Departments Management:**
    *   Create new departments.
    *   Read (list) all departments.
    *   Update existing department names.
    *   Delete departments (only if no employees are assigned).
*   **Employee Management:**
    *   Create new employees with assignment to one or more departments.
    *   Read (list) all employees, showing their assigned departments.
    *   Update employee details (first name, last name, department assignments).
    *   Delete employees.
*   **Web UI:** Simple interface to interact with the CRUD operations via the REST API.
*   **Dockerized:** Easy setup and deployment using Docker Compose.

## Setup and Installation

Follow these steps to get the application running locally using Docker.

### Prerequisites

*   [Git](https://git-scm.com/)
*   [Docker](https://www.docker.com/products/docker-desktop/)
*   [Docker Compose](https://docs.docker.com/compose/install/) (Usually included with Docker Desktop)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/<YourUsername>/<RepoName>.git
    cd <RepoName>
    ```

2.  **Create Environment File:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    *   Review the `.env` file. The default values should work for the Docker setup. **Do not commit your `.env` file.**

3.  **Build and Run with Docker Compose:**
    *   From the project root directory (`<RepoName>/`), run:
        ```bash
        docker-compose up --build
        ```
    *   `--build`: Ensures the Docker image for the Node.js app is built.
    *   Wait for the logs to indicate that the database is ready and the server is running (e.g., "MongoDB Connected successfully.", "Server running on http://localhost:3000").

4.  **Access the Application:**
    *   Open your web browser and navigate to: `http://localhost:3000`

5.  **Stopping the Application:**
    *   Press `Ctrl + C` in the terminal where `docker-compose up` is running.
    *   To stop containers running in detached mode (`-d`), use `docker-compose down`. Add `-v` (`docker-compose down -v`) to also remove the database data volume.

### (Optional) Seeding Initial Data

A seed script (`seed.js`) is included to populate the database with the initial departments and employees provided in the project brief.

*   **Requirement:** Ensure the MongoDB port `27017` is mapped to your host in `docker-compose.yml` (it is by default in the provided file).
*   **Run while containers are UP:** Make sure the Docker containers are running (`docker-compose up`).
*   **Execute the script:** Open a *separate* terminal window, navigate to the project directory, and run:
    ```bash
    node seed.js
    ```
*   Refresh the application in your browser to see the populated data.

## Project Structure
apollonia-app/
├── public/ # Frontend static files (HTML, CSS, JS)
│ ├── index.html
│ ├── style.css
│ └── script.js
├── models/ # Mongoose database schemas/models
│ ├── department.model.js
│ └── employee.model.js
├── routes/ # Express API route definitions
│ ├── department.routes.js
│ └── employee.routes.js
├── Dockerfile # Instructions to build the Node.js app image
├── docker-compose.yml # Defines and runs the multi-container application (Node app + MongoDB)
├── .dockerignore # Specifies files/folders to exclude from Docker image
├── .env.example # Example environment variables file
├── .gitignore # Specifies files/folders for Git to ignore
├── package.json # Node.js project manifest and dependencies
├── package-lock.json # Exact dependency versions
├── server.js # Main Express application setup and server start
└── seed.js # (Optional) Script to populate initial database data
└── README.md # This file


## API Endpoints (Brief Overview)

*   `GET /api/departments` - List all departments
*   `POST /api/departments` - Create a new department
*   `GET /api/departments/:id` - Get a single department
*   `PUT /api/departments/:id` - Update a department
*   `DELETE /api/departments/:id` - Delete a department
*   `GET /api/employees` - List all employees (with populated departments)
*   `POST /api/employees` - Create a new employee
*   `GET /api/employees/:id` - Get a single employee (with populated departments)
*   `PUT /api/employees/:id` - Update an employee
*   `DELETE /api/employees/:id` - Delete an employee

## Future Enhancements

(Based on original project brief)

*   Record trainings and specializations for staff.
*   Manage current projects.
*   Assign patients to staff members.
*   Track revenue per patient/staff member.
*   Develop towards a full employee and customer relationship management system.

## License

[MIT](LICENSE) <!-- If you add a LICENSE file, link it here. Otherwise, just state the license. -->

---

_Developed by [Muhammed Babatunde Garuba/Garbii1]_