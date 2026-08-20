# Feature Specifications

This directory contains spec-driven development files for each frontend feature.

## Structure

Each feature gets its own subdirectory with four files:

```
features/
└── <feature_name>/
    ├── <feature>_spec.md       # Full specification (requirements, UI, API, edge cases)
    ├── <feature>_clarify.md    # Clarification Q&A (questions + user answers)
    ├── <feature>_plan.md       # Technical implementation plan
    └── <feature>_tasks.md      # Ordered checklist of implementation steps
```

## Workflow

1. **Spec** → Agent writes specification based on user's feature request
2. **Clarify** → Agent asks questions, user answers, spec is updated
3. **Plan** → Agent creates technical plan referencing the constitution
4. **Tasks** → Agent breaks plan into atomic, checkable tasks
5. **Implement** → Agent writes code following the plan
6. **Verify** → Lint, type-check, visual QA

## Rules

- Never skip the specification step
- Always clarify before planning
- Update the spec when clarifications are resolved
- The constitution overrides any ad-hoc decisions
