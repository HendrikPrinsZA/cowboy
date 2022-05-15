#!/usr/bin/env sh

MESSAGE="Pong from Bash"
HOSTNAME=$(cat /etc/hostname)
NOW=$(date +"%Y-%m-%d %T")

response="{\"sucess\":true,\"message\":\"$MESSAGE\",\"hostname\":\"$HOSTNAME\",\"now\":\"$NOW\"}"

echo $response
