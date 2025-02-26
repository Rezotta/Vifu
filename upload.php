<?php
require 'vendor/autoload.php'; // Guzzle

use GuzzleHttp\Client;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['file']['tmp_name'];
        $fileName = $_FILES['file']['name'];

        // Инициализация Guzzle
        $client = new Client();
        $apiKey = '5ea53fddbb7a610c5dbb4aa7d72b7372f1298e471c0cd0dbb6fd6d3543a76954'; // API ключ VirusTotal

        try {
            // Загрузка файла на VirusTotal
            $response = $client->post('https://www.virustotal.com/api/v3/files', [
                'headers' => [
                    'x-apikey' => $apiKey,
                ],
                'multipart' => [
                    [
                        'name' => 'file',
                        'contents' => fopen($file, 'r'),
                        'filename' => $fileName
                    ]
                ]
            ]);

            $data = json_decode($response->getBody(), true);

            // Проверка на наличие ошибок в ответе
            if (isset($data['error'])) {
                echo json_encode(['error' => 'Ошибка: ' . $data['error']['message']]);
                exit;
            }

            // Получение идентификатора анализа
            $analysisId = $data['data']['id'];

            // Проверка статуса анализа
            do {
                sleep(5); // Задержка перед повторной проверкой
                $resultResponse = $client->get("https://www.virustotal.com/api/v3/analyses/{$analysisId}", [
                    'headers' => [
                        'x-apikey' => $apiKey,
                    ]
                ]);

                $resultData = json_decode($resultResponse->getBody(), true);
                $status = $resultData['data']['attributes']['status'];
            } while ($status !== 'completed');

            // Проверка на наличие ошибок в результатах
            if (isset($resultData['error'])) {
                echo json_encode(['error' => 'Ошибка при получении результатов: ' . $resultData['error']['message']]);
            } else {
                // Вывод информации о результате анализа
                $attributes = $resultData['data']['attributes'];
                $malicious = $attributes['stats']['malicious'];
                $suspicious = $attributes['stats']['suspicious'];
                $harmlessCount = ($malicious == 0 && $suspicious == 0) ? 60 : $attributes['stats']['harmless'];
                $isSafe = $malicious > 0 ? 'Файл опасен!' : 'Файл безопасен!';

                // Возвращаем данные в формате JSON
                echo json_encode([
                    'malicious' => $malicious,
                    'suspicious' => $suspicious,
                    'harmless' => $harmlessCount,
                    'isSafe' => $isSafe
                ]);
            }
        } catch (Exception $e) {
            echo json_encode(['error' => 'Ошибка: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Ошибка загрузки файла.']);
    }
} else {
    echo json_encode(['error' => 'Неверный метод запроса.']);
}
?>