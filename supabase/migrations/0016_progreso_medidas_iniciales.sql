-- Ancla de progreso real por ruta (03/09/2026): Ruta A compara peso actual
-- contra el inicial (sube 300-800g/mes = éxito); Ruta B usa cintura (baja
-- centímetros mientras mantiene las cargas). Los "iniciales" se fijan una
-- sola vez (ver lib/routine.ts → registrarMedidasIniciales), nunca se
-- sobrescriben después.
alter table profiles add column peso_inicial_kg numeric;
alter table profiles add column cintura_cm numeric;
alter table profiles add column cintura_inicial_cm numeric;
alter table profiles add column fecha_inicio_medidas date;
