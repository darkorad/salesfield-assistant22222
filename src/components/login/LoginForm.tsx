
import React from "react";
import { NetworkStatus } from "@/hooks/useConnectionStatus";
import { NetworkStatusIndicator } from "./NetworkStatusIndicator";
import { DNSTroubleshootingInfo } from "./DNSTroubleshootingInfo";

interface LoginFormProps {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  syncing: boolean;
  networkStatus: NetworkStatus;
}

export const LoginForm = ({
  email,
  password,
  setEmail,
  setPassword,
  handleSubmit,
  loading,
  syncing,
  networkStatus
}: LoginFormProps) => {
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email-address" className="sr-only">
            Email adresa
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Email adresa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Lozinka
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading || syncing || networkStatus === 'offline'}
          className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
            networkStatus === 'offline' ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {loading || syncing ? (
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
          ) : null}
          {loading ? "Prijavljivanje..." : syncing ? "Sinhronizacija..." : "Prijavi se"}
        </button>
      </div>
      
      {/* Network status indicator */}
      <NetworkStatusIndicator status={networkStatus} />
      
      {/* DNS troubleshooting info */}
      <DNSTroubleshootingInfo />
    </form>
  );
};
