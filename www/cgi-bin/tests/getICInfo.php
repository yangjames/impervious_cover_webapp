<?php
$year = $_POST['year'];
$month = $_POST['month'];
$day = $_POST['day'];
$zoom = $_POST['zoom'];
$tile = $_POST['tile'];
$pixel = $_POST['pixel'];

$tilex=$tile['x'];
$tiley=$tile['y'];
$pixelx=$pixel['x'];
$pixely=$pixel['y'];

exec('./getICPercent ' . $year . ' ' . $month . ' ' . $day . ' ' . $zoom . ' ' . $tilex . ' ' . $tiley . ' ' . $pixelx . ' ' . $pixely, $out);
echo json_encode($out);
//echo './getICPercent ' . $year . ' ' . $month . ' ' . $day . ' ' . $zoom . ' ' . $tilex . ' ' . $tiley . ' ' . $pixelx . ' ' . $pixely;
?>