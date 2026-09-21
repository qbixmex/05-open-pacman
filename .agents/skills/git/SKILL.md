---
name: git
description: Basic Git workflows — initialize a repo, inspect status/diff/history, stage and commit with a title and optional body, manage branches/remotes, undo changes, and sync with a remote. Use when the user asks to init a repository, check git status or log, stage files, make a commit, or run basic git commands.
---

# Basic Git

Only run git commands the user asks for. Never commit, push, or discard changes on your own initiative.

## Initialize

- `git init` — create a repository in the current directory.

## Inspect

- `git status` — working tree and staging state.
- `git diff` — unstaged changes; `git diff --staged` — staged changes.
- `git log --oneline --graph --all` — compact history graph across branches.
- `git branch` — list branches; `git branch <name>` — create.
- `git remote -v` — list remotes; `git remote add origin <url>` — add one.

## Stage

- `git add <path>...` — stage specific files.
- `git add -A` — stage all changes.

## Commit

1. If the user did not provide a title, ask for it. The title is required.
2. Then ask whether they want a body. It is optional; if yes, ask for the text.
3. Confirm something is staged (`git status --short`). If nothing is staged, ask whether to stage the relevant files first.
4. Run one of:
   - Title only: `git commit -m "<title>"`
   - Title + body: `git commit -m "<title>" -m "<body>"`
5. Do not add trailers or co-author lines unless asked. Do not use `--amend` or `--no-verify` unless asked.

## Undo

- `git restore <path>` — discard working-tree changes.
- `git restore --staged <path>` — unstage while keeping the changes.

## Sync

- `git pull` — fetch and merge the current branch.
- `git push` — push the current branch.
- Never force push unless the user explicitly asks.

## If a command fails

Report the error. Common causes: missing `user.name`/`user.email` (`git config user.name "…"`), a repo with no commits yet, or no upstream set (`git push -u origin <branch>`).
