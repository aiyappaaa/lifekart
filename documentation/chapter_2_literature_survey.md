# CHAPTER 2: LITERATURE SURVEY

## 2.1 Existing Research and Related Work

When we started researching the foundation for LifeKart, we looked heavily into supply chain optimization, subscription-based e-commerce, and predictive machine learning. There's a lot of existing research in these individual areas, but we found that they are rarely combined to solve problems for the "lifetime consumer."

**Subscription E-commerce and Direct-to-Consumer (D2C) Models:**
Over the last few years, the shift from traditional retail to subscriptions has been huge. Studies (like those by Chen et al., 2020) show that subscription models create very predictable recurring revenue, which drastically lowers the cost of acquiring new customers. Think of companies like Dollar Shave Club or Amazon's "Subscribe & Save." However, when reviewing this literature, we noticed these models are almost always short-term. They are built for convenience, not for fundamentally changing wholesale pricing. They still operate within the standard retail markup system.

**Supply Chain Optimization and the Bullwhip Effect:**
The "Bullwhip Effect" is a famous problem in supply chains. It basically means that a tiny change in what consumers are buying causes massive, exaggerated fluctuations in orders placed upstream to manufacturers (Lee et al., 1997). A lot of research has tried to fix this. Older approaches tried using better ERP systems to share information, while newer research (like Ivanov et al., 2019) suggests using predictive analytics. But the general consensus in the literature is that the only real cure for the Bullwhip Effect is having deterministic, guaranteed demand data—knowing exactly what will be bought rather than guessing based on past sales. This was the lightbulb moment for LifeKart.

**Demand Forecasting using Machine Learning:**
Using AI for forecasting has evolved a lot. Older statistical models like ARIMA have mostly been replaced by machine learning when dealing with complex supply chain data. Research by Makridakis et al. (2018) showed that advanced algorithms, particularly gradient boosting methods like XGBoost, are much better at retail forecasting because they can handle multiple variables at once (like changing demographics). Also, deep learning, specifically Long Short-Term Memory (LSTM) networks, is great for sequence prediction. LSTMs can actually remember long-term dependencies, making them perfect for predicting what a family will consume over 60 years. However, finding research on applying LSTMs to ultra-long-term consumer forecasting was surprisingly hard; it's a very new area.

## 2.2 Gaps in Existing Systems

Even with all the advancements in e-commerce and AI, we identified several massive gaps in the current systems that we specifically designed LifeKart to fix:

1. **Short-Term Horizon Bias:** Almost every predictive system out there is built to guess demand for the next quarter or maybe the next year. There is simply no software designed to aggregate consumer demand over a 20-to-60-year timeframe. 
2. **Static Subscriptions:** Current subscription apps are dumb. If you subscribe to dog food, you get that exact dog food forever until you manually cancel it. Existing systems don't have the intelligence to apply "progression rules." For example, no current system is smart enough to automatically increase a subscribed child's clothing size every year based on pediatric growth charts.
3. **Retail vs. Wholesale Pricing:** Existing D2C platforms still charge retail prices because they are acting as the retailer. There's a massive gap for a platform that acts purely as a middleman, letting consumers pledge their demand directly to factories to get real wholesale pricing.
4. **No B2B2C Payroll Integration for Groceries:** Companies have portals for health insurance and 401ks, but the idea of integrating employee grocery subscriptions directly into the corporate payroll system is basically non-existent right now.

## 2.3 Overview of Technologies Used (AI/ML, Deep Learning, etc.)

To actually pull off this ultra-long-term demand forecasting and automated subscription morphing, we had to use a hybrid approach with a few advanced AI/ML techniques.

**1. Time-Series Forecasting (XGBoost):**
XGBoost is a highly efficient machine learning library that we used to forecast the total, aggregated demand for the manufacturers. By feeding the XGBoost model historical consumption rates, geographic data, and demographic shifts, it builds a strong predictive model. It's really good at handling missing data and it doesn't overfit easily, which means the manufacturers get reliable production targets they can actually trust.

**2. Deep Learning (Long Short-Term Memory - LSTM):**
To figure out the complex, lifetime consumption of a single household, we explored using LSTM networks. LSTMs are a type of Recurrent Neural Network (RNN). Unlike basic neural networks, LSTMs have internal "memory gates" that allow them to remember information over long periods. When we are forecasting a family's needs over decades, the LSTM can learn tricky, non-linear patterns—like how the need for certain products spikes when a new baby is born, and gradually drops off as the kids leave for college.

**3. Demographic Progression Algorithms (Rule-Based Expert Systems):**
While deep learning is awesome for predicting volume, we didn't need AI for things that are strictly deterministic. For example, knowing that a child needs bigger shoes as they age is handled by a highly optimized rule-based expert system. Manufacturers set up "progression matrices" (e.g., Age 0-1 gets Size A, Age 1-3 gets Size B). Our system constantly checks these rules against the updating ages in the user's profile to automatically mutate their active subscriptions without the user doing a thing.

## 2.4 Comparison of Different Approaches

When we were designing the core architecture of LifeKart, we compared several different approaches before settling on our final stack.

**Forecasting: ARIMA vs. XGBoost vs. LSTM**
- *ARIMA:* We looked at this classical statistical model first, but it just wasn't good enough. It couldn't capture the complicated relationships between a family's changing demographics and their consumption rates. It also struggles with multiple variables.
- *XGBoost:* This approach was a huge winner for short-to-medium-term aggregate forecasting. It requires less computing power than deep learning and it tells us *why* it makes a prediction (feature importance), which is great for manufacturers. But, it struggles a bit with long-term sequential memory.
- *LSTM:* LSTMs were amazing at modeling the sequential nature of a human life. They easily learned that a user buying newborn diapers will definitely need toddler sizes later. The downside is they are very expensive to train computationally. 
- *Conclusion:* We decided on a hybrid approach: LSTMs are used for profiling long-term household consumption, while XGBoost aggregates that data into actionable, short-term production quotas for the manufacturers.

**System Architecture: Monolithic vs. Microservices**
- *Monolithic:* Building everything in one single app is easier initially. But it would be a disaster for the scale we want. If a heavy ML inference task ran on the same thread as the web server, the mobile app would lag terribly every time a user tried to log in.
- *Microservices (Our Choice):* We decoupled the system. Our core API uses FastAPI for incredibly fast web requests. Long-running tasks, like generating next year's delivery schedule or running the LSTM models, are pushed off to Celery workers in the background. We also separated the frontends (Next.js for web, Flutter for mobile) so we could update them independently.

**Database Design: NoSQL vs. Relational (PostgreSQL)**
- *NoSQL (like MongoDB):* Great for unstructured data and building things fast. But LifeKart deals with hardcore financial data—subscriptions, payroll deductions, and exact inventory counts. 
- *Relational (PostgreSQL) (Our Choice):* We absolutely needed the ACID compliance (reliability and strict data integrity) that PostgreSQL provides. We couldn't risk a database error messing up a 10-year financial contract. Plus, PostgreSQL's JSONB features let us store dynamic rules without losing that strict integrity.
