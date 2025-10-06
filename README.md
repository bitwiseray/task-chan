# Shift Management Bot

> Keep your team on track, broadcast tasks, and manage shifts like a boss. 💼✨

---

## Features

* **Assign Shifts:** Assign tasks to team members easily with automatic timestamps.
* **Status Tracking:** Monitor task status (`STARTED`, `COMPLETED`, `REJECTED`, etc.) at a glance.
* **Task Broadcasting:** Announce tasks to the entire server or specific roles using rich embeds.
* **Timestamps & Deadlines:** Automatically display human-readable relative timestamps.
* **User-Friendly Embeds:** Clean, readable task embeds with status emojis and assignment info.
* **Simple Commands:** Intuitive commands for assigning, starting, completing, or rejecting tasks.

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/task-chan.git
cd shift-management-bot
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your bot token and optional config:

```env
token=your-bot-token
```

4. Run the bot:

```bash
node index.js
```

---

## Configuration

* **Broadcast Channels:** Customize which roles/channels receive task broadcasts in `color.js`..

---

## Tips & Tricks

* Keep your task descriptions short and clear for better embed readability.
* Use relative timestamps for easy tracking of deadlines.
* Broadcast high-priority tasks to a specific role to alert the right team members.

---

## Contributing

Pull requests are welcome, 😘!
Feel free to improve task formatting, add new commands, or enhance broadcast functionality.
