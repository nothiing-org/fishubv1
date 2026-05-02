<?php

// ---------- CONFIG ----------
define('MAX_TEMPLATE', 15);
define('MIN_TEMPLATE', 1);

// ---------- GET TOKEN ----------
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$token = trim($uri, '/');

// block empty or root
if (!$token) {
    http_response_code(400);
    echo "Invalid link";
    exit;
}

// ---------- DECODE ----------
function base64url_decode_safe($data) {
    $data = strtr($data, '-_', '+/');
    $pad = strlen($data) % 4;
    if ($pad) {
        $data .= str_repeat('=', 4 - $pad);
    }
    return base64_decode($data);
}

$json = base64url_decode_safe($token);
$data = json_decode($json, true);

// ---------- VALIDATE PAYLOAD ----------
if (
    !$data ||
    !isset($data['t'], $data['exp']) ||
    !is_numeric($data['t']) ||
    !is_numeric($data['exp'])
) {
    http_response_code(400);
    echo "Invalid link";
    exit;
}

// ---------- EXPIRE CHECK ----------
$currentTimeMs = round(microtime(true) * 1000);

if ($currentTimeMs > (int)$data['exp']) {
    http_response_code(410);
    echo "⛔ Link expired";
    exit;
}

// ---------- TEMPLATE VALIDATION ----------
$template = (int)$data['t'];

if ($template < MIN_TEMPLATE || $template > MAX_TEMPLATE) {
    http_response_code(400);
    echo "Invalid template";
    exit;
}

// ---------- PATH ----------
$templatePath = __DIR__ . "/templates/$template/index.html";

// security: ensure file exists
if (!file_exists($templatePath)) {
    http_response_code(404);
    echo "Template not found";
    exit;
}

// ---------- SERVE ----------
header('Content-Type: text/html; charset=UTF-8');
readfile($templatePath);
exit;
