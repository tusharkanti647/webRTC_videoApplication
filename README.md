# WebRTC Video Application 🎥

This project is a full-stack **WebRTC video conferencing application** built using:

- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Real-time Communication:** WebRTC + Socket.IO
- **Containerization:** Docker & Docker Compose

The application is structured as a **monorepo** with separate frontend and backend services, all orchestrated using **Docker Compose**.

---

## 📁 Project Structure

```
webRTC_videoApplication/
│
├── docker-compose.yml
├── README.md
│
├── frontend/
│ ├── Dockerfile
│ ├── package.json
│ └── README.md
│
├── backend/
│ ├── Dockerfile
│ ├── package.json
│ ├── index.js
│ └── README.md
```


---

## 🚀 How to Run the Project (Using Docker)

### Prerequisites
- Docker Desktop installed
- Docker Desktop running (Linux containers)

### Start the application
From the **project root**:

```bash
docker compose up --build
```

**Access the app**

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)


## Detailed Documentation

For more detailed information, please refer to:

Frontend details:
frontend/README.md

Backend details:
backend/README.md