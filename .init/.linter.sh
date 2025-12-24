#!/bin/bash
cd /home/kavia/workspace/code-generation/resume-insights-platform-301637-301647/resume_frontend_dashboard
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

