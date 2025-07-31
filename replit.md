# Adult Dyslexia Assessment Survey

## Overview

This is a frontend web application that provides an interactive adult dyslexia assessment survey. The application is built as a static website using vanilla HTML, CSS, and JavaScript. It features accessibility-focused design with text-to-speech functionality, allowing users to have questions read aloud to accommodate reading difficulties commonly associated with dyslexia.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a simple client-side architecture:

- **Frontend Only**: Pure HTML/CSS/JavaScript with no backend dependencies
- **Static Hosting**: Designed to be deployed on any static web hosting platform
- **Accessibility First**: Built with dyslexic users in mind, featuring audio support and clear visual design
- **Progressive Enhancement**: Core functionality works without JavaScript, with audio features as an enhancement

## Key Components

### 1. User Interface (index.html)
- **Purpose**: Main survey interface with questions organized into categories
- **Structure**: Form-based layout with radio button responses
- **Accessibility**: Speaker icons for text-to-speech functionality on every question

### 2. Styling System (styles.css)
- **Design Approach**: Modern gradient-based design with high contrast
- **Responsive Layout**: Mobile-first design with flexible containers
- **Visual Hierarchy**: Clear categorization and progress indication
- **Accessibility Features**: High contrast colors and readable typography

### 3. Interactive Features (script.js)
- **Text-to-Speech**: Web Speech API integration for audio accessibility
- **Progress Tracking**: Visual progress bar for survey completion
- **Form Validation**: Client-side validation for survey responses
- **State Management**: Handles audio playback states and user interactions

## Data Flow

1. **User Interaction**: User clicks speaker icons or fills out form fields
2. **Audio Processing**: Text-to-speech converts question text to speech using browser APIs
3. **Progress Tracking**: Form completion percentage calculated and displayed
4. **Local Processing**: All data processing happens client-side
5. **Result Generation**: Survey scoring and recommendations generated locally

## External Dependencies

### Browser APIs
- **Web Speech API**: For text-to-speech functionality
- **DOM APIs**: For form handling and UI interactions

### Third-Party Services
- **None**: The application is completely self-contained with no external API calls

### Fonts and Assets
- **System Fonts**: Uses device default fonts (Segoe UI, Tahoma, etc.)
- **SVG Icons**: Inline SVG speaker icons for audio controls

## Deployment Strategy

### Static Hosting
- **Target Platforms**: Netlify, Vercel, GitHub Pages, or any static hosting service
- **Build Process**: No build step required - direct file serving
- **CDN Ready**: All assets are self-contained for CDN distribution

### Browser Compatibility
- **Modern Browsers**: Requires ES6+ support for full functionality
- **Graceful Degradation**: Core survey works without JavaScript
- **Progressive Enhancement**: Audio features enhance but don't block basic usage

### Performance Considerations
- **Lightweight**: Minimal file sizes with no external dependencies
- **Fast Loading**: All resources load from single domain
- **Offline Capable**: Can work offline once initially loaded

## Technical Decisions

### Why Vanilla JavaScript?
- **Simplicity**: No framework overhead for straightforward interactive features
- **Accessibility**: Direct control over DOM for screen reader compatibility
- **Performance**: Minimal bundle size for faster loading

### Why Client-Side Only?
- **Privacy**: No server-side data storage protects user privacy
- **Simplicity**: Easier deployment and maintenance
- **Cost**: No backend infrastructure costs

### Why Web Speech API?
- **Native Integration**: Built into modern browsers
- **No Dependencies**: Avoids third-party audio service costs
- **Accessibility**: Essential for dyslexic users who struggle with reading