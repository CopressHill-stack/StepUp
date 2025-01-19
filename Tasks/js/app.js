// Ініціалізація даних із localStorage
let calendarData;
try {
    calendarData = JSON.parse(localStorage.getItem("calendarData")) || {};
} catch (error) {
    console.error("Помилка при парсингу даних з localStorage:", error);
    calendarData = {};
}

let selectedDate = new Date().toISOString().split('T')[0]; // Сьогоднішня дата

document.getElementById("datePicker").value = selectedDate;

// Оновлення вибору дати
function updateSelectedDate() {
    selectedDate = document.getElementById("datePicker").value;
    renderCards();
}

document.getElementById("datePicker").addEventListener("change", updateSelectedDate);

// Додавання нової картки
function addCardToDate() {
    const cardName = prompt("Введіть назву картки:");
    if (cardName) {
        if (!calendarData[selectedDate]) {
            calendarData[selectedDate] = [];
        }
        const cardId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        calendarData[selectedDate].push({ id: cardId, name: cardName, goals: [] });
        saveCalendarData();
        renderCards();
    }
}

document.getElementById("addCardButton").addEventListener("click", addCardToDate);

// Додавання цілі в картку
function addGoalToCard(cardIndex) {
    const goalText = prompt("Введіть вашу ціль:");
    if (goalText) {
        calendarData[selectedDate][cardIndex].goals.push(goalText);
        saveCalendarData();
        renderCards();
    }
}

// Видалення картки
function deleteCard(cardIndex) {
    calendarData[selectedDate].splice(cardIndex, 1);
    saveCalendarData();
    renderCards();
}

// Збереження даних у localStorage
function saveCalendarData() {
    localStorage.setItem("calendarData", JSON.stringify(calendarData));
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

            console.log(
                "Drag Start - Goal Index:",
                goal.dataset.goalIndex,
                "From Card Index:",
                goal.dataset.cardIndex
            );
        });
    });

    // Налаштування прийому перетягуваних цілей для карток
    cards.forEach((card) => {
        card.addEventListener("dragover", (e) => {
            e.preventDefault(); // Дозволяємо перетягування
        });

        card.addEventListener("drop", (e) => {
            e.preventDefault();

            const goalIndex = e.dataTransfer.getData("goalIndex");
            const fromCardIndex = e.dataTransfer.getData("fromCardIndex");
            const toCardIndex = card.dataset.cardIndex;

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
                const goal = calendarData[selectedDate][fromCardIndex].goals.splice(goalIndex, 1)[0];
                calendarData[selectedDate][toCardIndex].goals.push(goal);

                saveCalendarData();
                renderCards();
            }
        });
    });
}
// Рендеринг карток із цілями
function renderCards() {
    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";

    if (!calendarData[selectedDate] || calendarData[selectedDate].length === 0) {
        const message = document.createElement("p");
        message.textContent = "Немає карток для вибраної дати.";
        message.classList.add("noCards");
        container.appendChild(message);
        return;
    }

    const cardsContainer = document.createElement("div");
    cardsContainer.classList.add("cards-container");
    cardsContainer.style.display = "grid";
    cardsContainer.style.gridTemplateColumns = "repeat(4, minmax(250px, 1fr))";
    cardsContainer.style.gridAutoRows = "max-content";
    cardsContainer.style.gap = "1rem";

    calendarData[selectedDate].forEach((card, cardIndex) => {
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

        // Цілі в картці
        card.goals.forEach((goal, goalIndex) => {
            const goalDiv = document.createElement("div");
            goalDiv.classList.add("goal");
            goalDiv.dataset.goalIndex = goalIndex;
            goalDiv.dataset.cardIndex = cardIndex;

            console.log(cardIndex);

            const goalText = document.createElement("span");
            goalText.textContent = goal;

            goalDiv.appendChild(goalText);
            cardDiv.appendChild(goalDiv);
        });

        // Кнопка додавання цілі
        const addGoalButton = document.createElement("button");
        addGoalButton.textContent = "Додати ціль";
        addGoalButton.classList.add("add-goal");
        addGoalButton.addEventListener("click", () => addGoalToCard(cardIndex));

        cardDiv.appendChild(addGoalButton);
        cardsContainer.appendChild(cardDiv);
    });

    container.appendChild(cardsContainer);
    setupDragAndDrop();
}

// Ініціалізація
renderCards();

const ctx = document.getElementById("progress-chart").getContext("2d");
    const progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['День 1', 'День 2', 'День 3', 'Місяць 4', 'День 5', 'День 6', 'День 7'],
            datasets: [{
                label: 'Прогрес',
                data: [10, 30, 50, 70],
                borderColor: '#4CAF50',
                backgroundColor: '#4CAF50',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                  beginAtZero: true
                }
            }
        }
    });
