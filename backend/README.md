# MaintainHub Backend

## Setup

1. Create a MySQL database named `maintainhub`.
2. Copy `.env.example` to `.env` and update `DATABASE_URL`.
3. Install dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

4. Run the API:

```bash
uvicorn app.main:app --reload
```

The API starts at `http://localhost:8000`. Tables are created at startup and the default staff user is seeded:

- Email: `staff@maintainhub.com`
- Password: `Admin@123`
