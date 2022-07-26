#!/bin/bash
docker build -t glukhota/sollar_blockchain:latest .
docker login docker.io
docker push glukhota/sollar_blockchain:latest
