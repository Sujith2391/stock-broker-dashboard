# Stock Broker Dashboard

A real-time stock broker dashboard application featuring live stock price updates, user authentication, and ticker subscriptions.

## Features

- **Real-time Stock Prices**: Live updates using Socket.IO.
- **User Authentication**: Simple email-based login (mock authentication).
- **Subscriptions**: Users can subscribe to specific stock tickers to track them.
- **Interactive Dashboard**: View and manage subscribed stocks.

## Tech Stack

### Frontend (`/client`)
- **React**: UI library.
- **Vite**: Build tool.
- **TailwindCSS**: Styling.
- **Zustand**: State management.
- **Socket.IO Client**: Real-time communication.

### Backend (`/server`)
- **Node.js**: Runtime environment.
- **Express**: Web framework.
- **Socket.IO**: Real-time server logic.

## Getting Started

### Prerequisites
- Node.js installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```

2.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd server
    npm run dev
    # Server runs on http://localhost:3000
    ```

2.  **Start the Frontend Client:**
    ```bash
    cd client
    npm run dev
    # Client runs on http://localhost:5173 (or similar)
    ```

Open your browser and navigate to the client URL to use the application.
