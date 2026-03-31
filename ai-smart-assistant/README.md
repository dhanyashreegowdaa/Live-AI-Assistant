# AI Smart Assistant

A comprehensive AI-powered smart assistant application with React/Next.js frontend and FastAPI backend.

## Project Structure

### Frontend
- React/Next.js application
- Components for chat, sidebar, and tools
- Custom hooks and API services
- Global styling and utilities

### Backend
- FastAPI server
- AI agents with planning and execution
- Multiple tools integration (search, calculator, weather, etc.)
- Memory system (short-term and long-term)
- Database models and services

### AI Modules
- Personalization engine
- Fact-checking system
- Multi-agent framework
- Reasoning display

## Setup

### Prerequisites
- Node.js 16+
- Python 3.9+
- Docker (optional)

### Installation

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### Environment Variables
Create a `.env` file in the root directory:

```
OPENAI_API_KEY=your_api_key
DATABASE_URL=your_database_url
FRONTEND_URL=http://localhost:3000
```

### Running Locally

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
uvicorn app.main:app --reload
```

### Docker Deployment

```bash
docker-compose up -d
```

## Features

- 💬 Real-time chat interface
- 🔍 Web search integration
- 📊 Calculator and analytics tools
- 🎙️ Voice input support
- 📁 File upload capability
- 💾 Memory system (short and long-term)
- 🤖 Multi-agent AI framework
- ⚙️ User personalization
- ✓ Fact-checking system

## API Documentation

Available at `http://localhost:8000/docs` when backend is running

## Testing

```bash
pytest tests/
```

## License

MIT
