# CHAPTER 1: INTRODUCTION

## 1.1 Project Overview

When we look at how people buy everyday things, it's clear that the system isn't built for the consumer's long-term benefit. Every person is a lifetime buyer. Think about it: a typical person will buy toothpaste every single month for sixty years, or a bag of rice every week. It's incredibly predictable. Yet, despite knowing exactly what we will need, we are forced to buy these things in small, expensive quantities from supermarkets, paying a huge retail markup every single time. There simply isn't a platform that groups together a person's lifetime needs and connects them directly with the people making the products so they can get wholesale prices.

This is exactly why we built LifeKart. LifeKart is a digital platform designed to change how we consume basic goods. By letting customers pre-register what they will need for their entire lives, the system acts as a massive demand aggregator. For instance, parents can use our app to pre-order school uniforms for their child from the day they are born until they turn eighteen. They lock in today's wholesale price, and our system automatically schedules the deliveries in the right size as the child grows. We also added a corporate portal, so companies can offer these lifetime grocery subscriptions to their employees as a perk, paying for it directly through automatic payroll deductions.

### 1.1.1 Statement of the Problem

The traditional supply chain is reactive and inefficient. Manufacturers usually produce goods based on guessing what the market will do, rather than having guaranteed orders. This guesswork leads to overproduction, high warehousing costs, and a long chain of middlemen (like distributors and retailers) who all add their own profit margins. 

Because of this, the end consumer ends up paying way more than the product actually costs to make. A normal household spends a huge chunk of its income on these basic consumables, but they can't get bulk discounts because they obviously can't store sixty years' worth of rice in their house. 

Even giant e-commerce platforms like Amazon only solve the convenience problem. They don't solve the pricing problem. They still treat consumers like short-term shoppers rather than lifelong entities whose needs are completely predictable. There is no system right now that lets a consumer securely pledge their lifetime consumption to a manufacturer in exchange for true wholesale pricing, nor is there an AI system smart enough to manage these deliveries as the consumer's household changes over time.

### 1.1.2 Brief Description of the Project

At its core, LifeKart is a multi-platform system. It includes a heavy-duty backend, a web application for manufacturers and corporate admins, and a mobile app for the end customers. 

Consumers use the mobile app to create profiles for their households. Based on who lives in the house, our "Lifetime Demand Forecasting Engine"—which is the main AI component of this project—predicts what the household will need over their lifetime. Users can then sign up for long-term wholesale contracts for things like groceries and personal care items.

On the other side, manufacturers log into the web portal to see all this aggregated demand. Because they have guaranteed, pre-paid orders spanning years, they can plan their production perfectly and completely skip the costs of marketing and retail distribution. These savings are what make the wholesale prices possible for the consumer.

We also built a corporate integration feature. Businesses can onboard their employees, and the system automatically calculates how much needs to be deducted from their payroll to fund their grocery subscriptions, making it a seamless benefit.

### 1.1.3 Objectives of the Project

The main goals we set out to achieve with LifeKart are:

1. **To build a unified platform** that connects consumers, companies, and manufacturers directly, cutting out all the retail middlemen.
2. **To develop an intelligent forecasting system** using machine learning that can accurately predict what a household will consume over several decades.
3. **To design a secure backend** that can handle complex subscription logic, long-term payments, and automated delivery scheduling without crashing.
4. **To create an easy-to-use mobile app** using Flutter, so customers can manage their lifetime subscriptions and track their savings right from their phones.
5. **To implement a corporate module** for automated payroll deductions, making it easy for companies to offer groceries as an employee benefit.

### 1.1.4 Scope of the Project

The scope of this project covers the entire software development lifecycle of the LifeKart ecosystem. This includes the initial idea, designing the system architecture, setting up the database, building the backend APIs, integrating the machine learning models, and developing both the web and mobile interfaces.

Specifically, we built out four different user roles:
- **Customers**: Use the mobile app to manage their families, view their AI-generated consumption forecasts, and subscribe to wholesale contracts.
- **Manufacturers**: Use the web dashboard to manage their product catalogs, set up rules for how products change over time (like shoe sizes), and view the demand forecasts so they know what to produce.
- **Corporate Admins**: Use the web portal to manage their employees and handle the payroll deduction reports.
- **Superadmins**: Overlook the entire platform, verify users, and check system health.

It's important to note that our scope is strictly the software and the AI models. We are not handling the physical delivery trucks or warehouses; the software is simply designed to send data to third-party delivery companies via APIs.

## 1.2 Software and Hardware Requirements

To get a complex, microservices-based system like LifeKart running smoothly, we needed a very specific setup. Below are the exact requirements we used for development and what would be needed for production.

### 1.2.1 Software Specifications

We chose a modern software stack to make sure the platform was fast and secure.

**Backend System:**
- **Language:** Python 3.12+. We went with Python mainly because it has the best libraries for machine learning, meaning our web server and our AI models could share the same code easily.
- **Framework:** FastAPI. We chose this over older frameworks like Django because FastAPI is incredibly fast and handles asynchronous requests perfectly.
- **Database:** PostgreSQL 16. We needed a strong, relational database to handle the complex financial agreements without losing data.
- **Cache & Queues:** Redis 7 and Celery. We used these to handle background tasks. If the AI model needs 5 minutes to predict a user's lifetime demand, Celery runs it in the background so the user's mobile app doesn't freeze.
- **ORM:** SQLAlchemy 2.0.

**Web Portals:**
- **Framework:** Next.js 14 (React). We used this for the admin and manufacturer websites because Server-Side Rendering makes the pages load instantly.
- **Styling:** Tailwind CSS, which made it really easy to make the dashboards look clean and modern.
- **Language:** TypeScript, to catch bugs before we even ran the code.

**Mobile App:**
- **Framework:** Flutter (Dart). This was a lifesaver because it allowed us to write the code once and deploy it to both iOS and Android smartphones, cutting our development time in half.
- **State Management:** Riverpod, to handle the complex data flowing through the app screens.

**Machine Learning Stack:**
- **Libraries:** Pandas and NumPy for cleaning up our data.
- **Algorithms:** Scikit-Learn and XGBoost for predicting overall manufacturer demand, and TensorFlow for the Deep Learning models that predict individual household consumption.

### 1.2.2 Hardware Specifications

**For Development (What we used to build it):**
- **Processor:** We developed this on machines with Intel Core i7 (and equivalent Apple M-series chips). Running Docker, the backend, the frontend, and the Android emulator all at once requires a lot of processing power.
- **RAM:** 16 GB DDR4 was the absolute minimum to keep the computer from crashing when running the local database and the machine learning training scripts simultaneously.
- **Storage:** A fast SSD (NVMe) was crucial for reading the large datasets during the ML training phase.

**For Production (Deploying to the real world):**
- **Servers:** We would need scalable cloud servers (like AWS EC2) with at least 2 vCPUs and 8 GB RAM per node to handle the web traffic.
- **Database Server:** A dedicated PostgreSQL instance with 16 GB RAM to handle thousands of concurrent queries.
- **Machine Learning Node:** A separate server with a dedicated GPU (like an NVIDIA T4) to run the heavy XGBoost and LSTM predictions every night without slowing down the main website.

## 1.3 Functional and Non-Functional Requirements

To keep the project on track, we strictly defined what the system absolutely had to do, and how well it had to do it.

### Functional Requirements

1. **Role-Based Access:** The system has to know who is logging in. A customer shouldn't be able to see the manufacturer's financial dashboard, and vice versa.
2. **Household Management:** Customers must be able to add family members and their birthdates. The system needs this exact data to figure out what the family needs to buy.
3. **Wholesale Contracting:** Users must be able to select a product, choose a duration (like 10 years), and lock in a wholesale price.
4. **Smart Progression Engine:** The system must automatically change products over time. If a parent subscribes to baby clothes, the system has to automatically upgrade the size every few months as the baby grows, without the parent having to click anything.
5. **Payroll Integration:** The system has to allow companies to upload a list of employees and automatically generate a report showing how much money to deduct from their paychecks for their groceries.
6. **Manufacturer Dashboards:** Manufacturers must have a visual dashboard showing them exactly how much demand is locked in for the future, so they know what to produce.

### Non-Functional Requirements

1. **Speed:** The mobile app must load screens in under 1.5 seconds, even if it's fetching complex lifetime savings calculations from the database.
2. **Security:** Because we are handling long-term financial commitments, all data must be encrypted, and passwords heavily hashed.
3. **Scalability:** The backend must be able to handle sudden spikes in traffic. If a large corporation onboards 5,000 employees in one day, the system shouldn't crash. We achieved this by using Docker containers.
4. **Asynchronous Processing:** Heavy AI calculations must never block the main web server. They must run in the background.

## 1.4 Company/Domain Profile

This project sits right in the middle of E-commerce, Supply Chain Management, and Artificial Intelligence. 

Normally, the consumer goods sector relies on a really messy distribution network. Manufacturers sell to huge distributors, who sell to smaller wholesalers, who sell to retail stores, who finally sell to you. By creating a direct-to-consumer model backed by lifetime contracts, LifeKart completely disrupts this old way of doing things.

Also, by hooking into corporate payrolls, we are stepping into the Employee Benefits domain. We are treating basic needs like groceries the same way companies treat health insurance—as a subsidized perk. 

Finally, the Machine Learning part moves this from a simple shopping app to a smart supply chain tool. In supply chains, there's a huge problem called the "Bullwhip Effect," where a small change in what consumers buy causes chaos for the manufacturers trying to guess what to produce. Our AI models solve this by giving manufacturers actual, guaranteed data about what people will consume years in advance.
