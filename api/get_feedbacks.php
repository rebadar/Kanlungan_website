<?php
// Set header to return JSON content
header('Content-Type: application/json');

include 'config.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Get limit from query parameter or default to 6
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 6;
    $limit = min($limit, 20); // Maximum 20 feedbacks
    
    $query = "SELECT id, name, message, created_at 
              FROM feedback 
              WHERE status = 'approved' 
              ORDER BY created_at DESC 
              LIMIT :limit";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $feedbacks = array();
    
    // Fetch all results into the feedbacks array
    // This loop will simply not run if rowCount() is 0,
    // resulting in an empty $feedbacks array.
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $feedbacks[] = array(
            "id" => $row['id'],
            "name" => $row['name'],
            "message" => $row['message'],
            "date" => date('Y-m-d', strtotime($row['created_at']))
        );
    }
    
    // Always return a success response
    // The 'data' key will contain the results or an empty array
    http_response_code(200);
    echo json_encode(array(
        "status" => "success",
        "data" => $feedbacks
    ));

} catch(PDOException $exception) {
    // Handle database errors
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => $exception->getMessage()));
}
?>