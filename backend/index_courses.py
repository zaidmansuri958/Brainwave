"""
Index all course content into Qdrant vector DB so the AI chatbot can answer questions.

Run inside the backend container:
    docker compose exec backend python index_courses.py

This sends course descriptions, lesson titles, AI summaries, and chapter info
to the AI service /index endpoint, which embeds them into Qdrant.
"""

import sys
import os
import asyncio
import httpx

# bcrypt compat patch
try:
    import bcrypt as _bcrypt
    if not hasattr(_bcrypt, '__about__'):
        _about = type(sys)('bcrypt.__about__')
        _about.__version__ = _bcrypt.__version__
        _bcrypt.__about__ = _about
except Exception:
    pass

sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models.course import Course, Chapter, Lesson

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://ai-services:8001")


# Rich course content for each course — covers concepts, topics, terminology
COURSE_KNOWLEDGE = {
    "python-data-science-zero-to-hero": [
        """Python for Data Science — Course Overview
        This course teaches Python from scratch specifically for data science applications.
        You will learn variables, loops, functions, object-oriented programming, and build
        up to professional data analysis using NumPy, Pandas, and Matplotlib.
        Prerequisites: None — complete beginners are welcome.
        Tools used: Python 3, Jupyter Notebook, VS Code, Anaconda.""",

        """Python Fundamentals Module
        Variables store data — integers (int), floats, strings (str), booleans (bool), lists, dicts, tuples.
        Operators: arithmetic (+,-,*,/,//,%,**), comparison (==,!=,<,>), logical (and, or, not).
        Control flow: if/elif/else for decision making. Loops: for iterates over sequences; while repeats while condition is true.
        Functions: def keyword, parameters, return values, default arguments, *args, **kwargs.
        Lambda functions are anonymous single-expression functions: lambda x: x*2.
        List comprehensions: [x**2 for x in range(10) if x % 2 == 0].
        Classes: class keyword, __init__ constructor, self parameter, inheritance, polymorphism.""",

        """NumPy — Numerical Computing
        NumPy arrays (ndarray) are faster than Python lists for numerical operations.
        Creating arrays: np.array(), np.zeros(), np.ones(), np.arange(), np.linspace(), np.random.
        Array operations: element-wise addition, multiplication, broadcasting across dimensions.
        Slicing: arr[0:5], arr[:, 1], arr[arr > 0].
        Linear algebra: np.dot(), np.linalg.inv(), np.linalg.eig(), np.linalg.svd().
        Statistical functions: np.mean(), np.std(), np.median(), np.percentile(), np.corrcoef().""",

        """Pandas — Data Wrangling
        DataFrame is a 2D labeled data structure like a spreadsheet. Series is a 1D labeled array.
        Reading data: pd.read_csv(), pd.read_excel(), pd.read_json(), pd.read_sql().
        Selection: df['column'], df[['col1','col2']], df.iloc[0:5], df.loc[df['age'] > 25].
        Cleaning: df.dropna(), df.fillna(0), df.drop_duplicates(), df.rename().
        Transformation: df.apply(), df.map(), df.astype(), pd.get_dummies() for encoding.
        GroupBy: df.groupby('category').agg({'sales': 'sum', 'price': 'mean'}).
        Merging: pd.merge(df1, df2, on='key', how='inner/left/right/outer'), pd.concat().""",

        """Matplotlib and Seaborn — Data Visualization
        Matplotlib is the base library; Seaborn builds on it with statistical plots.
        Line plot: plt.plot(x, y). Bar chart: plt.bar(categories, values). Scatter: plt.scatter(x, y).
        Histogram: plt.hist(data, bins=30). Box plot: plt.boxplot(data).
        Seaborn: sns.heatmap(corr_matrix), sns.pairplot(df), sns.distplot(series), sns.regplot(x, y, df).
        EDA (Exploratory Data Analysis) involves checking shape, dtypes, describe(), null counts, correlation.""",
    ],

    "machine-learning-python-a-to-z": [
        """Machine Learning with Python — Course Overview
        This course covers supervised learning (regression, classification), unsupervised learning
        (clustering, dimensionality reduction), and deep learning using scikit-learn and TensorFlow.
        You will build real models and understand the mathematics behind them.
        Prerequisites: Python basics, NumPy, Pandas.""",

        """Supervised Learning — Regression
        Linear Regression models the relationship between input features and a continuous output.
        Cost function: Mean Squared Error (MSE) = (1/n) * Σ(y_pred - y_actual)².
        Gradient descent minimizes the cost by updating weights: w = w - α * ∂J/∂w.
        Ridge regression adds L2 regularization to prevent overfitting: J + λΣw².
        Lasso uses L1 regularization: J + λΣ|w|. ElasticNet combines both.
        Polynomial features extend linear models to capture non-linear relationships.""",

        """Supervised Learning — Classification
        Logistic Regression applies sigmoid function σ(z) = 1/(1+e^-z) to output probabilities.
        Decision Trees split data on the feature that maximizes information gain (entropy reduction).
        Random Forests create many trees on bootstrap samples and aggregate predictions (bagging).
        Support Vector Machines find the maximum margin hyperplane. Kernel trick maps to higher dimensions.
        K-Nearest Neighbors classifies based on majority vote of k closest training examples.
        Evaluation metrics: accuracy, precision, recall, F1-score, AUC-ROC, confusion matrix.""",

        """Model Evaluation and Validation
        Train/test split: typically 80/20 or 70/30. Cross-validation: k-fold (k=5 or 10).
        Overfitting: model memorizes training data, fails on new data. Fix: regularization, more data, dropout.
        Underfitting: model too simple. Fix: more features, complex model, reduce regularization.
        Hyperparameter tuning: GridSearchCV exhaustively searches; RandomizedSearchCV samples randomly.
        Feature importance: tree-based models provide feature_importances_ attribute.
        Bias-variance tradeoff: high bias = underfitting, high variance = overfitting.""",

        """Unsupervised Learning
        K-Means clustering: assign k centroids, assign points to nearest centroid, update centroids, repeat.
        Elbow method finds optimal k by plotting inertia vs k — look for the 'elbow'.
        Hierarchical clustering builds a dendrogram; cut at desired distance to get clusters.
        DBSCAN: density-based, finds clusters of arbitrary shape, marks outliers as noise.
        PCA (Principal Component Analysis): orthogonal transformation to maximize variance in fewer dimensions.
        Explained variance ratio tells how much information each principal component captures.""",

        """Neural Networks and Deep Learning
        Perceptron: weighted sum of inputs + bias → activation function → output.
        Activation functions: ReLU (max(0,x)), sigmoid (for binary output), softmax (multi-class).
        Backpropagation: chain rule to compute gradients and update weights.
        Layers: input, hidden (multiple), output. Deep network = many hidden layers.
        TensorFlow/Keras: model = Sequential(), model.add(Dense(64, activation='relu')).
        CNN: Convolutional layers extract spatial features. Pooling reduces dimensions.
        Training: model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy']).
        Batch size, epochs, learning rate are key hyperparameters.""",
    ],

    "react-nextjs-14-modern-web-apps": [
        """React and Next.js 14 — Course Overview
        Learn to build production-ready web applications with React 18 and Next.js 14 App Router.
        Covers TypeScript, Tailwind CSS, server components, API routes, authentication, and deployment.
        Prerequisites: HTML, CSS, basic JavaScript.""",

        """React Fundamentals
        JSX is JavaScript XML — write HTML-like syntax in JavaScript. Components are functions returning JSX.
        Props pass data from parent to child. State (useState) stores component-level mutable data.
        useEffect runs side effects: data fetching, subscriptions, DOM manipulation.
        useMemo memoizes expensive computations. useCallback memoizes functions.
        useRef holds mutable values without re-render. forwardRef passes refs to child components.
        Context API (useContext) shares state globally without prop drilling.
        Custom hooks encapsulate reusable stateful logic (always start with 'use').""",

        """Next.js 14 App Router
        App Router uses the /app directory. Every folder becomes a route segment.
        page.tsx is the UI for a route. layout.tsx wraps children and persists across navigation.
        Server Components render on server by default — no useState, useEffect, browser APIs.
        Client Components need 'use client' directive — can use hooks and browser APIs.
        loading.tsx shows while page is loading. error.tsx handles errors. not-found.tsx for 404.
        Dynamic routes use [param] folders. Catch-all: [...slug]. Optional catch-all: [[...slug]].
        Data fetching: fetch() in Server Components with cache options (no-store, force-cache, revalidate).""",

        """TypeScript with React
        TypeScript adds static typing to JavaScript — catches bugs at compile time.
        Interface defines object shapes: interface User { id: number; name: string; email?: string }.
        Generic components: function List<T>({ items }: { items: T[] }) — reusable with any type.
        React.FC<Props> types functional components. useState<string>() types state.
        Enums, union types (string | number), intersection types, type guards improve safety.""",

        """Tailwind CSS
        Utility-first CSS framework — compose designs with utility classes directly in HTML/JSX.
        Responsive prefixes: sm:, md:, lg:, xl:, 2xl: apply at breakpoints.
        Dark mode: dark: prefix. Hover: hover: Focus: focus: Group hover: group-hover:
        Arbitrary values: w-[342px], bg-[#1a1a2e]. JIT (Just-In-Time) compiles only used classes.
        @apply directive: use Tailwind utilities in CSS files. cn() utility combines classes conditionally.""",
    ],

    "full-stack-nodejs-express": [
        """Full Stack Node.js and Express — Course Overview
        Build backend systems with Node.js, Express, MongoDB, JWT authentication, and Socket.io.
        Deploy to production with Docker and cloud platforms.
        Prerequisites: JavaScript fundamentals, basic HTML.""",

        """Node.js Fundamentals
        Node.js is a JavaScript runtime built on Chrome's V8 engine — runs JS outside the browser.
        Event loop: single-threaded, non-blocking I/O. Call stack, callback queue, microtask queue.
        CommonJS modules: const fs = require('fs'). ES Modules: import fs from 'fs'.
        Built-in modules: fs (file system), path, http, https, crypto, events, stream, os.
        npm: package manager. package.json: project metadata, dependencies, scripts.
        npm install, npm run dev, nodemon for hot-reload during development.""",

        """Express.js
        Express is a minimal Node.js web framework. const app = express().
        Routing: app.get('/path', handler), app.post(), app.put(), app.delete().
        Middleware: functions that run before route handlers. app.use(middleware).
        Request object: req.params, req.query, req.body, req.headers, req.cookies.
        Response: res.json(data), res.status(404).send(), res.redirect('/'), res.sendFile().
        Error handling middleware: (err, req, res, next) signature.
        express.Router() for modular routing. CORS: cors() middleware.""",

        """MongoDB and Mongoose
        MongoDB is a NoSQL document database. Documents are JSON-like (BSON) objects.
        Collections are like tables. No fixed schema — flexible document structure.
        Mongoose ODM: define Schema, compile to Model, perform CRUD operations.
        Schema types: String, Number, Date, Boolean, ObjectId, Array, Mixed.
        Validation: required, min, max, enum, custom validators.
        Queries: Model.find(), Model.findById(), Model.findOne(), Model.updateOne(), Model.deleteOne().
        Aggregation pipeline: $match, $group, $sort, $project, $lookup (join), $unwind.""",

        """JWT Authentication
        JSON Web Token: Header.Payload.Signature — base64 encoded, signed with secret.
        Flow: User logs in → server creates JWT → client stores in localStorage or httpOnly cookie.
        Server verifies JWT on protected routes using middleware.
        jwt.sign(payload, secret, { expiresIn: '7d' }) creates token.
        jwt.verify(token, secret) verifies and decodes. Never store sensitive data in payload.
        Refresh tokens: short-lived access tokens + long-lived refresh tokens for security.""",
    ],

    "javascript-mastery-es6-beyond": [
        """JavaScript Mastery — Course Overview
        Deep dive into modern JavaScript: closures, prototypes, async patterns, DOM, and real projects.
        No frameworks — pure JavaScript power. 30 coding challenges included.
        Prerequisites: Basic HTML and CSS.""",

        """JavaScript Core Concepts
        var is function-scoped and hoisted. let and const are block-scoped (no hoisting to value).
        Temporal Dead Zone (TDZ): let/const exist but can't be accessed before declaration line.
        Type coercion: == does type coercion ('1' == 1 is true), === does strict comparison.
        Truthy values: non-zero numbers, non-empty strings, objects, arrays. Falsy: 0, '', null, undefined, NaN, false.
        Closures: inner function remembers variables from outer function's scope even after it returns.
        IIFE (Immediately Invoked Function Expression): (function() { ... })() for private scope.""",

        """Modern ES6+ Features
        Arrow functions: const add = (a, b) => a + b. No own 'this' — inherits from enclosing scope.
        Destructuring: const { name, age } = user. const [first, ...rest] = array.
        Spread operator: [...arr1, ...arr2], {...obj1, ...obj2}. Rest parameters: function(...args).
        Template literals: \`Hello ${name}, you are ${age} years old\`.
        Optional chaining: user?.address?.city — returns undefined instead of throwing.
        Nullish coalescing: value ?? 'default' — uses default only for null/undefined (not 0 or '').
        Modules: export default, export const, import { named } from './file', import defaultExport from './file'.""",

        """Asynchronous JavaScript
        JavaScript is single-threaded. Web APIs (setTimeout, fetch) run outside the main thread.
        Callback hell: nested callbacks become unreadable. Promises solve this.
        Promise states: pending → fulfilled (resolve) or rejected (reject).
        Promise chaining: .then().then().catch().finally(). Promise.all() runs in parallel.
        async/await: syntactic sugar over promises. await pauses execution until promise resolves.
        try/catch/finally handles errors in async functions.
        Event loop: call stack → Web API → callback queue → call stack (when stack empty).
        Microtasks (Promises) run before macrotasks (setTimeout) in the event loop.""",

        """DOM Manipulation
        Document Object Model represents HTML as a tree of nodes.
        Selectors: document.getElementById(), querySelector(), querySelectorAll().
        Creating elements: document.createElement('div'), element.appendChild(), innerHTML.
        Events: addEventListener('click', handler), event.preventDefault(), event.stopPropagation().
        Event delegation: attach listener to parent, check event.target for the actual clicked element.
        Fetch API: fetch(url).then(r => r.json()).then(data => console.log(data)).
        Local Storage: localStorage.setItem('key', JSON.stringify(value)), getItem, removeItem.""",
    ],

    "system-design-software-engineers": [
        """System Design for Software Engineers — Course Overview
        Learn to design large-scale distributed systems like Amazon, Google, and Netflix.
        Covers load balancing, caching, databases, message queues, microservices, and CAP theorem.
        Essential for FAANG interviews and senior engineering roles.
        Prerequisites: Basic backend development experience.""",

        """Scalability Fundamentals
        Vertical scaling (scale up): add more CPU/RAM to a single server. Has limits and single point of failure.
        Horizontal scaling (scale out): add more servers. Requires load balancing and stateless services.
        Load balancer distributes traffic across servers. Algorithms: round robin, least connections, IP hash.
        Stateless services store session data externally (Redis) so any server can handle any request.
        CDN (Content Delivery Network): caches static assets at edge locations near users.
        Geographic distribution reduces latency. DNS-based routing directs users to nearest datacenter.""",

        """CAP Theorem and Consistency
        CAP Theorem: a distributed system can guarantee only 2 of: Consistency, Availability, Partition Tolerance.
        Consistency: every read receives the most recent write. Availability: every request gets a response.
        Partition Tolerance: system works despite network partitions (required in distributed systems).
        CP systems (e.g., HBase, Zookeeper): consistent but may be unavailable during partition.
        AP systems (e.g., DynamoDB, Cassandra): available but may return stale data.
        ACID (Atomicity, Consistency, Isolation, Durability) for SQL databases.
        BASE (Basically Available, Soft state, Eventually consistent) for NoSQL.""",

        """Caching Strategies
        Cache stores frequently accessed data in fast memory (RAM) to reduce database load.
        Redis: in-memory key-value store. Supports strings, lists, sets, sorted sets, hashes, pub/sub.
        Cache-aside (lazy loading): app checks cache first, loads from DB on miss, updates cache.
        Write-through: write to cache and DB simultaneously. Write-back: write to cache, async to DB.
        Cache eviction policies: LRU (Least Recently Used), LFU (Least Frequently Used), TTL expiry.
        Cache invalidation is the hard problem — when to update/expire cached data.
        CDN caches static assets (images, CSS, JS) at edge servers worldwide.""",

        """Database Design and Sharding
        SQL databases (PostgreSQL, MySQL): ACID, complex joins, good for relational data.
        NoSQL: document (MongoDB), key-value (Redis), column-family (Cassandra), graph (Neo4j).
        Database indexing: B-tree indexes speed up reads but slow writes. Composite indexes.
        Sharding: horizontal partitioning of data across multiple databases.
        Shard key determines which shard stores data. Range-based, hash-based, or directory-based.
        Replication: master-slave (one write, multiple reads), master-master (multiple writes).
        Read replicas reduce load on primary. Replication lag is a consistency concern.""",

        """Message Queues and Microservices
        Message queues decouple services. Producer sends messages; consumer processes asynchronously.
        Kafka: distributed event streaming. Topics, partitions, consumer groups, offsets. High throughput.
        RabbitMQ: traditional message broker. AMQP protocol. Queues, exchanges, routing keys.
        Use cases: async processing, event-driven architecture, buffering traffic spikes.
        Microservices: each service owns its domain, deployed independently, communicates via API/queue.
        API Gateway: single entry point. Rate limiting, authentication, routing, load balancing.
        Service discovery: Consul, Eureka. Services register and discover each other dynamically.""",

        """System Design Case Studies — WhatsApp
        WhatsApp design: 2 billion users, real-time messaging, media sharing.
        WebSocket connections for real-time bidirectional communication.
        Message queues (Kafka) to handle spikes and ensure delivery.
        Cassandra for message storage — write-heavy, time-series, distributed.
        Media stored in object storage (S3/MinIO). Thumbnails generated async.
        End-to-end encryption: Signal protocol. Keys stored on devices, not servers.
        Presence service: tracks online/offline status using heartbeat mechanism.
        Read receipts: delivered (1 tick), read (2 ticks) tracked via acknowledgment messages.""",

        """System Design Case Studies — YouTube
        YouTube: 500 hours of video uploaded every minute. 2 billion users.
        Video upload: chunked upload to avoid timeout. Stored in object storage (S3).
        Transcoding pipeline: convert to multiple resolutions (360p, 720p, 1080p, 4K) using FFmpeg.
        Adaptive bitrate streaming (HLS/DASH): client switches quality based on bandwidth.
        CDN distributes video chunks globally — most watched videos cached at edge.
        Metadata (title, description, views) in SQL. Video recommendations: ML-based collaborative filtering.
        Search: Elasticsearch indexes video titles, descriptions, tags.
        View count: approximate using Redis counters, periodically flushed to DB.""",

        """System Design Case Studies — Uber
        Uber: matches riders to drivers in real-time. 19 million trips per day.
        GPS tracking: drivers send location every 4 seconds. Stored in Cassandra (time-series).
        Geospatial indexing: Google S2 library divides earth into cells. Find nearby drivers in O(1).
        Matching algorithm: find N closest drivers, assign based on ETA and surge pricing.
        Surge pricing: supply/demand ratio. If drivers < riders in area, price multiplier applied.
        Trip service, driver service, rider service are separate microservices.
        Payment service: async processing via message queue. Idempotency keys prevent double-charge.
        Dispatch system: uses consistent hashing to assign drivers to dispatch servers.""",
    ],
}


async def index_all_courses():
    db = SessionLocal()
    try:
        courses = db.query(Course).filter_by(status="published").all()
        print(f"\n🌱  Indexing {len(courses)} courses into Qdrant...\n")

        async with httpx.AsyncClient(timeout=120) as client:
            # Check AI service is up
            try:
                r = await client.get(f"{AI_SERVICE_URL}/health")
                print(f"✓  AI service online: {r.json()}\n")
            except Exception as e:
                print(f"❌  AI service not reachable at {AI_SERVICE_URL}: {e}")
                print("   Make sure ai-services container is running: docker compose up ai-services")
                return

            for course in courses:
                print(f"📚  Indexing: {course.title}")

                # 1. Index course description
                course_text = f"""Course: {course.title}
Category: {course.category}
Difficulty: {course.difficulty_level}
Description: {course.description}
Short description: {course.short_description}
Tags: {', '.join(course.tags or [])}"""

                await client.post(f"{AI_SERVICE_URL}/index", json={
                    "course_id": str(course.id),
                    "text": course_text,
                    "lesson_id": "course_overview",
                    "chapter_id": "overview",
                    "source_type": "course_description"
                })

                # 2. Index pre-written knowledge base content (if available)
                if course.slug in COURSE_KNOWLEDGE:
                    for i, knowledge_chunk in enumerate(COURSE_KNOWLEDGE[course.slug]):
                        await client.post(f"{AI_SERVICE_URL}/index", json={
                            "course_id": str(course.id),
                            "text": knowledge_chunk,
                            "lesson_id": f"knowledge_base_{i}",
                            "chapter_id": "knowledge_base",
                            "source_type": "curated_content"
                        })
                    print(f"   ✓  Indexed {len(COURSE_KNOWLEDGE[course.slug])} knowledge chunks")

                # 3. Index chapters and lessons
                chapters = sorted(course.chapters, key=lambda c: c.order_index)
                for chapter in chapters:
                    chapter_text = f"""Chapter: {chapter.title}
Course: {course.title}
Description: {chapter.description or ''}
Lessons in this chapter: {', '.join(l.title for l in chapter.lessons)}"""

                    await client.post(f"{AI_SERVICE_URL}/index", json={
                        "course_id": str(course.id),
                        "text": chapter_text,
                        "lesson_id": f"chapter_{chapter.id}",
                        "chapter_id": str(chapter.id),
                        "source_type": "chapter_overview"
                    })

                    for lesson in sorted(chapter.lessons, key=lambda l: l.order_index):
                        lesson_text = f"""Lesson: {lesson.title}
Chapter: {chapter.title}
Course: {course.title}
Duration: {lesson.duration_seconds // 60} minutes
Type: {lesson.lesson_type}"""

                        if lesson.ai_summary:
                            lesson_text += f"\nSummary: {lesson.ai_summary}"

                        await client.post(f"{AI_SERVICE_URL}/index", json={
                            "course_id": str(course.id),
                            "text": lesson_text,
                            "lesson_id": str(lesson.id),
                            "chapter_id": str(chapter.id),
                            "source_type": "lesson"
                        })

                total_lessons = sum(len(ch.lessons) for ch in chapters)
                print(f"   ✓  Indexed {len(chapters)} chapters, {total_lessons} lessons")
                print()

        print("━" * 50)
        print("✅  All courses indexed! The AI chatbot can now answer questions.")
        print("━" * 50)

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(index_all_courses())
