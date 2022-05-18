#!/bin/bash

docker-compose down

docker-compose kill

docker-compose up -d --build