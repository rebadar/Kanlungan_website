<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate data
    if (
        !empty($data->message) 
    ) {
        $name = !empty($data->name) ? $data->name : 'Anonymous';
        $email = !empty($data->email) ? $data->email : NULL;
        $message = $data->message;
        
        try {
            $query = "INSERT INTO feedback (name, email, message) VALUES (:name, :email, :message)";
            $stmt = $db->prepare($query);
            
            // Bind parameters
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":message", $message);
            
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array(
                    "status" => "success",
                    "message" => "Feedback submitted successfully!",
                    "data" => array(
                        "id" => $db->lastInsertId(),
                        "name" => $name,
                        "message" => $message,
                        "created_at" => date('Y-m-d H:i:s')
                    )
                ));
            } else {
                http_response_code(503);
                echo json_encode(array("status" => "error", "message" => "Unable to submit feedback."));
            }
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(array("status" => "error", "message" => $exception->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("status" => "error", "message" => "Message is required."));
    }
} else {
    http_response_code(405);
    echo json_encode(array("status" => "error", "message" => "Method not allowed."));
}
?>