<?php
$mail = new PHPMailer();
$mail->IsSMTP();
$mail->CharSet = 'UTF-8';

$mail->Host = "notification@nasa.gov";
$mail->SMTPDebug = 0;
$mail->SMTPAuth = true;
$mail->Port = 25;
$mail->Username = "username";
$mail->Password = "password";
?>