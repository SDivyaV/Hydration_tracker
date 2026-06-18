# Daily Water Intake Tracker

A full-stack water intake tracking app with a Spring Boot backend and an animated React dashboard. Log daily water intake, track progress toward a 3L goal, view intake history, toggle dark mode, and celebrate goal completion with confetti.

## Features

- Log water intake entries in milliliters
- View today's total intake
- Track progress toward a 3000 ml daily goal
- Animated water bottle that fills based on progress
- Moving wave animation inside the bottle
- Hydration score label that changes with progress
- Confetti burst when the 3L goal is reached
- Light and dark dashboard themes
- Intake history table
- In-memory H2 database for local development

## Tech Stack

Backend:

- Java 18
- Spring Boot 3.2.6
- Spring Web
- Spring Data JPA
- H2 Database
- Maven

Frontend:

- React 19
- Vite
- Framer Motion
- Axios
- Tailwind CSS

## Project Structure

```text
.
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
├── src/
│   └── main/
│       ├── java/com/example/watertracker/
│       │   ├── controller/WaterIntakeController.java
│       │   ├── model/WaterIntake.java
│       │   ├── repository/WaterIntakeRepository.java
│       │   ├── service/WaterIntakeService.java
│       │   └── DailyWaterIntakeTrackerApplication.java
│       └── resources/application.properties
├── pom.xml
└── README.md
```

## Prerequisites

- Java 18 or later
- Maven
- Node.js and npm

## Run the Backend

From the project root:

```bash
mvn spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

The H2 console is available at:

```text
http://localhost:8080/h2-console
```

H2 connection settings:

```text
JDBC URL: jdbc:h2:mem:waterdb
Username: sa
Password:
```

## Run the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite usually starts at:

```text
http://localhost:5173
```

If port `5173` is already in use, Vite will print the next available local URL.

## API Endpoints

### Get All Water Intake Entries

```http
GET /api/water-intake
```

Example response:

```json
[
  {
    "id": 1,
    "date": "2026-06-18",
    "milliliters": 500
  }
]
```

### Add Water Intake

```http
POST /water
Content-Type: application/json
```

Example request:

```json
{
  "date": "2026-06-18",
  "milliliters": 500
}
```

### Get Today's Total Intake

```http
GET /water/today
```

Example response:

```json
1500
```

## Frontend Proxy

The Vite dev server proxies API calls to the backend:

```js
"/water" -> "http://localhost:8080"
"/api" -> "http://localhost:8080"
```

Start the Spring Boot backend before using the React dashboard so the frontend can load and save water intake data.

## Build

Backend:

```bash
mvn clean package
```

Frontend:

```bash
cd frontend
npm run build
```

## Notes

- The daily goal is currently set to `3000 ml` in the React app.
- The H2 database is in memory, so data resets when the backend restarts.
- Today's total is calculated using the backend server's current date.
