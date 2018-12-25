These examples contain same body "日本語の本文がQuoted Printableになっているもの".
Searching "日本語" in bodies should match all of them.

Steps to tests:

 1. Setup a local folder account.
 2. Drag these .eml files and drop to the inbox of the local folder account to import.
 3. Search "日本語" in bodies.

Expected result:

Three imported mails are found.

Actual result:

 * Thunderbird 60.4:
   - Only UTF-8 and Shift_JIS cases are found.

