<?php
 $to = "james.s.yang@nasa.gov";
 $subject = "Of course you can...";
 $body = "See the script \\var\\www\\cgi-bin\\send_email.php as an example.
Is this going to be controlled notifications or are you going to send
email based on user input from a form?  IF the latter, please
be VERY careful to check every field to make sure you are recieving 
expected characters.  Otherwise, a hacker could easily abuse the
system to spam NASA employees and contractors.  That would NOT be
a good thing.

Thanks,
-Carolyn";

 $headers = "From: SomethingICA@.nasa.gov" . "\r\n" .
           "CC: carolyn.r.owen@nasa.gov";

 if (mail($to, $subject, $body, $headers)) {
   echo("<p>Email successfully sent!</p>");
  } else {
   echo("<p>Email delivery failed.</p>");
  }
?>
