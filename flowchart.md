# Flowchart: LIFEOS 365 – Personal Growth Tracking System

This document contains the system flowchart for the LIFEOS 365 application. 

Standard ISO software engineering flowchart symbols are used:
* **Oval (Stadium)**: Start / End of program.
* **Rectangle**: Processing steps (welcome, inputs, operations).
* **Diamond**: Decision branching (Main Menu selection).
* **Arrows**: Direction of control flow.

---

## 1. Vector Flowchart (Mermaid.js Format)

The diagram below renders dynamically as a vector graphic. 

```mermaid
graph TD
    %% Define Styles for Black and White Academic Theme
    classDef default fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000000;
    classDef startEnd fill:#ffffff,stroke:#000000,stroke-width:2.5px,color:#000000;
    classDef decision fill:#ffffff,stroke:#000000,stroke-width:2px,color:#000000;
    classDef process fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000000;

    %% Nodes
    Start([START]):::startEnd
    Welcome[Display Welcome Screen]:::process
    GetName[Get User Name]:::process
    MainMenu{Select Option<br>1-5?}:::decision
    
    %% Modules
    HabitSub[Habit Tracker Module]:::process
    TaskSub[Task Tracker Module]:::process
    ProjSub[Project Tracker Module]:::process
    AnalyticsSub[Analytics Module]:::process
    ExitApp[Exit Application]:::process
    End([END]):::startEnd

    %% Module Actions
    HabitOps[Perform Habit CRUD:<br>• Add Habit<br>• Display Habit<br>• Update Habit<br>• Delete Habit]:::process

    TaskOps[Perform Task CRUD:<br>• Add Task<br>• Display Task<br>• Complete Task<br>• Delete Task]:::process
    TaskXP[Update XP]:::process

    ProjOps[Perform Project CRUD:<br>• Add Project<br>• Display Project<br>• Update Project<br>• Delete Project]:::process
    ProjXP[Update XP]:::process

    AnalyticsOps[Calculate & Display:<br>• Total Habits / Tasks / Projects<br>• XP & Current Level<br>• Achievement Status]:::process

    %% Flow Connections
    Start --> Welcome
    Welcome --> GetName
    GetName --> MainMenu
    
    %% Choice Branching
    MainMenu -->|Choice = 1| HabitSub
    MainMenu -->|Choice = 2| TaskSub
    MainMenu -->|Choice = 3| ProjSub
    MainMenu -->|Choice = 4| AnalyticsSub
    MainMenu -->|Choice = 5| ExitApp
    
    %% Habit Flow
    HabitSub --> HabitOps
    HabitOps --> MainMenu
    
    %% Task Flow
    TaskSub --> TaskOps
    TaskOps --> TaskXP
    TaskXP --> MainMenu
    
    %% Project Flow
    ProjSub --> ProjOps
    ProjOps --> ProjXP
    ProjXP --> MainMenu
    
    %% Analytics Flow
    AnalyticsSub --> AnalyticsOps
    AnalyticsOps --> MainMenu
    
    %% Exit Flow
    ExitApp --> End
```

> [!TIP]
> **To export this flowchart in high resolution for your report:**
> 1. Copy the code block above.
> 2. Paste it into the free [Mermaid Live Editor (mermaid.live)](https://mermaid.live).
> 3. Click **Actions** -> **PNG** or **SVG** to download the diagram in ultra-high resolution.

---

## 2. Pre-rendered Graphic Asset

Below is a generated high-resolution visual representation of the flowchart for direct use.

![LIFEOS 365 Flowchart Graphic](file:///C:/Users/ADMIN/.gemini/antigravity/brain/db7e9b7d-e39e-4a26-8b19-e61c90ae1a26/lifeos_flowchart_1782120103482.png)
