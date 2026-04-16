"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { questions } from "../data/questionsList";
import { calculateResults, SubscaleResult } from "../utils/scoring";
import {
  getSavedSessions,
  upsertSession,
  deleteSession,
  generateSessionId,
  SavedSession,
} from "../utils/sessionStorage";
import Completion from "./Completion";

const QUESTIONS_PER_PAGE = 13;
const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

export default function Questionnaire() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [results, setResults] = useState<SubscaleResult[] | null>(null);
  const [showError, setShowError] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState("");
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Load saved sessions on mount
  useEffect(() => {
    setSavedSessions(getSavedSessions());
  }, []);

  // Auto-save whenever answers or page changes (only while active session)
  const autoSave = useCallback(
    (page: number, ans: Record<number, string>, sid: string, name: string, age: string) => {
      upsertSession({ id: sid, name, age, currentPage: page, answers: ans });
      setSavedSessions(getSavedSessions());
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    },
    []
  );

  useEffect(() => {
    if (started && sessionId) {
      autoSave(currentPage, answers, sessionId, userName, userAge);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentPage]);

  const pageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const allPageAnswered = pageQuestions.every((q) => answers[q.id]);
  const allAnswered = questions.every((q) => answers[q.id]);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setShowError(false);
  };

  const handleNext = () => {
    if (!allPageAnswered) {
      setShowError(true);
      return;
    }
    setShowError(false);
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      scrollToTop();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setShowError(false);
      setCurrentPage((prev) => prev - 1);
      scrollToTop();
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      setShowError(true);
      return;
    }
    const res = calculateResults(answers);
    setResults(res);

    // Guardar resultados en localStorage
    const submission = {
      id: Date.now().toString(),
      userName,
      userAge,
      results: res,
      answers,
      timestamp: new Date().toISOString(),
    };
    const stored = localStorage.getItem("questionnaire-submissions");
    const submissions = stored ? JSON.parse(stored) : [];
    submissions.push(submission);
    localStorage.setItem("questionnaire-submissions", JSON.stringify(submissions));

    // Enviar resultados por email
    setIsSendingEmail(true);
    try {
      await fetch("/api/send-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, userAge, results: res, answers }),
      });
    } catch (error) {
      console.error("Error al enviar resultados:", error);
    } finally {
      setIsSendingEmail(false);
    }

    // Eliminar sesión guardada al completar
    if (sessionId) {
      deleteSession(sessionId);
      setSavedSessions(getSavedSessions());
    }

    setShowCompletion(true);
    scrollToTop();
  };

  const handleSaveAndExit = () => {
    if (sessionId) {
      upsertSession({ id: sessionId, name: userName, age: userAge, currentPage, answers });
      setSavedSessions(getSavedSessions());
    }
    resetToStart();
  };

  const resetToStart = () => {
    setAnswers({});
    setCurrentPage(0);
    setShowCompletion(false);
    setResults(null);
    setStarted(false);
    setUserName("");
    setUserAge("");
    setSessionId(null);
    setSavedSessions(getSavedSessions());
    scrollToTop();
  };

  const handleStartNew = () => {
    if (!userName.trim() || !userAge.trim()) return;
    const id = generateSessionId();
    setSessionId(id);
    setStarted(true);
  };

  const handleResumeSession = (session: SavedSession) => {
    setUserName(session.name);
    setUserAge(session.age);
    setAnswers(session.answers);
    setCurrentPage(session.currentPage);
    setSessionId(session.id);
    setStarted(true);
    scrollToTop();
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    setSavedSessions(getSavedSessions());
    setConfirmDelete(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ─── Start screen ────────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div ref={topRef} className="min-h-screen bg-meraki-cream p-4 relative">
        <div className="max-w-lg mx-auto py-8 space-y-6">

          {/* Saved sessions */}
          {savedSessions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-meraki-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sesiones guardadas
              </h2>
              <div className="space-y-3">
                {savedSessions.map((s) => {
                  const total = questions.length;
                  const answered = Object.keys(s.answers).length;
                  const pct = Math.round((answered / total) * 100);
                  return (
                    <div
                      key={s.id}
                      className="border-2 border-gray-100 rounded-xl p-4 hover:border-meraki-coral-light transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                          <p className="text-sm text-gray-500">{s.age} años · Guardado {formatDate(s.savedAt)}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-meraki-coral h-1.5 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {answered}/{total} respuestas
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleResumeSession(s)}
                            className="px-3 py-1.5 bg-meraki-coral text-white rounded-lg text-sm font-medium hover:bg-meraki-coral-dark transition-all"
                          >
                            Continuar
                          </button>
                          {confirmDelete === s.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDeleteSession(s.id)}
                                className="px-2 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600"
                              >
                                Sí, borrar
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-2 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(s.id)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-500 transition-all"
                              title="Eliminar sesión"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* New session form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-meraki-coral-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-meraki-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cuestionario de Personalidad
              </h1>
              <p className="text-gray-500">CPQ - Nueva sesión</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-meraki-coral focus:border-meraki-coral transition-all text-gray-900"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad *
                </label>
                <input
                  type="number"
                  value={userAge}
                  onChange={(e) => setUserAge(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-meraki-coral focus:border-meraki-coral transition-all text-gray-900"
                  placeholder="Tu edad"
                  min={1}
                  max={99}
                />
              </div>
            </div>

            <div className="bg-meraki-sage-light rounded-xl p-4 mb-8">
              <h3 className="font-semibold text-meraki-sage-dark mb-2">Instrucciones</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Respondé cada pregunta eligiendo A, B o C</li>
                <li>• No hay respuestas correctas ni incorrectas</li>
                <li>• Elegí la opción que mejor te represente</li>
                <li>• Son 130 preguntas divididas en 10 secciones</li>
                <li>• Al finalizar obtendrás tu resultado automáticamente</li>
              </ul>
            </div>

            <button
              onClick={handleStartNew}
              disabled={!userName.trim() || !userAge.trim()}
              className="w-full py-4 bg-meraki-coral text-white rounded-xl font-semibold text-lg hover:bg-meraki-coral-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Comenzar Cuestionario
            </button>
          </div>
        </div>

        {/* Admin button */}
        <a
          href="/admin"
          className="absolute top-4 right-4 p-2.5 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-all group"
          title="Panel de administración"
        >
          <svg className="w-5 h-5 text-gray-600 group-hover:text-meraki-coral transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </a>
      </div>
    );
  }

  // ─── Completion screen ────────────────────────────────────────────────────────
  if (showCompletion) {
    return (
      <div ref={topRef}>
        <Completion
          userName={userName}
          onRestart={resetToStart}
        />
      </div>
    );
  }

  // ─── Questionnaire screen ─────────────────────────────────────────────────────
  return (
    <div ref={topRef} className="min-h-screen bg-meraki-cream">
      {/* Progress bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Sección {currentPage + 1} de {totalPages}
            </span>
            <div className="flex items-center gap-3">
              {justSaved && (
                <span className="text-xs text-meraki-sage-dark font-medium flex items-center gap-1 animate-pulse">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardado
                </span>
              )}
              <span className="text-sm font-medium text-meraki-coral">
                {answeredCount}/{questions.length} respondidas
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-meraki-coral h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Sección {currentPage + 1}
          </h2>
          <button
            onClick={handleSaveAndExit}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:border-meraki-coral hover:text-meraki-coral transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Guardar y salir
          </button>
        </div>

        <div className="space-y-6">
          {pageQuestions.map((q) => {
            const isUnanswered = showError && !answers[q.id];
            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all p-6 ${
                  isUnanswered
                    ? "border-red-400 ring-2 ring-red-100"
                    : answers[q.id]
                    ? "border-meraki-sage"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <p className="font-medium text-gray-900 mb-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-meraki-gold-light text-meraki-gold-dark rounded-full text-sm font-bold mr-3">
                    {q.id}
                  </span>
                  {q.text}
                </p>

                <div className="space-y-2 ml-11">
                  {q.options.map((opt) => (
                    <label
                      key={opt.label}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        answers[q.id] === opt.label
                          ? "bg-meraki-coral-light border-2 border-meraki-coral text-gray-900"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt.label}
                        checked={answers[q.id] === opt.label}
                        onChange={() => handleAnswer(q.id, opt.label)}
                        className="sr-only"
                      />
                      <span
                        className={`flex items-center justify-center w-7 h-7 rounded-full border-2 mr-3 text-sm font-bold flex-shrink-0 ${
                          answers[q.id] === opt.label
                            ? "bg-meraki-coral border-meraki-coral text-white"
                            : "border-gray-300 text-gray-400"
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="text-sm">{opt.text}</span>
                    </label>
                  ))}
                </div>

                {isUnanswered && (
                  <p className="text-red-500 text-sm mt-2 ml-11">
                    Esta pregunta es obligatoria
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {showError && !allPageAnswered && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            Por favor respondé todas las preguntas de esta sección antes de continuar.
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 gap-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            ← Anterior
          </button>

          {currentPage < totalPages - 1 ? (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-meraki-coral text-white rounded-xl font-medium hover:bg-meraki-coral-dark transition-all shadow-md hover:shadow-lg"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSendingEmail}
              className="px-8 py-3 bg-meraki-sage text-white rounded-xl font-medium hover:bg-meraki-sage-dark transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingEmail ? "Enviando..." : "Finalizar Cuestionario"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
