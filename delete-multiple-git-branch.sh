#!/bin/bash

# Deletes all local branches except the current one and main/master branches.

# Get the current branch name
current_branch=$(git branch --show-current)

# Get a list of all local branches excluding 'main' and 'master'
branches=$(git branch --list | grep -vE "^\*|main|master" | sed 's/^  //')

if [ -z "$branches" ]; then
  echo "No branches to delete."
  exit 0
fi

for branch in $branches; do
  if [ "$branch" != "$current_branch" ]; then
    git branch -D "$branch" && echo "Deleted branch: $branch" || echo "Failed to delete branch: $branch"
  else
    echo "Skipping current branch: $current_branch"
  fi
done
