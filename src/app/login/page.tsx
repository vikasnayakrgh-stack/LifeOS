import { login, signup, guestLogin } from './actions'

export default function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; message?: string }>
}) {
    return (
        <LoginContent searchParams={searchParams} />
    )
}

async function LoginContent({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; message?: string }>
}) {
    const params = await searchParams

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
            {/* Ambient glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">L</span>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Life OS
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm">Revenue-first execution system</p>
                </div>

                {/* Card */}
                <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    {params?.error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {params.error}
                        </div>
                    )}

                    {params?.message && (
                        <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                            {params.message}
                        </div>
                    )}

                    <form className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                minLength={6}
                                className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all"
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <button
                                formAction={login}
                                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 active:scale-[0.98]"
                            >
                                Sign In
                            </button>

                            <button
                                formAction={signup}
                                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl border border-white/10 transition-all duration-200 active:scale-[0.98]"
                            >
                                Create Account
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-gray-500">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Guest Login */}
                    <form>
                        <button
                            formAction={guestLogin}
                            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 hover:from-amber-600/30 hover:to-orange-600/30 text-amber-400 font-medium rounded-xl border border-amber-500/20 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span>👤</span> Try as Guest — with demo data
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    Built for execution, not distraction.
                </p>
            </div>
        </div>
    )
}
