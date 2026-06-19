import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const DATA_DIR   = path.join(__dirname, "data");
const DATA_FILE  = path.join(DATA_DIR, "lifeos.json");
const app        = express();
const PORT       = process.env.PORT || 4000;

app.use(express.json({ limit: "20mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});


// ─── Helpers ─────────────────────────────────────────────────────────────────

function today() { return new Date().toISOString().slice(0, 10); }
function uid()   { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function mkTopics(list) {
  return list.map((title, i) => ({ id: `t${i}`, title, completed: false, xp: 20 }));
}

// ─── Roadmap Seed Data ────────────────────────────────────────────────────────

function buildRoadmap() {
  return [
    // ── FRONTEND ─────────────────────────────────────────────────
    {
      id: "html", category: "Frontend", title: "HTML", icon: "🌐",
      difficulty: "Beginner", estimatedHours: 8, xpReward: 240,
      description: "HTML (HyperText Markup Language) is the standard language for creating web pages. It describes the structure and content of a web document.",
      whyLearn: "HTML is the foundation of every website. Without HTML, there is no web page. It's the first skill every web developer must master.",
      resources: [
        { title: "MDN HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
        { title: "W3Schools HTML", url: "https://www.w3schools.com/html/" },
        { title: "freeCodeCamp HTML", url: "https://www.freecodecamp.org" }
      ],
      practiceProjects: ["Personal Portfolio Page", "Resume HTML Page", "Restaurant Menu Page"],
      interviewQuestions: [
        "What is the difference between HTML and HTML5?",
        "What are semantic HTML elements?",
        "Explain the difference between div and span.",
        "What is the purpose of DOCTYPE declaration?",
        "What are void elements in HTML?"
      ],
      topics: mkTopics([
        "Introduction to HTML & how browsers work",
        "HTML document structure (doctype, html, head, body)",
        "Headings (h1-h6) and Paragraphs",
        "Links and Anchor Tags",
        "Lists: Ordered, Unordered, Description",
        "Images and Multimedia (img, video, audio)",
        "Tables: structure, rows, columns, headers",
        "Forms: input, select, textarea, button",
        "Semantic Tags: header, nav, main, footer, article, section",
        "HTML5 New Elements",
        "Accessibility & ARIA attributes",
        "Mini Project: Build a personal portfolio page"
      ])
    },
    {
      id: "css", category: "Frontend", title: "CSS Fundamentals", icon: "🎨",
      difficulty: "Beginner", estimatedHours: 12, xpReward: 360,
      description: "CSS (Cascading Style Sheets) is the language used to style and visually present HTML documents. It controls colors, layouts, fonts, and animations.",
      whyLearn: "CSS transforms plain HTML into beautiful websites. Mastering CSS gives you complete control over how your applications look and feel.",
      resources: [
        { title: "MDN CSS Reference", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
        { title: "CSS-Tricks", url: "https://css-tricks.com" },
        { title: "Kevin Powell CSS", url: "https://www.youtube.com/@KevinPowell" }
      ],
      practiceProjects: ["Styled Resume", "Product Landing Page", "CSS Art Challenge"],
      interviewQuestions: [
        "What is the CSS box model?",
        "Explain the difference between margin and padding.",
        "What is specificity in CSS?",
        "What is the cascade in CSS?",
        "Explain position: relative, absolute, fixed, sticky."
      ],
      topics: mkTopics([
        "CSS Syntax, Selectors & Properties",
        "Colors: hex, rgb, hsl, named colors",
        "Typography: font-family, size, weight, line-height",
        "The Box Model: margin, border, padding, content",
        "Display: block, inline, inline-block",
        "Positioning: static, relative, absolute, fixed, sticky",
        "Background properties",
        "CSS Variables (Custom Properties)",
        "Pseudo-classes & Pseudo-elements",
        "Transitions & Basic Animations",
        "Media Queries (Responsive Basics)",
        "Mini Project: Style a complete website"
      ])
    },
    {
      id: "flexbox", category: "Frontend", title: "CSS Flexbox", icon: "📐",
      difficulty: "Beginner", estimatedHours: 6, xpReward: 180,
      description: "Flexbox is a one-dimensional CSS layout method for arranging items in rows or columns. It's the most commonly used layout system in modern web development.",
      whyLearn: "Flexbox is used in virtually every modern web project. It makes centering, spacing, and responsive layouts trivially easy.",
      resources: [
        { title: "Flexbox Froggy (game)", url: "https://flexboxfroggy.com" },
        { title: "CSS-Tricks Flexbox Guide", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }
      ],
      practiceProjects: ["Navigation Bar", "Card Grid Layout", "Holy Grail Layout"],
      interviewQuestions: [
        "What is the difference between flex-direction row and column?",
        "Explain justify-content vs align-items.",
        "When would you use flex-wrap?",
        "What does flex: 1 mean?"
      ],
      topics: mkTopics([
        "Flex container vs flex items",
        "flex-direction: row, column, reverse",
        "justify-content: alignment on main axis",
        "align-items: alignment on cross axis",
        "flex-wrap and multi-line layouts",
        "flex-grow, flex-shrink, flex-basis",
        "align-self and order",
        "Mini Project: Build a responsive navigation bar"
      ])
    },
    {
      id: "cssgrid", category: "Frontend", title: "CSS Grid", icon: "▦",
      difficulty: "Intermediate", estimatedHours: 8, xpReward: 240,
      description: "CSS Grid is a two-dimensional layout system. It lets you define both rows and columns, making it the most powerful layout tool in CSS.",
      whyLearn: "Grid is essential for complex page layouts like dashboards, galleries, and full website structures. It works alongside Flexbox.",
      resources: [
        { title: "Grid Garden (game)", url: "https://cssgridgarden.com" },
        { title: "CSS-Tricks Grid Guide", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" }
      ],
      practiceProjects: ["Dashboard Layout", "Photo Gallery", "Newspaper Layout"],
      interviewQuestions: [
        "What is the difference between Flexbox and Grid?",
        "Explain grid-template-columns.",
        "What is fr unit in CSS Grid?",
        "What is grid-area?"
      ],
      topics: mkTopics([
        "Grid container and grid items",
        "grid-template-columns and grid-template-rows",
        "The fr unit and repeat()",
        "Grid gaps (gap, row-gap, column-gap)",
        "Placing items with grid-column and grid-row",
        "grid-template-areas",
        "auto-fill and auto-fit",
        "Mini Project: Build a dashboard layout"
      ])
    },
    {
      id: "javascript", category: "Frontend", title: "JavaScript Fundamentals", icon: "⚡",
      difficulty: "Intermediate", estimatedHours: 30, xpReward: 900,
      description: "JavaScript is the programming language of the web. It makes web pages interactive, dynamic, and powerful.",
      whyLearn: "JavaScript is the only programming language that runs natively in browsers. Every frontend and Node.js backend developer must know it thoroughly.",
      resources: [
        { title: "javascript.info", url: "https://javascript.info" },
        { title: "Eloquent JavaScript", url: "https://eloquentjavascript.net" },
        { title: "MDN JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" }
      ],
      practiceProjects: ["To-Do App", "Calculator", "Quiz App", "Weather App"],
      interviewQuestions: [
        "What is the difference between var, let, and const?",
        "Explain closures in JavaScript.",
        "What is hoisting?",
        "Explain the event loop.",
        "What is the difference between == and ===?"
      ],
      topics: mkTopics([
        "Variables: var, let, const",
        "Data Types: string, number, boolean, null, undefined, object",
        "Operators and Expressions",
        "Control Flow: if/else, switch, ternary",
        "Loops: for, while, for...of, for...in",
        "Functions: declaration, expression, arrow functions",
        "Arrays: methods, iteration",
        "Objects: properties, methods, destructuring",
        "Scope, Hoisting & Closures",
        "The Event Loop & Asynchronous JS",
        "Error Handling: try/catch/finally",
        "Template Literals & Spread/Rest",
        "Modules: import/export",
        "JSON: parse and stringify",
        "Mini Project: Build an interactive quiz app"
      ])
    },
    {
      id: "jsadvanced", category: "Frontend", title: "JavaScript Advanced", icon: "🚀",
      difficulty: "Advanced", estimatedHours: 25, xpReward: 750,
      description: "Advanced JavaScript covers complex patterns, async programming, prototypes, design patterns, and performance optimization.",
      whyLearn: "Senior developers and interviewers test advanced JS deeply. Mastering this separates beginners from professionals.",
      resources: [
        { title: "You Don't Know JS", url: "https://github.com/getify/You-Dont-Know-JS" },
        { title: "javascript.info Advanced", url: "https://javascript.info/advanced-functions" }
      ],
      practiceProjects: ["Custom Promise Library", "Event Emitter", "Debounce/Throttle"],
      interviewQuestions: [
        "Explain prototypal inheritance.",
        "What is the difference between call, apply, and bind?",
        "What are Promises and async/await?",
        "What is a generator function?",
        "Explain WeakMap and WeakSet."
      ],
      topics: mkTopics([
        "Prototypes & Prototype Chain",
        "this keyword: call, apply, bind",
        "Promises: creation, chaining, .all, .race",
        "Async/Await & error handling",
        "Generators and Iterators",
        "Symbols and Well-known Symbols",
        "Proxy & Reflect",
        "WeakMap, WeakSet, WeakRef",
        "Memory Management & Garbage Collection",
        "Design Patterns: Module, Observer, Factory",
        "Performance: debounce, throttle, memoization",
        "Mini Project: Build a custom event system"
      ])
    },
    {
      id: "dom", category: "Frontend", title: "DOM Manipulation", icon: "🔧",
      difficulty: "Intermediate", estimatedHours: 10, xpReward: 300,
      description: "The Document Object Model (DOM) is the programmatic interface for HTML documents. DOM manipulation allows JavaScript to dynamically change web page content.",
      whyLearn: "DOM manipulation is how JavaScript makes web pages interactive. Every frontend developer must understand it deeply.",
      resources: [
        { title: "MDN DOM Guide", url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model" }
      ],
      practiceProjects: ["Dynamic Todo List", "Image Slider", "Form Validator"],
      interviewQuestions: [
        "What is the difference between getElementById and querySelector?",
        "Explain event bubbling and capturing.",
        "What is event delegation?",
        "What is the difference between innerHTML and textContent?"
      ],
      topics: mkTopics([
        "DOM tree structure",
        "Selecting elements: getElementById, querySelector, querySelectorAll",
        "Creating, inserting, removing elements",
        "Modifying content: innerHTML, textContent, innerText",
        "Modifying attributes and classes",
        "CSS manipulation via JS",
        "Events: addEventListener, removeEventListener",
        "Event object, preventDefault, stopPropagation",
        "Event bubbling, capturing & delegation",
        "Mini Project: Build a dynamic task manager"
      ])
    },
    {
      id: "react", category: "Frontend", title: "React Fundamentals", icon: "⚛️",
      difficulty: "Intermediate", estimatedHours: 25, xpReward: 750,
      description: "React is a JavaScript library for building user interfaces. It uses a component-based architecture and virtual DOM for efficient updates.",
      whyLearn: "React is the most popular frontend library used by Meta, Airbnb, Netflix, and thousands of companies. It's the top skill in frontend job listings.",
      resources: [
        { title: "React Official Docs", url: "https://react.dev" },
        { title: "Scrimba React Course", url: "https://scrimba.com" }
      ],
      practiceProjects: ["Movie Search App", "Shopping Cart", "Blog with CRUD"],
      interviewQuestions: [
        "What is the virtual DOM?",
        "Explain React reconciliation.",
        "What are controlled vs uncontrolled components?",
        "What is prop drilling?",
        "Explain the React component lifecycle."
      ],
      topics: mkTopics([
        "What is React and why use it?",
        "JSX: JavaScript XML syntax",
        "Components: functional components",
        "Props: passing and receiving data",
        "State: useState hook",
        "useEffect hook and side effects",
        "Event handling in React",
        "Conditional rendering",
        "Lists and keys",
        "Forms and controlled components",
        "Component composition and children",
        "Mini Project: Build a full blog application"
      ])
    },
    {
      id: "reacthooks", category: "Frontend", title: "React Hooks Deep Dive", icon: "🪝",
      difficulty: "Advanced", estimatedHours: 15, xpReward: 450,
      description: "React Hooks are functions that let you use state and other React features in functional components. They are the modern way to write React.",
      whyLearn: "Hooks are now the standard in React development. Deep knowledge of hooks is required for all React interviews and professional projects.",
      resources: [
        { title: "React Hooks Reference", url: "https://react.dev/reference/react" }
      ],
      practiceProjects: ["Custom useFetch Hook", "useLocalStorage Hook", "useDebounce Hook"],
      interviewQuestions: [
        "When should you use useCallback vs useMemo?",
        "Explain the rules of hooks.",
        "What is useRef used for?",
        "How does useReducer differ from useState?"
      ],
      topics: mkTopics([
        "useState: state management",
        "useEffect: lifecycle & cleanup",
        "useContext: consuming context",
        "useRef: DOM refs & mutable values",
        "useMemo: memoizing values",
        "useCallback: memoizing functions",
        "useReducer: complex state",
        "useId and useTransition",
        "Custom hooks: building your own",
        "Mini Project: Build a custom hook library"
      ])
    },
    {
      id: "nextjs", category: "Frontend", title: "Next.js", icon: "▲",
      difficulty: "Advanced", estimatedHours: 20, xpReward: 600,
      description: "Next.js is a React framework that adds server-side rendering, static site generation, API routes, and more to React applications.",
      whyLearn: "Next.js is the most popular React framework for production apps. It's used by Vercel, TikTok, Twitch, and thousands of companies.",
      resources: [
        { title: "Next.js Official Docs", url: "https://nextjs.org/docs" },
        { title: "Next.js Tutorial", url: "https://nextjs.org/learn" }
      ],
      practiceProjects: ["Blog with SSG", "E-commerce Store", "Dashboard App"],
      interviewQuestions: [
        "What is the difference between SSR and SSG?",
        "Explain Next.js App Router vs Pages Router.",
        "What are Server Components?",
        "How does Next.js handle API routes?"
      ],
      topics: mkTopics([
        "Next.js setup and project structure",
        "Pages Router vs App Router",
        "File-based routing",
        "Server-Side Rendering (SSR)",
        "Static Site Generation (SSG)",
        "Incremental Static Regeneration (ISR)",
        "API Routes",
        "Server Components & Client Components",
        "Data fetching patterns",
        "Image optimization",
        "Deployment to Vercel",
        "Mini Project: Full-stack Next.js app"
      ])
    },
    // ── BACKEND ────────────────────────────────────────────────────
    {
      id: "nodejs", category: "Backend", title: "Node.js", icon: "🟢",
      difficulty: "Intermediate", estimatedHours: 20, xpReward: 600,
      description: "Node.js is a JavaScript runtime built on Chrome's V8 engine. It allows running JavaScript on the server side.",
      whyLearn: "Node.js enables full-stack JavaScript development. It's used by Netflix, LinkedIn, Uber, and is the backbone of most JS backends.",
      resources: [
        { title: "Node.js Official Docs", url: "https://nodejs.org/docs" },
        { title: "The Odin Project Node", url: "https://www.theodinproject.com" }
      ],
      practiceProjects: ["File system CLI tool", "REST API server", "Real-time chat server"],
      interviewQuestions: [
        "What is the event loop in Node.js?",
        "What is the difference between process.nextTick and setImmediate?",
        "Explain Node.js streams.",
        "What is npm and how do you manage dependencies?"
      ],
      topics: mkTopics([
        "Node.js architecture and event loop",
        "Core modules: fs, path, http, os",
        "npm: installing and managing packages",
        "package.json and scripts",
        "CommonJS vs ES Modules",
        "File system operations (async/sync)",
        "Streams and Buffers",
        "Events and EventEmitter",
        "Process and environment variables",
        "Worker threads basics",
        "Error handling in Node",
        "Mini Project: Build a CLI file manager"
      ])
    },
    {
      id: "express", category: "Backend", title: "Express.js", icon: "🚂",
      difficulty: "Intermediate", estimatedHours: 15, xpReward: 450,
      description: "Express is a minimal and flexible Node.js web application framework that provides routing, middleware, and utilities for building web and API servers.",
      whyLearn: "Express is the most popular Node.js framework. Understanding it is essential for backend development and all Node.js interviews.",
      resources: [
        { title: "Express.js Official Docs", url: "https://expressjs.com" }
      ],
      practiceProjects: ["Todo REST API", "Authentication Server", "File Upload API"],
      interviewQuestions: [
        "What is middleware in Express?",
        "Explain the difference between app.use() and app.get().",
        "What is the order of middleware execution?",
        "How do you handle errors in Express?"
      ],
      topics: mkTopics([
        "Express setup and basic server",
        "Routing: GET, POST, PUT, DELETE, PATCH",
        "Route parameters and query strings",
        "Middleware: built-in, third-party, custom",
        "Request and Response objects",
        "Template engines (EJS, Pug)",
        "Error handling middleware",
        "Static file serving",
        "CORS and security headers",
        "Mini Project: Build a complete REST API"
      ])
    },
    {
      id: "restapi", category: "Backend", title: "REST API Design", icon: "🔌",
      difficulty: "Intermediate", estimatedHours: 10, xpReward: 300,
      description: "REST (Representational State Transfer) is an architectural style for designing networked applications using HTTP methods.",
      whyLearn: "REST APIs are the communication layer of every modern application. Knowing good API design is essential for backend developers.",
      resources: [
        { title: "REST API Tutorial", url: "https://restapitutorial.com" }
      ],
      practiceProjects: ["Blog API", "Social Media API", "E-commerce API"],
      interviewQuestions: [
        "What are the HTTP methods and when to use each?",
        "What is idempotency?",
        "Explain REST vs GraphQL.",
        "What are HTTP status codes?"
      ],
      topics: mkTopics([
        "REST principles and constraints",
        "HTTP methods: GET, POST, PUT, PATCH, DELETE",
        "HTTP status codes (200, 201, 400, 401, 403, 404, 500)",
        "URL design and resource naming",
        "Request/Response headers",
        "Query parameters, path params, request body",
        "Pagination, filtering, sorting",
        "API versioning",
        "Rate limiting",
        "API documentation (OpenAPI/Swagger)"
      ])
    },
    {
      id: "auth", category: "Backend", title: "Authentication & Authorization", icon: "🔐",
      difficulty: "Advanced", estimatedHours: 15, xpReward: 450,
      description: "Authentication verifies who you are. Authorization determines what you can do. Both are critical for secure application development.",
      whyLearn: "Security is non-negotiable in professional development. Broken authentication is one of the top OWASP vulnerabilities.",
      resources: [
        { title: "Auth0 Blog", url: "https://auth0.com/blog" },
        { title: "JWT.io", url: "https://jwt.io" }
      ],
      practiceProjects: ["Login/Register System", "JWT Auth API", "OAuth Integration"],
      interviewQuestions: [
        "What is the difference between authentication and authorization?",
        "How does JWT work?",
        "What is OAuth 2.0?",
        "What is bcrypt and why is it used for passwords?"
      ],
      topics: mkTopics([
        "Sessions vs Tokens",
        "Password hashing with bcrypt",
        "JWT: structure, signing, verification",
        "Access tokens and refresh tokens",
        "OAuth 2.0 flow",
        "Google/GitHub OAuth integration",
        "Role-based access control (RBAC)",
        "Middleware: protect routes",
        "CORS and security headers",
        "Common vulnerabilities and prevention"
      ])
    },
    // ── DATABASE ───────────────────────────────────────────────────
    {
      id: "sqlbasics", category: "Database", title: "SQL Fundamentals", icon: "🗄️",
      difficulty: "Intermediate", estimatedHours: 15, xpReward: 450,
      description: "SQL (Structured Query Language) is the standard language for relational databases. It's used to create, read, update, and delete data.",
      whyLearn: "SQL is used in 90% of companies. It's essential for DBMS interviews, backend development, and data analysis.",
      resources: [
        { title: "SQLBolt", url: "https://sqlbolt.com" },
        { title: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/" }
      ],
      practiceProjects: ["Student Database", "E-commerce Database", "Library System"],
      interviewQuestions: [
        "What is the difference between INNER JOIN and LEFT JOIN?",
        "What is normalization?",
        "What are indexes and why are they used?",
        "What is a subquery?"
      ],
      topics: mkTopics([
        "Relational database concepts",
        "SELECT, FROM, WHERE",
        "INSERT, UPDATE, DELETE",
        "JOINs: INNER, LEFT, RIGHT, FULL",
        "GROUP BY, HAVING, ORDER BY",
        "Aggregate functions: COUNT, SUM, AVG, MAX, MIN",
        "Subqueries and nested queries",
        "Indexes and performance",
        "Normalization: 1NF, 2NF, 3NF",
        "Transactions: ACID properties",
        "Stored procedures and views",
        "Mini Project: Design a complete database schema"
      ])
    },
    {
      id: "mongodb", category: "Database", title: "MongoDB", icon: "🍃",
      difficulty: "Intermediate", estimatedHours: 15, xpReward: 450,
      description: "MongoDB is a NoSQL document database that stores data in flexible JSON-like documents. It's widely used in Node.js applications.",
      whyLearn: "MongoDB with Node.js is the M in MERN stack. It's the most popular NoSQL database for web applications.",
      resources: [
        { title: "MongoDB University", url: "https://university.mongodb.com" },
        { title: "MongoDB Docs", url: "https://www.mongodb.com/docs" }
      ],
      practiceProjects: ["Blog with Comments", "User Profile System", "Product Catalog"],
      interviewQuestions: [
        "What is the difference between SQL and NoSQL?",
        "When would you use MongoDB over MySQL?",
        "What is an ObjectId?",
        "Explain MongoDB aggregation pipeline."
      ],
      topics: mkTopics([
        "NoSQL vs SQL concepts",
        "MongoDB documents and collections",
        "CRUD operations in MongoDB",
        "Query operators: $eq, $gt, $in, $and, $or",
        "Projection: selecting fields",
        "Sorting, skip, limit",
        "Indexes in MongoDB",
        "Aggregation pipeline",
        "Schema design and embedding vs referencing",
        "MongoDB Atlas (cloud setup)",
        "Mongoose ODM basics",
        "Mini Project: Backend API with MongoDB"
      ])
    },
    // ── DEVOPS ─────────────────────────────────────────────────────
    {
      id: "git", category: "DevOps", title: "Git & GitHub", icon: "🐙",
      difficulty: "Beginner", estimatedHours: 8, xpReward: 240,
      description: "Git is a distributed version control system. GitHub is a platform for hosting and collaborating on Git repositories.",
      whyLearn: "Git is used by every software developer daily. It's mandatory for any software development job.",
      resources: [
        { title: "Pro Git Book", url: "https://git-scm.com/book" },
        { title: "GitHub Learning Lab", url: "https://skills.github.com" }
      ],
      practiceProjects: ["Open Source Contribution", "Team Project Workflow", "CI/CD Pipeline"],
      interviewQuestions: [
        "What is the difference between git merge and git rebase?",
        "Explain git stash.",
        "What is a pull request?",
        "How do you resolve merge conflicts?"
      ],
      topics: mkTopics([
        "Git installation and configuration",
        "init, clone, status, add, commit",
        "Branching: create, switch, merge",
        "Remote repositories: push, pull, fetch",
        "GitHub: repositories, issues, pull requests",
        "Merge conflicts resolution",
        "git stash and cherry-pick",
        "git log, diff, blame",
        "Git flow workflow",
        "GitHub Actions basics",
        ".gitignore best practices",
        "Mini Project: Collaborate on a team project"
      ])
    },
    {
      id: "docker", category: "DevOps", title: "Docker", icon: "🐳",
      difficulty: "Intermediate", estimatedHours: 12, xpReward: 360,
      description: "Docker is a platform for building, running, and shipping applications in containers. Containers ensure your app runs consistently everywhere.",
      whyLearn: "Docker is now standard in every DevOps pipeline. Companies expect developers to understand containerization.",
      resources: [
        { title: "Docker Official Docs", url: "https://docs.docker.com" },
        { title: "Play with Docker", url: "https://labs.play-with-docker.com" }
      ],
      practiceProjects: ["Dockerize a Node app", "Multi-container with Compose", "Docker Hub CI"],
      interviewQuestions: [
        "What is a Docker container vs a VM?",
        "What is a Dockerfile?",
        "What is Docker Compose?",
        "What is the difference between CMD and ENTRYPOINT?"
      ],
      topics: mkTopics([
        "What is Docker and containerization?",
        "Docker installation and setup",
        "Docker images: pull, build, push",
        "Docker containers: run, stop, start, rm",
        "Dockerfile: FROM, RUN, COPY, EXPOSE, CMD",
        "Docker volumes and persistence",
        "Docker networking",
        "Docker Compose: multi-service apps",
        "Docker Hub and image registry",
        "Docker in CI/CD pipelines",
        "Container best practices",
        "Mini Project: Containerize your full-stack app"
      ])
    },
    // ── DSA ────────────────────────────────────────────────────────
    {
      id: "arrays", category: "DSA", title: "Arrays & Strings", icon: "📊",
      difficulty: "Intermediate", estimatedHours: 20, xpReward: 600,
      description: "Arrays are the most fundamental data structure. String problems are extremely common in coding interviews.",
      whyLearn: "Arrays and strings appear in 70% of coding interviews. Mastering these is the foundation for all DSA success.",
      resources: [
        { title: "LeetCode Arrays", url: "https://leetcode.com/tag/array/" },
        { title: "NeetCode", url: "https://neetcode.io" }
      ],
      practiceProjects: ["Implement sorting algorithms", "String manipulation library"],
      interviewQuestions: [
        "How do you find duplicates in an array?",
        "Explain two-pointer technique.",
        "What is sliding window?",
        "How to reverse a string in-place?"
      ],
      topics: mkTopics([
        "Array fundamentals and operations",
        "Two-pointer technique",
        "Sliding window technique",
        "Prefix sums",
        "Sorting algorithms: bubble, selection, insertion",
        "Sorting algorithms: merge sort, quick sort",
        "Binary search on arrays",
        "String manipulation techniques",
        "String matching: KMP algorithm",
        "Anagram and palindrome problems",
        "Subarray problems",
        "Matrix (2D array) problems",
        "LeetCode: 20 array problems solved",
        "LeetCode: 10 string problems solved",
        "Mini Project: Build a sorting visualizer"
      ])
    },
    {
      id: "linkedlist", category: "DSA", title: "Linked Lists", icon: "🔗",
      difficulty: "Intermediate", estimatedHours: 12, xpReward: 360,
      description: "A linked list is a linear data structure where elements are connected using pointers. It's a classic interview topic.",
      whyLearn: "Linked lists test your understanding of pointers and memory. They appear frequently in interviews at FAANG companies.",
      resources: [
        { title: "LeetCode Linked List", url: "https://leetcode.com/tag/linked-list/" }
      ],
      practiceProjects: ["Implement a LinkedList class", "LRU Cache"],
      interviewQuestions: [
        "How to detect a cycle in a linked list?",
        "How to reverse a linked list?",
        "How to find the middle of a linked list?",
        "What is a doubly linked list?"
      ],
      topics: mkTopics([
        "Singly linked list: nodes and pointers",
        "Traversal and search",
        "Insertion: head, tail, middle",
        "Deletion: by value, by position",
        "Reverse a linked list",
        "Detect cycle: Floyd's algorithm",
        "Find middle node (fast/slow pointers)",
        "Doubly linked list",
        "Merge two sorted linked lists",
        "LeetCode: 15 linked list problems solved"
      ])
    },
    {
      id: "trees", category: "DSA", title: "Trees & BST", icon: "🌳",
      difficulty: "Advanced", estimatedHours: 20, xpReward: 600,
      description: "Trees are hierarchical data structures. Binary Search Trees (BST) are fundamental for fast data lookup, insertion, and deletion.",
      whyLearn: "Tree problems are extremely common in technical interviews. Understanding recursion on trees is essential for senior roles.",
      resources: [
        { title: "LeetCode Tree Problems", url: "https://leetcode.com/tag/tree/" },
        { title: "Visualgo Trees", url: "https://visualgo.net/en/bst" }
      ],
      practiceProjects: ["BST implementation", "Expression Tree", "File System Tree"],
      interviewQuestions: [
        "What is the difference between a tree and a graph?",
        "Explain in-order, pre-order, post-order traversal.",
        "What is a balanced BST?",
        "What is the time complexity of BST operations?"
      ],
      topics: mkTopics([
        "Tree terminology: root, node, leaf, height, depth",
        "Binary tree properties",
        "Tree traversal: in-order, pre-order, post-order",
        "Level-order traversal (BFS)",
        "Binary Search Tree: insert, search, delete",
        "BST validation",
        "Height and depth calculations",
        "Lowest Common Ancestor (LCA)",
        "AVL Trees and rotations",
        "Heaps and priority queues",
        "Trie data structure",
        "LeetCode: 20 tree problems solved"
      ])
    },
    {
      id: "dynamicprog", category: "DSA", title: "Dynamic Programming", icon: "🧩",
      difficulty: "Advanced", estimatedHours: 30, xpReward: 900,
      description: "Dynamic Programming is a technique for solving complex problems by breaking them into overlapping subproblems and storing results.",
      whyLearn: "DP is the hardest and most asked topic in FAANG interviews. Mastering it separates average candidates from top performers.",
      resources: [
        { title: "NeetCode DP", url: "https://neetcode.io/roadmap" },
        { title: "DP Patterns", url: "https://leetcode.com/discuss/general-discussion/458695/" }
      ],
      practiceProjects: ["Shortest Path with DP", "Coin Change solver"],
      interviewQuestions: [
        "What is memoization vs tabulation?",
        "What is the Knapsack problem?",
        "Explain the Fibonacci DP approach.",
        "What is the time complexity of Fibonacci with memoization?"
      ],
      topics: mkTopics([
        "DP fundamentals: overlapping subproblems",
        "Memoization (top-down DP)",
        "Tabulation (bottom-up DP)",
        "Fibonacci sequence (DP approach)",
        "Coin change problem",
        "Longest Common Subsequence (LCS)",
        "Longest Increasing Subsequence (LIS)",
        "0/1 Knapsack problem",
        "Matrix chain multiplication",
        "Edit distance (Levenshtein)",
        "DP on strings",
        "DP on trees",
        "LeetCode: 30 DP problems solved"
      ])
    }
  ];
}

// ─── Placement Subjects Seed ──────────────────────────────────────────────────

function buildPlacement() {
  return {
    readinessScore: 0,
    subjects: [
      {
        id: "dsa", title: "Data Structures & Algorithms", icon: "📊", progress: 0,
        topics: mkTopics(["Arrays", "Strings", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs", "Heaps", "Sorting", "Searching", "Dynamic Programming", "Greedy", "Backtracking", "Bit Manipulation"])
      },
      {
        id: "java", title: "Core Java", icon: "☕", progress: 0,
        topics: mkTopics(["OOP Concepts", "Classes & Objects", "Inheritance", "Polymorphism", "Abstraction", "Encapsulation", "Interfaces", "Collections", "Exception Handling", "Multithreading", "Java 8 Features", "String handling"])
      },
      {
        id: "dbms", title: "DBMS", icon: "🗄️", progress: 0,
        topics: mkTopics(["ER Model", "Relational Model", "SQL Basics", "Normalization", "Transactions & ACID", "Concurrency Control", "Indexing & Hashing", "Query Optimization", "NoSQL Concepts", "RAID"])
      },
      {
        id: "os", title: "Operating Systems", icon: "💻", progress: 0,
        topics: mkTopics(["Process Management", "Scheduling Algorithms", "Memory Management", "Paging & Segmentation", "Virtual Memory", "Deadlocks", "File Systems", "I/O Management", "Semaphores & Mutex", "Inter-process Communication"])
      },
      {
        id: "cn", title: "Computer Networks", icon: "🌐", progress: 0,
        topics: mkTopics(["OSI Model", "TCP/IP Stack", "HTTP/HTTPS", "DNS", "IP Addressing & CIDR", "Routing Algorithms", "TCP vs UDP", "Sockets", "Network Security Basics", "Firewalls & Proxies"])
      },
      {
        id: "aptitude", title: "Aptitude & Reasoning", icon: "🧠", progress: 0,
        topics: mkTopics(["Number System", "Percentages", "Profit & Loss", "Time & Work", "Time & Distance", "Ratios & Proportions", "Permutation & Combination", "Probability", "Logical Reasoning", "Verbal Reasoning"])
      },
      {
        id: "hr", title: "HR & Behavioral", icon: "🤝", progress: 0,
        topics: mkTopics(["Tell me about yourself", "Strengths & Weaknesses", "Why this company?", "STAR method", "Conflict resolution", "Leadership examples", "Career goals", "Salary negotiation basics"])
      },
      {
        id: "mock", title: "Mock Interviews", icon: "🎯", progress: 0,
        topics: mkTopics(["Round 1: Coding problems", "Round 2: System design basics", "Round 3: HR round", "Technical communication", "Problem-solving approach", "Code walkthrough", "Time management in interviews", "Online assessment practice"])
      }
    ],
    mockInterviews: [],
    revisionPlan: []
  };
}

// ─── Zero-State Seed ──────────────────────────────────────────────────────────

function buildSeed() {
  return {
    version: 5,
    onboarded: false,
    startDate: null,
    dayCount: 0,
    profile: {
      name: "", email: "", college: "", degree: "B.E Computer Science",
      semester: "1", cgpa: "", targetRole: "Full Stack Developer",
      dreamCompany: "", dreamSalary: "", photo: "",
      about: "", currentWeight: 0, targetWeight: 0,
      heightCm: 0, currentCodingLevel: "Beginner",
      currentEnglishLevel: "Beginner", currentSkills: ""
    },
    settings: { theme: "dark", accentColor: "indigo", sidebarCollapsed: false },
    gamification: {
      xp: 0,
      achievements: [],
      streaks: {
        coding:  { current: 0, best: 0, lastDate: null },
        workout: { current: 0, best: 0, lastDate: null },
        english: { current: 0, best: 0, lastDate: null },
        study:   { current: 0, best: 0, lastDate: null },
        overall: { current: 0, best: 0, lastDate: null }
      },
      totalMissionsCompleted: 0,
      xpHistory: []
    },
    missions: [],
    missionDate: null,
    calendar: [],
    habits: [
      { id: "h1", title: "Morning workout", icon: "💪", category: "health",    completed: false, xp: 20 },
      { id: "h2", title: "Code for 1 hour",  icon: "💻", category: "coding",   completed: false, xp: 50 },
      { id: "h3", title: "Drink 3L water",   icon: "💧", category: "health",   completed: false, xp: 10 },
      { id: "h4", title: "Read / Study",     icon: "📚", category: "learning", completed: false, xp: 20 },
      { id: "h5", title: "English practice", icon: "🗣️", category: "english",  completed: false, xp: 20 },
      { id: "h6", title: "Journal entry",    icon: "📝", category: "journal",  completed: false, xp: 10 },
      { id: "h7", title: "Meditation",       icon: "🧘", category: "health",   completed: false, xp: 10 }
    ],
    dailyLog: {},
    coding: {
      totalHours: 0,
      todayHours: 0,
      sessions: [],
      languages: {},
      weeklyGoal: 10,
      dailyGoal: 2,
      heatmap: {},
      notes: []
    },
    health: {
      score: 0,
      workouts: [],
      sleepLog: [],
      waterLog: [],
      moodLog: [],
      weight: [],
      meditationLog: [],
      readingLog: []
    },
    english: {
      score: 0,
      vocabulary: [],
      sessions: [],
      speakingTopics: [
        "Introduce yourself in 2 minutes",
        "Talk about your favorite technology",
        "Describe your dream career",
        "Explain a complex topic simply",
        "Discuss your biggest challenge so far",
        "Share your daily routine in English",
        "Talk about a book or article you read",
        "Describe your hometown",
        "Explain what Full Stack Development means",
        "Talk about your goals for the next 6 months"
      ],
      grammarNotes: [],
      confidenceScore: 0,
      weeklyReport: null
    },
    placement: buildPlacement(),
    projects: [],
    goals: [],
    journal: { entries: [] },
    finance: {
      income: [],
      expenses: [],
      savings: 0,
      budget: 0,
      categories: ["Food", "Transport", "Books", "Entertainment", "Utilities", "Other"]
    },
    roadmap: buildRoadmap(),
    analytics: { dailyLogs: [], weeklyLogs: [], insights: [] },
    notifications: {
      morning: true,
      coding: true,
      workout: true,
      water: true,
      english: true,
      journal: true
    },
    tools: {
      flashcards: [],
      pomodoroSessions: 0,
      notes: []
    },
    aiCoach: {
      messages: [],
      lastAdvice: null,
      weeklyReport: null
    }
  };
}

// ─── File I/O ─────────────────────────────────────────────────────────────────

async function readState() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if ((parsed.version || 0) < 5) throw new Error("outdated");
    return parsed;
  } catch {
    const seed = buildSeed();
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
}

async function writeState(state) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2));
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET full state
app.get("/api/state", async (req, res) => {
  const state = await readState();
  res.json(state);
});

// PUT full state (auto-save)
app.put("/api/state", async (req, res) => {
  try {
    const incoming = req.body;
    if (!incoming || typeof incoming !== "object") return res.status(400).json({ error: "Invalid body" });
    incoming.version = 5;
    await writeState(incoming);
    res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST onboarding — set profile and initialize startDate
app.post("/api/onboard", async (req, res) => {
  const state = await readState();
  const { profile } = req.body;
  state.profile   = { ...state.profile, ...profile };
  state.onboarded = true;
  state.startDate = today();
  state.dayCount  = 0;
  state.missions  = generateDailyMissions();
  state.missionDate = today();
  await writeState(state);
  res.json({ ok: true, state });
});

// POST complete a daily mission → award XP
app.post("/api/missions/complete", async (req, res) => {
  const state = await readState();
  const { missionId } = req.body;
  const mission = (state.missions || []).find(m => m.id === missionId);
  if (!mission) return res.status(404).json({ error: "Mission not found" });
  if (mission.completed) return res.json({ ok: true, xp: 0 });
  mission.completed = true;
  state.gamification.xp += mission.xp;
  state.gamification.totalMissionsCompleted = (state.gamification.totalMissionsCompleted || 0) + 1;
  state.gamification.xpHistory = state.gamification.xpHistory || [];
  state.gamification.xpHistory.push({ date: today(), amount: mission.xp, source: "mission", title: mission.title });
  await writeState(state);
  res.json({ ok: true, xp: mission.xp, totalXP: state.gamification.xp });
});

// POST award XP manually
app.post("/api/xp/award", async (req, res) => {
  const state = await readState();
  const { amount, source, title } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid XP amount" });
  state.gamification.xp += amount;
  state.gamification.xpHistory = state.gamification.xpHistory || [];
  state.gamification.xpHistory.push({ date: today(), amount, source: source || "manual", title: title || "XP Awarded" });
  await writeState(state);
  res.json({ ok: true, xp: amount, totalXP: state.gamification.xp });
});

// POST log coding session
app.post("/api/coding/session", async (req, res) => {
  const state = await readState();
  const { language, hours, notes } = req.body;
  if (!hours || hours <= 0) return res.status(400).json({ error: "Invalid hours" });
  const session = { id: uid(), date: today(), language: language || "General", hours: Number(hours), notes: notes || "" };
  state.coding.sessions = state.coding.sessions || [];
  state.coding.sessions.push(session);
  state.coding.totalHours = (state.coding.totalHours || 0) + hours;
  state.coding.heatmap    = state.coding.heatmap || {};
  state.coding.heatmap[today()] = (state.coding.heatmap[today()] || 0) + hours;
  state.coding.languages  = state.coding.languages || {};
  state.coding.languages[language || "General"] = (state.coding.languages[language || "General"] || 0) + hours;
  const xpEarned = Math.round(hours * 50);
  state.gamification.xp += xpEarned;
  state.gamification.xpHistory.push({ date: today(), amount: xpEarned, source: "coding", title: `Coded ${hours}h in ${language || "General"}` });
  await writeState(state);
  res.json({ ok: true, session, xpEarned });
});

// POST complete a roadmap topic → award XP + update progress
app.post("/api/roadmap/topic", async (req, res) => {
  const state = await readState();
  const { moduleId, topicId, completed } = req.body;
  const mod = (state.roadmap || []).find(m => m.id === moduleId);
  if (!mod) return res.status(404).json({ error: "Module not found" });
  const topic = (mod.topics || []).find(t => t.id === topicId);
  if (!topic) return res.status(404).json({ error: "Topic not found" });
  const wasCompleted = topic.completed;
  topic.completed = completed !== false;
  let xpEarned = 0;
  if (topic.completed && !wasCompleted) {
    xpEarned = topic.xp || 20;
    state.gamification.xp += xpEarned;
    state.gamification.xpHistory.push({ date: today(), amount: xpEarned, source: "roadmap", title: `Completed: ${topic.title}` });
  } else if (!topic.completed && wasCompleted) {
    xpEarned = -(topic.xp || 20);
    state.gamification.xp = Math.max(0, state.gamification.xp + xpEarned);
  }
  await writeState(state);
  const completedTopics = mod.topics.filter(t => t.completed).length;
  const totalTopics = mod.topics.length;
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  res.json({ ok: true, moduleId, progress, xpEarned, totalXP: state.gamification.xp });
});

// POST update streak
app.post("/api/streaks/update", async (req, res) => {
  const state = await readState();
  const { category } = req.body;
  const valid = ["coding", "workout", "english", "study", "overall"];
  if (!valid.includes(category)) return res.status(400).json({ error: "Invalid category" });
  const streak = state.gamification.streaks[category];
  const lastDate = streak.lastDate;
  const todayDate = today();
  if (lastDate === todayDate) return res.json({ ok: true, streak });
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  if (lastDate === yStr) {
    streak.current += 1;
  } else {
    streak.current = 1;
  }
  streak.best = Math.max(streak.best, streak.current);
  streak.lastDate = todayDate;
  await writeState(state);
  res.json({ ok: true, streak });
});

// POST mark day complete
app.post("/api/day/complete", async (req, res) => {
  const state = await readState();
  const { xp, missionsCompleted } = req.body;
  const entry = { date: today(), status: "success", xp: xp || 0, missionsCompleted: missionsCompleted || 0 };
  state.calendar = state.calendar || [];
  const existing = state.calendar.findIndex(d => d.date === today());
  if (existing >= 0) state.calendar[existing] = entry;
  else state.calendar.push(entry);
  if (state.startDate) {
    const diff = Math.floor((new Date() - new Date(state.startDate)) / 86400000);
    state.dayCount = Math.max(state.dayCount || 0, diff);
  }
  await writeState(state);
  res.json({ ok: true, dayCount: state.dayCount });
});

// ─── Missions CRUD ────────────────────────────────────────────────────────────

function generateDailyMissions() {
  const base = [
    { title: "Code for 1 hour",              xp: 50, category: "coding",    priority: "high"   },
    { title: "Solve 2 DSA problems",          xp: 40, category: "coding",    priority: "high"   },
    { title: "Study 1 roadmap topic",         xp: 30, category: "learning",  priority: "medium" },
    { title: "Practice English for 15 min",  xp: 20, category: "english",   priority: "medium" },
    { title: "Workout for 20 minutes",        xp: 20, category: "health",    priority: "medium" },
    { title: "Drink 3 litres of water",       xp: 10, category: "health",    priority: "low"    },
    { title: "Write in your journal",         xp: 10, category: "journal",   priority: "low"    },
  ];
  return base.map(m => ({ ...m, id: uid(), completed: false, createdAt: today(), archived: false }));
}

app.get("/api/missions", async (req, res) => {
  const state = await readState();
  if (state.missionDate !== today()) {
    state.missions = generateDailyMissions();
    state.missionDate = today();
    await writeState(state);
  }
  res.json(state.missions || []);
});

app.post("/api/missions", async (req, res) => {
  const state = await readState();
  const { title, xp, category, priority, deadline } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  const mission = {
    id: uid(), title, xp: xp || 20,
    category: category || "general",
    priority: priority || "medium",
    deadline: deadline || null,
    completed: false, archived: false, createdAt: today()
  };
  state.missions = state.missions || [];
  state.missions.push(mission);
  await writeState(state);
  res.json(mission);
});

app.put("/api/missions/:id", async (req, res) => {
  const state = await readState();
  const idx = (state.missions || []).findIndex(m => m.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  state.missions[idx] = { ...state.missions[idx], ...req.body, id: req.params.id };
  await writeState(state);
  res.json(state.missions[idx]);
});

app.delete("/api/missions/:id", async (req, res) => {
  const state = await readState();
  state.missions = (state.missions || []).filter(m => m.id !== req.params.id);
  await writeState(state);
  res.json({ ok: true });
});

// ─── Health log endpoints ─────────────────────────────────────────────────────

app.post("/api/health/workout", async (req, res) => {
  const state = await readState();
  const entry = { id: uid(), date: today(), ...req.body };
  state.health.workouts = state.health.workouts || [];
  state.health.workouts.push(entry);
  state.gamification.xp += 20;
  await writeState(state);
  res.json({ ok: true, entry, xpEarned: 20 });
});

app.post("/api/health/sleep", async (req, res) => {
  const state = await readState();
  const entry = { id: uid(), date: today(), ...req.body };
  state.health.sleepLog = state.health.sleepLog || [];
  state.health.sleepLog.push(entry);
  await writeState(state);
  res.json({ ok: true, entry });
});

app.post("/api/health/water", async (req, res) => {
  const state = await readState();
  const entry = { id: uid(), date: today(), litres: req.body.litres || 0 };
  state.health.waterLog = state.health.waterLog || [];
  state.health.waterLog.push(entry);
  await writeState(state);
  res.json({ ok: true, entry });
});

app.post("/api/health/mood", async (req, res) => {
  const state = await readState();
  const entry = { id: uid(), date: today(), mood: req.body.mood || 5, note: req.body.note || "" };
  state.health.moodLog = state.health.moodLog || [];
  state.health.moodLog.push(entry);
  await writeState(state);
  res.json({ ok: true, entry });
});

// ─── Journal endpoints ────────────────────────────────────────────────────────

app.post("/api/journal", async (req, res) => {
  const state = await readState();
  const entry = { id: uid(), date: today(), ...req.body, createdAt: new Date().toISOString() };
  state.journal.entries = state.journal.entries || [];
  state.journal.entries.unshift(entry);
  state.gamification.xp += 10;
  await writeState(state);
  res.json({ ok: true, entry, xpEarned: 10 });
});

app.put("/api/journal/:id", async (req, res) => {
  const state = await readState();
  const idx = (state.journal.entries || []).findIndex(e => e.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  state.journal.entries[idx] = { ...state.journal.entries[idx], ...req.body };
  await writeState(state);
  res.json(state.journal.entries[idx]);
});

app.delete("/api/journal/:id", async (req, res) => {
  const state = await readState();
  state.journal.entries = (state.journal.entries || []).filter(e => e.id !== req.params.id);
  await writeState(state);
  res.json({ ok: true });
});

// ─── Projects CRUD ────────────────────────────────────────────────────────────

app.get("/api/projects", async (req, res) => {
  const state = await readState();
  res.json(state.projects || []);
});

app.post("/api/projects", async (req, res) => {
  const state = await readState();
  const project = { id: uid(), status: "todo", progress: 0, createdAt: today(), ...req.body };
  state.projects = state.projects || [];
  state.projects.push(project);
  await writeState(state);
  res.json(project);
});

app.put("/api/projects/:id", async (req, res) => {
  const state = await readState();
  const idx = (state.projects || []).findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  state.projects[idx] = { ...state.projects[idx], ...req.body, id: req.params.id };
  if (state.projects[idx].status === "completed" && req.body.status === "completed") {
    state.gamification.xp += 500;
  }
  await writeState(state);
  res.json(state.projects[idx]);
});

app.delete("/api/projects/:id", async (req, res) => {
  const state = await readState();
  state.projects = (state.projects || []).filter(p => p.id !== req.params.id);
  await writeState(state);
  res.json({ ok: true });
});

// ─── Goals CRUD ───────────────────────────────────────────────────────────────

app.post("/api/goals", async (req, res) => {
  const state = await readState();
  const goal = { id: uid(), progress: 0, completed: false, createdAt: today(), ...req.body };
  state.goals = state.goals || [];
  state.goals.push(goal);
  await writeState(state);
  res.json(goal);
});

app.put("/api/goals/:id", async (req, res) => {
  const state = await readState();
  const idx = (state.goals || []).findIndex(g => g.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  state.goals[idx] = { ...state.goals[idx], ...req.body, id: req.params.id };
  await writeState(state);
  res.json(state.goals[idx]);
});

app.delete("/api/goals/:id", async (req, res) => {
  const state = await readState();
  state.goals = (state.goals || []).filter(g => g.id !== req.params.id);
  await writeState(state);
  res.json({ ok: true });
});

// ─── Export ───────────────────────────────────────────────────────────────────

app.get("/api/export/json", async (req, res) => {
  const state = await readState();
  res.setHeader("Content-Disposition", `attachment; filename=lifeos-backup-${today()}.json`);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(state, null, 2));
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/api/ping", (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }));

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 LifeOS 365 API → http://0.0.0.0:${PORT}\n`);
});
