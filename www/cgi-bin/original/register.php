<?php

$email = $_POST["email"];

$con=mysqli_connect('localhost','icauser','testing','icdmt');
if (mysqli_connect_errno($con))
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
else {
  $result=mysqli_query($con,"SELECT * FROM user_profile WHERE email_address='" . $email . "'");

  $row = mysqli_fetch_array($result);
  if (!empty($row)) {
    $retval["email_address"]=$row["email_address"];
    echo json_encode($retval);
  }
  else {
    session_start();
    session_destroy();
    session_start();

    $password = $_POST["password"];
    $first_name = $_POST["first_name"];
    $last_name = $_POST["last_name"];
    
    $_SESSION['email_address'] = $email;
    $_SESSION['password']=$password;
    $_SESSION['first_name']=$first_name;
    $_SESSION['subscriptions']="";
    $_SESSION['login']="1";

    mysqli_query($con, "INSERT INTO user_profile (first_name,last_name,email_address,password) VALUES ('$first_name','$last_name','$email','$password')");
    echo "";
  }
}
  
?>