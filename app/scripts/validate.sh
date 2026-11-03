#!/bin/bash
set -euo pipefail
for i in {1..20}; do if curl -fsS http://127.0.0.1:3000/health; then exit 0; fi; sleep 2; done
exit 1
