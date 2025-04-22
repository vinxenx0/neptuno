
# Neptuno Setup Wizard

The Neptuno Setup Wizard helps you configure your entire Neptuno stack with a user-friendly interface.

## Features

- Project and GitHub configuration
- Environment settings
- Server and database setup
- Authentication providers configuration
- Redis cache settings
- Frontend framework selection
- Load balancing configuration
- Nginx server settings
- Docker containers fine-tuning

## Requirements

- Node.js 18 or higher
- npm or yarn package manager
- Git installed for repository configuration

## Getting Started

1. Clone this repository:
```bash
git clone https://github.com/yourusername/neptuno-setup
cd neptuno-setup
```

2. Install dependencies:
```bash
npm install
```

3. Start the setup wizard:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

5. Follow the wizard steps to configure your Neptuno stack

## Configuration Steps

1. **Project Setup**: Configure basic project info and GitHub repository
2. **Environment**: Set up development/production environment variables
3. **Server**: Configure your backend server, database, and load balancing
4. **Auth**: Set up authentication providers (Google, Meta)
5. **Redis**: Configure Redis cache settings
6. **Frontend**: Select and configure your frontend framework
7. **Docker**: Fine-tune your Docker containers and services
8. **Nginx**: Configure your Nginx server settings

## Output

The wizard generates:
- A complete `.env` file with all your configurations
- Nginx configuration file
- Docker Compose configuration
- Server deployment files

## Support

For issues and feature requests, please open an issue in the GitHub repository.
