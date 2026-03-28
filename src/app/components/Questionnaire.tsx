"use client";

import { useState, useRef } from "react";
import { questions } from "../data/questionsList";
import { calculateResults, SubscaleResult } from "../utils/scoring";
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
  const topRef = useRef<HTMLDivElement>(null);

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
    
    // Enviar resultados por email (opcional)
    setIsSendingEmail(true);
    try {
      await fetch('/api/send-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          userAge,
          results: res,
          answers,
        }),
      });
    } catch (error) {
      console.error('Error al enviar resultados:', error);
    } finally {
      setIsSendingEmail(false);
    }
    
    setShowCompletion(true);
    scrollToTop();
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentPage(0);
    setShowCompletion(false);
    setResults(null);
    setStarted(false);
    setUserName("");
    setUserAge("");
    scrollToTop();
  };

  if (!started) {
    return (
      <div ref={topRef} className="min-h-screen bg-meraki-cream flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-meraki-coral-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-meraki-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cuestionario de Personalidad
            </h1>
            <p className="text-gray-500">CPQ - Cuestionario de Personalidad</p>
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
            onClick={() => setStarted(true)}
            disabled={!userName.trim() || !userAge.trim()}
            className="w-full py-4 bg-meraki-coral text-white rounded-xl font-semibold text-lg hover:bg-meraki-coral-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            Comenzar Cuestionario
          </button>
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

  if (showCompletion) {
    return (
      <div ref={topRef}>
        <Completion
          userName={userName}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  return (
    <div ref={topRef} className="min-h-screen bg-meraki-cream">
      {/* Progress bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Sección {currentPage + 1} de {totalPages}
            </span>
            <span className="text-sm font-medium text-meraki-coral">
              {answeredCount}/{questions.length} respondidas
            </span>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Sección {currentPage + 1}
        </h2>

        <div className="space-y-6">
          {pageQuestions.map((q, idx) => {
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
              {isSendingEmail ? 'Enviando...' : 'Finalizar Cuestionario'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
