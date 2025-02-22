#!/bin/bash

# Install dependencies (not needed in Heroku since it installs requirements.txt automatically)
pip install -r requirements.txt

# Start Gunicorn server
gunicorn -b 0.0.0.0:5000 app:app
