# 🎬 TaskMatrix — Demo Video Script (README & UI Focus)

**Target Length:** 3–4 minutes
**Tone:** Professional and feature-focused
**Format:** A continuous flow moving from the README documentation directly into a live demonstration of the UI.

---

### [0:00 - 0:20] 🚀 Part 1: Introduction

**[Visual]**
*Start with your camera on, or have the static Login page up on the screen.*

**[Audio - Voiceover]**
"Hello everyone! My name is Yash Soni, and today I’m presenting my frontend internship Capstone project: **TaskMatrix**.

TaskMatrix is a Jira and Asana-inspired project management application. I built this because I wanted to tackle a heavy UI challenge—building a tool that helps software teams organize tasks, track sprint progress, and manage their workload in a clean, unified workspace."

---

### [0:20 - 2:00] 📄 Part 2: Explaining Important Concepts via the README

**[Visual]**
*Open up VS Code or GitHub and show the `README.md` file. Scroll deliberately to the specific sections as you mention them. Highlight text with your mouse occasionally to guide the viewer's eyes.*

**[Audio - Voiceover]**
"Before we jump into the live application, I want to show you the README, which I designed as the complete Product Requirements Document for this project. There are three hugely important concepts I want to point out here.

*(Scroll to the 'Track & Role' and 'Tech Stack' tables)*
First, the Stack. Because my internship focused entirely on the Frontend Track, I chose the most demanding modern stack available: **Next.js 16** with the App Router, **React 19**, and the brand new **Tailwind CSS v4**. 

*(Scroll down to the 'State Architecture Diagram')*
Second, the State Architecture. Since there is no actual database, how does the app store data? I mapped out the entire application's data flow using **Zustand 5**. You can see here in the architecture diagram that state is divided across five specific stores: Auth, Tasks, Projects, Team, and Notifications. Every action a user takes interacts with these stores seamlessly.

*(Scroll down to the 'Mock API Endpoints' table)*
Third, and most importantly, the Mock API Layer. Even though the app uses client-side Zustand state, I wanted it to behave exactly like a real production app. So, I engineered a Mock API layer. Here you can see a list of simulated REST endpoints. When the user creates a task, the UI doesn't just instantly update the store—it calls one of these async simulated endpoints, which creates a 300-millisecond network delay before saving. 

This means my UI code is written identically to an app talking to a real server. If we added a Postgres database tomorrow, the frontend component code wouldn't need to change at all.

Now, let's see how that comes to life in the UI."

---

### [2:00 - 3:00] 🎨 Part 3: UI Demo — Login & Dashboard

**[Visual]**
*Switch over to the live running application (`localhost:3000`). Show the split-panel Login screen, hit "Sign In", and land on the Dashboard. Hover over the stat cards and scroll the activity feed.*

**[Audio - Voiceover]**
"Let’s see the UI in action. 

It starts with this premium split-panel login design. The left side builds brand trust with a gradient layout, while the right side handles authentication. When we click 'Sign In', we are taken instantly to the Dashboard.

Every piece of data on this Dashboard is computed live from the Zustand stores. You immediately see your top-level stats: Total Tasks, Completed, and Overdue tasks. Working our way down the page, you have a weekly completion chart, a list of your most recent assignments with color-coded priority badges, your active projects, and a real-time activity feed that logs all team actions."

---

### [2:30 - 3:15] 💻 Part 4: UI Demo — The Kanban Core

**[Visual]**
*Click on the "Tasks" link in the sidebar to navigate to the Kanban board. Grab a task and drag it across columns. Open the New Task Dialog using the "plus" button inside a column header.*

**[Audio - Voiceover]**
"The core feature of TaskMatrix is the Kanban board. I built a fluid, drag-and-drop 5-column board. 

Moving cards between 'To Do', 'In Progress', and 'Review' provides instant visual feedback. Each card is packed with scannable information including tag pills and assignee avatars, without feeling cluttered. 

If we need to create a new task, we don’t get redirected to a clunky form page. We just hit the plus icon in our desired column, and a clean, fully accessible modal opens up. This allows us to rapidly enter titles, assign priorities, set due dates, and update the board seamlessly."

---

### [3:15 - 3:45] 🏁 Part 5: Polish & Outro

**[Visual]**
*Click on the top-bar notification bell to show the dropdown. Then, click the theme toggle to switch the entire application from Dark Mode to Light Mode. Switch back to your camera or pause on the Dashboard.*

**[Audio - Voiceover]**
"To finish the workspace experience, I included a notification center right here in the top bar, and built robust theme support. With one click, the entire application drops into a stunning Light Mode, powered natively via CSS variables.

Building TaskMatrix was a fantastic challenge in UI design and heavy frontend state management. I'm very proud of how the interface turned out. 

Thank you so much for taking the time to review my project!"
