<?php
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
    
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $feedbacks[] = array(
                "id" => $row['id'],
                "name" => $row['name'],
                "message" => $row['message'],
                "date" => date('Y-m-d', strtotime($row['created_at']))
            );
        }
        
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "data" => $feedbacks
        ));
    } else {
        // Return sample feedbacks if database is empty
        $sample_feedbacks = array(
            array(
                "id" => 1,
                "name" => "Maria Santos",
                "message" => "This app has been a lifesaver for me. The anonymous feature made me feel safe to seek help when I needed it most.",
                "date" => "2023-10-15"
            ),
            array(
                "id" => 2,
                "name" => "Juan Dela Cruz",
                "message" => "The self-help tools are very useful, especially the calming music when I can't sleep at night. Thank you for this app!",
                "date" => "2023-10-10"
            ),
            array(
                "id" => 3,
                "name" => "Anonymous",
                "message" => "The community forum is a great place to connect with others who understand what I'm going through.",
                "date" => "2023-10-05"
            )
        );
        
        echo json_encode(array(
            "status" => "success",
            "data" => $sample_feedbacks,
            "note" => "Sample data - database is empty"
        ));
    }
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => $exception->getMessage()));
}
?>