# Test Case: TC-013 Team Switcher Navigation after Creation

**ID**: TC-013
**Description**: Verify that creating a new team from the "Edit Team" mode redirects the user to the new team's dashboard or settings.
**Pre-conditions**:
- User is logged in.
- User is on the team detail page of an existing team (e.g., `/app/teams/1`).

**Steps**:
1. Open the Team Switcher.
2. Click on "Create Team".
3. Enter a new team name and confirm.
4. Observe the current URL.

**Expected Result**:
- The user should be redirected to either the main dashboard (`/app`) or the new team's detail page (`/app/teams/[NEW_ID]`).
- The active team in the UI should be the newly created team.
