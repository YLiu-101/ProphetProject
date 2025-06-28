import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // For now, we'll show a placeholder. Later we'll fetch real bets from the database
  const mockBets = [
    {
      id: 1,
      title: "I'll finish my marathon under 4 hours",
      creator: "John Doe",
      arbitrator_type: "friend",
      deadline: "Dec 15, 2024",
      participants: 3
    },
    {
      id: 2,
      title: "Bitcoin will hit $100k this year",
      creator: "Crypto Fan",
      arbitrator_type: "ai",
      deadline: "Dec 31, 2024",
      participants: 12
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Prophet</h1>
              <span className="ml-2 text-sm text-gray-500">Beta</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.user_metadata?.full_name || user.email}</span>
              <Link
                href="/create"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create Bet
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Active Bets</h2>
          <p className="text-gray-600">Join bets or create your own</p>
        </div>

        {/* Bet Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockBets.map((bet) => (
            <div key={bet.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{bet.title}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>by {bet.creator}</p>
                <p>{bet.arbitrator_type === 'ai' ? '🤖 AI Arbitrator' : '👥 Friend Arbitrator'}</p>
                <p>Deadline: {bet.deadline}</p>
                <p>{bet.participants} participants</p>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 py-2 px-3 rounded-lg text-sm font-medium">
                  Bet Yes
                </button>
                <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 py-2 px-3 rounded-lg text-sm font-medium">
                  Bet No
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockBets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎲</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No active bets</h3>
            <p className="text-gray-600 mb-6">Be the first to create a bet and get others to join!</p>
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Your First Bet
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
