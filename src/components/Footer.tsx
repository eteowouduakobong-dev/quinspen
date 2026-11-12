"use client";

import React from "react";
import Link from "next/link";
import { Feather, ShieldCheck, Lock, Heart, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-stone-800/80 bg-stone-950 text-stone-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: Brand & Philosophy */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Feather className="w-4 h-4" />
            </div>
            <span className="font-serif text-lg font-bold text-stone-100 tracking-wider">
              QUINSPEN
            </span>
          </div>
          <p className="text-sm text-stone-400 max-w-md leading-relaxed">
            QUINSPEN is a sacred digital journal for the unspoken thoughts and raw experiences humanity buries beneath daily routines. We believe that when identity is detached from story, truth becomes pure.
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <span className="flex items-center space-x-1.5 text-stone-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Identity Exposure</span>
            </span>
            <span className="flex items-center space-x-1.5 text-stone-300">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Private Chronicle Storage</span>
            </span>
            <span className="flex items-center space-x-1.5 text-stone-300">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Masked Peer Whispers</span>
            </span>
          </div>
        </div>

        {/* Col 2: Circles */}
        <div>
          <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
            Story Circles
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/circles" className="hover:text-amber-300 transition-colors">
                Midnight Confessions
              </Link>
            </li>
            <li>
              <Link href="/circles" className="hover:text-amber-300 transition-colors">
                Unspoken Love
              </Link>
            </li>
            <li>
              <Link href="/circles" className="hover:text-amber-300 transition-colors">
                Healing & Grief
              </Link>
            </li>
            <li>
              <Link href="/circles" className="hover:text-amber-300 transition-colors">
                Career & Burnout
              </Link>
            </li>
            <li>
              <Link href="/circles" className="hover:text-amber-300 transition-colors">
                Secret Dreams & Musings
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Safe Harbor & Anonymity */}
        <div>
          <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
            Safe Harbor
          </h4>
          <p className="text-xs text-stone-400 leading-relaxed mb-3">
            If you are undergoing severe distress or thoughts of self-harm, please connect with compassionate support:
          </p>
          <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300">
            <p className="font-semibold text-stone-200">Crisis Lifeline: 988</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Free, confidential 24/7 support</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-stone-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
        <p>© 2026 QUINSPEN. Written by anonymous souls everywhere.</p>
        <p className="flex items-center space-x-1 mt-2 sm:mt-0">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1 inline" />
          <span>for human vulnerability. Built on Next.js & Supabase.</span>
        </p>
      </div>
    </footer>
  );
}
