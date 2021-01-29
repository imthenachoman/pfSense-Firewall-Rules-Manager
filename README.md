# pfSense Firewall Rules Manager

A GAS web-app to manage pfSense FW rules from a Google Sheets spreadsheet

1. overview
1. to use


## overview

I am not a fan of the pfSense rule editor. I like having all of my rules in one table.

So I wrote a [Google Apps Script](https://developers.google.com/apps-script/) web-app to make it easier for me to **view the rules** I have and to **create new rules**. I wrote this for myself and thought others might be interested so I am sharing with others.

The app lets you:

- convert the firewall rules from pfSense's **Backup & Restore** XML file into a CSV or Google Sheet; you can:
  - upload the XML file or manually enter it
  - create a new Google Sheet, use an existing one, or get the CSV string
- convert a CSV or Google Sheet table back to an XML file that you can import into pfSense; you can:
  - select a Google Sheet, upload a CSV file, or manually enter the CSV 

## screenshots

WIP

## to use

You have two options:

- you can use the one I published at https://script.google.com/macros/s/AKfycby0nVfwX-AKKwhydWfojp0AxlL5zUHdKbRs0iCEZAvziDao8Iou/exec (see [about Google Apps Script, permissions, and security](#about-google-apps-script-permissions-and-security))
- [self-publish your own copy](#self-publish)

## about the app

- the app parses pfSense's **Backup & Restore** XML file into a table
- it is rather dumb in that it is not aware of your pfSense configuration, like what VLANs you have, what your IPs are, etc...; it only knows what it sees in the XML file
- I recommend exporting your configuration from pfSense and then importing them with this app to see how the data is stored
- then you can copy data from other rows to create new firewall rules

## about Google Apps Script, permissions, and security

For those who are not familiar with [Google Apps Script](https://developers.google.com/apps-script/):

- Google Apps Script web-apps can be published in many ways
- you can read more about this at https://developers.google.com/apps-script/guides/web#permissions
- mine is published with:
  - **Execute the app as**: `User accessing the web app`
  - **Who has access to the app**: `Anyone`
- this means that when you go to the app, it will run under **your Google account**
- this is so the app can read/write Google Sheet files from your account
- I personally cannot access your Google account, **the app can**
- you can see the code yourself to make sure the app is not doing anything nefarious like reading your Google files/emails and sending them to me
- **the first time you go to the app, it will ask you to authorize the app to run as you**
- **if you do not trust me, you can go the [self-publish](#self-publish) route**

## self-publish

WIP

