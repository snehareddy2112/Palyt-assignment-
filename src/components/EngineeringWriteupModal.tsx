import React from 'react';
import { X, BookOpen, ShieldCheck, Scale, Cpu } from 'lucide-react';

interface EngineeringWriteupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EngineeringWriteupModal: React.FC<EngineeringWriteupModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 rounded-t-3xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[#FF7A00]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Engineering Write-up & Design Decisions</h3>
              <p className="text-xs text-slate-400 font-medium">Palyt Engineering Intern Task Submission Document</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close write-up"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs leading-relaxed text-slate-300">
          {/* Section 1: The Calls Made */}
          <section className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#FF7A00]" />
              1. Architectural Calls & Domain Edge Cases
            </h4>
            <div className="space-y-3">
              <div>
                <strong className="text-slate-200 block text-[13px]">Deleting Ingredients Used by Recipes:</strong>
                <p className="mt-0.5">
                  <span className="text-[#FF7A00] font-bold">Policy:</span> We strictly prevent deleting ingredients that are referenced by active recipes (e.g. <code>Cashews</code> or <code>Paneer</code>). The system inspects reverse dependencies and provides an explicit list of blocking dishes. Unused items (like <code>Bay Leaves</code> and <code>Saffron</code>) can be deleted safely.
                </p>
                <p className="mt-1 text-slate-400">
                  <span className="text-slate-300 font-semibold">Rationale:</span> In real restaurant operations, deleting an active ingredient corrupts recipe definitions and leads to runtime crashes during order calculation. Deletion must require either archiving or decoupling recipes first.
                </p>
              </div>

              <div>
                <strong className="text-slate-200 block text-[13px]">Mixed Unit Normalization Layer:</strong>
                <p className="mt-0.5">
                  Stock is purchased in bulk (<code>kg</code>, <code>L</code>), while kitchen prep is measured in portions (<code>g</code>, <code>ml</code>). We built a dedicated, pure conversion module (<code>src/domain/units.ts</code>) using base metric units (grams and millilitres) with <code>1 kg = 1000 g</code> and <code>1 L = 1000 ml</code>. Cross-dimension conversions (e.g. mass to volume) are rejected with strict error boundaries.
                </p>
              </div>

              <div>
                <strong className="text-slate-200 block text-[13px]">Dataset Nuance Noted:</strong>
                <p className="mt-0.5">
                  In the supplied data, <code>Refined Flour</code> (Butter Naan) and <code>Cumin Seeds</code> (Veg Pulao, Jeera Rice) exist in <code>recipes.json</code> but were omitted from <code>stock.json</code>. We handle missing items gracefully: they default to stock = 0, automatically marking those dishes as Unavailable until added to inventory.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: How Correctness Was Checked */}
          <section className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              2. Verification & Testing Strategy
            </h4>
            <div className="space-y-2">
              <p>
                We implemented <strong>50 automated unit & integration tests</strong> in Vitest covering:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 font-medium">
                <li><strong>Unit conversions:</strong> Exact factors, decimal rounding (preventing JS floating drift like <code>1.4 - 0.18 = 1.22</code>), and illegal conversion rejection.</li>
                <li><strong>Availability rules:</strong> Ingredient above par, at par, below par, missing items, and multi-ingredient compound failures.</li>
                <li><strong>Atomic ordering:</strong> Multi-ingredient cross-unit deductions and complete rollback if stock is physically insufficient.</li>
                <li><strong>Dependency enforcement:</strong> Blocking delete on multi-recipe ingredients and permitting delete on unused items.</li>
                <li><strong>Form validation:</strong> Rejecting empty names, case-insensitive duplicates, negative values, and malformed inputs.</li>
              </ul>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 mt-2">
                <strong className="text-white block">What could still go wrong even if tests pass?</strong>
                <p className="mt-1 text-slate-400">
                  Unit tests operate on known data structures. In live restaurant operations, concurrent waiter orders could cause race conditions if multiple tables order the last portion simultaneously. In this in-memory demo state updates are synchronous, but in production, optimistic locking or transactional queueing on the backend would be required.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Future Improvements */}
          <section className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              3. What I Would Build Next
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-white">1. Purchase Order Auto-Generation</strong>
                <p className="text-slate-400 mt-0.5">Automated supplier reorder draft when stock crosses below par levels.</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-white">2. Wastage & Yield Tracking</strong>
                <p className="text-slate-400 mt-0.5">Account for kitchen prep wastage (e.g. peeling onions = 15% loss) before recipe deduction.</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-white">3. Multi-portion Batch Ordering</strong>
                <p className="text-slate-400 mt-0.5">Table-level ticket management allowing batch preparation of multiple dishes.</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-white">4. Recipe Editor</strong>
                <p className="text-slate-400 mt-0.5">Full CRUD UI for kitchen chefs to adjust portion sizes and add seasonal dishes.</p>
              </div>
            </div>
          </section>

          {/* AI Usage Disclosure */}
          <section className="border-t border-slate-800 pt-3 text-slate-400 text-[11px]">
            <strong className="text-slate-300">AI Usage Disclosure:</strong> AI tools were used to assist in structuring code, generating comprehensive Vitest test coverage, and crafting clean Tailwind styles. All business rules, unit normalization logic, and architectural decisions were verified and tested directly.
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#FF7A00] to-[#F59E0B] hover:brightness-110 rounded-xl transition-colors cursor-pointer"
          >
            Close Write-up
          </button>
        </div>
      </div>
    </div>
  );
};
