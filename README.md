# 🏎️ Automobile Showroom Management System

An enterprise-grade, full-stack dealership management platform built with **Spring Boot 3**, **MySQL 8.0**, and **React (Vite)**. Designed to manage multi-branch vehicle inventory, 1:1 statutory records (tax, insurance, features), customer relations, sales transactions, payments, and after-sales service tracking.

---

## 🏛️ System Architecture

The application implements a decoupled **3-tier enterprise architecture**:

```text
┌────────────────────────────────────────────────────────┐
│               Client Tier: React (Vite)                │
│    Interactive SaaS UI • Recharts Analytics • Axios    │
└───────────────────────────┬────────────────────────────┘
                             │ HTTP / JSON (REST APIs with CORS)
┌───────────────────────────▼────────────────────────────┐
│              Application Tier: Spring Boot 3           │
│  ├── Controller Layer  (REST Endpoints, Validation)    │
│  ├── Service Layer     (Business Rules & Integrity)    │
│  ├── DTO Layer         (Serialization & Loop Breaking) │
│  └── Repository Layer  (Spring Data JPA Interfaces)    │
└───────────────────────────┬────────────────────────────┘
                             │ JDBC (Hibernate ORM Dialect)
┌───────────────────────────▼────────────────────────────┐
│            Database Tier: MySQL Relational DB          │
│    9 Normalized Tables • Foreign Key Constraints        │
└────────────────────────────────────────────────────────┘
```

### Architectural Highlights

- **Decoupled DTO Contract** — Flat Data Transfer Objects (DTOs) prevent circular-reference recursion and `StackOverflowError` exceptions during JSON serialization.
- **Separation of Concerns** — Controllers handle HTTP mappings, Service methods enforce integrity constraints inside `@Transactional` boundaries, and JPA repositories manage database persistence.

---

## 📊 Relational Database Design & ER Schema

The database model implements 9 normalized relational entities matching the ER schema:

| Entity | Primary & Foreign Keys | Key Attributes | Cardinality |
|---|---|---|---|
| **Showroom** | `id` (PK) | name, address, manager, salesExecutive | 1 : N with Vehicle, Services |
| **Vehicle** | `id` (PK), `showroom_id` (FK) | type, brand, colour, numberPlate, cost | N : 1 Showroom; 1 : 1 Features, Tax, Insurance |
| **Features** | `id` (PK), `vehicle_id` (FK, Unique) | engineCapacity, mileage, fuelType, seatCapacity, safetyFeatures | 1 : 1 with Vehicle |
| **Tax** | `id` (PK), `vehicle_id` (FK, Unique) | vehicleTax, roadTax, paid | 1 : 1 with Vehicle |
| **Insurance** | `id` (PK), `vehicle_id` (FK, Unique) | expiryDate, familyDetails, bankDetails | 1 : 1 with Vehicle |
| **Customer** | `id` (PK) | firstName, middleName, lastName, phone, email, address | 1 : N with Sales, Payments, Services |
| **Sales** | `id` (PK), `vehicle_id` (FK), `customer_id` (FK) | target, quantity, date, offer | N : 1 Vehicle & Customer; 1 : N Payment |
| **Payment** | `id` (PK), `sale_id` (FK), `customer_id` (FK) | method (CASH/LOAN/CHEQUE), amount, paymentDate | N : 1 with Customer & Sales |
| **Services** | `id` (PK), `showroom_id` (FK), `customer_id` (FK) | issue, price, entryDate, deliveryDate | N : 1 with Showroom & Customer |

---

## ⚡ Core DBMS & Engineering Highlights

- **ACID Transaction Guarantee** — Inventory checks execute inside `@Transactional(rollbackFor = Exception.class)` boundaries so a sold vehicle cannot be double-sold.
- **Entity Normalization (3NF)** — 1:1 statutory specifications (tax, features, insurance) are isolated from core inventory records to eliminate sparse null columns and preserve clean normal form.
- **Real-Time Client-Side Filtering** — Live search inputs across all four management views (Vehicles, Showrooms, Sales, Services).
- **Executive Metrics Dashboard** — Aggregates multi-table joins to calculate total branch revenue, active maintenance tickets, and available inventory.

---

## 🛠️ Technology Stack

- **Backend:** Java 17, Spring Boot 3.x, Spring Data JPA, Hibernate ORM, Maven, Lombok
- **Database:** MySQL 8.0 Relational DBMS
- **Frontend:** React 18, Vite, Axios, Recharts, Lucide Icons

---

## 🚀 Setup & Local Execution

### 1. Database Setup

Launch MySQL Workbench or terminal and run:

\`\`\`sql
CREATE DATABASE showroom_db;
\`\`\`

### 2. Backend Execution

Navigate to the backend project and start Spring Boot:

\`\`\`bash
cd backend/showroom-api

# Windows
.\mvnw.cmd clean spring-boot:run

# macOS / Linux
./mvnw clean spring-boot:run
\`\`\`

Backend runs on `http://localhost:8081`.

### 3. Frontend Execution

In a separate terminal, start Vite:

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Frontend runs on `http://localhost:5173`.

---

## 🔍 Key Multi-Table Join Queries (DBMS Showcase)

### 1. Sales Records with Customer, Vehicle, and Payment Details

\`\`\`sql
SELECT 
    s.id AS sale_id,
    s.date AS sale_date,
    CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name,
    c.phone,
    v.brand,
    v.number_plate,
    s.target AS sale_price,
    p.method AS payment_method,
    p.amount AS amount_paid
FROM sales s
JOIN customer c ON s.customer_id = c.id
JOIN vehicle v ON s.vehicle_id = v.id
LEFT JOIN payment p ON p.sale_id = s.id;
\`\`\`

### 2. Branch-Wise Aggregated Revenue

\`\`\`sql
SELECT 
    sh.name AS showroom_name,
    sh.manager,
    COUNT(s.id) AS total_vehicles_sold,
    COALESCE(SUM(s.target), 0) AS total_sales_revenue
FROM showroom sh
LEFT JOIN vehicle v ON v.showroom_id = sh.id
LEFT JOIN sales s ON s.vehicle_id = v.id
GROUP BY sh.id, sh.name, sh.manager;
\`\`\`

