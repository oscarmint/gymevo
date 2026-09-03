import { NextResponse } from 'next/server';

// TRM (Tasa Representativa del Mercado) oficial de Colombia — fuente pública
// del gobierno (datos.gov.co, sin API key). Se usa para mostrar el precio en
// pesos colombianos junto al de dólares en la landing y el paywall: la
// mayoría de la venta es en Colombia y ver solo USD ahuyenta clientes (a
// pedido explícito del usuario — "evitar fuga de clientes al ver dólares").
export const revalidate = 3600; // la TRM cambia una vez al día — no hace falta pedirla más seguido

export async function GET() {
  try {
    const res = await fetch(
      'https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=1',
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error('TRM: respuesta no OK');
    const data: { valor: string; vigenciadesde: string }[] = await res.json();
    const valor = Number(data[0]?.valor);
    if (!valor) throw new Error('TRM: sin valor numérico');
    return NextResponse.json({ valor, fecha: data[0].vigenciadesde });
  } catch {
    // Sin TRM disponible (red caída, fuente cambió) — el cliente sigue
    // mostrando el precio en dólares, nunca rompe la pantalla por esto.
    return NextResponse.json({ valor: null, fecha: null });
  }
}
