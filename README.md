# Connect HomeTask – Items & Categories API (Node.js + SQLite)

## Stack
- Node.js, Express
- SQLite (via `better-sqlite3`)
- Security: API Key middleware, Helmet, CORS
- Validation: `express-validator`

## Requirements
- Node.js LTS
- npm

## Overview
A tiny REST API for managing, categories, items and item volumes.  
Built with Node.js (Express) and SQLite (better-sqlite3).  
Auth via `x-api-key`. Validation with `express-validator`.  
Seed data is created automatically on first run.

Send requests with header: x-api-key: dev-123456

## Setup
```bash
copy .env.example .env
npm install
npm run dev
