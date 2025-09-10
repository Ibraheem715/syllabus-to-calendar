# 📅 Syllabus to Calendar

> **LawBandit Coding Challenge Submission**

Upload a syllabus PDF and automatically extract assignments, readings, and exams into a beautiful calendar interface. Built with TypeScript, Next.js, and OpenAI for intelligent content extraction.

## 🌟 Features

- **AI-Powered Extraction**: Uses OpenAI GPT-4 to intelligently parse syllabus content
- **PDF Processing**: Handles text-based PDF files with robust validation
- **Interactive Calendar**: Beautiful calendar view with event indicators and details
- **Event Management**: Edit, create, and delete events with a user-friendly interface
- **Multiple Export Options**: Download as .ics file for importing into any calendar app
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Type Safety**: Built with TypeScript for reliability and maintainability

## 🚀 Live Demo

**Deployed App**: [Coming Soon - Will be deployed to Vercel]
**GitHub Repository**: https://github.com/Ibraheem715/syllabus-to-calendar

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **AI Processing**: OpenAI GPT-4 API
- **PDF Processing**: pdf-parse library
- **Calendar UI**: react-calendar, Lucide React icons
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with custom calendar styles

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- OpenAI API key (required for AI processing)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Ibraheem715/syllabus-to-calendar.git
cd syllabus-to-calendar
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy the example file
cp env.example .env.local
```

Add your OpenAI API key to `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 5. Upload a Syllabus

1. Click "browse" or drag & drop a PDF syllabus
2. Wait for AI processing (30-60 seconds)
3. Review extracted events in calendar view
4. Edit events as needed
5. Export to your preferred calendar app

## 📖 How It Works

### 1. PDF Processing Pipeline

```typescript
// Extract text from PDF
const extractedText = await PDFProcessor.processForAI(buffer);

// Validate PDF format and content
if (!PDFProcessor.validatePDFBuffer(buffer)) {
  throw new Error('Invalid PDF file');
}
```

### 2. AI Content Extraction

The app uses OpenAI GPT-4 with a specialized prompt to extract structured data:

```typescript
const syllabusProcessor = new SyllabusProcessor();
const processedSyllabus = await syllabusProcessor.extractEventsWithFallback(extractedText);
```

The AI identifies:
- Assignment due dates
- Exam schedules  
- Reading deadlines
- Project milestones
- Class sessions
- Event types and priorities

### 3. Calendar Generation

Events are displayed in both calendar and list views with:
- Color-coded priority indicators
- Event type icons
- Interactive editing capabilities
- Export functionality

## 🎯 Project Structure

```
syllabus-to-calendar/
├── src/
│   ├── app/
│   │   ├── api/process-syllabus/    # API endpoint for PDF processing
│   │   ├── globals.css             # Global styles and calendar CSS
│   │   ├── layout.tsx              # Root layout component
│   │   └── page.tsx                # Main page component
│   ├── components/
│   │   ├── FileUpload.tsx          # Drag & drop file upload
│   │   ├── CalendarView.tsx        # Calendar display and interaction
│   │   └── EventEditor.tsx         # Event creation/editing modal
│   ├── lib/
│   │   ├── pdf-parser.ts           # PDF text extraction utilities
│   │   ├── openai-client.ts        # OpenAI API integration
│   │   └── google-calendar.ts      # Google Calendar API (future)
│   └── types/
│       └── syllabus.ts             # TypeScript type definitions
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🔧 Configuration Options

### OpenAI Settings

The app uses GPT-4 for best accuracy, with GPT-3.5-turbo as fallback:

```typescript
// Primary processing with GPT-4
model: 'gpt-4',
temperature: 0.1,  // Low temperature for consistent results
max_tokens: 3000,
```

### PDF Processing

- Maximum file size: 10MB
- Supported format: Text-based PDFs only
- Automatic validation and error handling
- OCR detection for scanned documents

### Calendar Features

- Multiple view modes (calendar/list)
- Event priority color coding
- Custom event types with icons
- .ics export for universal compatibility

## 🎨 Design Approach

### User Experience

1. **Simplicity First**: Clean, intuitive interface with clear visual hierarchy
2. **Progressive Disclosure**: Show basic info first, detailed editing on demand
3. **Visual Feedback**: Loading states, success/error messages, and progress indicators
4. **Mobile Responsive**: Optimized for all screen sizes

### AI Integration Strategy

1. **Robust Prompting**: Carefully crafted prompts for consistent extraction
2. **Fallback Handling**: Multiple model options and graceful error recovery
3. **Validation Pipeline**: Multi-layer validation of AI responses
4. **Cost Optimization**: Intelligent token management and caching

## 🚨 Error Handling

The application includes comprehensive error handling:

- **PDF Validation**: File type, size, and content validation
- **AI Processing**: Timeout handling and model fallbacks  
- **Network Issues**: Retry logic and user feedback
- **Data Validation**: Type checking and sanitization

## 🔮 Future Enhancements

- [ ] Google Calendar direct sync
- [ ] OCR support for scanned PDFs
- [ ] Recurring event detection
- [ ] Multiple syllabus management
- [ ] Collaborative editing
- [ ] Mobile app version

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**: Add `OPENAI_API_KEY` in Vercel dashboard
3. **Deploy**: Automatic deployment on push to main branch

```bash
# Manual deployment
npx vercel --prod
```

### Environment Variables for Production

```env
OPENAI_API_KEY=your_production_openai_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 📊 Performance Considerations

- **File Processing**: Chunked processing for large PDFs
- **AI Calls**: Request debouncing and caching
- **Bundle Size**: Code splitting and lazy loading
- **Rendering**: Server-side rendering for SEO

## 🤝 Contributing

This project was built for the LawBandit coding challenge. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 👨‍💻 About This Submission

**Challenge**: LawBandit Coding Challenge - Syllabus to Calendar Feature
**Timeline**: September 10-19, 2025
**Submission**: Built in TypeScript + Node.js, deployed on Vercel

### Key Implementation Highlights

1. **AI-First Approach**: Leverages OpenAI for intelligent content extraction
2. **Production Ready**: Comprehensive error handling and validation
3. **User-Centric Design**: Intuitive interface with progressive enhancement
4. **Scalable Architecture**: Modular design for easy extension
5. **Type Safety**: Full TypeScript implementation

---

**Built with ❤️ for the LawBandit Coding Challenge**