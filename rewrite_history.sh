#!/bin/bash
git filter-branch --force --env-filter '
if [ "$GIT_AUTHOR_EMAIL" = "noreply@lovable.dev" ]; then
    GIT_AUTHOR_NAME="VinitBaria"
    GIT_AUTHOR_EMAIL="vinitbaria2006@gmail.com"
fi
if [ "$GIT_COMMITTER_EMAIL" = "noreply@lovable.dev" ]; then
    GIT_COMMITTER_NAME="VinitBaria"
    GIT_COMMITTER_EMAIL="vinitbaria2006@gmail.com"
fi
' --tag-name-filter cat -- --all
