1. Open a fresh Claude Code chat. Paste the full contents of `phases/01-discover.md`. Send it.
2. Answer every question Claude asks using the multiple-choice interface. When Claude stops asking and writes files, Phase 1 is complete. Note the `[project-name]` folder it created.
3. Open a fresh chat. Open `phases/02-engineer.md`. Replace `[PROJECT_FOLDER_PATH]` at the top with the full path to your `[project-name]` folder. Paste the full file contents. Send it.
4. Answer any questions Claude asks. When it writes `refined-prompt.md` to your project folder, Phase 2 is complete.
5. Open a fresh chat. Open `phases/03-orchestrate.md`. Replace `[PROJECT_FOLDER_PATH]`. Paste full contents. Send it.
6. Answer any questions. When it writes `state.json` and `prompt-NN.md` files to `[project-name]/orchestration/`, Phase 3 is complete.
7. Open a fresh chat. Open `phases/04-ground.md`. Replace `[PROJECT_FOLDER_PATH]`. Paste full contents. Send it.
8. Answer any questions about exact values. When it writes files to `[project-name]/context/`, Phase 4 is complete.
9. Open `[project-name]/orchestration/README.md`. Locate `prompt-01.md` in the execution table.
10. Open a fresh chat. Open `prompt-01.md`. Paste its FULL contents. Send it. Wait for completion before proceeding.
11. If the step completed without errors → go to step 12. If the step failed → go to step 14.
12. Open the next prompt in sequence (`prompt-02.md`, `prompt-03.md`, ...). Repeat step 10. Continue until all prompts are done. Go to step 13.
13. Open `[project-name]/orchestration/state.json`. If `pendingSteps` is empty → build is complete. If `pendingSteps` is not empty → go to step 14.
14. Open `claude-build-system/methodology/04-meta-system/system-integrity-rules.md`. Find the matching failure mode and follow the recovery instructions.
