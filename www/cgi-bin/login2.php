<?php header('Access-Control-Allow-Origin: *');
session_start();

if(isset($_SESSION["login"])) {
  $retval["first_name"]=$_SESSION["first_name"];
  $retval["subscriptions"]=$_SESSION["subscriptions"];
  $retval["message"]="session exists!";
  echo json_encode($retval);
}
else {
  $email = $_POST["email"];
  $password = $_POST["password"];
  
  $con=mysqli_connect('localhost','icauser','testing','icdmt');
  if (mysqli_connect_errno($con))
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
  else {
    $result=mysqli_query($con,"SELECT * FROM user_profile2 WHERE email_address='" . $email . "' AND password='" . $password . "'");
    $row = mysqli_fetch_array($result);
    if (!empty($row)) {
      $_SESSION['email_address'] = $email;
      $_SESSION['password']=$password;
      $_SESSION['first_name']=$row["first_name"];
      $_SESSION['subscriptions']=$row["subscriptions"];
      $_SESSION['login']=time();
      echo "Logged in";
    }
    else {
      echo "";
    }
  }
}

?>