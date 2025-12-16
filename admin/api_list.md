# Project API Endpoints

This file lists all the API endpoints used in the project. The base URL for all endpoints is `https://jobaddah.onrender.com/api/v1`.

## Sidebar Items

- **GET /sidebar/items**
  - Fetches all sidebar items.

- **PUT /sidebar/items/:id**
  - Updates a specific sidebar item.

- **POST /sidebar/items**
  - Creates a new sidebar item.

- **DELETE /sidebar/items/:id**
  - Deletes a specific sidebar item.

- **POST /sidebar/items/:id/assign**
  - Assigns a menu item to a user or role.

## Users

- **GET /users**
  - Fetches all users.

- **PUT /users/:id/ban**
  - Bans or unbans a user.

- **PUT /users/:id/role**
  - Updates the role of a user.

- **PUT /users/:id/permissions**
  - Updates the permissions for a user.

## Ad Config

- **GET /ad-config**
  - Fetches the ad configuration.

- **POST /ad-config/global**
  - Updates the global ad configuration.

- **POST /ad-config/page/:page**
  - Updates the ad configuration for a specific page.

- **POST /ad-config/slot/:slot**
  - Updates the ad configuration for a specific ad slot.

- **POST /ad-config/emergency-disable**
  - Disables all ads in an emergency.

- **POST /ad-config/enable**
  - Enables ads.

## Jobs

- **GET /jobs**
  - Fetches all jobs.
