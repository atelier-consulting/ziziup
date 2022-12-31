#!/usr/bin/env node

const args = process.argv.slice(2)

if (args.length === 0) {
  const dotenv = require('dotenv')
  dotenv.config()
}

const FtpDeploy = require('ftp-deploy')
const path = require('path')

const ftp = new FtpDeploy()

if (process.env.FTP_USER && process.env.FTP_PASS && process.env.FTP_HOST) { 
  const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS,
    host: process.env.FTP_HOST,
    port: 21,
    localRoot: path.join(__dirname, "demo"),
    remoteRoot: '/clients/ziziup/dev/',
    include: ["**/*"],
    deleteRemote: false,
    forcePasv: true,
  }

  ftp
    .deploy(config)
    .then(res => console.log(`Finished: ${res}`))
    .catch(err => console.log(err))
} else {
  console.error('Couldn\'t find .env file')
  process.exit(1)
}
