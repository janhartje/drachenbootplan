# Test Case: iCal Integration (Sync)

**ID**: TC-020
**Description**: Verifies that a team captain can add an iCal URL to their team settings and manually trigger a sync, importing events correctly.
**Pre-conditions**:
- User is logged in as Captain of a team.
- A valid iCal URL is available (e.g., from Kadermanager or Google Calendar).
- Team has no existing events that conflict with the import (or test duplicates).

**Steps**:
1. Navigate to **Team Settings**.
2. Locate the "iCal Integration" section (or "Kalender-Integration").
3. Enter a valid `iCal URL` (http/webcal).
4. Click **Save** (Speichern).
5. Verify success message and that URL is saved.
6. Click the **Sync Now** button (next to the URL).
7. Wait for success confirmation.
8. Navigate to **Planner** (Trainingsplan).
9. Verify that events from the iCal feed appear in the calendar.
10. Click **Sync Now** again.
11. Verify that no duplicate events are created (idempotency).

**Expected Result**:
- iCal URL is saved in database.
- "Sync Now" imports events:
    - Title matches `SUMMARY`.
    - Date matches `DTSTART`.
    - Type defaults to `training`.
- Duplicate syncs do not create duplicate events.
