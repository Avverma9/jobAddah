# API List

This file documents the APIs used in the jobsaddah project.

## Base URL

The base URL for the API is:

```
http://localhost:5000/api/v1
```

or for production:

```
https://jobsaddah.onrender.com/api/v1
```

## Endpoints

Here is a list of the endpoints used in the application:

- `GET /get-jobs?postType=PRIVATE_JOB`: Fetches private job postings.
- `GET /scrapper/get-categories`: Retrieves categories for the scrapper.
- `POST /scrapper/scrape-category`: Triggers the scrapper to scrape a category.
- `GET /get-all`: Fetches all job postings.
- `GET /get-post/details?url=<url>`: Fetches details for a specific post by URL.
- `POST /log-visit`: Logs a visit to the site.
- `GET /get-sections`: Retrieves sections for the homepage.
- `POST /get-postlist`: Fetches a list of posts.
- `GET /reminders/expiring-jobs`: Gets reminders for expiring jobs.
- `GET /fav-posts`: Fetches favorite posts.
- `POST /ai-chat`: Sends a message to the AI chat.
- `GET /posts`: Used to generate the sitemap.

