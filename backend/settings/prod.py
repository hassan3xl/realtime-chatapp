"""
Production settings for chatapp project.
"""

import os
from .base import *  # noqa: F401, F403

DEBUG = False

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# CORS — restrict in production
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
