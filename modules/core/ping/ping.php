<?php

header('Content-Type: application/json; charset=utf-8');

$hostname = $_SERVER['HOSTNAME'];

echo json_encode([
  'success' => true,
  'message' => 'Pong from PHP',
  'hostname' => $hostname,
  'now' => date('Y-m-d H:i:s')
]);
