<?php
session_start();

if (!isset($_SESSION['login']))
  session_destroy();
else {
  $email=$_POST['email_address'];

  $con=mysqli_connect('localhost','icauser','testing','icdmt');
  if (mysqli_connect_errno($con))
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
  else {
    $result=mysqli_query($con,"SELECT * FROM user_profile WHERE email_address='" . $email . "' AND password='" . $password . "'");
    $row = mysqli_fetch_array($result);
    if (!empty($row)) {
      if ($_SESSION['email_address']==$email)
	session_destroy();
      $delete_account=mysli_query($con,"DELETE FROM user_profile WHERE email_address='$email'");
      echo "";
    }
    else
      echo "Information is incorrect.";
  }
}
?>