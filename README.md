# pfSense Firewall Rules Manager

A GAS web-app to manage pfSense FW rules from a Google Sheets spreadsheet

- [overview](#overview)
- [screenshots](#screenshots)
- [to use](#to-use)
- [how it works](#how-it-works)
- [to do](#to-do)
- [about Google Apps Script, permissions, and security](#about-google-apps-script-permissions-and-security)
- [self-publish](#self-publish)
- [disclaimer and warnings](#disclaimer-and-warnings)
- [contact, support, help](#contact-support-help)

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


![001](/screenshots/001.png)
![002](/screenshots/002.png)
![003](/screenshots/003.png)

## to use

You have two options:

- you can use the one I published at https://script.google.com/macros/s/AKfycby0nVfwX-AKKwhydWfojp0AxlL5zUHdKbRs0iCEZAvziDao8Iou/exec (see [about Google Apps Script, permissions, and security](#about-google-apps-script-permissions-and-security))
- [self-publish your own copy](#self-publish)

## how it works

- the app parses pfSense's **Backup & Restore** XML file into a table
- I recommend exporting your configuration from pfSense and then importing them with this app to see how the data is stored
- then you can copy data from other rows to create new firewall rules

## to do

- download CSV/XML file

## about Google Apps Script, permissions, and security

For those who are not familiar with [Google Apps Script](https://developers.google.com/apps-script/):

- Google Apps Script web-apps can be published in many ways
- you can read more about this at https://developers.google.com/apps-script/guides/web#permissions
- mine is published with ([screenshot](/screenshots/gas-published-settings.png)):
  - **Execute the app as**: `User accessing the web app`
  - **Who has access to the app**: `Anyone`
- this means that when you go to the app, it will run under **your Google account**
- this is so the app can read/write Google Sheet files from your account
- I personally cannot access your Google account, **the app can**
- you can see the code yourself to make sure the app is not doing anything nefarious like reading your Google files/emails and sending them to me
- **the first time you go to the app, it will ask you to authorize the app to run as you**
- **if you do not trust me, you can go the [self-publish](#self-publish) route**

## self-publish

These instructions require a little knowledge/understanding of [Google Apps Script](https://www.google.com/script/start/). There are many articles online about it if you get lost.

1. Create a new script by going to [https://script.google.com/home/projects/create](https://script.google.com/home/projects/create)
2. You will need to create 3 files in your project and copy the contents from the files in this repos:
   - `web app.gs` => [https://github.com/imthenachoman/pfSense-Firewall-Rules-Manager/blob/main/web%20app.js](https://github.com/imthenachoman/pfSense-Firewall-Rules-Manager/blob/main/web%20app.js)
   - `xml rule schemas.gs` => [https://github.com/imthenachoman/pfSense-Firewall-Rules-Manager/blob/main/xml%20rule%20schemas.js](https://github.com/imthenachoman/pfSense-Firewall-Rules-Manager/blob/main/xml%20rule%20schemas.js)
   - `index.html` => [https://github.com/imthenachoman/pfSense-Firewall-Rules-Manager/blob/main/index.html](https://github.com/imthenachoman/pfSense-Firewall-Rules-Manager/blob/main/index.html)
3. Save the project and deploy as a `web app` with these settings:
   - `Execute as`: `User accessing the web app`
   - `Who has access`: either option
4. Then go to the URL of your deployed web-app.

## disclaimer and warnings

- Please use at your own discretion. This app comes with no warranty. I am not responsible for anything resulting from this app.
- it is rather dumb in that it is not aware of your pfSense configuration, like what VLANs you have, what your IPs are, etc...; it only knows what it sees in the XML file
- not all pfSense firewall rule settings are included (...yet)

**Remember to make a backup of your pfSense configuration.**

## contact, support, help

Submit a new issue at https://github.com/imthenachoman/pfSense-Firewall-Rules-Manager/issues/new.
