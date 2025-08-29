# Overview

This is a full-stack AI-powered virtual salon booking application for "Goodness Glamour Ladies & Kids Salon". The system is designed for a virtual salon that provides premium doorstep hair services for women and children. The application combines a modern React frontend with an Express.js backend to provide customers with an interactive booking experience. The core feature is an AI chat agent that helps customers discover hair services, answer questions, and facilitate bookings through natural conversation. The application includes QR code scanning functionality for easy access to AI services, comprehensive hair service management, and a complete booking system for doorstep appointments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for consistent, accessible interface elements
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Form Handling**: React Hook Form with Zod schema validation for type-safe form processing

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API endpoints following conventional HTTP methods
- **Data Access**: In-memory storage with interface-based architecture allowing future database integration
- **Middleware**: Custom logging middleware for API request tracking and error handling

## Data Storage Solutions
- **Database ORM**: Drizzle ORM configured for PostgreSQL with type-safe schema definitions
- **Current Storage**: Memory-based storage implementation with predefined service data
- **Schema Management**: Shared TypeScript schema definitions between frontend and backend
- **Migration System**: Drizzle-kit for database schema migrations and management

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Security**: CORS handling and request validation middleware
- **API Protection**: Error handling middleware for consistent error responses

## External Dependencies

### AI Services
- **OpenAI GPT API**: Core conversational AI for customer interactions and service recommendations
- **Integration**: Custom AI service class for managing chat sessions and conversation state

### Database Services
- **Neon Database**: Serverless PostgreSQL database for production data storage
- **Connection**: @neondatabase/serverless driver for database connectivity

### Development Tools
- **Replit Integration**: Custom development banner and runtime error overlay for Replit environment
- **Build System**: ESBuild for server-side bundling and Vite for client-side assets
- **Type Checking**: TypeScript compiler with strict mode for comprehensive type safety

### UI and Styling
- **Component Library**: Extensive Radix UI components for accessibility-first interface elements
- **Icons**: Lucide React for consistent iconography throughout the application
- **Fonts**: Google Fonts integration with Playfair Display and Inter font families
- **Responsive Design**: Mobile-first approach with custom breakpoints and responsive utilities