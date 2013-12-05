#!/usr/bin/python

import cgi, cgitb
import send_message
import sys
import json

form = cgi.FieldStorage()
email = form.getvalue('email')
password = form.getvalue('password')

sendConfirm=send_message.sendConfirmationLink(email)

print 'Success: 200 OK'
print 'Content-Type: text/html'
print
print (email, password)
