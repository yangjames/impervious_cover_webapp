<?php
session_start();

if (isset($_SESSION['login'])) {
  
  $con = mysqli_connect('localhost','icauser','testing','icdmt');
  
  if (mysqli_connect_errno($con))
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
  else {
    //echo $_SESSION['email_address'];}}
    
    $email=$_SESSION['email_address'];
    $password=$_SESSION['password'];
    
    $result=mysqli_query($con,"SELECT * FROM user_profile WHERE email_address='$email' AND password='$password'");
    
    $row = mysqli_fetch_array($result);
    
    if (!empty($row)) {
      $retval["first_name"]=$row["first_name"];
      $retval["subscriptions"]=$row["subscriptions"];
      echo json_encode($retval);
    }
    else
      echo "";
  }
}
else
  echo "";

?>