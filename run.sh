#!/bin/bash

# Install any missing dependencies (optional)
pip install -r requirements.txt

# Run the Flask app using Gunicorn in production mode
gunicorn -b 0.0.0.0:5000 app:app
