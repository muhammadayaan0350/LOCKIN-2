/* =========================================================
   LOCKIN — SHARED SCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* -----------------------------------------------------
       BASIC PAGE DETECTION
    ----------------------------------------------------- */

    const isStudy = document.body.classList.contains("study-page");
    const isWorkout = document.body.classList.contains("workout-page");

    if (isStudy) initStudy();
    if (isWorkout) initWorkout();

});


/* =========================================================
   SHARED
   ========================================================= */

function setupNavigation(titleElementId) {

    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".page-section");
    const title = document.getElementById(titleElementId);

    navItems.forEach(button => {

        button.addEventListener("click", () => {

            const target = button.dataset.section;

            navItems.forEach(item => item.classList.remove("active"));
            button.classList.add("active");

            sections.forEach(section => {
                section.classList.toggle(
                    "active",
                    section.id === target
                );
            });

            if (title) {
                title.textContent =
                    button.textContent.trim();
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

    });


    document.querySelectorAll("[data-section-target]").forEach(button => {

        button.addEventListener("click", () => {

            const target = button.dataset.sectionTarget;
            const targetButton =
                document.querySelector(
                    `.nav-item[data-section="${target}"]`
                );

            if (targetButton) {
                targetButton.click();
            }

        });

    });

}


function setupModals() {

    document.querySelectorAll("[data-close]").forEach(button => {

        button.addEventListener("click", () => {

            const id = button.dataset.close;
            const modal = document.getElementById(id);

            if (modal) {
                modal.classList.remove("open");
            }

        });

    });

    document.querySelectorAll(".modal").forEach(modal => {

        modal.addEventListener("click", event => {

            if (event.target === modal) {
                modal.classList.remove("open");
            }

        });

    });

}


/* =========================================================
   STUDY
   ========================================================= */

function initStudy() {

    setupNavigation("pageTitle");
    setupModals();

    initStudyTheme();
    initQuotes();
    initPomodoro();
    initTasks();
    initSubjects();
    initCalendar();
    initFocusMode();
    initStudyReset();

    updateStudyStats();
}


/* ---------------------------------------------------------
   STUDY THEME
--------------------------------------------------------- */

function initStudyTheme() {

    const button = document.getElementById("studyTheme");

    const saved = localStorage.getItem("lockin-study-theme");

    if (saved === "light") {
        document.body.classList.add("light-mode");
    }

    if (button) {

        button.addEventListener("click", () => {

            document.body.classList.toggle("light-mode");

            localStorage.setItem(
                "lockin-study-theme",
                document.body.classList.contains("light-mode")
                    ? "light"
                    : "dark"
            );

        });

    }

}


/* ---------------------------------------------------------
   QUOTES
--------------------------------------------------------- */

function initQuotes() {

    const quotes = [
        "Small progress is still progress.",
        "Discipline beats motivation.",
        "One focused hour can change your day.",
        "Start before you're ready.",
        "You don't need motivation. You need momentum.",
        "Do the work. Then do it again.",
        "Your future self is watching.",
        "No zero days."
    ];

    const quote = document.getElementById("quote");
    const button = document.getElementById("quoteButton");

    function newQuote() {

        if (!quote) return;

        quote.textContent =
            quotes[Math.floor(Math.random() * quotes.length)];

    }

    if (button) {
        button.addEventListener("click", newQuote);
    }

}


/* ---------------------------------------------------------
   POMODORO
--------------------------------------------------------- */

function initPomodoro() {

    const display = document.getElementById("timerDisplay");
    const bigDisplay = document.getElementById("bigTimerDisplay");
    const overlayDisplay =
        document.getElementById("focusOverlayTimer");

    const progress =
        document.getElementById("timerProgress");

    const status =
        document.getElementById("timerStatus");

    const preset =
        document.getElementById("timerPreset");

    let totalSeconds = 25 * 60;
    let remaining = totalSeconds;
    let interval = null;
    let running = false;
    let sessionType = "focus";

    function render() {

        const minutes =
            Math.floor(remaining / 60);

        const seconds =
            remaining % 60;

        const text =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        if (display) display.textContent = text;
        if (bigDisplay) bigDisplay.textContent = text;
        if (overlayDisplay) overlayDisplay.textContent = text;

        if (progress) {

            const percentage =
                ((totalSeconds - remaining) / totalSeconds) * 100;

            progress.style.width =
                `${Math.max(0, Math.min(100, percentage))}%`;

        }

    }

    function start() {

        if (running) return;

        running = true;

        if (status) {
            status.textContent =
                sessionType === "focus"
                    ? "Stay focused."
                    : "Take a proper break.";
        }

        interval = setInterval(() => {

            remaining--;

            render();

            if (remaining <= 0) {

                clearInterval(interval);
                interval = null;
                running = false;

                if (sessionType === "focus") {

                    const sessions =
                        Number(localStorage.getItem("lockin-sessions") || 0) + 1;

                    const xp =
                        Number(localStorage.getItem("lockin-xp") || 0) + 100;

                    localStorage.setItem(
                        "lockin-sessions",
                        sessions
                    );

                    localStorage.setItem(
                        "lockin-xp",
                        xp
                    );

                    alert("🔥 Focus session complete! +100 XP");

                }

                status.textContent = "Session complete.";

                updateStudyStats();

            }

        }, 1000);

    }

    function pause() {

        if (interval) {
            clearInterval(interval);
            interval = null;
        }

        running = false;

        if (status) {
            status.textContent = "Paused.";
        }

    }

    function reset(minutes = 25, type = "focus") {

        pause();

        sessionType = type;

        totalSeconds = minutes * 60;
        remaining = totalSeconds;

        render();

        if (status) {
            status.textContent =
                type === "focus"
                    ? "Ready to focus"
                    : "Break time";
        }

        const label =
            document.getElementById("timerModeLabel");

        if (label) {
            label.textContent =
                type === "focus" ? "FOCUS" : "BREAK";
        }

    }

    document.getElementById("startTimer")
        ?.addEventListener("click", start);

    document.getElementById("pauseTimer")
        ?.addEventListener("click", pause);

    document.getElementById("resetTimer")
        ?.addEventListener("click", () => reset());

    document.getElementById("bigStart")
        ?.addEventListener("click", start);

    document.getElementById("bigPause")
        ?.addEventListener("click", pause);

    document.getElementById("bigReset")
        ?.addEventListener("click", () => reset());

    document.getElementById("shortBreak")
        ?.addEventListener("click", () => reset(5, "break"));

    document.getElementById("longBreak")
        ?.addEventListener("click", () => reset(10, "break"));

    document.getElementById("focusOverlayStart")
        ?.addEventListener("click", start);

    preset?.addEventListener("change", () => {

        if (preset.value === "25") {
            reset(25);
        }

        if (preset.value === "50") {
            reset(50);
        }

        if (preset.value === "custom") {

            const value =
                Number(prompt("Focus duration in minutes:", "30"));

            if (value > 0 && value <= 180) {
                reset(value);
            } else {
                preset.value = "25";
            }

        }

    });

    render();

}


/* ---------------------------------------------------------
   TASKS
--------------------------------------------------------- */

function initTasks() {

    let tasks =
        JSON.parse(
            localStorage.getItem("lockin-tasks") || "[]"
        );

    const list =
        document.getElementById("taskList");

    const todayList =
        document.getElementById("todayTasks");

    const modal =
        document.getElementById("taskModal");

    const addButton =
        document.getElementById("addTaskButton");

    const form =
        document.getElementById("taskForm");

    const filter =
        document.getElementById("taskFilter");

    const priorityFilter =
        document.getElementById("priorityFilter");

    const sort =
        document.getElementById("sortTasks");


    function save() {

        localStorage.setItem(
            "lockin-tasks",
            JSON.stringify(tasks)
        );

        render();

        updateStudyStats();

    }


    function priorityValue(priority) {

        return {
            high: 3,
            medium: 2,
            low: 1
        }[priority] || 0;

    }


    function getFiltered() {

        let result = [...tasks];

        if (filter?.value === "active") {
            result = result.filter(task => !task.completed);
        }

        if (filter?.value === "completed") {
            result = result.filter(task => task.completed);
        }

        if (priorityFilter?.value !== "all") {

            result = result.filter(
                task =>
                    task.priority === priorityFilter.value
            );

        }

        if (sort?.value === "priority") {

            result.sort(
                (a, b) =>
                    priorityValue(b.priority) -
                    priorityValue(a.priority)
            );

        }

        if (sort?.value === "due") {

            result.sort(
                (a, b) =>
                    (a.due || "9999") -
                    (b.due || "9999")
            );

        }

        return result;

    }


    function render() {

        if (!list) return;

        const filtered = getFiltered();

        if (filtered.length === 0) {

            list.innerHTML = `
                <div class="panel">
                    <p style="color:#777">
                        No tasks here. Add one and lock in.
                    </p>
                </div>
            `;

        } else {

            list.innerHTML = filtered.map(task => `

                <div class="task-item ${task.completed ? "done" : ""}">

                    <input
                        class="task-check"
                        type="checkbox"
                        data-task-id="${task.id}"
                        ${task.completed ? "checked" : ""}
                    >

                    <div class="task-info">

                        <strong>${escapeHTML(task.title)}</strong>

                        <small>
                            ${escapeHTML(task.subject)}
                            ${task.due ? " • Due " + task.due : ""}
                            • ${task.minutes} min
                        </small>

                    </div>

                    <span class="priority ${task.priority}">
                        ${task.priority}
                    </span>

                    <button
                        class="delete-task"
                        data-delete-task="${task.id}">
                        ×
                    </button>

                </div>

            `).join("");

        }


        if (todayList) {

            const active =
                tasks.filter(task => !task.completed).slice(0, 4);

            todayList.innerHTML =
                active.length
                    ? active.map(task => `
                        <div class="mini-task">
                            <input
                                type="checkbox"
                                class="task-check"
                                data-task-id="${task.id}"
                            >
                            <div class="task-info">
                                <strong>${escapeHTML(task.title)}</strong>
                                <small>${escapeHTML(task.subject)}</small>
                            </div>
                        </div>
                    `).join("")
                    : `<div class="mini-task">
                        <span>🎉</span>
                        <div class="task-info">
                            <strong>All clear.</strong>
                            <small>Nothing waiting.</small>
                        </div>
                    </div>`;

        }

    }


    document.addEventListener("click", event => {

        const check =
            event.target.closest("[data-task-id]");

        if (check && check.matches("input")) {

            const id = Number(check.dataset.taskId);

            const task =
                tasks.find(item => item.id === id);

            if (!task) return;

            task.completed = check.checked;

            if (task.completed) {

                const xp =
                    Number(localStorage.getItem("lockin-xp") || 0) + 25;

                localStorage.setItem(
                    "lockin-xp",
                    xp
                );

            }

            save();

        }


        const deleteButton =
            event.target.closest("[data-delete-task]");

        if (deleteButton) {

            const id =
                Number(deleteButton.dataset.deleteTask);

            tasks =
                tasks.filter(task => task.id !== id);

            save();

        }

    });


    addButton?.addEventListener("click", () => {

        modal?.classList.add("open");

    });


    form?.addEventListener("submit", event => {

        event.preventDefault();

        const title =
            document.getElementById("taskTitle").value.trim();

        if (!title) return;

        const task = {

            id: Date.now(),

            title,

            subject:
                document.getElementById("taskSubject").value,

            due:
                document.getElementById("taskDue").value,

            minutes:
                Number(
                    document.getElementById("taskMinutes").value
                ) || 25,

            priority:
                document.getElementById("taskPriority").value,

            completed: false

        };

        tasks.unshift(task);

        save();

        form.reset();

        modal?.classList.remove("open");

    });


    filter?.addEventListener("change", render);
    priorityFilter?.addEventListener("change", render);
    sort?.addEventListener("change", render);

    render();

}


/* ---------------------------------------------------------
   SUBJECTS
--------------------------------------------------------- */

function initSubjects() {

    const container =
        document.getElementById("subjectList");

    const add =
        document.getElementById("addSubject");

    let subjects =
        JSON.parse(
            localStorage.getItem("lockin-subjects") ||
            JSON.stringify([
                "Mathematics",
                "Programming",
                "Electronics",
                "Physics"
            ])
        );


    function render() {

        if (!container) return;

        container.innerHTML = subjects.map((subject, index) => `

            <div class="subject-card">

                <span class="eyebrow">
                    SUBJECT ${String(index + 1).padStart(2, "0")}
                </span>

                <h3>${escapeHTML(subject)}</h3>

                <p>
                    Keep your sessions organized.
                </p>

            </div>

        `).join("");

    }


    add?.addEventListener("click", () => {

        const subject =
            prompt("Subject name:");

        if (!subject?.trim()) return;

        subjects.push(subject.trim());

        localStorage.setItem(
            "lockin-subjects",
            JSON.stringify(subjects)
        );

        render();

    });


    render();

}


/* ---------------------------------------------------------
   CALENDAR
--------------------------------------------------------- */

function initCalendar() {

    const grid =
        document.getElementById("calendarGrid");

    const title =
        document.getElementById("calendarTitle");

    let current =
        new Date();

    function render() {

        if (!grid || !title) return;

        const year = current.getFullYear();
        const month = current.getMonth();

        title.textContent =
            current.toLocaleDateString(
                undefined,
                {
                    month: "long",
                    year: "numeric"
                }
            );

        const firstDay =
            new Date(year, month, 1).getDay();

        const days =
            new Date(year, month + 1, 0).getDate();

        const today =
            new Date();

        let html = "";

        for (let i = 0; i < firstDay; i++) {
            html += `<div class="calendar-day"></div>`;
        }

        for (let day = 1; day <= days; day++) {

            const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

            html += `
                <div class="calendar-day ${isToday ? "today" : ""}">
                    ${day}
                </div>
            `;

        }

        grid.innerHTML = html;

    }


    document.getElementById("prevMonth")
        ?.addEventListener("click", () => {

            current.setMonth(
                current.getMonth() - 1
            );

            render();

        });


    document.getElementById("nextMonth")
        ?.addEventListener("click", () => {

            current.setMonth(
                current.getMonth() + 1
            );

            render();

        });


    render();

}


/* ---------------------------------------------------------
   FOCUS MODE
--------------------------------------------------------- */

function initFocusMode() {

    const overlay =
        document.getElementById("focusOverlay");

    document.getElementById("focusMode")
        ?.addEventListener("click", () => {

            overlay?.classList.add("open");

        });

    document.getElementById("exitFocus")
        ?.addEventListener("click", () => {

            overlay?.classList.remove("open");

        });

}


/* ---------------------------------------------------------
   STUDY STATS
--------------------------------------------------------- */

function updateStudyStats() {

    const sessions =
        Number(
            localStorage.getItem("lockin-sessions") || 0
        );

    const xp =
        Number(
            localStorage.getItem("lockin-xp") || 0
        );

    const tasks =
        JSON.parse(
            localStorage.getItem("lockin-tasks") || "[]"
        );

    const completed =
        tasks.filter(task => task.completed).length;

    const focus =
        sessions * 25;

    const level =
        Math.floor(xp / 500) + 1;


    setText("sessionStat", sessions);
    setText("xpStat", xp);
    setText("levelStat", level);
    setText("focusStat", `${focus}m`);
    setText("taskStat", completed);

    setText("analyticsFocus", `${focus} minutes`);
    setText("analyticsLevel", `Level ${level}`);
    setText("analyticsXP", `${xp} XP`);

    const completion =
        tasks.length
            ? Math.round(
                (completed / tasks.length) * 100
            )
            : 0;

    setText(
        "completionRate",
        `${completion}%`
    );

    setText("profileXP", xp);
    setText("profileSessions", sessions);
    setText("profileTasks", completed);

}


/* ---------------------------------------------------------
   RESET
--------------------------------------------------------- */

function initStudyReset() {

    document.getElementById("resetData")
        ?.addEventListener("click", () => {

            const yes =
                confirm(
                    "Reset all Study data?"
                );

            if (!yes) return;

            localStorage.removeItem("lockin-tasks");
            localStorage.removeItem("lockin-xp");
            localStorage.removeItem("lockin-sessions");

            location.reload();

        });

}


/* =========================================================
   WORKOUT
   ========================================================= */

function initWorkout() {

    setupNavigation("workoutPageTitle");
    setupModals();

    initWorkoutTheme();
    initWorkoutPlans();
    initExerciseLibrary();
    initWorkoutTimer();
    initWorkoutHistory();
    initPRs();
    initWorkoutQuotes();

}


/* ---------------------------------------------------------
   THEME
--------------------------------------------------------- */

function initWorkoutTheme() {

    const button =
        document.getElementById("workoutTheme");

    button?.addEventListener("click", () => {

        document.body.classList.toggle("light-mode");

    });

}


/* ---------------------------------------------------------
   WORKOUT PLANS
--------------------------------------------------------- */

function initWorkoutPlans() {

    const modal =
        document.getElementById("workoutModal");

    const selected =
        document.getElementById("selectedWorkoutName");

    document.querySelectorAll(
        "[data-workout]"
    ).forEach(button => {

        button.addEventListener("click", () => {

            selected.textContent =
                button.dataset.workout;

            modal?.classList.add("open");

        });

    });


    document.getElementById("beginWorkout")
        ?.addEventListener("click", () => {

            const name =
                selected.textContent;

            modal?.classList.remove("open");

            document
                .querySelector(
                    '[data-section="workoutTimer"]'
                )
                ?.click();

            setText(
                "currentWorkout",
                name.toUpperCase()
            );

        });


    document.getElementById("randomWorkout")
        ?.addEventListener("click", () => {

            const workouts = [
                "Full Body",
                "Push Day",
                "Pull Day",
                "Leg Day",
                "Cardio",
                "Recovery"
            ];

            const workout =
                workouts[
                    Math.floor(
                        Math.random() * workouts.length
                    )
                ];

            selected.textContent = workout;

            modal?.classList.add("open");

        });

}


/* ---------------------------------------------------------
   EXERCISES
--------------------------------------------------------- */

function initExerciseLibrary() {

    const container =
        document.getElementById("exerciseLibrary");

    const search =
        document.getElementById("exerciseSearch");

    const exercises = [

        {
            name: "Bench Press",
            icon: "🏋️",
            muscle: "Chest",
            type: "Strength"
        },

        {
            name: "Squat",
            icon: "🦵",
            muscle: "Legs",
            type: "Strength"
        },

        {
            name: "Deadlift",
            icon: "🏋️",
            muscle: "Back",
            type: "Strength"
        },

        {
            name: "Pull Up",
            icon: "💪",
            muscle: "Back",
            type: "Bodyweight"
        },

        {
            name: "Shoulder Press",
            icon: "🏋️",
            muscle: "Shoulders",
            type: "Strength"
        },

        {
            name: "Bicep Curl",
            icon: "💪",
            muscle: "Biceps",
            type: "Isolation"
        },

        {
            name: "Tricep Pushdown",
            icon: "💪",
            muscle: "Triceps",
            type: "Isolation"
        },

        {
            name: "Lunges",
            icon: "🦵",
            muscle: "Legs",
            type: "Bodyweight"
        },

        {
            name: "Running",
            icon: "🏃",
            muscle: "Full Body",
            type: "Cardio"
        },

        {
            name: "Plank",
            icon: "🔥",
            muscle: "Core",
            type: "Bodyweight"
        }

    ];


    function render(query = "") {

        const filtered =
            exercises.filter(exercise =>
                exercise.name
                    .toLowerCase()
                    .includes(query.toLowerCase()) ||
                exercise.muscle
                    .toLowerCase()
                    .includes(query.toLowerCase())
            );

        container.innerHTML =
            filtered.map(exercise => `

                <div class="exercise-card">

                    <div class="exercise-icon">
                        ${exercise.icon}
                    </div>

                    <h3>${exercise.name}</h3>

                    <p>
                        Target: ${exercise.muscle}
                    </p>

                    <div class="exercise-meta">
                        <span>${exercise.type}</span>
                        <span>3 × 10</span>
                        <span>90 sec rest</span>
                    </div>

                </div>

            `).join("");

    }


    search?.addEventListener(
        "input",
        () => render(search.value)
    );

    render();

}


/* ---------------------------------------------------------
   WORKOUT TIMER
--------------------------------------------------------- */

function initWorkoutTimer() {

    let seconds = 0;
    let interval = null;
    let running = false;
    let sets = 0;

    const display =
        document.getElementById(
            "workoutTimerDisplay"
        );

    function render() {

        const mins =
            Math.floor(seconds / 60);

        const secs =
            seconds % 60;

        display.textContent =
            `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        setText(
            "setCounter",
            `${sets} / 4 Sets`
        );

    }

    document.getElementById("workoutStart")
        ?.addEventListener("click", () => {

            if (running) return;

            running = true;

            interval =
                setInterval(() => {

                    seconds++;
                    render();

                }, 1000);

        });


    document.getElementById("workoutPause")
        ?.addEventListener("click", () => {

            clearInterval(interval);

            interval = null;
            running = false;

        });


    document.getElementById("workoutReset")
        ?.addEventListener("click", () => {

            clearInterval(interval);

            interval = null;
            running = false;
            seconds = 0;
            sets = 0;

            render();

        });


    document.getElementById("plusSet")
        ?.addEventListener("click", () => {

            sets = Math.min(4, sets + 1);

            render();

        });


    document.getElementById("minusSet")
        ?.addEventListener("click", () => {

            sets = Math.max(0, sets - 1);

            render();

        });


    render();

}


/* ---------------------------------------------------------
   HISTORY
--------------------------------------------------------- */

function initWorkoutHistory() {

    const container =
        document.getElementById("historyList");

    const history =
        JSON.parse(
            localStorage.getItem("lockin-workout-history") ||
            "[]"
        );

    if (history.length === 0) {

        container.innerHTML = `
            <div class="panel">
                <p style="color:#777">
                    No workouts completed yet.
                    Your first one starts here.
                </p>
            </div>
        `;

    } else {

        container.innerHTML =
            history.map(item => `
                <div class="history-item">
                    <strong>${escapeHTML(item.name)}</strong>
                    <span>${escapeHTML(item.date)}</span>
                </div>
            `).join("");

    }

}


/* ---------------------------------------------------------
   PERSONAL RECORDS
--------------------------------------------------------- */

function initPRs() {

    const container =
        document.getElementById("prList");

    const modal =
        document.getElementById("prModal");

    const form =
        document.getElementById("prForm");

    let prs =
        JSON.parse(
            localStorage.getItem("lockin-prs") ||
            "[]"
        );


    function render() {

        if (prs.length === 0) {

            container.innerHTML = `
                <div class="panel">
                    <p style="color:#777">
                        No PRs yet. Go earn one.
                    </p>
                </div>
            `;

            return;

        }

        container.innerHTML =
            prs.map(pr => `

                <div class="pr-card">

                    <span class="eyebrow">
                        PERSONAL RECORD
                    </span>

                    <strong>
                        ${escapeHTML(pr.exercise)}
                    </strong>

                    <p>
                        ${pr.weight} kg × ${pr.reps} reps
                    </p>

                </div>

            `).join("");

    }


    document.getElementById("addPR")
        ?.addEventListener("click", () => {

            modal?.classList.add("open");

        });


    form?.addEventListener("submit", event => {

        event.preventDefault();

        prs.push({

            exercise:
                document.getElementById(
                    "prExercise"
                ).value,

            weight:
                Number(
                    document.getElementById(
                        "prWeight"
                    ).value
                ),

            reps:
                Number(
                    document.getElementById(
                        "prReps"
                    ).value
                )

        });

        localStorage.setItem(
            "lockin-prs",
            JSON.stringify(prs)
        );

        form.reset();

        modal?.classList.remove("open");

        render();

    });


    render();

}


/* ---------------------------------------------------------
   WORKOUT QUOTES
--------------------------------------------------------- */

function initWorkoutQuotes() {

    const quotes = [
        "Don't wish for it. Work for it.",
        "The pain you feel today is strength tomorrow.",
        "Discipline is choosing between what you want now and what you want most.",
        "One more rep.",
        "Nobody can do the work for you.",
        "Earn your rest.",
        "Strong body. Strong mind."
    ];

    const quote =
        document.getElementById(
            "workoutQuote"
        );

    document.getElementById(
        "newWorkoutQuote"
    )?.addEventListener("click", () => {

        quote.textContent =
            quotes[
                Math.floor(
                    Math.random() * quotes.length
                )
            ];

    });

}


/* =========================================================
   HELPERS
   ========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
