"use client";

interface CompletionProps {
  userName: string;
  onRestart: () => void;
}

export default function Completion({ userName, onRestart }: CompletionProps) {
  return (
    <div className="min-h-screen bg-meraki-cream flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-meraki-sage-light rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-meraki-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Finalizaste el cuestionario!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          ¡Muchas gracias, {userName}!
        </p>

        <div className="bg-meraki-gold-light rounded-xl p-6 mb-8">
          <p className="text-sm text-gray-700">
            Tus respuestas han sido registradas correctamente. Los resultados serán enviados al profesional para su análisis.
          </p>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-4 bg-meraki-coral text-white rounded-xl font-semibold text-lg hover:bg-meraki-coral-dark transition-all shadow-lg hover:shadow-xl"
        >
          Realizar otro cuestionario
        </button>
      </div>
    </div>
  );
}
