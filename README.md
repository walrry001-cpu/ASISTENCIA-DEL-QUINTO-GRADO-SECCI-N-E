# Asistencia 5.° "E" · I.E. N.° 82019 "La Florida del Inca"

Aplicación web (PWA) para registrar la asistencia diaria, avisar a los padres por WhatsApp y generar informes en PDF.

## Cambio en esta versión
- Mensaje de WhatsApp para **faltas injustificadas (F)**: incluye un párrafo cordial sobre los nuevos lineamientos del Ministerio de Educación, la corresponsabilidad de la familia y el seguimiento por la Dirección.
- Mensaje para **tardanzas (T)**: recordatorio breve de puntualidad.
- Los demás estados (FJ, TJ, R) mantienen el mensaje original.

## Cómo publicar en GitHub Pages
1. Sube `index.html` (y los demás archivos de la app: `manifest.json`, `service-worker.js`, íconos) a tu repositorio.
2. En **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`.
3. `service-worker.js` de esta versión **reemplaza** al anterior: usa "red primero" y borra las cachés viejas al activarse. Deja `manifest.json` e íconos como están.
4. Si el celular aún muestra el mensaje anterior, cierra la app por completo y ábrela dos veces (la primera instala la versión nueva, la segunda ya la muestra).
