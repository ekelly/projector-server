#!/bin/sh

PROCESS="sh -c node server.js"
OUTPUT=$(ps aux | grep -v grep | grep "$PROCESS" | wc -l)

if [ "${OUTPUT}" -gt 0 ] ; then
  # Process is already running
  echo "Server is already running. Exiting"
  exit 0
else
  echo "Starting server"
  cd ~/projector-server
  npm start &
fi
