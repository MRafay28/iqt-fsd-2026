# Code review and architecture

## What steps would you take to secure a web application?

Start at the trust boundary. Treat every request as untrusted: validate the body, the query string, and route params with a schema before they reach business logic, and keep database access parameterized. This API does that with Zod and Prisma.

Authentication should prove who the caller is, with a session cookie or a short-lived access token. Authorization should decide what that caller may read or change. This assessment app has no accounts. In production the next step would be per-user ownership, checked on every read and write.

Secrets stay in the environment or a secret manager, never in git. HTTPS terminates in front of the app. Security headers (Helmet here), a tight CORS allowlist, and a small JSON body limit reduce easy abuse. If passwords are added, hash them with a slow algorithm. Cookies should be HttpOnly, Secure, and SameSite.

Least privilege applies to the database user, cloud roles, and admin routes. Dependencies are updated and scanned. Errors returned to the client stay generic; the server log keeps the detail. Rate limits and audit logs belong on login and on write endpoints.

## How would you improve the performance of a slow React application?

Measure before changing code. The React DevTools profiler, the browser performance panel, and the network waterfall show whether the cost is rendering, fetching, or the bundle.

If rendering is slow, stop unnecessary updates. Keep state local, split large components so a keystroke does not rerender the whole page, and memoize only values that profiling shows are expensive. Pass stable callbacks where children are memoized. Long lists should be virtualized. In a hot list, avoid fresh objects and inline functions that defeat that memoization.

If data is slow, fetch in parallel, cache responses, and remove waterfalls. Show a skeleton instead of blocking the page. Do not refetch the full list when a single task changes.

If the bundle is slow, inspect it, import heavy libraries only where they are used, and keep client components at the leaves. Give images real dimensions through the framework image component.

Profile again after each change. A fast app is one you measured.

## Explain the difference between SQL and NoSQL databases and when you would use each.

SQL databases store rows in tables with a declared schema, relations, and transactions. PostgreSQL is the database for this task app. A task has a title, an optional description, a completed flag, and timestamps. Those fields are known up front, and the screen is a simple ordered query. Constraints and the index on `created_at` protect the data and keep that query cheap. Use SQL when the shape is stable, you need joins or transactions, and correctness matters. Orders, accounts, and tasks fit this.

NoSQL databases such as MongoDB store documents. The shape can vary per record, and related data is often embedded so one screen can be read in one query. Use NoSQL when the shape changes often, when you store large or nested documents, or when a specific access pattern needs to scale horizontally. A catalog with different attributes per category, or an activity log, can fit.

Neither is faster by default. Pick the model from how the data is queried and how often the shape changes. This project uses SQL because a task is a small, consistent record.

## How would you deploy a full-stack application to AWS, Azure, or Google Cloud?

I would deploy this stack on AWS and keep the three processes separate.

The Next.js client can go on Amplify, which builds from Git and serves the app through CloudFront. The Express API is a long-running Node process, so I would put it in a container and run it on App Runner. ECS Fargate is the alternative when the API must sit in a private network. PostgreSQL moves to RDS in a private subnet. The API accepts traffic only from App Runner or the load balancer, and RDS accepts traffic only from the API.

Configuration stays out of the image. `DATABASE_URL`, `CLIENT_ORIGIN`, and `PORT` come from Secrets Manager and are injected at runtime. The client build receives `NEXT_PUBLIC_API_URL` for the public API domain. Certificates come from ACM.

GitHub Actions runs on pull requests: install, lint, and test against a disposable database. On main it builds the image, pushes to ECR, runs `prisma migrate deploy`, and updates App Runner. Logs go to CloudWatch. RDS backups and a Multi-AZ setting cover the database.
