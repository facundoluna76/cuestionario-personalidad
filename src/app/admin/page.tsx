"use client";

import { useState, useEffect } from "react";
import Results from "../components/Results";
import { SubscaleResult } from "../utils/scoring";

interface Submission {
  id: string;
  userName: string;
  userAge: string;
  results: SubscaleResult[];
  answers: Record<number, string>;
  timestamp: string;
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions();
    }
  }, [isAuthenticated]);

  const loadSubmissions = () => {
    const stored = localStorage.getItem("questionnaire-submissions");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSubmissions(Array.isArray(parsed) ? parsed : [parsed]);
    }
  };

  const handleLogin = () => {
    // Contraseña simple - en producción deberías usar autenticación real
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar estos resultados?")) {
      const updated = submissions.filter(s => s.id !== id);
      setSubmissions(updated);
      localStorage.setItem("questionnaire-submissions", JSON.stringify(updated));
      setSelectedSubmission(null);
    }
  };

  const handleDeleteAll = () => {
    if (confirm("¿Estás seguro de eliminar TODOS los resultados?")) {
      setSubmissions([]);
      localStorage.removeItem("questionnaire-submissions");
      setSelectedSubmission(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-meraki-cream flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Panel de Administración
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-meraki-coral focus:border-meraki-coral transition-all text-gray-900"
                placeholder="Ingresa la contraseña"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-meraki-coral text-white rounded-xl font-medium hover:bg-meraki-coral-dark transition-all"
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedSubmission) {
    return (
      <div>
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a lista
            </button>
            <button
              onClick={() => handleDelete(selectedSubmission.id)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all"
            >
              Eliminar
            </button>
          </div>
        </div>
        <Results
          results={selectedSubmission.results}
          userName={selectedSubmission.userName}
          userAge={selectedSubmission.userAge}
          onRestart={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-meraki-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Panel de Administración
              </h1>
              <p className="text-gray-500">
                Resultados de cuestionarios completados
              </p>
            </div>
            <div className="flex gap-3">
              {submissions.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all text-sm"
                >
                  Eliminar Todos
                </button>
              )}
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                No hay cuestionarios completados aún
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => {
                const date = new Date(submission.timestamp);
                return (
                  <div
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 cursor-pointer transition-all border-2 border-transparent hover:border-meraki-coral"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {submission.userName}
                        </h3>
                        <div className="flex gap-4 mt-1">
                          <span className="text-sm text-gray-600">
                            Edad: {submission.userAge} años
                          </span>
                          <span className="text-sm text-gray-600">
                            Fecha: {date.toLocaleDateString("es-AR")} {date.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
