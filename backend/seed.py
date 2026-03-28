"""
Brainwave.ai — Database Seed Script
=====================================
Run inside the backend container:
    docker compose exec backend python seed.py

Creates:
  • 3 teacher accounts
  • 3 teacher profiles
  • 6 published courses with chapters and lessons

Teacher credentials:
  ┌─────────────────────────────────┬─────────────────────────────┬─────────────┐
  │ Name                            │ Email                       │ Password    │
  ├─────────────────────────────────┼─────────────────────────────┼─────────────┤
  │ Dr. Rajesh Kumar                │ rajesh.kumar@brainwave.ai   │ Teacher@123 │
  │ Prof. Priya Sharma              │ priya.sharma@brainwave.ai   │ Teacher@123 │
  │ Arjun Mehta                     │ arjun.mehta@brainwave.ai    │ Teacher@123 │
  └─────────────────────────────────┴─────────────────────────────┴─────────────┘
"""

import sys
import os

# Patch bcrypt 4.x compatibility before anything imports passlib
try:
    import bcrypt as _bcrypt
    if not hasattr(_bcrypt, '__about__'):
        _about = type(sys)('bcrypt.__about__')
        _about.__version__ = _bcrypt.__version__
        _bcrypt.__about__ = _about
except Exception:
    pass

sys.path.insert(0, '/app')

from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
import app.models  # registers all models
from app.models.user import User, TeacherProfile
from app.models.course import Course, Chapter, Lesson

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─────────────────────────────────────────────────────────────────────────────
# DATA
# ─────────────────────────────────────────────────────────────────────────────

TEACHERS = [
    {
        "email": "rajesh.kumar@brainwave.ai",
        "full_name": "Dr. Rajesh Kumar",
        "password": "Teacher@123",
        "bio": "PhD in Computer Science from IIT Bombay. 12+ years teaching Data Science and Python. Taught 80,000+ students across India.",
        "expertise_areas": ["Python", "Data Science", "Machine Learning", "AI"],
        "credibility_score": 4.92,
    },
    {
        "email": "priya.sharma@brainwave.ai",
        "full_name": "Prof. Priya Sharma",
        "password": "Teacher@123",
        "bio": "Senior Software Engineer at Google, Bangalore. 8 years building React and Node.js at scale. Passionate about teaching modern web development.",
        "expertise_areas": ["React", "Next.js", "Node.js", "TypeScript", "Web Development"],
        "credibility_score": 4.87,
    },
    {
        "email": "arjun.mehta@brainwave.ai",
        "full_name": "Arjun Mehta",
        "password": "Teacher@123",
        "bio": "Ex-Amazon SDE-II. 6 years in distributed systems and backend engineering. Interviewed 200+ candidates. System Design specialist.",
        "expertise_areas": ["System Design", "JavaScript", "Backend Engineering", "DSA"],
        "credibility_score": 4.78,
    },
]

COURSES = [
    # ─── Dr. Rajesh Kumar ───────────────────────────────────────────────────
    {
        "teacher_email": "rajesh.kumar@brainwave.ai",
        "title": "Python for Data Science — Zero to Hero",
        "slug": "python-data-science-zero-to-hero",
        "description": "The most comprehensive Python course for aspiring data scientists. Start from zero — variables, loops, functions — and build all the way up to Pandas, NumPy, Matplotlib, and real-world data analysis projects. No prior experience needed.",
        "short_description": "Complete Python course from basics to data analysis. Covers NumPy, Pandas & Matplotlib.",
        "thumbnail_url": "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=800&q=80",
        "price": 999,
        "category": "Data Science",
        "tags": ["python", "pandas", "numpy", "data science", "matplotlib"],
        "difficulty_level": "Beginner",
        "total_duration_minutes": 1140,
        "avg_rating": 4.9,
        "review_count": 2340,
        "enrolled_count": 18700,
        "is_featured": True,
        "chapters": [
            {
                "title": "Python Fundamentals",
                "description": "Variables, data types, operators, conditionals, and loops",
                "order_index": 1,
                "is_free_preview": True,
                "lessons": [
                    {"title": "Why Python? Setting up your environment", "lesson_type": "video", "order_index": 1, "duration_seconds": 900},
                    {"title": "Variables and Data Types", "lesson_type": "video", "order_index": 2, "duration_seconds": 1200},
                    {"title": "Operators and Expressions", "lesson_type": "video", "order_index": 3, "duration_seconds": 1100},
                    {"title": "Control Flow: if/elif/else", "lesson_type": "video", "order_index": 4, "duration_seconds": 1300},
                    {"title": "Loops: for and while", "lesson_type": "video", "order_index": 5, "duration_seconds": 1400},
                    {"title": "Chapter 1 Quiz", "lesson_type": "quiz", "order_index": 6, "duration_seconds": 600},
                ],
            },
            {
                "title": "Functions and OOP",
                "description": "Writing reusable code with functions and classes",
                "order_index": 2,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Defining and Calling Functions", "lesson_type": "video", "order_index": 1, "duration_seconds": 1200},
                    {"title": "Lambda, Map, Filter, Reduce", "lesson_type": "video", "order_index": 2, "duration_seconds": 1100},
                    {"title": "Classes and Objects", "lesson_type": "video", "order_index": 3, "duration_seconds": 1500},
                    {"title": "Inheritance and Polymorphism", "lesson_type": "video", "order_index": 4, "duration_seconds": 1400},
                ],
            },
            {
                "title": "NumPy — Fast Numerical Computing",
                "description": "Arrays, operations, broadcasting, and linear algebra",
                "order_index": 3,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Introduction to NumPy Arrays", "lesson_type": "video", "order_index": 1, "duration_seconds": 1300},
                    {"title": "Array Operations and Slicing", "lesson_type": "video", "order_index": 2, "duration_seconds": 1200},
                    {"title": "Broadcasting and Vectorization", "lesson_type": "video", "order_index": 3, "duration_seconds": 1400},
                    {"title": "Linear Algebra with NumPy", "lesson_type": "video", "order_index": 4, "duration_seconds": 1100},
                ],
            },
            {
                "title": "Pandas — Data Wrangling",
                "description": "DataFrames, cleaning, merging, groupby, and aggregation",
                "order_index": 4,
                "is_free_preview": False,
                "lessons": [
                    {"title": "DataFrames and Series", "lesson_type": "video", "order_index": 1, "duration_seconds": 1500},
                    {"title": "Data Cleaning and Handling Nulls", "lesson_type": "video", "order_index": 2, "duration_seconds": 1300},
                    {"title": "Merging, Joining, and Concatenating", "lesson_type": "video", "order_index": 3, "duration_seconds": 1400},
                    {"title": "GroupBy and Aggregation", "lesson_type": "video", "order_index": 4, "duration_seconds": 1200},
                    {"title": "Pandas Quiz", "lesson_type": "quiz", "order_index": 5, "duration_seconds": 600},
                ],
            },
            {
                "title": "Matplotlib & Seaborn — Data Visualization",
                "description": "Charts, plots, and beautiful visualizations",
                "order_index": 5,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Line, Bar, and Scatter Plots", "lesson_type": "video", "order_index": 1, "duration_seconds": 1200},
                    {"title": "Histograms and Box Plots", "lesson_type": "video", "order_index": 2, "duration_seconds": 1100},
                    {"title": "Seaborn for Statistical Plots", "lesson_type": "video", "order_index": 3, "duration_seconds": 1300},
                    {"title": "Final Project: EDA on Real Dataset", "lesson_type": "document", "order_index": 4, "duration_seconds": 2400},
                ],
            },
        ],
    },
    {
        "teacher_email": "rajesh.kumar@brainwave.ai",
        "title": "Machine Learning with Python — A to Z",
        "slug": "machine-learning-python-a-to-z",
        "description": "Hands-on machine learning course covering supervised, unsupervised, and deep learning. Build real models — linear regression, decision trees, random forests, SVMs, KNNs, clustering, and neural networks from scratch using scikit-learn and TensorFlow.",
        "short_description": "Full ML course: supervised, unsupervised, and neural networks with scikit-learn.",
        "thumbnail_url": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
        "price": 1999,
        "category": "Machine Learning",
        "tags": ["machine learning", "scikit-learn", "tensorflow", "deep learning", "AI"],
        "difficulty_level": "Intermediate",
        "total_duration_minutes": 1680,
        "avg_rating": 4.8,
        "review_count": 1870,
        "enrolled_count": 12400,
        "is_featured": True,
        "chapters": [
            {
                "title": "ML Foundations",
                "description": "Math and statistics you need for ML",
                "order_index": 1,
                "is_free_preview": True,
                "lessons": [
                    {"title": "What is Machine Learning?", "lesson_type": "video", "order_index": 1, "duration_seconds": 1200},
                    {"title": "Statistics Refresher for ML", "lesson_type": "video", "order_index": 2, "duration_seconds": 1500},
                    {"title": "Linear Algebra Essentials", "lesson_type": "video", "order_index": 3, "duration_seconds": 1400},
                    {"title": "Setting up the ML Environment", "lesson_type": "video", "order_index": 4, "duration_seconds": 900},
                ],
            },
            {
                "title": "Supervised Learning",
                "description": "Regression and classification algorithms",
                "order_index": 2,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Linear Regression from Scratch", "lesson_type": "video", "order_index": 1, "duration_seconds": 1800},
                    {"title": "Logistic Regression and Classification", "lesson_type": "video", "order_index": 2, "duration_seconds": 1600},
                    {"title": "Decision Trees and Random Forests", "lesson_type": "video", "order_index": 3, "duration_seconds": 1700},
                    {"title": "Support Vector Machines", "lesson_type": "video", "order_index": 4, "duration_seconds": 1500},
                    {"title": "Model Evaluation and Cross-Validation", "lesson_type": "video", "order_index": 5, "duration_seconds": 1400},
                    {"title": "Supervised Learning Quiz", "lesson_type": "quiz", "order_index": 6, "duration_seconds": 720},
                ],
            },
            {
                "title": "Unsupervised Learning",
                "description": "Clustering and dimensionality reduction",
                "order_index": 3,
                "is_free_preview": False,
                "lessons": [
                    {"title": "K-Means Clustering", "lesson_type": "video", "order_index": 1, "duration_seconds": 1600},
                    {"title": "Hierarchical Clustering", "lesson_type": "video", "order_index": 2, "duration_seconds": 1400},
                    {"title": "PCA — Principal Component Analysis", "lesson_type": "video", "order_index": 3, "duration_seconds": 1800},
                ],
            },
            {
                "title": "Neural Networks and Deep Learning",
                "description": "Build neural networks from scratch with TensorFlow",
                "order_index": 4,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Perceptrons and Activation Functions", "lesson_type": "video", "order_index": 1, "duration_seconds": 1500},
                    {"title": "Backpropagation Explained", "lesson_type": "video", "order_index": 2, "duration_seconds": 2000},
                    {"title": "Building Neural Networks with TensorFlow", "lesson_type": "video", "order_index": 3, "duration_seconds": 2200},
                    {"title": "CNNs for Image Classification", "lesson_type": "video", "order_index": 4, "duration_seconds": 2400},
                    {"title": "Final Project: Image Classifier", "lesson_type": "document", "order_index": 5, "duration_seconds": 3600},
                ],
            },
        ],
    },
    # ─── Prof. Priya Sharma ─────────────────────────────────────────────────
    {
        "teacher_email": "priya.sharma@brainwave.ai",
        "title": "React & Next.js 14 — Build Modern Web Apps",
        "slug": "react-nextjs-14-modern-web-apps",
        "description": "Learn React 18 and Next.js 14 App Router from a Google engineer. Build real-world apps with TypeScript, Tailwind CSS, server components, API routes, authentication, and deployment. Industry-grade code quality throughout.",
        "short_description": "Build production-ready React/Next.js apps with TypeScript, Tailwind & App Router.",
        "thumbnail_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
        "price": 1499,
        "category": "Web Development",
        "tags": ["react", "next.js", "typescript", "tailwind", "web development"],
        "difficulty_level": "Intermediate",
        "total_duration_minutes": 1380,
        "avg_rating": 4.9,
        "review_count": 3120,
        "enrolled_count": 24800,
        "is_featured": True,
        "chapters": [
            {
                "title": "React Fundamentals",
                "description": "JSX, components, props, and state",
                "order_index": 1,
                "is_free_preview": True,
                "lessons": [
                    {"title": "Why React? The Component Model", "lesson_type": "video", "order_index": 1, "duration_seconds": 1100},
                    {"title": "JSX and Rendering", "lesson_type": "video", "order_index": 2, "duration_seconds": 1200},
                    {"title": "Props and Component Composition", "lesson_type": "video", "order_index": 3, "duration_seconds": 1300},
                    {"title": "useState and Event Handling", "lesson_type": "video", "order_index": 4, "duration_seconds": 1400},
                    {"title": "useEffect and Side Effects", "lesson_type": "video", "order_index": 5, "duration_seconds": 1500},
                ],
            },
            {
                "title": "Next.js 14 App Router",
                "description": "Server components, routing, layouts, and data fetching",
                "order_index": 2,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Next.js 14 App Router Architecture", "lesson_type": "video", "order_index": 1, "duration_seconds": 1300},
                    {"title": "Server vs Client Components", "lesson_type": "video", "order_index": 2, "duration_seconds": 1500},
                    {"title": "Dynamic Routes and Layouts", "lesson_type": "video", "order_index": 3, "duration_seconds": 1400},
                    {"title": "Data Fetching Patterns", "lesson_type": "video", "order_index": 4, "duration_seconds": 1600},
                    {"title": "API Routes and Server Actions", "lesson_type": "video", "order_index": 5, "duration_seconds": 1700},
                ],
            },
            {
                "title": "Styling with Tailwind CSS",
                "description": "Utility-first CSS, responsive design, dark mode",
                "order_index": 3,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Tailwind CSS Core Concepts", "lesson_type": "video", "order_index": 1, "duration_seconds": 1200},
                    {"title": "Responsive Design with Tailwind", "lesson_type": "video", "order_index": 2, "duration_seconds": 1100},
                    {"title": "Dark Mode Implementation", "lesson_type": "video", "order_index": 3, "duration_seconds": 1000},
                    {"title": "Component Library with shadcn/ui", "lesson_type": "video", "order_index": 4, "duration_seconds": 1400},
                ],
            },
            {
                "title": "Real-World Project: Full-Stack App",
                "description": "Build a complete e-commerce app end to end",
                "order_index": 4,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Project Architecture and Setup", "lesson_type": "video", "order_index": 1, "duration_seconds": 1200},
                    {"title": "Authentication with NextAuth", "lesson_type": "video", "order_index": 2, "duration_seconds": 1800},
                    {"title": "Database with Prisma and PostgreSQL", "lesson_type": "video", "order_index": 3, "duration_seconds": 2000},
                    {"title": "Deployment to Vercel", "lesson_type": "video", "order_index": 4, "duration_seconds": 1200},
                    {"title": "Final Project Quiz", "lesson_type": "quiz", "order_index": 5, "duration_seconds": 720},
                ],
            },
        ],
    },
    {
        "teacher_email": "priya.sharma@brainwave.ai",
        "title": "Full Stack Development with Node.js & Express",
        "slug": "full-stack-nodejs-express",
        "description": "Build complete backend systems with Node.js, Express, MongoDB, and REST APIs. Covers authentication with JWT, file uploads, real-time features with Socket.io, and deploying to production. Perfect companion to the React course.",
        "short_description": "Backend mastery: Node.js, Express, MongoDB, JWT auth, Socket.io and deployment.",
        "thumbnail_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        "price": 1299,
        "category": "Backend Development",
        "tags": ["node.js", "express", "mongodb", "REST API", "backend"],
        "difficulty_level": "Intermediate",
        "total_duration_minutes": 960,
        "avg_rating": 4.7,
        "review_count": 980,
        "enrolled_count": 9200,
        "is_featured": False,
        "chapters": [
            {
                "title": "Node.js Fundamentals",
                "description": "Event loop, modules, fs, streams, and npm",
                "order_index": 1,
                "is_free_preview": True,
                "lessons": [
                    {"title": "How Node.js Works — The Event Loop", "lesson_type": "video", "order_index": 1, "duration_seconds": 1400},
                    {"title": "Modules and require()", "lesson_type": "video", "order_index": 2, "duration_seconds": 1100},
                    {"title": "File System and Streams", "lesson_type": "video", "order_index": 3, "duration_seconds": 1300},
                ],
            },
            {
                "title": "Express.js — Building APIs",
                "description": "Routing, middleware, error handling",
                "order_index": 2,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Express Setup and Routing", "lesson_type": "video", "order_index": 1, "duration_seconds": 1400},
                    {"title": "Middleware and Error Handling", "lesson_type": "video", "order_index": 2, "duration_seconds": 1500},
                    {"title": "REST API Design Principles", "lesson_type": "video", "order_index": 3, "duration_seconds": 1300},
                    {"title": "JWT Authentication", "lesson_type": "video", "order_index": 4, "duration_seconds": 1800},
                ],
            },
            {
                "title": "MongoDB and Mongoose",
                "description": "Schema design, queries, and aggregation",
                "order_index": 3,
                "is_free_preview": False,
                "lessons": [
                    {"title": "MongoDB Basics and CRUD", "lesson_type": "video", "order_index": 1, "duration_seconds": 1400},
                    {"title": "Mongoose Schemas and Models", "lesson_type": "video", "order_index": 2, "duration_seconds": 1500},
                    {"title": "Aggregation Pipeline", "lesson_type": "video", "order_index": 3, "duration_seconds": 1600},
                ],
            },
        ],
    },
    # ─── Arjun Mehta ────────────────────────────────────────────────────────
    {
        "teacher_email": "arjun.mehta@brainwave.ai",
        "title": "JavaScript Mastery — ES6+ and Beyond",
        "slug": "javascript-mastery-es6-beyond",
        "description": "The most thorough JavaScript course available. Master ES6+, async/await, Promises, closures, prototypes, DOM manipulation, Fetch API, and modern JS patterns. Includes 30 coding challenges and 5 real projects. No frameworks — pure JS power.",
        "short_description": "Deep-dive into modern JavaScript: closures, async, prototypes, DOM, and real projects.",
        "thumbnail_url": "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80",
        "price": 799,
        "category": "Programming",
        "tags": ["javascript", "ES6", "async", "dom", "web"],
        "difficulty_level": "Beginner",
        "total_duration_minutes": 1080,
        "avg_rating": 4.8,
        "review_count": 4200,
        "enrolled_count": 31000,
        "is_featured": True,
        "chapters": [
            {
                "title": "JavaScript Core Concepts",
                "description": "Variables, scope, hoisting, and type coercion",
                "order_index": 1,
                "is_free_preview": True,
                "lessons": [
                    {"title": "var vs let vs const — Scope Deep Dive", "lesson_type": "video", "order_index": 1, "duration_seconds": 1400},
                    {"title": "Type Coercion and == vs ===", "lesson_type": "video", "order_index": 2, "duration_seconds": 1200},
                    {"title": "Hoisting and the TDZ", "lesson_type": "video", "order_index": 3, "duration_seconds": 1100},
                    {"title": "Closures — The Real Explanation", "lesson_type": "video", "order_index": 4, "duration_seconds": 1600},
                ],
            },
            {
                "title": "Modern ES6+ Features",
                "description": "Arrow functions, destructuring, spread, modules",
                "order_index": 2,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Arrow Functions and this Binding", "lesson_type": "video", "order_index": 1, "duration_seconds": 1300},
                    {"title": "Destructuring Arrays and Objects", "lesson_type": "video", "order_index": 2, "duration_seconds": 1200},
                    {"title": "Spread, Rest, and Optional Chaining", "lesson_type": "video", "order_index": 3, "duration_seconds": 1100},
                    {"title": "ES Modules: import and export", "lesson_type": "video", "order_index": 4, "duration_seconds": 1000},
                    {"title": "ES6+ Quiz", "lesson_type": "quiz", "order_index": 5, "duration_seconds": 600},
                ],
            },
            {
                "title": "Async JavaScript",
                "description": "Callbacks, Promises, async/await, and error handling",
                "order_index": 3,
                "is_free_preview": False,
                "lessons": [
                    {"title": "The Event Loop — Visualized", "lesson_type": "video", "order_index": 1, "duration_seconds": 1500},
                    {"title": "Promises — Creation and Chaining", "lesson_type": "video", "order_index": 2, "duration_seconds": 1600},
                    {"title": "async/await — Clean Async Code", "lesson_type": "video", "order_index": 3, "duration_seconds": 1400},
                    {"title": "Fetch API and REST Calls", "lesson_type": "video", "order_index": 4, "duration_seconds": 1300},
                    {"title": "Error Handling Best Practices", "lesson_type": "video", "order_index": 5, "duration_seconds": 1200},
                ],
            },
        ],
    },
    {
        "teacher_email": "arjun.mehta@brainwave.ai",
        "title": "System Design for Software Engineers",
        "slug": "system-design-software-engineers",
        "description": "Learn how to design large-scale distributed systems — the way Amazon, Google, and Netflix do it. Covers load balancing, caching, databases, message queues, microservices, CAP theorem, and complete case studies: WhatsApp, YouTube, Uber, and URL shortener. Essential for FAANG interviews.",
        "short_description": "Design WhatsApp, YouTube, Uber from scratch. Essential for senior SDE & FAANG interviews.",
        "thumbnail_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
        "price": 0,
        "category": "System Design",
        "tags": ["system design", "distributed systems", "microservices", "interview prep", "backend"],
        "difficulty_level": "Advanced",
        "total_duration_minutes": 840,
        "avg_rating": 4.95,
        "review_count": 6700,
        "enrolled_count": 52000,
        "is_featured": True,
        "chapters": [
            {
                "title": "Foundations of System Design",
                "description": "Scalability, reliability, CAP theorem",
                "order_index": 1,
                "is_free_preview": True,
                "lessons": [
                    {"title": "How to Approach System Design Interviews", "lesson_type": "video", "order_index": 1, "duration_seconds": 1200},
                    {"title": "Vertical vs Horizontal Scaling", "lesson_type": "video", "order_index": 2, "duration_seconds": 1400},
                    {"title": "CAP Theorem Explained with Examples", "lesson_type": "video", "order_index": 3, "duration_seconds": 1600},
                    {"title": "Load Balancers — Types and Algorithms", "lesson_type": "video", "order_index": 4, "duration_seconds": 1500},
                ],
            },
            {
                "title": "Core Building Blocks",
                "description": "Caching, databases, queues, CDN",
                "order_index": 2,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Caching Strategies — Redis, Memcached", "lesson_type": "video", "order_index": 1, "duration_seconds": 1800},
                    {"title": "SQL vs NoSQL — When to Use What", "lesson_type": "video", "order_index": 2, "duration_seconds": 1600},
                    {"title": "Database Sharding and Replication", "lesson_type": "video", "order_index": 3, "duration_seconds": 1700},
                    {"title": "Message Queues — Kafka, RabbitMQ", "lesson_type": "video", "order_index": 4, "duration_seconds": 1600},
                    {"title": "CDNs and Content Delivery", "lesson_type": "video", "order_index": 5, "duration_seconds": 1200},
                ],
            },
            {
                "title": "Real-World Case Studies",
                "description": "Design WhatsApp, YouTube, Uber, URL shortener",
                "order_index": 3,
                "is_free_preview": False,
                "lessons": [
                    {"title": "Design WhatsApp — Chat at Scale", "lesson_type": "video", "order_index": 1, "duration_seconds": 2400},
                    {"title": "Design YouTube — Video Streaming", "lesson_type": "video", "order_index": 2, "duration_seconds": 2200},
                    {"title": "Design Uber — Geo-distributed Matching", "lesson_type": "video", "order_index": 3, "duration_seconds": 2000},
                    {"title": "Design a URL Shortener (TinyURL)", "lesson_type": "video", "order_index": 4, "duration_seconds": 1800},
                    {"title": "System Design Final Quiz", "lesson_type": "quiz", "order_index": 5, "duration_seconds": 900},
                ],
            },
        ],
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# SEED LOGIC
# ─────────────────────────────────────────────────────────────────────────────

def seed():
    db: Session = SessionLocal()
    try:
        print("\n🌱  Brainwave.ai — Starting seed...\n")

        teacher_map: dict[str, User] = {}

        # ── Create teachers ──────────────────────────────────────────────────
        for t_data in TEACHERS:
            existing = db.query(User).filter_by(email=t_data["email"]).first()
            if existing:
                print(f"  ↩  Teacher already exists: {t_data['email']}")
                teacher_map[t_data["email"]] = existing
                continue

            user = User(
                email=t_data["email"],
                full_name=t_data["full_name"],
                password_hash=pwd_ctx.hash(t_data["password"]),
                role="teacher",
                is_verified=True,
            )
            db.add(user)
            db.flush()  # get user.id before commit

            profile = TeacherProfile(
                user_id=user.id,
                bio=t_data["bio"],
                expertise_areas=t_data["expertise_areas"],
                identity_verified=True,
                expert_verified=True,
                outcome_verified=True,
                credibility_score=t_data["credibility_score"],
                total_students=0,
                avg_completion_rate=78.50,
            )
            db.add(profile)
            teacher_map[t_data["email"]] = user
            print(f"  ✓  Created teacher: {t_data['full_name']} ({t_data['email']})")

        db.commit()

        # ── Create courses ───────────────────────────────────────────────────
        for c_data in COURSES:
            existing = db.query(Course).filter_by(slug=c_data["slug"]).first()
            if existing:
                print(f"  ↩  Course already exists: {c_data['slug']}")
                continue

            teacher = teacher_map[c_data["teacher_email"]]
            chapters_data = c_data.pop("chapters")
            teacher_email = c_data.pop("teacher_email")

            total_lessons = sum(len(ch["lessons"]) for ch in chapters_data)

            course = Course(
                teacher_id=teacher.id,
                status="published",
                ai_processing_status="completed",
                language="English",
                certificate_enabled=True,
                completion_requirement_percent=80,
                quiz_pass_percent=60,
                total_chapters=len(chapters_data),
                **{k: v for k, v in c_data.items()},
            )
            db.add(course)
            db.flush()

            for ch_data in chapters_data:
                lessons_data = ch_data.pop("lessons")
                chapter = Chapter(course_id=course.id, **ch_data)
                db.add(chapter)
                db.flush()

                for l_data in lessons_data:
                    lesson = Lesson(
                        chapter_id=chapter.id,
                        course_id=course.id,
                        is_published=True,
                        ai_summary=f"AI-generated summary for: {l_data['title']}",
                        **l_data,
                    )
                    db.add(lesson)

            db.commit()
            price_str = "FREE" if course.price == 0 else f"₹{course.price}"
            print(f"  ✓  Created course: {course.title} ({price_str}) — {len(chapters_data)} chapters")

        print("\n✅  Seed complete!\n")
        print("━" * 60)
        print("  TEACHER LOGIN CREDENTIALS")
        print("━" * 60)
        for t in TEACHERS:
            print(f"  📧  {t['email']}")
            print(f"  🔑  {t['password']}")
            print(f"  👤  {t['full_name']}")
            print()
        print("━" * 60)
        print(f"  {len(COURSES)} courses created and published.")
        print("━" * 60)

    except Exception as e:
        db.rollback()
        print(f"\n❌  Seed failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
