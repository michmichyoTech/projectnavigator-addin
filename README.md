# Project Navigator Add-in

`project-navigator-addin` is the future workspace for the MS Project task pane add-in.

## Purpose

This project will host:

- the Office add-in shell
- the MS Project task pane UI
- the Office adapter
- the bridge to `project-navigator-core`

It will not host:

- parser or API work
- standalone web application behavior
- duplicated business logic already extracted in `project-navigator-core`

## How to work in this folder

This workspace is organized so it can be used on its own.

Core guidance lives in:

- `spec/backlog.md`
- `spec/next-step.md`
- `spec/current-step.md`
- `spec/task-breakdown.md`
- `spec/function-list.md`
- `spec/validation-log.md`
- `spec/code-map.md`
- `spec/rules.md`

Code areas:

- `src/taskpane`
  - task pane composition and UI shell
- `src/office`
  - Office.js boundary
- `src/core`
  - bridge to `project-navigator-core`
- `src/mock`
  - mock data source for local checks

## Current status

- the add-in architecture is prepared
- a partial Yeoman scaffold exists in `Project Navigator Add-in/`
- the recovery and promotion strategy is now captured in `spec/`
- the next actionable step is described in `spec/next-step.md`
