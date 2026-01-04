# Test Case: TC-014 Onboarding Skills Validation

**ID**: TC-014
**Description**: Verify that the onboarding modal enforces skill selection.
**Pre-conditions**:
- New user logs in for the first time.
- Onboarding modal is displayed.

**Steps**:
1. Enter a valid name.
2. Enter a valid weight.
3. Leave all skills unselected.
4. Try to click "Complete Profile" (it should be disabled) OR click it (if not disabled) and observe.

**Expected Result**:
- The "Complete Profile" button should be disabled if no skills are selected.
- OR it should show an error message "At least one skill must be selected".
- The modal must not close if no skills are selected.
