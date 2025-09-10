import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Syllabus to Calendar',
  description: 'Upload a syllabus and automatically turn assignments, readings, and exams into tasks on a calendar.',
  keywords: ['syllabus', 'calendar', 'academic', 'ai', 'pdf', 'education'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    📅 Syllabus to Calendar
                  </h1>
                </div>
                <div className="text-sm text-gray-500">
                  Powered by AI
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-sm text-gray-500">
                <p>Built with TypeScript, Next.js, and OpenAI • For LawBandit Coding Challenge</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
