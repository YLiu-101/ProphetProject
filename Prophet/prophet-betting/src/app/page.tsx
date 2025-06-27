export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header will be created as a component */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Prophet</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Prophet
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create and bet on anything. From personal goals to real-world events, 
            let friends or AI decide the outcome.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Create Bet Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create a Bet
            </h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Bet title (e.g., I'll get a 4.0 GPA this semester)" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea 
                placeholder="Describe your bet and terms..." 
                className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Choose arbitrator type</option>
                <option value="friend">Friend/Family</option>
                <option value="ai">AI Arbitrator</option>
              </select>
              <input 
                type="email" 
                placeholder="Arbitrator email (if friend)" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input 
                type="datetime-local" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Create Bet
              </button>
            </div>
          </div>

          {/* Active Bets Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Active Bets
            </h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">I&apos;ll finish my marathon under 4 hours</h3>
                <p className="text-sm text-gray-600 mt-1">by @john_doe • Friend arbitrator</p>
                <p className="text-sm text-gray-500 mt-2">Deadline: Dec 15, 2024</p>
                <div className="mt-3 flex gap-2">
                  <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                    Bet Yes ($10)
                  </button>
                  <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                    Bet No ($10)
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Bitcoin will hit $100k this year</h3>
                <p className="text-sm text-gray-600 mt-1">by @crypto_fan • AI arbitrator</p>
                <p className="text-sm text-gray-500 mt-2">Deadline: Dec 31, 2024</p>
                <div className="mt-3 flex gap-2">
                  <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                    Bet Yes ($25)
                  </button>
                  <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                    Bet No ($25)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Personal Goals</h3>
            <p className="text-gray-600">Bet on your own achievements and stay motivated</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-lg font-semibold mb-2">Friend Arbitrators</h3>
            <p className="text-gray-600">Have trusted friends verify bet outcomes</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">AI Verification</h3>
            <p className="text-gray-600">Let AI decide with appeal options available</p>
          </div>
        </div>
      </main>
    </div>
  );
}
