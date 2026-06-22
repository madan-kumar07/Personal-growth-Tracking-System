# Algorithm: LIFEOS 365 – Personal Growth Tracking System

An algorithm is a step-by-step procedure for solving a problem. Below is the structured software engineering algorithm for the LIFEOS 365 application, formatted for project reports.

```txt
Step 1:  [START]
         Begin the execution of the program.

Step 2:  [INITIALIZE & WELCOME]
         a. Display the application welcome screen ("LIFEOS 365").
         b. Prompt the user and read the User's Name.

Step 3:  [DISPLAY MENU]
         Present the Main Menu console/UI with the following options:
         1. Habit Tracker
         2. Task Tracker
         3. Project Tracker
         4. Analytics Dashboard
         5. Exit

Step 4:  [READ CHOICE]
         Accept the user's menu selection (Choice).

Step 5:  [PROCESS CHOICE - DECISION BRANCHING]
         Evaluate the value of Choice:
         
         Case 1: If Choice = 1 (Habit Tracker)
                 i. Open Habit Tracker Module.
                 ii. Present Habit Operations: Add, Display, Update, Delete.
                 iii. Execute user-selected operation.
                 iv. Return to Step 3.

         Case 2: If Choice = 2 (Task Tracker)
                 i. Open Task Tracker Module.
                 ii. Present Task Operations: Add, Display, Complete, Delete.
                 iii. Execute user-selected operation.
                 iv. If Task is completed: Increment user XP (Experience Points).
                 v. Return to Step 3.

         Case 3: If Choice = 3 (Project Tracker)
                 i. Open Project Tracker Module.
                 ii. Present Project Operations: Add, Display, Update, Delete.
                 iii. Execute user-selected operation.
                 iv. If Project milestones are completed: Increment user XP.
                 v. Return to Step 3.

         Case 4: If Choice = 4 (Analytics Dashboard)
                 i. Compute system-wide statistics:
                    - Count total habits
                    - Count total tasks
                    - Count total projects
                    - Fetch current XP and Level
                    - Calculate Achievement Status
                 ii. Display the compiled statistics.
                 iii. Return to Step 3.

         Case 5: If Choice = 5 (Exit)
                 Go to Step 6.

         Default:
                 Display "Invalid Choice! Please select between 1 and 5."
                 Return to Step 3.

Step 6:  [TERMINATE]
         a. Display exit message ("Thank you for using LIFEOS 365!").
         b. [END] Terminate program execution.
```
