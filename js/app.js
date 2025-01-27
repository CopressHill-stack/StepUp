// Ініціалізація даних із localStorage
let calendar;
try {
    calendar = JSON.parse(localStorage.getItem("calendarData")) || {};
} catch (error) {
    console.error("Помилка при парсингу даних з localStorage:", error);
    calendar = {};
}

let selectedDate = new Date().toISOString().split('T')[0]; // Сьогоднішня дата

document.getElementById("datePicker").value = selectedDate;

// Оновлення вибору дати
function updateSelectedDate() {
    selectedDate = document.getElementById("datePicker").value;
    renderCards();
}

document.getElementById("datePicker").addEventListener("change", updateSelectedDate);

function burgerMenu(){
    const burgerButton = document.querySelector('.burger');
    const nav = document.querySelector('.nav');
    const progressBar = document.getElementById("progress-section");
    const pageWidth = document.documentElement.scrollWidth;

    if(pageWidth <= '480'){
        progressBar.style.display = 'none';
    }

    // Функція для відкриття/закриття меню
    burgerButton.addEventListener('click', () => {
        progressBar.style.display = "block";
        progressBar.style.width = '100%';
        nav.appendChild(progressBar);
        nav.classList.toggle('open'); // Додаємо/видаляємо клас "open"
        burgerButton.classList.toggle('active'); // Змінюємо вигляд бургер-кнопки
    });

    // Закриття меню при натисканні поза ним
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !burgerButton.contains(e.target)) {
        nav.classList.remove('open');
        burgerButton.classList.remove('active');
      }
    });
}

// Додавання нової картки
function addCardToDate() {
    const cardName = prompt("Введіть назву картки:");
    if (cardName) {
        if (!calendar[selectedDate]) {
            calendar[selectedDate] = [];
        }
        const cardId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        calendar[selectedDate].push({ id: cardId, name: cardName, goals: [] });
        saveCalendarData();
        renderCards();
    }
}

    document.getElementById("addCardButton").addEventListener("click", () => {
        addCardToDate();
        updateChart();
});

// Додавання цілі в картку
function addGoalToCard(cardIndex) {
    const goalText = prompt("Введіть вашу ціль:");
    if (goalText) {
        calendar[selectedDate][cardIndex].goals.push({ text: goalText, completed: false});

        saveCalendarData();
        renderCards();
        updateChart();
    }
}

// Позначення цілі як виконаної
function completeGoal(cardIndex, goalIndex) {
    const goal = calendar[selectedDate][cardIndex].goals[goalIndex];
    goal.completed = true;

    if(goal.completed){
        calendar[selectedDate][cardIndex].goals.splice(goalIndex, 1);
        calendar[selectedDate][cardIndex].goals.push(goal);

    }
    saveCalendarData();
    renderCards();
    updateChart();
}
// Видалення картки
function deleteCard(cardIndex) {
    calendar[selectedDate].splice(cardIndex, 1);
    saveCalendarData();
    renderCards();
    updateChart();
}

// Збереження даних у localStorage
function saveCalendarData() {
    localStorage.setItem("calendarData", JSON.stringify(calendar));
}

function darkMode(){
    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark"){
        document.body.classList.add("dark-theme");
        themeToggle.checked = true;
    }
    themeToggle.addEventListener("change", () => {
        if(themeToggle.checked){
            document.body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
            console.log("dark");
        }else{
            document.body.classList.remove("dark-theme");
            localStorage.setItem("theme", "light");  
            console.log("light");
        }
    });
}

function setupDragAndDrop() {
    const goals = document.querySelectorAll(".goal");
    const cards = document.querySelectorAll(".card");

    // Налаштування перетягування цілей
    goals.forEach((goal) => {
        goal.draggable = true;
        goal.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("goalIndex", e.target.dataset.goalIndex);
            e.dataTransfer.setData("fromCardIndex", e.target.dataset.cardIndex);
        });
    });

    // Налаштування прийому перетягуваних цілей для карток
    cards.forEach((card) => {
        card.addEventListener("dragover", (e) => {
            e.preventDefault(); // Дозволяємо перетягування
        });

        card.addEventListener("drop", (e) => {
            e.preventDefault();

            const goalIndex = parseInt(e.dataTransfer.getData("goalIndex"), 10);
            const fromCardIndex = parseInt(e.dataTransfer.getData("fromCardIndex"), 10);
            const toCardIndex = parseInt(card.dataset.cardIndex, 10);

            console.log(
                "Drop - Goal Index:",
                goalIndex,
                "From Card Index:",
                fromCardIndex,
                "To Card Index:",
                toCardIndex
            );

            if (fromCardIndex !== toCardIndex) {
                // Переміщуємо ціль між картками
                const goal = calendar[selectedDate][fromCardIndex].goals.splice(goalIndex, 1)[0];
                calendar[selectedDate][toCardIndex].goals.push(goal);

                saveCalendarData();
                renderCards(selectedDate);
            }
        });
    });
}
// Рендеринг карток із цілями
function renderCards() {
    const container = document.getElementById("boardsContainer");
    container.innerHTML = "";

    if (!calendar[selectedDate] || calendar[selectedDate].length === 0) {
        const message = document.createElement("p");
        message.textContent = "Немає карток для вибраної дати.";
        message.classList.add("noCards");
        container.appendChild(message);
        return;
    }

    const cardsContainer = document.createElement("div");
    cardsContainer.classList.add("cards-container");

    calendar[selectedDate].forEach((card, cardIndex) => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        cardDiv.dataset.cardIndex = cardIndex;
        // Назва картки
        const cardTitle = document.createElement("h4");
        cardTitle.textContent = card.name;
        cardDiv.appendChild(cardTitle);

        // Кнопка видалення картки
        const deleteCardButton = document.createElement("button");
        deleteCardButton.textContent = "Х";
        deleteCardButton.classList.add("delete-card");
        deleteCardButton.addEventListener("click", () => deleteCard(cardIndex));
        cardDiv.appendChild(deleteCardButton);

        const sortedGoals = card.goals.slice().sort((a, b) => a.completed - b.completed);

         // Кнопка додавання цілі
        const addGoalButton = document.createElement("button");
        addGoalButton.textContent = "Додати ціль";
        addGoalButton.classList.add("add-goal");
        addGoalButton.addEventListener("click", () => addGoalToCard(cardIndex));

        // Цілі в картці
        sortedGoals.forEach((goal, goalIndex) => {
            const goalDiv = document.createElement("div");
            goalDiv.classList.add("goal");
            goalDiv.dataset.goalIndex = goalIndex;
            goalDiv.dataset.cardIndex = cardIndex;
            goalDiv.className = 'goal animate__animated animate__fadeUnDown';
            if(goal.completed){
                goalDiv.classList.add("completed");
                goalDiv.draggable = false;
            }else{
                goalDiv.draggable = true;
            }
           
            const goalText = document.createElement("span");
            goalText.textContent = goal.text;
            goalDiv.appendChild(goalText);
            cardDiv.appendChild(goalDiv);
            // Кнопка виконання цілі
            if(!goal.completed){
                const completeDiv = document.createElement("div");
                completeDiv.classList.add("complete-div");
                const completeButton = document.createElement("button");
                completeButton.textContent = "✔";
                completeButton.classList.add("complete-goal");
                completeButton.addEventListener("click", () => {
                    completeGoal(cardIndex, goalIndex);
                    updateChart();
                   });
                completeDiv.appendChild(completeButton);
                goalDiv.appendChild(completeDiv);    
                const remindButton = document.createElement('button');
                remindButton.textContent = 'Нагадати';
                remindButton.addEventListener('click', () => {
                    sendNotification(goalText);
                });
                completeDiv.appendChild(remindButton); 
            }
        });


        cardDiv.appendChild(addGoalButton);
        cardsContainer.appendChild(cardDiv);
    });

    container.appendChild(cardsContainer);
    setupDragAndDrop();
}

// Ініціалізація
renderCards();
updateSelectedDate();
darkMode();
burgerMenu();


function getLastWeekDates() {
    const dates = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
}

function sendNotification(taskName){
    if(Notification.permission === 'granted'){
        new Notification('Reminder', {
            body: 'Не забудь виконати свої завдання: ${taskName}',
        });
    }else if(Notification.permission !== 'denied'){
        Notification.requestPermission().then(permission => {
            if(permission === 'granted'){
                sendNotification(taskName);
            }
        });
    }
}

// Функція для підрахунку виконаних і запланованих цілей за кожен день
function getWeeklyStats() {
    const dates = getLastWeekDates(); // Масив останніх 7 днів
    const stats = dates.map((date) => {
        let completedGoals = 0; // Лічильник виконаних цілей
        let totalGoals = 0; // Лічильник загальної кількості цілей

        // Перевіряємо цілі для кожної дати
        if (calendar[date]) {
            calendar[date].forEach((card) => {
                totalGoals += card.goals.length; // Додаємо всі цілі
                completedGoals += card.goals.filter(goal => goal.completed).length; // Фільтруємо виконані
            });
        }

        return { date, completedGoals, totalGoals }; // Повертаємо дані для дати
    });

    return stats; // Повертаємо статистику за тиждень
}

// Функція для оновлення даних графіка
function updateChartData(chart) {
    const weeklyStats = getWeeklyStats(); // Отримуємо статистику за останній тиждень
    const labels = weeklyStats.map(stat => stat.date); // Дати для підписів на графіку
    const completedData = weeklyStats.map(stat => stat.completedGoals); // Дані виконаних цілей
    const totalData = weeklyStats.map(stat => stat.totalGoals); // Дані загальної кількості цілей

    chart.data.labels = labels; // Оновлюємо підписи
    chart.data.datasets[0].data = totalData; // Дані для "Запланованих цілей"
    chart.data.datasets[1].data = completedData; // Дані для "Виконаних цілей"

    chart.update(); // Оновлюємо графік
}



const ctx = document.getElementById("taskChart").getContext("2d");
const progressChart =  new Chart(ctx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Заплановані завдання",
                     data: [],
                     backgroundColor: "rgba(75, 192, 192, 0.6)",
                     borderColor: "rgba(75, 192, 192, 1)",
                     borderWidth: 1,
                },
                {
                     label: "Виконані завдання",
                      data: [],
                      backgroundColor: "rgba(153, 102, 255, 0.6)",
                      borderColor: "rgba(153, 102, 255, 1)",
                      borderWidht: 1,
                },
            ],            
        },
        options: {
            responsive: true,
            plugins: {
                legends: {
                    position: "top",
                },
                title: {
                    display: true,
                    text: "Статистика завдань за останній тиждень",
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Дата",
                    },
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                    },
                    title: {
                        display: true,
                        text: "Кількість завдань",
                    },
                },
            },
        },
    });        

function updateChart() {
    updateChartData(progressChart); // Оновлюємо дані графіка
}


updateChart();
