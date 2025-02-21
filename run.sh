#!/bin/bash

# Set the Flask app environment variable
export FLASK_APP=app.py

# Set the Flask environment to development (for local testing)
export FLASK_ENV=development

# Run the Flask app on the default port 5000
flask run
