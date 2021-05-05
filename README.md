# Mailcord
An email client which sends emails to a discord channel through a webhook

## Using the app in dev mode
- Download from github
- run `npm install`
- run `npm start`

## Compiling the application yourself
- install the npm packages
- install electron-forge globally 
- run `electron-forge make --platform=platform` (replace platform with win32, darwin, or linux)

## Installation and setup
- Install it :) (idk how this works ok)
- This package has only been tested with a gmail account

### Setting up Gmail
- You probably have to enable imap in your gmail settings

#### Insecure method of connecting (simple but insecure-ish)
- You also probably need to enable less secure apps at https://myaccount.google.com/lesssecureapps

#### More secure method of connecting
- go to https://myaccount.google.com/security
- Enable 2-Step verification
- There will now be a **App Passwords** option
- Add a new app password with the mail option selected and name it whatever you want (It is easier to call it mailcord)
- use the password provided in the app password dialogue rather than your real password and you can turn off less secure apps


