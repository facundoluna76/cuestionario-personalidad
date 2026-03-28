import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userName, userAge, results, answers } = body;

    // Aquí guardaremos los resultados en localStorage del lado del cliente
    // o podríamos implementar una base de datos si lo necesitas
    
    // Por ahora, simplemente retornamos success
    // Los resultados se pueden ver en /admin
    
    const submission = {
      id: Date.now().toString(),
      userName,
      userAge,
      results,
      answers,
      timestamp: new Date().toISOString(),
    };

    // En producción, aquí enviarías un email o guardarías en una base de datos
    // Por ahora usaremos localStorage en el cliente
    
    return NextResponse.json({ 
      success: true, 
      message: 'Resultados recibidos correctamente',
      submissionId: submission.id
    });
  } catch (error) {
    console.error('Error al procesar resultados:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar los resultados' },
      { status: 500 }
    );
  }
}
