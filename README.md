# MaintainHub

MaintainHub is a full-stack maintenance request tracker with tenant and staff roles, JWT authentication, request lifecycle management, comments, local file uploads, CSV import, CSV/PDF export, reports, and responsive SaaS-style dashboards.

## Stack

- Frontend: React 19, Vite, Tailwind CSS, React Router DOM, Axios, React Hook Form, Lucide React
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT, bcrypt, CORS, REST APIs
- Database: MySQL
- Storage: local `/uploads` folder with a small storage service that can be replaced by S3 later

## Run Backend

```bash
cd Backend
copy .env.example .env
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Create the MySQL database first:

```sql
CREATE DATABASE maintainhub;
```

Default seeded staff account:

- Email: `staff@maintainhub.com`
- Password: `Admin@123`

Demo seeded tenant:

- Email: `tenant@example.com`
- Password: `Tenant@123`

## Run Frontend

```bash
cd Frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Main API Surface

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/profile`
- `POST /requests`
- `GET /requests/tenant`
- `GET /requests/{id}`
- `GET /requests`
- `PUT /requests/{id}`
- `DELETE /requests/{id}`
- `POST /requests/{id}/assign`
- `POST /requests/{id}/status`
- `GET /requests/{id}/history`
- `POST /requests/{id}/comments`
- `GET /requests/{id}/comments`
- `POST /upload`
- `GET /export`
- `POST /import-csv`
- `GET /notifications`
