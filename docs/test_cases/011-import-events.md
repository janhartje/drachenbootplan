# Test Case: Import Events via CSV

**ID**: TC-011
**Description**: Verify that events (trainings and regattas) can be imported in bulk using the sample CSV file provided in the repository.
**Pre-conditions**:
- User is logged in as Admin/Captain.
- The sample file `docs/test_cases/test-events.csv` is available.
- CSV Headers: `Title,Date,Time,Type,BoatSize,Comment`

**Steps**:
1. Navigate to the Team Dashboard.
2. Click the "Importieren" button (available for Captains).
3. Switch to the "Termine" (Events) tab in the import modal.
4. Select the file from the repository at `docs/test_cases/test-events.csv`.
5. Verify the preview modal displays the correct number of events (15 rows in the sample file).
6. Verify the preview shows correct data:
   - Event titles (e.g., "Training Dienstag Abend", "Regatta Hannover Cup")
   - Dates in correct format (YYYY-MM-DD)
   - Times (HH:MM format)
   - Types (training/regatta)
   - BoatSize (standard/small)
   - Comments (some rows have comments, some are empty)
7. Click the "Importieren" confirmation button.
8. Verify that the events are correctly added to the calendar/event list.

**Expected Result**:
- The import modal opens automatically upon file selection/processing.
- Data is correctly parsed:
  - "Title" maps to event title
  - "Date" is parsed as date (format: YYYY-MM-DD or DD.MM.YYYY)
  - "Time" is parsed as time (HH:MM)
  - "Type" is correctly identified as "training" or "regatta"
  - "BoatSize" is mapped to either "standard" (20 seats) or "small" (10 seats)
  - "Comment" field is optional and correctly stored
- All 15 events from the CSV are added to the team calendar.
- Event count updates correctly in the UI.
- Events are displayed with correct icons/badges for type (training vs regatta).

**Test Data Coverage**:
The `test-events.csv` file includes:
- Mix of training (11) and regatta (4) events
- Both standard (12) and small (3) boat sizes
- Various time slots (morning, afternoon, evening)
- Some events with comments, some without
- Special characters (emojis like 🍕) in comments
- Date range spanning multiple months (January - April 2026)

**Edge Cases to Verify**:
- Events without comments are imported correctly (empty comment field)
- Events with special characters in comments
- Different boat sizes are correctly assigned
- Date formatting is handled correctly
