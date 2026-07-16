# CHAPTER 4: SYSTEM DESIGN AND DEVELOPMENT

## 4.1 System Architecture (High-Level Design)

### 4.1.1 Conceptual Design

When we designed the conceptual architecture for LifeKart, we knew it had to be highly decoupled and event-driven. We completely separated the presentation layers (the mobile and web apps) from the complex business logic and machine learning models running in the backend. 

The system operates across three main environments:
1.  **Client Environment:** This is what the users see. It includes the Flutter mobile app for end consumers, and the Next.js web portals for Corporate Admins, Manufacturers, and Platform Superadmins.
2.  **Application Environment (Backend):** This is the brain of the system, built using the FastAPI framework. It handles routing requests, verifying JWT authentication tokens, validating business rules, and talking to the predictive AI/ML models.
3.  **Data Environment:** This is where data is saved and cached. We use PostgreSQL for our relational data (like users, financial transactions, and subscriptions) and Redis for fast caching and running asynchronous background tasks via Celery.

### 4.1.2 Component Diagram

*(Note: In a visual component diagram, the structural relationships would look like this)*
-   **API Gateway (Nginx/Traefik):** This sits at the front, intercepts all incoming client requests, manages SSL security, and routes the traffic to the right backend service.
-   **Authentication Service (FastAPI):** Manages user registration, login, role checking, and issues tokens. It talks directly to the PostgreSQL `users` table.
-   **Subscription & Core Logic Engine (FastAPI):** This is the heavy lifter. It handles creating, validating, and managing the lifecycle of the lifetime wholesale contracts. 
-   **AI Demand Forecasting Module (Python/TensorFlow/XGBoost):** This runs asynchronously. It grabs data from the `households` and `subscriptions` tables, runs its predictive inferences, and saves the results so the Manufacturer portal can display them quickly.
-   **Corporate Payroll Integration Module:** A specialized service that processes employee CSV rosters and generates standard payroll deduction reports.

## 4.2 Detailed Design (Low-Level Design)

### 4.2.1 Data Flow Diagram (DFD)

We structured the flow of data through LifeKart very strictly to maintain ACID compliance (meaning data is never corrupted or partially saved).

**Level 0 (Context Diagram):**
The Consumer inputs their demographic data and subscription requests into the System. The System then outputs lifetime cost savings and delivery schedules back to the Consumer. At the same time, the System outputs aggregated demand forecasts to the Manufacturer and payroll deduction reports to the Corporate Partner. 

**Level 1 DFD (Core Subscription Flow):**
1.  Consumer submits a `Household_Profile` payload via the app.
2.  The API validates the payload and saves it in the `households` database table.
3.  Consumer requests a `Lifetime_Subscription`.
4.  The API queries the `products` table for wholesale pricing and checks the `progression_rules` table to see if the product size needs to mutate over time.
5.  A `WholesaleAgreement` record is generated and marked as "Pending".
6.  Once payment is successful (via an external gateway like Stripe), the record status changes to "Active".

### 4.2.2 Use Case Diagrams

We used strict Role-Based Access Control (RBAC), which means each type of user has completely isolated use cases.

**Actor: Consumer**
-   *Register/Login*
-   *Create/Update Household Profile* (Includes adding family members)
-   *Browse Wholesale Catalog*
-   *Initiate Lifetime Subscription*
-   *View Lifetime Savings Analytics*
-   *Track Scheduled Deliveries*

**Actor: Manufacturer**
-   *Register/Verify Corporate Identity*
-   *Manage Product Catalog* (Add products, define wholesale price tiers)
-   *Define Progression Rules* (e.g., mapping an age range to a specific clothing size)
-   *View Predictive Demand Analytics Dashboard*

**Actor: Corporate Admin**
-   *Upload Employee Roster*
-   *Set Monthly Employee Grocery Allowances*
-   *Download Monthly Payroll Deduction Reports*

**Actor: Superadmin**
-   *Approve/Suspend Manufacturers and Corporate Partners*
-   *View Global Platform Financial KPIs*
-   *Manage Platform Configuration*

### 4.2.3 Activity Diagrams

The activity flow for starting a lifetime subscription shows just how complex the backend state machine is:
1.  **Start:** The Consumer selects a product and specifies a contract duration (like 10 years).
2.  **Action:** The System fetches the consumer's household demographic data.
3.  **Decision:** Does this product require a Progression Rule (like children's clothing)?
    -   *If Yes:* The System runs the rules engine to map the subscriber's current and future ages to specific product sizes.
    -   *If No:* It just proceeds with the static product ID.
4.  **Action:** The System calculates the total lifetime contract value using the manufacturer's wholesale rates.
5.  **Action:** The System displays the projected savings to the user (compared to retail).
6.  **Decision:** Does the user confirm payment?
    -   *If Yes:* Generate the `WholesaleAgreement`, update the database, and trigger an async task to notify the manufacturer.
    -   *If No:* Abort the process and log an abandonment event.
7.  **End.**

## 4.3 Database Design

We designed the relational database architecture in PostgreSQL 16 because we had to handle complex hierarchical data (like households that contain multiple members) and highly transactional financial agreements.

### 4.3.1 ER Diagram (Conceptual)

*(Insert ER Diagram Here)*

Our core Entities and their Relationships are set up like this:
-   **User (1) -- (1) Household:** A consumer user manages exactly one household.
-   **Household (1) -- (M) Member:** A household can have multiple demographic members.
-   **User (1) -- (1) CorporatePartner / Manufacturer:** A user account can alternatively be linked to a corporate or manufacturer profile.
-   **CorporatePartner (1) -- (M) EmployeeEnrollment:** A corporation sponsors multiple employees.
-   **Manufacturer (1) -- (M) Product:** A manufacturer owns multiple product SKUs.
-   **Product (1) -- (M) ProgressionRule:** A product can have multiple rules dictating how it evolves over time.
-   **Household (1) -- (M) WholesaleAgreement:** A household enters into multiple long-term subscriptions.
-   **Product (1) -- (M) WholesaleAgreement:** A product is tied to multiple subscriptions.

### 4.3.2 Schema Design

Here are some of the key table schemas we designed:

**Table: `users`**
-   `id`: UUID (Primary Key)
-   `email`: VARCHAR (Unique, Indexed)
-   `hashed_password`: VARCHAR
-   `role`: ENUM ('CUSTOMER', 'SUPERADMIN', 'MANUFACTURER', 'CORPORATE_ADMIN')

**Table: `wholesale_agreements`**
-   `id`: UUID (Primary Key)
-   `household_id`: UUID (Foreign Key -> `households.id`)
-   `product_id`: UUID (Foreign Key -> `products.id`)
-   `duration_years`: INTEGER
-   `status`: ENUM ('active', 'pending', 'cancelled')
-   `total_contract_value`: NUMERIC(10, 2)

**Table: `progression_rules`**
-   `id`: UUID (Primary Key)
-   `base_product_id`: UUID (Foreign Key -> `products.id`)
-   `target_product_id`: UUID (Foreign Key -> `products.id`)
-   `trigger_age_months`: INTEGER (The exact age at which the product mutates to the new target size)

## 4.4 Input/Output Interface Design

### 4.4.1 User Interface (UI) Screens

*(Insert UI Screenshots Here)*

We designed the user interfaces with a mobile-first approach, prioritizing clarity because users are making long-term commitments.

**Consumer Mobile App (Flutter):**
-   *Dashboard Screen:* Features a huge "Total Lifetime Savings" metric in green, with quick links to their active subscriptions.
-   *Household Profiling Screen:* A dynamic form where users add avatars for family members and select birth dates.
-   *Subscription Builder Screen:* An interactive slider where users drag a timeline to select how long their wholesale contract will be (1 to 60 years), with real-time math showing their projected cost vs. retail cost.

**Manufacturer Web Portal (Next.js):**
-   *Analytics Dashboard:* Uses charting libraries to display time-series graphs of the aggregated future demand locked in by our platform.
-   *Catalog Manager:* A complex data grid interface where manufacturers can bulk upload SKUs and define progression rules.

### 4.4.2 API Design

Our backend exposes a highly formalized RESTful API. We documented the whole thing using Swagger/OpenAPI standards, which FastAPI generates automatically.

**Example Endpoints:**
-   `POST /api/v1/auth/login`: Accepts a JSON payload with `{"email", "password"}` and returns a JWT Bearer token.
-   `GET /api/v1/profiling/households/me`: Requires the Bearer token. It returns the JSON representation of the logged-in user's household demographics.
-   `POST /api/v1/agreements`: Starts a new lifetime subscription. The payload requires `{"product_id", "duration_years", "delivery_frequency"}`.
-   `GET /api/v1/analytics/kpi/savings`: This is used by superadmins to fetch the global platform savings metrics.

## 4.5 Module Description

We compartmentalized the system into specific functional modules to make the code easier to maintain and test.

### 4.5.1 Description of Each Module

1.  **Auth & Users Module:** Handles security, hashing passwords (using bcrypt), generating tokens, and enforcing the RBAC middleware.
2.  **Profiling Module:** Manages the CRUD (Create, Read, Update, Delete) operations for households and family members. This is the absolute source of truth for all demographic data.
3.  **Catalog Module:** Manages the products, categories, and our complex progression rules engine.
4.  **Agreements (Subscription) Module:** This is the financial heart of the platform. It handles creating the long-term contracts and interfacing with the billing system.
5.  **Analytics Module:** The integration point for the AI/ML forecasting engine. It performs complex SQL aggregations on the `wholesale_agreements` table and serves this data to the dashboards.
6.  **Corporate Module:** Handles the specific business logic for enrolling B2B2C employees and mapping out payroll deductions.

### 4.5.2 Functionality and Interaction

These modules interact extensively, but we designed them to do so securely. For example, when a user calls the **Agreements Module** to create a subscription, that module first synchronously asks the **Profiling Module** to verify the household exists. It then asks the **Catalog Module** to validate the product ID and get the wholesale price. Finally, it uses a Celery task queue to asynchronously tell the **Analytics Module** to recalculate the global demand forecast models. We do this asynchronously so that the manufacturer dashboards stay up-to-date without making the user's checkout experience slow down.
