**# Automobile Showroom Management System (DBMS Course Project)

An enterprise-grade, full-stack automobile dealership management platform engineered with a **Java (Spring Boot 3)** backend, **MySQL 8.0** relational database, and an ultra-modern **React (Vite)** single-page frontend[cite: 1, 2, 8]. Designed for multi-branch automobile dealerships to manage vehicle inventory, 1:1 statutory specifications, customer relations, transactional sales, financial logs, and after-sales service tracking.

---

## 🏛️ System Architecture

The project adheres strictly to the **3-Tier Enterprise Architectural Pattern** with complete decoupling between frontend and backend tiers[cite: 2]:

```text
┌────────────────────────────────────────────────────────┐
│               Client Tier: React (Vite)                │
│    Interactive SaaS UI • Recharts Analytics • Axios    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON (REST APIs with CORS)[cite: 2, 6]
┌───────────────────────────▼────────────────────────────┐
│              Application Tier: Spring Boot 3           │
│  ├── Controller Layer  (REST Endpoints, Validation)    │[cite: 2]
│  ├── Service Layer     (Business Rules & Integrity)    │[cite: 2, 5]
│  ├── DTO Layer         (Serialization & Loop Breaking) │
│  └── Repository Layer  (Spring Data JPA Interfaces)    │[cite: 2, 5]
└───────────────────────────┬────────────────────────────┘
                            │ JDBC (Hibernate ORM Dialect)
┌───────────────────────────▼────────────────────────────┐
│            Database Tier: MySQL Relational DB          │
│    9 Normalized Tables • Foreign Key Constraints       │[cite: 2, 4, 8]
└────────────────────────────────────────────────────────┘
Architectural HighlightsDecoupled API Contract: By transferring flat Data Transfer Objects (DTOs) between tiers instead of raw @Entity classes, the system eliminates bidirectional circular reference loops and StackOverflowError exceptions[cite: 6].Separation of Concerns: HTTP parsing and status mapping remain isolated in Controllers, domain integrity logic runs within @Transactional service boundaries, and data access executes through abstracted JPA repositories.   📊 Relational Database Design & ER SchemaThe database model implements 9 normalized relational entities matching the system ER diagram:   EntityKey AttributesRelationships & CardinalityShowroomid, name, address, manager, salesExecutive1 : N with Vehicle and ServicesVehicleid, type, brand, colour, numberPlate, costN : 1 with Showroom; 1 : 1 with Features, Tax, Insurance; 1 : N with SalesFeaturesid, engineCapacity, mileage, colour, seatCapacity, fuelType, pollutionControl, safetyFeatures1 : 1 with Vehicle (Foreign Key: vehicle_id, Unique)Taxid, vehicleTax, roadTax, paid1 : 1 with Vehicle (Foreign Key: vehicle_id, Unique)Insuranceid, expiryDate, familyDetails, bankDetails1 : 1 with Vehicle (Foreign Key: vehicle_id, Unique)Customerid, firstName, middleName, lastName, phone, email, address1 : N with Sales, Payment, and ServicesSalesid, target, quantity, date, offerN : 1 with Vehicle and Customer; 1 : N with PaymentPaymentid, method (CASH/LOAN/CHEQUE), amount, paymentDateN : 1 with Customer and SalesServicesid, issue, price, entryDate, deliveryDateN : 1 with Showroom and Customer⚡ Core DBMS & Engineering HighlightsTransactional ACID Checkout: The system prevents double-selling inventory by checking vehicle sales status in an atomic, isolated service transaction; if invalid, the operation throws a descriptive exception and rolls back completely.   Entity Isolation (3NF): Vehicle specifications, tax assessments, and insurance policies are normalized into separate 1:1 tables rather than wide null-heavy columns, allowing independent policy lifecycles and compliance tracking.   Interactive Drill-Down Dashboard: Features KPI metric cards and Recharts visualizations that dynamically aggregate sales revenue, service ticket earnings, and in-stock inventory per showroom branch.   Real-Time Client-Side Search: Instantaneous multi-field search inputs across all 4 primary management pages (Vehicles, Showrooms, Sales, and Service tickets).   🛠️ Technology StackBackend: Java 17+, Spring Boot 3.x, Spring Data JPA, Hibernate ORM, Maven, Lombok[cite: 2, 4]Database: MySQL 8.0 Community Server[cite: 2]Frontend: React 18, Vite build tool, Axios client, React Router DOM   Visualizations & UI: Recharts (dynamic charts), Lucide React (modern SVG iconography), Custom Dark Slate SaaS Theme   🚀 Setup & Installation Guide1. Database SetupLaunch MySQL Workbench or your MySQL terminal client and create the schema:   SQLCREATE DATABASE showroom_db;
2. Backend Configuration & ExecutionNavigate to the backend directory:   Bashcd backend/showroom-api
Verify src/main/resources/application.properties matches your local MySQL credentials:   Propertiesspring.datasource.url=jdbc:mysql://localhost:3306/showroom_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
server.port=8081
Run the Spring Boot application:   Bash# Windows PowerShell
.\mvnw.cmd clean spring-boot:run

# Linux / macOS
./mvnw clean spring-boot:run
Backend REST API boots up at http://localhost:8081/api.3. Frontend Configuration & ExecutionOpen a second terminal window and navigate to the frontend directory:Bashcd frontend
Install the required dependencies:Bashnpm install
Start the Vite development server:Bashnpm run dev
Frontend UI becomes active at http://localhost:5173.   🔍 Key Multi-Table Join Queries (DBMS Showcase)Examiners commonly inspect raw relational joins during project demonstrations:   1. Vehicle Sales with Customer & Payment DetailsSQLSELECT 
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
2. Branch-Wise Aggregation & Revenue MetricsSQLSELECT 
    sh.name AS showroom_name,
    sh.manager,
    COUNT(s.id) AS total_vehicles_sold,
    COALESCE(SUM(s.target), 0) AS total_sales_revenue
FROM showroom sh
LEFT JOIN vehicle v ON v.showroom_id = sh.id
LEFT JOIN sales s ON s.vehicle_id = v.id
GROUP BY sh.id, sh.name, sh.manager;
👩‍💻 Author & Project ContextStudent Name: Zoha Qureshi (Zoa)   Degree: B.Tech Computer Science & Engineering   Institution: Shri G. S. Institute of Technology and Science (SGSITS), Indore   Course: Database Management Systems (DBMS) Laboratory Project   
<ElicitationsGroup>
  <Elicitation label="Prepare DBMS lab viva Q&A" query="What are the top 5 questions the external examiner will ask about this ER diagram and code?"/>
  <Elicitation label="Generate project report text" query="Can you help me generate the project report text (abstract, schema, and methodology) for submission?"/>
</ElicitationsGroup>
**
