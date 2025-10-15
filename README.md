# Lucky Draw Frontend

A comprehensive Lucky Draw Management System built with React, TypeScript, and Tailwind CSS. This modern web application provides a complete solution for managing contests, participants, executing lucky draws, and tracking winners.

## Features

### Dashboard
- **Overview Statistics**: Real-time metrics for contests, participants, entries, and winners
- **Quick Stats**: Engagement rates, completion rates, and prize claim statistics
- **Notifications**: Contest closing alerts, pending draws, and prize distribution reminders
- **Participation trends**: Visual charts showing daily/weekly/monthly trends

### Contest Management
- **Create & Edit Contests**: Full form with name, theme, description, dates, and status
- **Prize Configuration**: Add multiple prizes with name, value, and quantity
- **Entry Rules**: Define participation rules and methods (QR, WhatsApp, Manual)
- **Contest History**: View all contests with filtering and search capabilities
- **Status Management**: Draft, Upcoming, Ongoing, Completed, Cancelled

### Participant Management
- **Comprehensive Table View**: Display all participants with filtering and search
- **Validation**: Automatic duplicate detection and validation
- **Import/Export**: CSV and Excel support for bulk operations
- **Entry Method Tracking**: Track how participants entered (QR, WhatsApp, Manual)
- **Duplicate Removal**: Identify and remove duplicate entries

### Lucky Draw Execution
- **Secure Random Selection**: Cryptographically secure random winner selection
- **Manual & Scheduled Draws**: Choose between immediate or scheduled draws
- **Live Draw Animation**: Engaging animated winner reveal
- **Re-draw Option**: Ability to re-execute draws if needed
- **Draw History**: Complete audit trail of all draws

### Winner Management
- **Winner List**: Comprehensive list with prize status tracking
- **Status Management**: Pending, Notified, Claimed, Dispatched, Delivered
- **Auto Notifications**: WhatsApp integration-ready for winner notifications
- **Export Reports**: Download winner reports in CSV format
- **Bulk Operations**: Send notifications to multiple winners at once

### Communication
- **Message Templates**: Pre-built templates for welcome, reminders, and results
- **Custom Messaging**: Send custom messages to selected participants
- **Message History**: Track all sent messages with status
- **Recipient Selection**: Target all participants, winners, or specific contests
- **Auto Messages**: Automated welcome, reminder, and result announcements

### Reports & Analytics
- **Participation trends**: Line charts showing growth over time
- **Contest Performance**: Bar charts comparing contest engagement
- **Entry Method Distribution**: Pie charts showing participation methods
- **Time-based Analysis**: Participation by time of day
- **Prize Statistics**: Claim rates and average claim times
- **Export Reports**: Download analytics in Excel/PDF format

### User & Role Management
- **Multiple Admin Accounts**: Support for multiple administrators
- **Role-based Permissions**: Super Admin, Admin, Moderator roles
- **Activity Logs**: Complete audit trail of all user actions
- **Two-Factor Authentication**: Optional 2FA for enhanced security
- **User Management**: Add, edit, and remove admin users

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Route guards for authenticated access
- **Encrypted Data**: Participant details encryption
- **Fraud Prevention**: Duplicate entry detection, IP/device tracking
- **Audit Trail**: Complete logging of all system activities
- **Session Management**: Configurable session timeouts

## Tech Stack

- **React 19.1.1**: Modern React with hooks
- **TypeScript 4.9.5**: Type-safe development
- **Tailwind CSS 4.1.13**: Utility-first CSS framework
- **React Router DOM 7.9.3**: Client-side routing
- **Zustand 4.4.6**: Lightweight state management
- **Chart.js 4.4.0**: Beautiful charts and graphs
- **Framer Motion 10.16.4**: Smooth animations
- **Lucide React 0.294.0**: Modern icon library
- **Axios 1.6.0**: HTTP client
- **React Hot Toast 2.4.1**: Toast notifications
- **XLSX 0.18.5**: Excel file handling
- **date-fns 2.30.0**: Date manipulation

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Lucky-Draw-Frontend
```
2. **Install dependencies**
```bash
npm install
```
3. **Configure environment variables**
```bash
cp .env.example .env
```
Edit `.env` and configure your API endpoint:
````
REACT_APP_API_URL=http://localhost:5000/api
```
4. **Start the development server**
```bash
npm start
```
The application will open at [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
```
This creates an optimized production build in the `build` folder.

## Project Structure

````
src/
components/
common/          # Reusable UI components
Button.tsx
Card.tsx
Input.tsx
Modal.tsx
Table.tsx
Badge.tsx
layout/          # Layout components
Layout.tsx
Sidebar.tsx
Header.tsx
contests/        # Feature-specific components
ContestForm.tsx
pages/               # Page components
auth/
Login.tsx
Dashboard.tsx
Contests.tsx
Participants.tsx
LuckyDraw.tsx
Winners.tsx
Communication.tsx
Analytics.tsx
Users.tsx
Settings.tsx
store/               # State management
authStore.ts
notificationStore.ts
types/               # TypeScript types
index.ts
utils/               # Utility functions
api.ts
helpers.ts
routes/              # Route configuration
ProtectedRoute.tsx
App.tsx              # Main app component
index.tsx            # Entry point
```
## Default Login Credentials

For demo purposes, you can use any email and password:
- **Email**: admin@example.com
- **Password**: any password

## UI/UX Features

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive**: Fully responsive design for all screen sizes
- **Dark Mode Ready**: Architecture supports dark mode implementation
- **Smooth Animations**: Framer Motion for delightful interactions
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Clear loading indicators for async operations
- **Error Handling**: Graceful error messages and fallbacks

## Configuration

### Tailwind CSS
The project uses Tailwind CSS with custom configuration in `tailwind.config.js`:
- Custom color palette (primary colors)
- Custom animations
- Extended theme

### Environment Variables
- `REACT_APP_API_URL`: Backend API endpoint
- `REACT_APP_APP_NAME`: Application name
- `REACT_APP_VERSION`: Application version

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**Note: this is a one-way operation!** Ejects from Create React App

## Deployment

The application can be deployed to:
- **Vercel**: `vercel --prod`
- **Netlify**: Connect your repository
- **AWS S3 + CloudFront**: Upload build folder
- **Docker**: Create a Dockerfile with nginx

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Known Issues

The lint warnings about `@tailwind` and `@apply` directives are expected and can be ignored. These are Tailwind CSS directives that work correctly at runtime.

## Support

For support, email support@example.com or open an issue in the repository.

## Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors

---
