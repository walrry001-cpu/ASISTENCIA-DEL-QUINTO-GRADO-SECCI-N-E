# Asistencia 5.° "E" · I.E. N.° 82019 "La Florida del Inca"

Aplicación web (PWA) para registrar la asistencia diaria, avisar a los padres por WhatsApp y generar informes en PDF.

## Mensajes de WhatsApp
- **Falta injustificada (F):** destaca lo que el estudiante pierde cada día que falta, apela al rol de la familia y pide el documento sustentatorio (receta, cita, certificado o solicitud de permiso).
- **Falta justificada (FJ):** agradece la comunicación y recuerda presentar el documento sustentatorio.
- **Tardanza, tardanza justificada y retirado:** mensaje básico, sin párrafo adicional.

## Pestaña "Resumen SIAGIE"
Totales mensuales por estudiante (A, F, FJ, T, TJ, R) con las fechas de falta, y botón para copiar el resumen. No envía datos al SIAGIE: sirve para ingresarlos con tu usuario sin errores.

## Publicar en GitHub Pages
1. Sube `index.html` y `service-worker.js` a tu repositorio, reemplazando los anteriores. Deja `manifest.json` e íconos como están.
2. En **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`.
3. `service-worker.js` usa "red primero" y borra las cachés viejas al activarse. Si el celular muestra el mensaje anterior, cierra la app por completo y ábrela dos veces.
