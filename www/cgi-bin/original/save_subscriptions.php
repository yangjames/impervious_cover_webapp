<?php

session_start();
if (isset($_SESSION['login'])) {
  $subscriptions = $_POST["subscriptions"];
  
  $con = mysqli_connect('localhost','icauser','testing','icdmt');
  
  if (mysqli_connect_errno($con))
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
  else {
    $serialized=json_encode($subscriptions);
    $email = $_SESSION['email_address'];
    $result=mysqli_query($con, "UPDATE user_profile SET subscriptions='$serialized' WHERE email_address='$email'" );
    echo "Success!";//json_encode(mysqli_error($con));
  }
}
else
  echo "Not logged in.";

?>