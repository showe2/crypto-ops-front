import React from "react";
import "./test.css";

export default function TestApp() {
  return (
    <div>
      {/* Test 1: Basic CSS */}
      <div className="test-red">
        🔥 TEST 1: If you see red background, CSS is loading!
      </div>

      {/* Test 2: Tailwind utilities */}
      <div className="bg-blue-500 text-white p-8 m-4 rounded-lg">
        🚀 TEST 2: If you see blue background, Tailwind is working!
      </div>

      {/* Test 3: More complex Tailwind */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 m-4 rounded-xl shadow-lg">
        ✨ TEST 3: If you see purple-pink gradient, Tailwind is fully working!
      </div>

      {/* Test 4: Dark theme like your app */}
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 p-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <h1 className="text-2xl font-bold text-indigo-400">
            🎯 TEST 4: Your app's dark theme should look like this!
          </h1>
        </div>
      </div>
    </div>
  );
}
