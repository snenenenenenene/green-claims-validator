# Lutrify - Green Claims Validator

Lutrify is a user-friendly platform for validating environmental claims. It provides administrative tools, user management, and document handling functionalities tailored to assist organizations in verifying their green claims with precision.

## Table of Contents
1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API Routes](#api-routes)
5. [Components](#components)
6. [Development Status](#development-status)

---

## Features

### 1. Claim Management
   - Users can submit new environmental claims.
   - Admins review, approve, or reject supporting documents for these claims.
   - Track progress and status of individual claims.

### 2. User Management
   - Admin dashboard allows management of users and their associated claims.
   - Filter, search, and update roles (admin/user) for each user.

### 3. Document Management
   - Users upload documents supporting their claims.
   - Admins review each document, with options to approve or reject.
   - View, download, and add review notes to uploaded documents.

### 4. Question Flow Configuration
   - **Dashboard-based Flow Creation**: Lutrify includes an intuitive dashboard where admins can create and configure question flows.
   - **Node-based Flow Chart**: Questions are defined as nodes within flow charts, allowing the configuration of complex, logic-based questionnaires.
   - **Questionnaire Translation**: Configured flows are translated into actual questionnaires, dynamically adjusting based on user responses.

## Installation

To set up Lutrify locally, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/snenenenenenene/lutrify.git
    ```

2. Navigate to the project directory and install dependencies:
    ```bash
    cd lutrify
    npm install
    ```

3. Set up environment variables:
   - Create an `.env` file using the template provided in `.env.example`.

4. Run database migrations:
    ```bash
    npx prisma migrate dev
    ```

5. Start the development server:
    ```bash
    npm run dev
    ```

## Usage

1. **Admin Dashboard**  
   Access the Admin Dashboard for user management and claim review at `/admin`.
   
2. **Claim Submission**  
   Users can submit claims on the homepage, with options to add supporting documents.

3. **Document Review**  
   Admins can review uploaded documents via the claim management interface.

## API Routes

### Admin API Endpoints
   - **`/api/admin/claims`**: Fetches all claims for admin review.
   - **`/api/admin/users-with-claims`**: Retrieves users along with their claim summaries.
   - **`/api/admin/users`**: Manages user information, including role updates.

### Auth API Endpoint
   - **`/api/auth/[...nextauth]`**: Manages user authentication with NextAuth.

### Claims API Endpoints
   - **`/api/claims`**: Manages the creation and retrieval of claims.
   - **`/api/claim`**: Single claim creation and update functionalities.

### Document API Endpoint
   - **`/api/documents`**: Handles document uploads and reviews, including file retrieval.

### Payment API Endpoints
   - **`/api/payments/history`**: Retrieves payment history for users.

## Components

1. **ClaimsReviewList**  
   Displays a list of claims with document statuses, sorting, and filtering options for admin review.

2. **DocumentGrid**  
   Showcases document previews, including details, approval status, and download options.

3. **Layout Components**  
   - **Footer** and **Navbar** components for consistent navigation across the application.
   - **Breadcrumbs** in `ClaimsLayout` for intuitive navigation within claim details.

4. **3D Model Integration**  
   Incorporates an interactive 3D Earth model on the homepage, powered by React Three Fiber, enhancing visual engagement.

## Database

- Prisma is used for database management, providing a seamless integration with various data models such as User, Claims, and Documents.

## Development Status

### Completed Tasks
- Flow chart editor configuration for questionnaires.
- Ability to remove nodes.
- Automatic question generation based on flow chart configuration.
- Configuration of questions on a single page or multiple pages.
- Checkbox option for single-page view of questions.
- Account creation and validation progress indicators.

### Ongoing Development
- Implementation of version tracking for configurations.
- Configuration management for greenwashing percentage thresholds.
- User credit management and credit purchasing features.
- Audit trail functionality for changes in configuration.

---