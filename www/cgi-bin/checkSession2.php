<?php
session_start();

if (isset($_SESSION['login'])) {
  if (time() - $_SESSION['login'] > 43200) {
    session_unset();
    session_destroy();
    echo "";
  }
  else {
    $_SESSION['login'] = time();
    $con = mysqli_connect('localhost','icauser','testing','icdmt');
  
    if (mysqli_connect_errno($con))
      echo "Failed to connect to MySQL: " . mysqli_connect_error();
    else {
      $email=$_SESSION['email_address'];
      $password=$_SESSION['password'];
    
      $result=mysqli_query($con,"SELECT * FROM user_profile2 WHERE email_address='$email' AND password='$password'");
    
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
}
else
  echo "";

?>