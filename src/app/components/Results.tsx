"use client";

import { SubscaleResult } from "../utils/scoring";

interface ResultsProps {
  results: SubscaleResult[];
  userName: string;
  userAge: string;
  onRestart: () => void;
}

function getLevel(score: number, maxScore: number): { label: string; color: string; bgColor: string } {
  if (maxScore === 0) return { label: "Sin datos", color: "text-gray-500", bgColor: "bg-gray-100" };
  const pct = (score / maxScore) * 100;
  if (pct <= 25) return { label: "Bajo", color: "text-meraki-sage-dark", bgColor: "bg-meraki-sage-light" };
  if (pct <= 50) return { label: "Medio-Bajo", color: "text-meraki-gold-dark", bgColor: "bg-meraki-gold-light" };
  if (pct <= 75) return { label: "Medio-Alto", color: "text-meraki-coral-dark", bgColor: "bg-meraki-coral-light" };
  return { label: "Alto", color: "text-meraki-coral-dark", bgColor: "bg-meraki-coral-light" };
}

function getBarColor(score: number, maxScore: number): string {
  if (maxScore === 0) return "bg-gray-300";
  const pct = (score / maxScore) * 100;
  if (pct <= 25) return "bg-meraki-sage";
  if (pct <= 50) return "bg-meraki-gold";
  if (pct <= 75) return "bg-meraki-coral";
  return "bg-meraki-coral-dark";
}

export default function Results({ results, userName, userAge, onRestart }: ResultsProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-meraki-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 print:shadow-none">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Resultados del Cuestionario
              </h1>
              <p className="text-gray-500">CPQ - Cuestionario de Personalidad</p>
            </div>
            <div className="flex gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
              <button
                onClick={onRestart}
                className="px-5 py-2.5 bg-meraki-coral text-white rounded-xl font-medium hover:bg-meraki-coral-dark transition-all"
              >
                Nuevo cuestionario
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nombre</p>
              <p className="font-semibold text-gray-900">{userName}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Edad</p>
              <p className="font-semibold text-gray-900">{userAge} años</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fecha</p>
              <p className="font-semibold text-gray-900">{dateStr}</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 print:shadow-none">
          <h3 className="font-semibold text-gray-700 mb-3">Referencia de niveles</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-meraki-sage" />
              <span className="text-sm text-gray-600">Bajo (0-25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-meraki-gold" />
              <span className="text-sm text-gray-600">Medio-Bajo (26-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-meraki-coral" />
              <span className="text-sm text-gray-600">Medio-Alto (51-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-meraki-coral-dark" />
              <span className="text-sm text-gray-600">Alto (76-100%)</span>
            </div>
          </div>
        </div>

        {/* Subscale Results */}
        <div className="space-y-4">
          {results.map((r) => {
            const level = getLevel(r.score, r.maxScore);
            const barColor = getBarColor(r.score, r.maxScore);
            const pct = r.maxScore > 0 ? (r.score / r.maxScore) * 100 : 0;

            return (
              <div
                key={r.code}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:break-inside-avoid"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 bg-meraki-gold-light text-meraki-gold-dark rounded-xl text-sm font-bold">
                      {r.code}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{r.name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${level.color} ${level.bgColor}`}>
                      {level.label}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {r.score} / {r.maxScore} pts
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                  <div
                    className={`${barColor} h-3 rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span className="max-w-[45%]">← {r.descriptionLow}</span>
                  <span className="max-w-[45%] text-right">{r.descriptionHigh} →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6 print:shadow-none">
          <h3 className="font-semibold text-gray-900 mb-4">Tabla resumen de puntajes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-600">Subescala</th>
                  <th className="text-left py-2 px-3 text-gray-600">Nombre</th>
                  <th className="text-center py-2 px-3 text-gray-600">Puntaje</th>
                  <th className="text-center py-2 px-3 text-gray-600">Máximo</th>
                  <th className="text-center py-2 px-3 text-gray-600">%</th>
                  <th className="text-center py-2 px-3 text-gray-600">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const level = getLevel(r.score, r.maxScore);
                  const pct = r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0;
                  return (
                    <tr key={r.code} className="border-b border-gray-100">
                      <td className="py-2 px-3 font-bold text-meraki-coral">{r.code}</td>
                      <td className="py-2 px-3 text-gray-900">{r.name}</td>
                      <td className="py-2 px-3 text-center font-semibold">{r.score}</td>
                      <td className="py-2 px-3 text-center text-gray-500">{r.maxScore}</td>
                      <td className="py-2 px-3 text-center font-medium">{pct}%</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${level.color} ${level.bgColor}`}>
                          {level.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer buttons - print hidden */}
        <div className="flex justify-center gap-4 mt-8 print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            Imprimir resultados
          </button>
          <button
            onClick={onRestart}
            className="px-5 py-2.5 bg-meraki-coral text-white rounded-xl font-medium hover:bg-meraki-coral-dark transition-all"
          >
            Nuevo cuestionario
          </button>
        </div>
      </div>
    </div>
  );
}
