# VOIDRUN

## Overview

VoidRun is a cyber-themed web application that combines user authentication, progression systems, and interactive features into a unified platform.
The project is designed to simulate a game-like environment where users can create accounts, track progress, and interact with core systems such as dashboards and AI-driven components.

VoidRun focuses on clean UI design, modular architecture, and scalable backend integration using Firebase services.

---

## Features

### Authentication System

* Email & password registration and login
* Google authentication support
* Secure session handling using Firebase Authentication

### User Data & Storage

* Firestore integration for persistent user data
* Structured user profiles (username, email, metadata)
* Scalable database design for future features

### Dashboard System

* Personalized user interface
* Displays user-related data and system status
* Foundation for progression, stats, and future modules

### Cookie & Privacy System

* Custom-built cookie consent manager
* Accept / Reject / Manage preferences
* Conditional loading of analytics based on user consent

### UI / UX Design

* Cyber-themed interface with neon styling
* Responsive layout across devices
* Modular CSS structure with reusable components

### VoidBot (Interactive System)

* Integrated script system for AI/interactive behavior
* Expandable for future chatbot or command-based features

---

## Tech Stack

**Frontend**

* HTML5
* CSS3 (custom styling, responsive design)
* JavaScript (vanilla)

**Backend / Services**

* Firebase Authentication
* Firebase Firestore

**Other Integrations**

* Google Analytics (loaded conditionally via cookie system)

---

## Architecture

VoidRun follows a modular structure:

* `register.html` / `login.html` → authentication interfaces
* `firebase-auth.js` → handles authentication logic
* `voidbot.js` → interactive system logic
* `cookies.js` → cookie consent & tracking control
* Firestore → user data persistence

The system is designed to separate UI, logic, and data handling for maintainability and scalability.

---

## Key Concepts Demonstrated

* Asynchronous programming with Firebase
* Event-driven UI interactions
* Modular JavaScript structure
* State management (user sessions, cookies)
* Conditional script loading (analytics control)
* Secure authentication workflows

---

## Demo

A demonstration video of the system can be found here:
[https://www.youtube.com/watch?v=eU64P81g6q4]
GAME TEST FROM THE WEBSITE THATS ALREADY UP [https://voidruninc.netlify.app/play]

---

## Future Improvements

* XP and progression system
* Leaderboard and multiplayer features
* Expanded VoidBot capabilities
* Profile and settings management
* Game mechanics integration

---

## Notes

This project was built as a full-stack web application prototype demonstrating structured development practices, real-world integrations, and scalable design patterns.
