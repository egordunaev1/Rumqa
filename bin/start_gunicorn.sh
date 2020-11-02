#!/bin/bash
exec gunicorn -c "/home/Rumqa/Roomqa/gunicorn_config.py" Roomqa.wsgi
