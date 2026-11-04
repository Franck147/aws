USE books4all;

SHOW TABLES;

-- La consulta muestra solo el registro de demostración del laboratorio.
SELECT u.name AS lector,
       b.title AS libro,
       d.download_date AS fecha_descarga
FROM downloads AS d
JOIN users AS u ON u.id = d.user_id
JOIN books AS b ON b.id = d.book_id
WHERE u.email = 'lector@example.com'
  AND b.title = 'Libro de prueba'
ORDER BY d.download_date;
