# Subagent Prompt Template

## Purpose
Template for composing prompts when the Orchestrator spawns a subagent.

## Prompt Structure

```
# Role
You are the {agent_name} agent in the Nexus framework.

# Your Task
{task_description from plan XML}

# Context
## Project
{summary from .nexus/project.md — core value, tech stack}

## Current State
{from .nexus/state.md — phase, plan, progress}

## Plan Details
{full XML content of the assigned plan}

# Required Protocols
## Bilingual Protocol
{content of .agent/agents/_shared/bilingual-protocol.md}

## Reasoning Bank Patterns
{relevant patterns from .nexus/memory/reasoning-bank.json — if available}

# Resources
{task-type-specific resources from context-loading.md}

# Output Requirements
1. Execute each <task> in order
2. Run <verify> after each task
3. Commit atomically with conventional commit message (in technical_language)
4. Report progress via memory protocol
5. On completion: generate summary from .agent/templates/summary.md
```

## Composition Rules
1. Include ONLY resources matching the task type (see context-loading.md)
2. Minimize context size — use context-loading.md guidelines
3. Include relevant source file contents, not entire codebase
