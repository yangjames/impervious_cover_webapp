#!/usr/bin/python

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def sendConfirmationLink(email):
    msg=MIMEMultipart('alternative')
    msg['Subject']='Welcome to ICDMT!'
    msg['From']='registration@nasa.gov'
    msg['To']=email
   
    link='http://sample.link.that.does.nothing.com/'
    body="Thank you for making an account with ICDMT!\nPlease click the following link to finish the registration process:\n%s"%link
   
    part1=MIMEText(body,'plain')
    msg.attach(part1)
    
    try:
        s=smtplib.SMTP('mailhost')
    except smtplib.socket.gaierror:
        return False
    try:
        s.sendmail(msg['From'],msg['To'],msg.as_string())
        return True
    except Exception:
        return False
    finally:
        s.quit()
